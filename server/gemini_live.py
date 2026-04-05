import google.genai as genai
from google.genai import types
import asyncio
import base64
import json
import logging
import inspect
from typing import Optional, List, Dict, Callable

logger = logging.getLogger(__name__)

class GeminiLive:
    def __init__(self, project_id: str, location: str, model: str, input_sample_rate: int = 16000):
        self.project_id = project_id
        self.location = location
        self.model = model
        self.input_sample_rate = input_sample_rate
        self.client = genai.Client(vertexai=True, project=project_id, location=location)
        self.tool_mapping = {}

    def register_tool(self, func: Callable):
        self.tool_mapping[func.__name__] = func
        return func

    async def start_session(self, audio_input_queue, video_input_queue, text_input_queue,
                           audio_output_callback, audio_interrupt_callback=None, setup_config=None):
        # Default fallback system instruction
        _default_system_prompt = (
            'You are Olivia, the OmniD3sk AI assistant. Help users with IT support issues. '
            'Call each tool only ONCE. After all tools complete, give one brief verbal summary '
            'of what was accomplished. NEVER call the same tool twice in one session.'
        )

        config_args = {
            "response_modalities": [types.Modality.AUDIO],
            "speech_config": types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Leda")
                )
            ),
            "system_instruction": types.Content(parts=[types.Part.from_text(text=_default_system_prompt)]),
        }

        if setup_config:
            # Use client's system instruction if provided (contains full SYSTEM_PROMPT)
            if "system_instruction" in setup_config:
                try:
                    parts = setup_config["system_instruction"].get("parts", [])
                    if parts and parts[0].get("text"):
                        client_prompt = parts[0]["text"]
                        config_args["system_instruction"] = types.Content(
                            parts=[types.Part.from_text(text=client_prompt)]
                        )
                        logger.info(f"Using client system instruction ({len(client_prompt)} chars)")
                except Exception as e:
                    logger.warning(f"Error parsing system_instruction from client: {e}")

            if "proactivity" in setup_config:
                try:
                    proactive_audio = setup_config["proactivity"].get("proactiveAudio", False)
                    config_args["proactivity"] = types.ProactivityConfig(proactive_audio=proactive_audio)
                except (AttributeError, TypeError):
                    pass

            if "tools" in setup_config:
                try:
                    tool_config = setup_config["tools"]
                    if "function_declarations" in tool_config:
                        fds = []
                        for fd in tool_config["function_declarations"]:
                            fds.append(types.FunctionDeclaration(
                                name=fd.get("name"),
                                description=fd.get("description"),
                                parameters=fd.get("parameters")
                            ))
                        config_args["tools"] = [types.Tool(function_declarations=fds)]
                except Exception as e:
                    logger.warning(f"Error parsing tools config: {e}")

            # Parse realtime_input_config (VAD / activity detection settings)
            if "realtime_input_config" in setup_config:
                try:
                    ric = setup_config["realtime_input_config"]
                    aad = ric.get("automatic_activity_detection", {})
                    aad_args = {}
                    if aad.get("disabled"):
                        aad_args["disabled"] = True
                    if "silence_duration_ms" in aad:
                        aad_args["silence_duration_ms"] = aad["silence_duration_ms"]
                    if "prefix_padding_ms" in aad:
                        aad_args["prefix_padding_ms"] = aad["prefix_padding_ms"]
                    if "start_of_speech_sensitivity" in aad:
                        aad_args["start_of_speech_sensitivity"] = aad["start_of_speech_sensitivity"]
                    if "end_of_speech_sensitivity" in aad:
                        aad_args["end_of_speech_sensitivity"] = aad["end_of_speech_sensitivity"]

                    if aad_args:
                        config_args["realtime_input_config"] = types.RealtimeInputConfig(
                            automatic_activity_detection=types.AutomaticActivityDetection(**aad_args)
                        )
                        logger.info(f"Applied realtime_input_config: {aad_args}")
                except Exception as e:
                    logger.warning(f"Error parsing realtime_input_config: {e}")

            if "output_audio_transcription" in setup_config:
                config_args["output_audio_transcription"] = types.AudioTranscriptionConfig()
            if "input_audio_transcription" in setup_config:
                config_args["input_audio_transcription"] = types.AudioTranscriptionConfig()

        config = types.LiveConnectConfig(**config_args)
        logger.info(f"LiveConnectConfig created: modalities={config_args.get('response_modalities')}, "
                     f"proactivity={config_args.get('proactivity')}, "
                     f"realtime_input={config_args.get('realtime_input_config')}, "
                     f"tools={len(config_args.get('tools', []))} tool groups")

        async with self.client.aio.live.connect(model=self.model, config=config) as session:
            async def send_audio():
                try:
                    while True:
                        chunk = await audio_input_queue.get()
                        await session.send_realtime_input(
                            audio=types.Blob(data=chunk, mime_type=f"audio/pcm;rate={self.input_sample_rate}")
                        )
                except asyncio.CancelledError:
                    pass

            async def send_video():
                try:
                    while True:
                        chunk = await video_input_queue.get()
                        await session.send_realtime_input(
                            video=types.Blob(data=chunk, mime_type="image/jpeg")
                        )
                except asyncio.CancelledError:
                    pass

            async def send_text():
                nonlocal _awaiting_user_input
                try:
                    while True:
                        text = await text_input_queue.get()
                        _awaiting_user_input = False  # Text input = new user turn, reset gate
                        await session.send(input=text, end_of_turn=True)
                except asyncio.CancelledError:
                    pass

            event_queue = asyncio.Queue()
            # Turn gating: suppress model output after turn_complete until user speaks
            _awaiting_user_input = False

            async def receive_loop():
                nonlocal _awaiting_user_input
                try:
                    while True:
                        async for response in session.receive():
                            server_content = response.server_content
                            tool_call = response.tool_call

                            if server_content:
                                if server_content.model_turn:
                                    if _awaiting_user_input:
                                        # Suppress stray model output after turn_complete
                                        logger.debug("Suppressed model output (awaiting user input)")
                                        continue
                                    for part in server_content.model_turn.parts:
                                        if part.inline_data:
                                            if inspect.iscoroutinefunction(audio_output_callback):
                                                await audio_output_callback(part.inline_data.data)
                                            else:
                                                audio_output_callback(part.inline_data.data)

                                if server_content.input_transcription:
                                    # User is speaking — reset turn gate
                                    _awaiting_user_input = False
                                    await event_queue.put({
                                        "serverContent": {
                                            "inputTranscription": {
                                                "text": server_content.input_transcription.text,
                                                "finished": True
                                            }
                                        }
                                    })

                                if server_content.output_transcription and not _awaiting_user_input:
                                    await event_queue.put({
                                        "serverContent": {
                                            "outputTranscription": {
                                                "text": server_content.output_transcription.text,
                                                "finished": True
                                            }
                                        }
                                    })

                                if server_content.turn_complete:
                                    _awaiting_user_input = True
                                    await event_queue.put({"serverContent": {"turnComplete": True}})

                                if server_content.interrupted:
                                    await event_queue.put({"serverContent": {"interrupted": True}})
                                    if audio_interrupt_callback:
                                        if inspect.iscoroutinefunction(audio_interrupt_callback):
                                            await audio_interrupt_callback()
                                        else:
                                            audio_interrupt_callback()
                                    await event_queue.put({"type": "interrupted"})

                            if tool_call:
                                # Tool calls are allowed even during turn gate
                                _awaiting_user_input = False
                                function_responses = []
                                client_tool_calls = []

                                async def _execute_tool(fc):
                                    func_name = fc.name
                                    args = fc.args or {}
                                    if func_name in self.tool_mapping:
                                        try:
                                            tool_func = self.tool_mapping[func_name]
                                            if inspect.iscoroutinefunction(tool_func):
                                                result = await tool_func(**args)
                                            else:
                                                _loop = asyncio.get_running_loop()
                                                result = await _loop.run_in_executor(None, lambda: tool_func(**args))
                                        except Exception as e:
                                            result = f"Error: {e}"
                                        return ("backend", fc, func_name, args, result)
                                    else:
                                        return ("client", fc)

                                results = await asyncio.gather(*[_execute_tool(fc) for fc in tool_call.function_calls], return_exceptions=True)

                                for res in results:
                                    if isinstance(res, Exception):
                                        continue
                                    if res[0] == "backend":
                                        _, fc, func_name, args, result = res
                                        function_responses.append(types.FunctionResponse(
                                            name=func_name, id=fc.id, response={"result": result}
                                        ))
                                        await event_queue.put({"type": "tool_call", "name": func_name, "args": args, "result": result})
                                    else:
                                        _, fc = res
                                        client_tool_calls.append({"name": fc.name, "args": fc.args, "id": fc.id})

                                if client_tool_calls:
                                    await event_queue.put({"toolCall": {"functionCalls": client_tool_calls}})
                                if function_responses:
                                    await session.send(input=types.LiveClientToolResponse(
                                        function_responses=function_responses
                                    ))

                except Exception as e:
                    await event_queue.put({"type": "error", "error": str(e)})
                finally:
                    await event_queue.put(None)

            send_audio_task = asyncio.create_task(send_audio())
            send_video_task = asyncio.create_task(send_video())
            send_text_task = asyncio.create_task(send_text())
            receive_task = asyncio.create_task(receive_loop())

            try:
                while True:
                    event = await event_queue.get()
                    if event is None:
                        break
                    yield event
            except asyncio.CancelledError:
                logger.info("GeminiLive session cancelled — cleaning up tasks")
            finally:
                send_audio_task.cancel()
                send_video_task.cancel()
                send_text_task.cancel()
                receive_task.cancel()
                # Await all tasks with a short timeout to prevent hangs
                await asyncio.gather(
                    send_audio_task, send_video_task,
                    send_text_task, receive_task,
                    return_exceptions=True
                )

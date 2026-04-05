import base64
import asyncio
import json
import os
import logging
import time
import uuid
from typing import Dict, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv(override=True)

from server.gemini_live import GeminiLive
from server.config_utils import get_project_id
from server.tools import register_all_tools, TOOL_DECLARATIONS
from server.session_state import create_session, get_session, end_session
from server.adk_agent import is_adk_enabled

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

PROJECT_ID = get_project_id()
LOCATION = os.getenv("LOCATION", "us-central1")
MODEL = os.getenv("MODEL", "gemini-live-2.5-flash-native-audio")
SESSION_TIME_LIMIT = int(os.getenv("SESSION_TIME_LIMIT", "300"))

# ── Activity Feed ──
from collections import deque
ACTIVITY_LOG: deque = deque(maxlen=100)

def log_activity(category: str, action: str, detail: str = "", severity: str = "info"):
    """Log an activity event for the live feed."""
    entry = {
        "ts": time.strftime("%H:%M:%S"),
        "epoch": time.time(),
        "category": category,
        "action": action,
        "detail": detail[:200],
        "severity": severity,
    }
    ACTIVITY_LOG.appendleft(entry)
    icon = {"shield": "🛡️", "voice": "🎙️", "tool": "🔧", "adk": "🤖", "system": "⚙️", "nav": "🧭"}.get(category, "📌")
    logger.info(f"{icon} [{category.upper()}] {action} — {detail[:120]}")

app = FastAPI(title="OmniD3sk API", version="1.0.0")
_BOOT_TIME = time.time()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
if os.path.exists("dist/assets"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")
if os.path.exists("dist/audio-processors"):
    app.mount("/audio-processors", StaticFiles(directory="dist/audio-processors"), name="audio-processors")

# In-memory token storage
valid_tokens: Dict[str, float] = {}
TOKEN_EXPIRY_SECONDS = 300

def cleanup_tokens():
    current_time = time.time()
    expired = [token for token, ts in valid_tokens.items() if current_time - ts > TOKEN_EXPIRY_SECONDS]
    for token in expired:
        del valid_tokens[token]

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "OmniD3sk", "adk": is_adk_enabled()}

@app.get("/api/status")
async def get_status():
    return {
        "service": "OmniD3sk",
        "mode": "adk" if is_adk_enabled() else "live",
        "model": MODEL,
        "tools": 18,
        "agents": {
            "omniagent": {"tools": 10, "role": "IT Helpdesk Voice Agent"},
            "omnishield": {"tools": 7, "role": "Scam Shield Sub-Agent"},
            "researcher": {"tools": 1, "role": "IT Research (google_search)"},
            "threat_intel": {"tools": 1, "role": "Threat Intel (google_search)"},
        },
        "features": [
            "voice", "vision", "screen_share", "omnishield",
            "ui_navigator", "multilingual", "fake_content_detection",
            "multi_agent_orchestration", "danger_zone_annotations",
            "calendar_mcp", "notion_mcp", "sqlite_tickets",
        ],
        "languages": 20,
        "adk_enabled": is_adk_enabled(),
        "project_id": PROJECT_ID,
        "location": LOCATION,
    }

@app.get("/api/activity")
async def get_activity_feed(limit: int = 50):
    """Live activity feed — shows all agent actions, tool calls, shield scans, etc."""
    return {
        "activities": list(ACTIVITY_LOG)[:limit],
        "total": len(ACTIVITY_LOG),
        "system": {
            "uptime_seconds": int(time.time() - _BOOT_TIME),
            "model": MODEL,
            "adk_enabled": is_adk_enabled(),
            "project_id": PROJECT_ID,
            "active_sessions": len(valid_tokens),
        },
    }

@app.post("/api/auth")
async def authenticate(request: Request):
    try:
        body = {}
        try:
            body = await request.json()
        except:
            pass
        language = body.get("language", "English")
        session_token = str(uuid.uuid4())
        cleanup_tokens()
        valid_tokens[session_token] = time.time()
        create_session(session_token, language)
        return {"session_token": session_token, "session_time_limit": SESSION_TIME_LIMIT}
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: Optional[str] = None):
    await websocket.accept()

    if not token or token not in valid_tokens:
        logger.warning("Invalid or missing session token")
        await websocket.close(code=4003, reason="Unauthorized")
        return

    del valid_tokens[token]
    logger.info("WebSocket connection accepted")
    log_activity("voice", "Session started", f"Token: {token[:8]}..., Model: {MODEL}")

    session = get_session(token)
    if session:
        from server.tools import issue_tracker, itsm, kb_search, portal_lookup
        issue_tracker.set_session(session)
        itsm.set_session(session)
        kb_search.set_session(session)
        portal_lookup.set_session(session)

    setup_config = None
    try:
        message = await websocket.receive_text()
        initial_data = json.loads(message)
        if "setup" in initial_data:
            setup_config = initial_data["setup"]
            logger.info("Received setup configuration from client")
    except Exception as e:
        logger.warning(f"Error receiving setup config: {e}")

    async def emit_session_state():
        if session:
            try:
                await websocket.send_json({
                    "type": "session_state",
                    "data": session.generate_call_summary()
                })
            except:
                pass

    audio_input_queue = asyncio.Queue()
    video_input_queue = asyncio.Queue()
    text_input_queue = asyncio.Queue()

    async def audio_output_callback(data):
        await websocket.send_bytes(data)

    async def audio_interrupt_callback():
        pass

    gemini_client = GeminiLive(
        project_id=PROJECT_ID,
        location=LOCATION,
        model=MODEL,
        input_sample_rate=16000
    )

    register_all_tools(gemini_client)

    if setup_config:
        if "tools" not in setup_config:
            setup_config["tools"] = {}
        existing_fds = setup_config["tools"].get("function_declarations", [])
        existing_names = {fd.get("name") for fd in existing_fds}
        for td in TOOL_DECLARATIONS:
            if td["name"] not in existing_names:
                existing_fds.append(td)
        setup_config["tools"]["function_declarations"] = existing_fds
        logger.info(f"Total tool declarations sent to Gemini: {len(existing_fds)}")

    if session and setup_config and session.language != "English":
        from server.prompts import LANGUAGE_INSTRUCTION_TEMPLATE
        lang_suffix = LANGUAGE_INSTRUCTION_TEMPLATE.format(language=session.language)
        si = setup_config.get("system_instruction")
        if isinstance(si, dict):
            try:
                si["parts"][0]["text"] += lang_suffix
            except (KeyError, IndexError, TypeError):
                pass
        elif isinstance(si, str) and si:
            setup_config["system_instruction"] = si + lang_suffix
        logger.info(f"Applied language instruction: {session.language}")

    if session:
        session.update_checkpoint("initiation", "Capture error details", "active")
        await emit_session_state()

    async def receive_from_client():
        try:
            while True:
                message = await websocket.receive()
                if "bytes" in message and message["bytes"]:
                    await audio_input_queue.put(message["bytes"])
                elif "text" in message and message["text"]:
                    text = message["text"]
                    try:
                        payload = json.loads(text)
                        if isinstance(payload, dict):
                            if payload.get("type") == "image" and payload.get("data"):
                                image_data = base64.b64decode(payload["data"])
                                await video_input_queue.put(image_data)
                                continue
                            if "realtime_input" in payload:
                                chunks = payload["realtime_input"].get("media_chunks", [])
                                for chunk in chunks:
                                    if chunk.get("data") and chunk.get("mime_type", "").startswith("image/"):
                                        try:
                                            image_data = base64.b64decode(chunk["data"])
                                            await video_input_queue.put(image_data)
                                        except Exception as img_err:
                                            logger.error(f"Error decoding image frame: {img_err}")
                                continue
                    except json.JSONDecodeError:
                        pass
                    await text_input_queue.put(text)
        except WebSocketDisconnect:
            logger.info("WebSocket disconnected")
        except Exception as e:
            logger.error(f"Error receiving from client: {e}")

    receive_task = asyncio.create_task(receive_from_client())

    async def run_session():
        async for event in gemini_client.start_session(
            audio_input_queue=audio_input_queue,
            video_input_queue=video_input_queue,
            text_input_queue=text_input_queue,
            audio_output_callback=audio_output_callback,
            audio_interrupt_callback=audio_interrupt_callback,
            setup_config=setup_config
        ):
            if event:
                await websocket.send_json(event)
                sc = event.get("serverContent") if isinstance(event, dict) else None
                if sc and session:
                    inp = sc.get("inputTranscription")
                    if inp and inp.get("text"):
                        session.add_transcript("user", inp["text"])
                    out = sc.get("outputTranscription")
                    if out and out.get("text"):
                        session.add_transcript("model", out["text"])
                if isinstance(event, dict) and event.get("type") in ("tool_call", "tool_result", "server_tool_call"):
                    tool_name = event.get("name", event.get("tool", "unknown"))
                    log_activity("tool", f"Tool: {event['type']}", f"{tool_name}")
                    await emit_session_state()

    try:
        await asyncio.wait_for(run_session(), timeout=SESSION_TIME_LIMIT)
    except asyncio.TimeoutError:
        logger.info("Session time limit reached")
    except Exception as e:
        logger.error(f"Error in Gemini session: {e}", exc_info=True)
    finally:
        end_session(token)
        receive_task.cancel()
        try:
            await websocket.close()
        except:
            pass

@app.get("/api/tickets")
async def get_tickets():
    """Get all ITSM tickets (from SQLite database)."""
    from server.tools.itsm import get_all_tickets
    return {"tickets": get_all_tickets()}

@app.get("/api/session/{token}/summary")
async def get_session_summary(token: str):
    session = get_session(token)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return JSONResponse(content=session.generate_call_summary())

@app.get("/api/session/{token}/rca")
async def get_session_rca(token: str):
    session = get_session(token)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    rca_text = session.generate_rca()
    return PlainTextResponse(
        content=rca_text,
        headers={"Content-Disposition": f'attachment; filename="omnid3sk-report-{token[:8]}.txt"'}
    )

@app.get("/api/session/{token}/transcript")
async def get_session_transcript(token: str):
    session = get_session(token)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    transcript_text = session.generate_transcript_export()
    return PlainTextResponse(
        content=transcript_text,
        headers={"Content-Disposition": f'attachment; filename="omnid3sk-transcript-{token[:8]}.txt"'}
    )

@app.post("/api/adk/chat")
async def adk_chat(request: Request):
    """ADK-powered text chat endpoint (OmniAgent).

    When ENABLE_ADK=true, runs queries through the full ADK agent graph.
    Falls back to a simple error if ADK is not enabled.
    """
    if not is_adk_enabled():
        return JSONResponse(
            status_code=400,
            content={"error": "ADK not enabled. Set ENABLE_ADK=true in .env"},
        )
    try:
        from google.adk.runners import Runner
        from google.adk.sessions import InMemorySessionService
        from google.genai import types as genai_types
        from server.adk_agent import root_agent

        body = await request.json()
        user_message = body.get("message", "")
        session_id = body.get("session_id", "omni-default")
        log_activity("adk", "Chat query", f"Message: {user_message[:80]}")

        session_service = InMemorySessionService()
        runner = Runner(agent=root_agent, app_name="omnid3sk", session_service=session_service)

        session = await session_service.get_session(
            app_name="omnid3sk", user_id="user", session_id=session_id
        )
        if session is None:
            session = await session_service.create_session(
                app_name="omnid3sk", user_id="user", session_id=session_id
            )

        content = genai_types.Content(
            role="user", parts=[genai_types.Part.from_text(text=user_message)]
        )

        response_parts = []
        tool_calls_made = []
        async for event in runner.run_async(
            user_id="user", session_id=session.id, new_message=content
        ):
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        response_parts.append(part.text)
                    if part.function_call:
                        tool_calls_made.append(part.function_call.name)

        log_activity("adk", f"Chat complete → {len(tool_calls_made)} tools used", f"Tools: {', '.join(tool_calls_made) or 'none'}")
        return JSONResponse(content={
            "response": "\n".join(response_parts),
            "tools_used": tool_calls_made,
            "agent": "omniagent",
            "mode": "adk",
        })

    except Exception as e:
        logger.error(f"ADK chat error: {e}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "response": "OmniAgent error"},
        )


@app.post("/api/shield")
async def shield_scan(request: Request):
    """Analyze a page screenshot for scam/phishing/fraud indicators (OmniShield)."""
    from server.tools.shield_analyzer import analyze_page_safety
    try:
        body = await request.json()
        page_url = body.get("page_url", "")
        log_activity("shield", "Scan started", f"URL: {page_url}")
        result = await analyze_page_safety(
            screenshot_b64=body.get("screenshot", ""),
            dom_summary=body.get("dom_summary", {}),
            language=body.get("language", "English"),
            page_url=page_url,
            page_title=body.get("page_title", ""),
        )
        level = result.get("threat_level", "safe")
        layers = result.get("layers_used", [])
        log_activity(
            "shield", f"Scan complete → {level.upper()}",
            f"URL: {page_url} | Layers: {', '.join(layers)} | {result.get('summary', '')[:80]}",
            severity="warning" if level in ("medium", "high", "critical") else "info",
        )
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Shield endpoint error: {e}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "threat_level": "safe",
                "summary": f"Analysis error: {str(e)}",
                "threats": [],
                "error": str(e),
            },
        )

@app.post("/api/navigate")
async def navigate_page(request: Request):
    """Analyze a page screenshot via Gemini vision and return UI navigation actions."""
    from server.tools.ui_navigator import analyze_page_screenshot
    try:
        body = await request.json()
        query = body.get("query", "Help me navigate this page")
        log_activity("nav", "UI analysis started", f"Query: {query[:80]}")
        result = await analyze_page_screenshot(
            screenshot_b64=body.get("screenshot", ""),
            dom_summary=body.get("dom_summary", {}),
            query=query,
            language=body.get("language", "English"),
            page_url=body.get("page_url", ""),
            page_title=body.get("page_title", ""),
        )
        actions_count = len(result.get("actions", []))
        log_activity("nav", f"UI analysis complete → {actions_count} actions", f"Query: {query[:80]}")
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Navigate endpoint error: {e}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "actions": [], "explanation": "Server error"},
        )

@app.get("/api/threats")
async def get_threats():
    """Return the OmniShield threat log."""
    from server.tools.omni_tools import get_threat_log
    threats = get_threat_log()
    return JSONResponse(content={
        "threats": threats,
        "count": len(threats),
    })


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    file_path = f"dist/{full_path}"
    if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    if os.path.exists("dist/index.html"):
        return FileResponse("dist/index.html")
    return JSONResponse({"message": "OmniD3sk API is running. Frontend build not found at dist/."})

@app.on_event("startup")
async def on_startup():
    # Phase 2: Initialize SQLite
    from server.db import init_db
    init_db()
    log_activity("system", "OmniD3sk started",
                 f"Model: {MODEL} | ADK: {is_adk_enabled()} | "
                 f"Agents: omniagent+omnishield+researcher+threat_intel | "
                 f"Tools: 18 (10 IT + 7 Shield + 1 Search) | SQLite: omniflow.db")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)

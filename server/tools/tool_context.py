"""
Tool Context - Provides tools with a way to send real-time status updates to the user.

Allows tools to notify the frontend about what they're doing asynchronously.
"""
import asyncio
import logging

logger = logging.getLogger(__name__)

# Global callback for sending messages to the user
_status_callback = None


def set_status_callback(callback):
    """Register the WebSocket callback for sending status updates."""
    global _status_callback
    _status_callback = callback
    logger.debug("Tool status callback registered")


def get_status_callback():
    """Get the current status callback."""
    return _status_callback


async def notify_tool_status(tool_name: str, status: str, detail: str = ""):
    """
    Send a real-time status update to the user about what a tool is doing.
    
    Args:
        tool_name: Name of the tool (e.g., "research_support_topic", "search_knowledge_base")
        status: Status message (e.g., "started", "searching", "processing", "completed")
        detail: Optional detail message (e.g., the query or what's being searched)
    """
    callback = get_status_callback()
    if callback is None:
        return  # No callback registered, silently skip
    
    try:
        message = {
            "type": "tool_status",
            "tool": tool_name,
            "status": status,
            "detail": detail[:200] if detail else "",
        }
        # Call the callback, handling both sync and async callbacks
        result = callback(message)
        if asyncio.iscoroutine(result):
            await result
    except Exception as e:
        logger.error(f"Error sending tool status: {e}")


async def notify_tool_started(tool_name: str, detail: str = ""):
    """Notify that a tool has started execution."""
    await notify_tool_status(tool_name, "started", detail)


async def notify_tool_progress(tool_name: str, message: str):
    """Notify about tool progress during execution."""
    await notify_tool_status(tool_name, "progress", message)


async def notify_tool_completed(tool_name: str, detail: str = ""):
    """Notify that a tool has completed successfully."""
    await notify_tool_status(tool_name, "completed", detail)

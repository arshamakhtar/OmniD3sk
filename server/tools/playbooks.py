import json
import logging
from typing import Dict, Any

from server.tools.omni_tools import scan_url_safety
from server.tools.itsm import create_itsm_ticket
from server.tools.notes_mcp import save_threat_report_to_notion
from server.tools.calendar_mcp import book_calendar_slot

logger = logging.getLogger(__name__)

async def execute_security_playbook(url: str) -> str:
    """Executes the full emergency security playbook sequentially."""
    logger.info(f"[Playbook] Starting security playbook for URL: {url}")
    
    try:
        # 1. Scan URL (async)
        logger.info("[Playbook] Step 1: Scanning URL")
        scan_result_str = await scan_url_safety(url)
        scan_result = json.loads(scan_result_str)
        threat_level = scan_result.get("threat_level", "unknown")
        
        # 2. Create ITSM ticket (sync)
        logger.info("[Playbook] Step 2: Creating ITSM ticket")
        ticket_title = f"{'Phishing' if threat_level in ('high', 'critical') else 'Security'} Alert: {url}"
        ticket_desc = f"Security incident reported for URL: {url}\n\nScan Result:\n{scan_result.get('summary', 'No summary')}"
        ticket_resp_str = create_itsm_ticket(
            title=ticket_title,
            description=ticket_desc,
            severity="critical" if threat_level in ["high", "critical"] else "medium",
            category="Security"
        )
        ticket_id = "Unknown"
        try:
            ticket_id = json.loads(ticket_resp_str).get("ticket_id", "Unknown")
        except Exception:
            pass
        
        # 3. Save Notion report (sync)
        logger.info("[Playbook] Step 3: Saving Notion report")
        notion_content = f"URL Analyzed: {url}\n\nThreat Level: {threat_level}\n\nDetailed Findings:\n{json.dumps(scan_result.get('findings', []), indent=2)}"
        notion_resp_str = save_threat_report_to_notion(
            title=f"Threat Report: {url}",
            content=notion_content,
            tags=["security-incident", threat_level]
        )
        notion_url = "Notion workspace"
        try:
            notion_url = json.loads(notion_resp_str).get("notion_url", "Notion workspace")
        except Exception:
            pass
        
        # 4. Book calendar (sync)
        logger.info("[Playbook] Step 4: Booking calendar slot")
        # Tomorrow's date for emergency sync
        book_calendar_slot(
            summary=f"Emergency Security Sync: {url}",
            duration_minutes=15
        )
        
        logger.info("[Playbook] Playbook execution completed successfully")
        return f"Playbook executed successfully. Ticket created: {ticket_id}. Documentation saved at: {notion_url}. Calendar booked for 15 minutes tomorrow."
    except Exception as e:
        logger.error(f"[Playbook] Playbook execution failed: {e}", exc_info=True)
        return f"Playbook execution failed: {str(e)}"

PLAYBOOK_DECLARATIONS = [
    {
        "name": "execute_security_playbook",
        "description": "Executes the full emergency security playbook sequentially for a reported URL. Automatically scans the URL safety, creates a high-priority ITSM ticket, documents the threat report to Notion, and immediately books a 15-minute emergency calendar slot for tomorrow with the Secure Ops team.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "url": {
                    "type": "STRING",
                    "description": "The URL involved in the security incident"
                }
            },
            "required": ["url"]
        }
    }
]

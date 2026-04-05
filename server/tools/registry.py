"""
Tool registry — single place to register all backend tools for OmniD3sk.
"""
import logging
from typing import List, Dict

from server.tools.kb_search import search_knowledge_base, KB_DECLARATIONS
from server.tools.itsm import create_itsm_ticket, update_itsm_ticket, ITSM_DECLARATIONS
from server.tools.portal_lookup import lookup_error_code, lookup_portal_page, PORTAL_DECLARATIONS
from server.tools.issue_tracker import create_issue, ISSUE_DECLARATIONS
from server.agents.diagnostic_expert import diagnose_issue, DIAGNOSIS_DECLARATIONS
from server.tools.search_grounding import research_support_topic, SEARCH_GROUNDING_DECLARATIONS
from server.tools.ui_navigator import navigate_user_browser, UI_NAVIGATOR_DECLARATIONS
from server.tools.omni_tools import (
    scan_url_safety,
    check_domain_reputation,
    analyze_page_for_threats,
    verify_domain_legitimacy,
    detect_fake_content,
    report_threat,
    highlight_danger_zones,
    OMNI_TOOL_DECLARATIONS,
)
from server.tools.calendar_mcp import book_calendar_slot, CALENDAR_DECLARATIONS
from server.tools.notes_mcp import save_threat_report_to_notion, NOTES_DECLARATIONS

logger = logging.getLogger(__name__)

# Aggregate all tool declarations for the Gemini setup message
TOOL_DECLARATIONS: List[Dict] = [
    *KB_DECLARATIONS,
    *ITSM_DECLARATIONS,
    *PORTAL_DECLARATIONS,
    *ISSUE_DECLARATIONS,
    *DIAGNOSIS_DECLARATIONS,
    *SEARCH_GROUNDING_DECLARATIONS,
    *UI_NAVIGATOR_DECLARATIONS,
    *OMNI_TOOL_DECLARATIONS,
    *CALENDAR_DECLARATIONS,
    *NOTES_DECLARATIONS,
]

# Map of function_name -> callable
_TOOL_HANDLERS = {
    # IT Helpdesk tools
    "search_knowledge_base": search_knowledge_base,
    "create_itsm_ticket": create_itsm_ticket,
    "update_itsm_ticket": update_itsm_ticket,
    "lookup_error_code": lookup_error_code,
    "lookup_portal_page": lookup_portal_page,
    "create_issue": create_issue,
    "diagnose_issue": diagnose_issue,
    "research_support_topic": research_support_topic,
    "navigate_user_browser": navigate_user_browser,
    # OmniShield tools
    "scan_url_safety": scan_url_safety,
    "check_domain_reputation": check_domain_reputation,
    "analyze_page_for_threats": analyze_page_for_threats,
    "verify_domain_legitimacy": verify_domain_legitimacy,
    "detect_fake_content": detect_fake_content,
    "report_threat": report_threat,
    "highlight_danger_zones": highlight_danger_zones,
    # MCP tools
    "book_calendar_slot": book_calendar_slot,
    "save_threat_report_to_notion": save_threat_report_to_notion,
}


def register_all_tools(gemini_client) -> None:
    """Register all backend tools into GeminiLive's tool_mapping."""
    for name, handler in _TOOL_HANDLERS.items():
        gemini_client.tool_mapping[name] = handler
        logger.info(f"Registered backend tool: {name}")
    logger.info(f"Total backend tools registered: {len(_TOOL_HANDLERS)}")

"""
ADK Multi-Agent Definition for OmniD3sk Platform.

Agent graph:
  root_agent (OmniAgent) — 10 IT FunctionTools + 2 sub-agents
    ├── researcher — google_search (IT research)
    └── omnishield — 7 Shield FunctionTools + 1 sub-agent
        └── threat_intel — google_search (scam/fact verification)

Activated via: ENABLE_ADK=true in .env
Default mode: Raw google-genai SDK (server/gemini_live.py)
"""
import os
import logging

logger = logging.getLogger(__name__)

MODEL = os.getenv("ADK_MODEL", "gemini-2.5-flash")
RESEARCH_MODEL = os.getenv("RESEARCH_MODEL", "gemini-2.5-flash")

_ADK_AVAILABLE = False
root_agent = None

try:
    if os.getenv("ENABLE_ADK", "").lower() == "true":
        from google.adk import Agent
        from google.adk.tools import FunctionTool, google_search

        # IT Helpdesk Tools
        from server.tools.kb_search import search_knowledge_base
        from server.tools.itsm import create_itsm_ticket, update_itsm_ticket
        from server.tools.portal_lookup import lookup_error_code, lookup_portal_page
        from server.tools.issue_tracker import create_issue
        from server.tools.ui_navigator import navigate_user_browser
        from server.agents.diagnostic_expert import diagnose_issue

        # OmniShield Tools
        from server.tools.omni_tools import (
            scan_url_safety,
            check_domain_reputation,
            analyze_page_for_threats,
            verify_domain_legitimacy,
            detect_fake_content,
            report_threat,
            highlight_danger_zones,
        )

        # MCP Tools
        from server.tools.calendar_mcp import book_calendar_slot
        from server.tools.notes_mcp import save_threat_report_to_notion

        from server.prompts import get_system_prompt, get_omni_prompt

        # ─── Researcher Sub-Agent ───
        researcher = Agent(
            name="researcher",
            model=RESEARCH_MODEL,
            instruction=(
                "You are a research assistant for IT helpdesk support. "
                "Use Google Search to find the latest information about portal outages, "
                "known issues, government service updates, visa processing times, "
                "tax filing deadlines, and technical solutions. "
                "Be specific, cite sources, and focus on actionable information."
            ),
            tools=[google_search],
        )

        # ─── Threat Intel Sub-Agent ───
        threat_intel = Agent(
            name="threat_intel",
            model=RESEARCH_MODEL,
            instruction=(
                "You research domains, URLs, and claims for scam/phishing reports "
                "and fact verification. Use Google Search to find scam reports, "
                "domain reputation, fact-checks from Reuters/BBC/AP, and verified sources. "
                "Return citations with source URLs. Be thorough — check multiple sources."
            ),
            tools=[google_search],
        )

        # ─── OmniShield Sub-Agent (Scam Shield) ───
        omnishield = Agent(
            name="omnishield",
            model=MODEL,
            description=(
                "OmniShield is the cybersecurity shield agent. Transfer to OmniShield when the user "
                "asks about page safety, scams, phishing, fake content, or domain legitimacy. "
                "Also transfer when you see suspicious pages on the user's screen, or when "
                "the user is about to enter credentials or payment on an unfamiliar site."
            ),
            instruction=get_omni_prompt(),
            tools=[
                FunctionTool(scan_url_safety),
                FunctionTool(check_domain_reputation),
                FunctionTool(analyze_page_for_threats),
                FunctionTool(verify_domain_legitimacy),
                FunctionTool(detect_fake_content),
                FunctionTool(report_threat),
                FunctionTool(highlight_danger_zones),
            ],
            sub_agents=[threat_intel],
        )

        # ─── Root Agent: OmniAgent ───
        root_agent = Agent(
            name="omniagent",
            model=MODEL,
            instruction=get_system_prompt(),
            tools=[
                FunctionTool(search_knowledge_base),
                FunctionTool(create_itsm_ticket),
                FunctionTool(update_itsm_ticket),
                FunctionTool(lookup_error_code),
                FunctionTool(lookup_portal_page),
                FunctionTool(create_issue),
                FunctionTool(diagnose_issue),
                FunctionTool(navigate_user_browser),
                FunctionTool(book_calendar_slot),
                FunctionTool(save_threat_report_to_notion),
            ],
            sub_agents=[researcher, omnishield],
        )

        _ADK_AVAILABLE = True
        logger.info(
            "ADK multi-agent initialized: omniagent (10 tools) "
            "+ researcher (google_search) "
            "+ omnishield (7 shield tools) "
            "+ threat_intel (google_search)"
        )

except ImportError as e:
    logger.info(f"ADK not available ({e}), using raw google-genai SDK")
except Exception as e:
    logger.warning(f"ADK initialization failed: {e}", exc_info=True)


def is_adk_enabled() -> bool:
    """Check if ADK orchestration is active."""
    return _ADK_AVAILABLE and root_agent is not None

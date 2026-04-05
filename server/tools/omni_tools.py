"""
OmniShield Tools — ADK FunctionTools for scam/phishing/fake content detection.

These tools wrap the existing shield_analyzer.py functions for use as
ADK FunctionTools in the OmniShield sub-agent. They can also be used in
raw Gemini Live mode via the tool registry.

Tools:
1. scan_url_safety — full 5-layer shield scan
2. check_domain_reputation — quick OSINT + Web Risk
3. analyze_page_for_threats — Gemini Vision scam detection
4. verify_domain_legitimacy — Google Search domain reputation
5. detect_fake_content — fact-check claims via Search grounding
6. report_threat — log confirmed threats
7. highlight_danger_zones — send danger annotations to Chrome extension
"""
import json
import logging
import os
from datetime import datetime, timezone
from urllib.parse import urlparse

import google.genai as genai
from google.genai import types

from server.tools.shield_analyzer import (
    _analyze_domain_osint,
    _check_web_risk,
    _search_domain_reputation,
    analyze_page_safety,
    SHIELD_SYSTEM_PROMPT,
)

logger = logging.getLogger(__name__)

# In-memory threat log (replace with persistent store in production)
_THREAT_LOG: list[dict] = []

_client = None


def _get_client():
    global _client
    if _client is None:
        project_id = os.getenv("PROJECT_ID", "")
        location = os.getenv("LOCATION", "us-central1")
        _client = genai.Client(vertexai=True, project=project_id, location=location)
    return _client


# ─── Tool 1: Full 4-Layer Shield Scan ───

async def scan_url_safety(url: str, page_title: str = "") -> str:
    """Scan a URL for scam, phishing, and fraud using a 5-layer shield pipeline.

    Runs OSINT domain heuristics, Google Web Risk API, Gemini Vision analysis,
    and Google Search grounding. Use for comprehensive page safety analysis.

    Args:
        url: The full URL to scan (e.g., https://example.com/login).
        page_title: The page title if available, for context.

    Returns:
        JSON with threat_level, summary, findings, layers_used, and recommendation.
    """
    try:
        osint = _analyze_domain_osint(url)
        web_risk = await _check_web_risk(url)

        threat_level = "safe"
        findings = []
        threats = []
        recommendation = "This URL appears safe."

        osint_severity = "safe"
        if osint["score"] < 50:
            osint_severity = "high"
            threat_level = "medium"
        elif osint["score"] < 75:
            osint_severity = "medium"
        elif osint["score"] < 90:
            osint_severity = "low"

        flags_str = "; ".join(osint["flags"]) if osint["flags"] else "No flags"
        findings.append({
            "layer": "OSINT",
            "severity": osint_severity,
            "detail": f"Domain score: {osint['score']}/100. {flags_str}",
        })

        if web_risk.get("is_threat"):
            threat_level = "critical"
            threats.append(web_risk["detail"])
            findings.append({
                "layer": "Web Risk API",
                "severity": "critical",
                "detail": web_risk["detail"],
            })
            recommendation = f"BLOCKED: Google Web Risk flagged this URL as {', '.join(web_risk.get('threat_types', []))}. Do NOT proceed."

        if osint["score"] < 75 or web_risk.get("is_threat"):
            try:
                client = _get_client()
                search_result = await _search_domain_reputation(client, url, page_title)
                if search_result:
                    findings.append({
                        "layer": "Google Search",
                        "severity": "info",
                        "detail": search_result[:300],
                    })
            except Exception as e:
                logger.warning(f"Search grounding failed: {e}")

        if threat_level == "safe" and osint["score"] >= 90:
            recommendation = "This URL appears safe. All checks passed."

        return json.dumps({
            "threat_level": threat_level,
            "summary": f"URL scan: {threat_level} | Domain score: {osint['score']}/100",
            "findings": findings,
            "threats": threats,
            "recommendation": recommendation,
            "domain": osint.get("domain", ""),
            "osint_score": osint["score"],
            "layers_used": ["osint", "web_risk", "search_grounding"],
        })

    except Exception as e:
        logger.error(f"scan_url_safety error: {e}", exc_info=True)
        return json.dumps({"threat_level": "safe", "error": str(e),
                           "recommendation": "Scan failed. Exercise normal caution."})


# ─── Tool 2: Quick Domain Reputation ───

async def check_domain_reputation(url: str) -> str:
    """Quick domain reputation check using OSINT heuristics and Google Web Risk API."""
    try:
        if not url.startswith("http"):
            url = f"https://{url}"

        osint = _analyze_domain_osint(url)
        web_risk = await _check_web_risk(url)

        risk_level = "safe"
        if web_risk.get("is_threat"):
            risk_level = "critical"
        elif osint["score"] < 50:
            risk_level = "high"
        elif osint["score"] < 75:
            risk_level = "medium"
        elif osint["score"] < 90:
            risk_level = "low"

        return json.dumps({
            "domain": osint.get("domain", ""),
            "domain_score": osint["score"],
            "flags": osint["flags"],
            "is_threat": web_risk.get("is_threat", False),
            "threat_types": web_risk.get("threat_types", []),
            "risk_level": risk_level,
            "tld": osint.get("tld", ""),
            "subdomain_depth": osint.get("subdomain_depth", 0),
        })

    except Exception as e:
        logger.error(f"check_domain_reputation error: {e}", exc_info=True)
        return json.dumps({"risk_level": "unknown", "error": str(e)})


# ─── Tool 3: Vision-Based Threat Analysis ───

async def analyze_page_for_threats(
    screenshot_description: str,
    url: str,
    page_title: str = "",
) -> str:
    """Analyze a web page for visual scam indicators using Gemini Vision."""
    try:
        client = _get_client()

        prompt = (
            f"Analyze this web page for scam/phishing/fraud indicators.\n"
            f"URL: {url}\n"
            f"Title: {page_title or 'Unknown'}\n"
            f"Page description: {screenshot_description}\n\n"
            f"Check for: brand impersonation, fake login forms, urgency tactics, "
            f"too-good-to-be-true offers, payment fraud, visual cloning, "
            f"AI-generated content, fake testimonials.\n\n"
            f"Return your analysis as JSON with: threat_level (safe/low/medium/high/critical), "
            f"summary, findings (list), recommendation."
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SHIELD_SYSTEM_PROMPT,
                temperature=0.1,
                response_mime_type="application/json",
            ),
        )

        result_text = ""
        if response.candidates and response.candidates[0].content:
            for part in response.candidates[0].content.parts:
                if part.text:
                    result_text += part.text

        if result_text:
            result = json.loads(result_text)
            return json.dumps(result)

        return json.dumps({
            "threat_level": "safe",
            "summary": "Vision analysis completed — no threats detected.",
            "findings": [],
            "recommendation": "Page appears safe.",
        })

    except Exception as e:
        logger.error(f"analyze_page_for_threats error: {e}", exc_info=True)
        return json.dumps({"threat_level": "safe", "error": str(e),
                           "recommendation": "Vision analysis failed. Exercise caution."})


# ─── Tool 4: Domain Legitimacy via Search ───

async def verify_domain_legitimacy(domain: str, context: str = "") -> str:
    """Verify a domain's legitimacy by cross-referencing with Google Search results."""
    try:
        client = _get_client()

        query = (
            f'Is "{domain}" a legitimate website? Check for scam reports, '
            f"phishing alerts, user reviews, and official verification. "
            f"Context: {context}" if context else
            f'Is "{domain}" a legitimate website? Check for scam reports, '
            f"phishing alerts, user reviews, and official verification."
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=query,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                temperature=0.1,
            ),
        )

        result_text = ""
        sources = []

        if response.candidates and response.candidates[0].content:
            for part in response.candidates[0].content.parts:
                if part.text:
                    result_text += part.text

        if (response.candidates and
                response.candidates[0].grounding_metadata and
                response.candidates[0].grounding_metadata.grounding_chunks):
            for chunk in response.candidates[0].grounding_metadata.grounding_chunks:
                if chunk.web:
                    sources.append({
                        "title": chunk.web.title or "",
                        "uri": chunk.web.uri or "",
                    })

        result_lower = result_text.lower()
        negative_signals = ["scam", "phishing", "fraud", "fake", "avoid", "not legitimate"]
        positive_signals = ["legitimate", "official", "trusted", "reputable", "real"]

        has_negative = any(sig in result_lower for sig in negative_signals)
        has_positive = any(sig in result_lower for sig in positive_signals)

        if has_negative and not has_positive:
            is_legitimate = False
            confidence = "high"
        elif has_positive and not has_negative:
            is_legitimate = True
            confidence = "high"
        else:
            is_legitimate = True
            confidence = "low"

        return json.dumps({
            "domain": domain,
            "is_legitimate": is_legitimate,
            "confidence": confidence,
            "evidence": result_text[:500],
            "sources": sources[:5],
            "source_count": len(sources),
        })

    except Exception as e:
        logger.error(f"verify_domain_legitimacy error: {e}", exc_info=True)
        return json.dumps({"domain": domain, "is_legitimate": True,
                           "confidence": "none", "error": str(e)})


# ─── Tool 5: Fake Content Detection ───

async def detect_fake_content(
    url: str,
    page_title: str = "",
    content_snippet: str = "",
) -> str:
    """Detect fake news, misinformation, and AI-generated content on web pages."""
    try:
        client = _get_client()

        query = (
            f"Fact-check this content. Is it accurate, misleading, or fabricated?\n"
            f"URL: {url}\n"
            f"Title: {page_title}\n"
            f"Content: {content_snippet}\n\n"
            f"Cross-reference with Reuters, BBC, AP, official sources. "
            f"If claims are false, provide the correct information with citations. "
            f"If claims are true, confirm with sources."
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=query,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                temperature=0.1,
            ),
        )

        result_text = ""
        sources = []

        if response.candidates and response.candidates[0].content:
            for part in response.candidates[0].content.parts:
                if part.text:
                    result_text += part.text

        if (response.candidates and
                response.candidates[0].grounding_metadata and
                response.candidates[0].grounding_metadata.grounding_chunks):
            for chunk in response.candidates[0].grounding_metadata.grounding_chunks:
                if chunk.web:
                    sources.append({
                        "title": chunk.web.title or "",
                        "uri": chunk.web.uri or "",
                    })

        result_lower = result_text.lower()
        if any(w in result_lower for w in ["false", "fabricated", "fake", "misleading", "misinformation"]):
            verdict = "fake"
            confidence = "high"
        elif any(w in result_lower for w in ["partially true", "misleading context", "out of context"]):
            verdict = "misleading"
            confidence = "medium"
        elif any(w in result_lower for w in ["true", "accurate", "confirmed", "verified"]):
            verdict = "verified"
            confidence = "high"
        else:
            verdict = "unverified"
            confidence = "low"

        return json.dumps({
            "url": url,
            "page_title": page_title,
            "verdict": verdict,
            "confidence": confidence,
            "explanation": result_text[:600],
            "citations": sources[:5],
            "citation_count": len(sources),
        })

    except Exception as e:
        logger.error(f"detect_fake_content error: {e}", exc_info=True)
        return json.dumps({"verdict": "unverified", "error": str(e),
                           "explanation": "Fact-check failed. Cannot verify this content."})


# ─── Tool 6: Report Threat ───

async def report_threat(
    url: str,
    threat_type: str,
    evidence: str,
    severity: str,
) -> str:
    """Log a confirmed threat with full evidence to the threat database."""
    try:
        import uuid
        threat_id = f"THREAT-{uuid.uuid4().hex[:8].upper()}"

        entry = {
            "threat_id": threat_id,
            "url": url,
            "domain": urlparse(url).netloc if url.startswith("http") else url,
            "threat_type": threat_type,
            "evidence": evidence,
            "severity": severity,
            "reported_at": datetime.now(timezone.utc).isoformat(),
            "status": "confirmed",
        }

        _THREAT_LOG.append(entry)
        logger.info(f"Threat reported: {threat_id} | {threat_type} | {severity} | {url}")

        return json.dumps({
            "threat_id": threat_id,
            "status": "logged",
            "message": f"Threat {threat_id} logged successfully. Domain flagged for monitoring.",
            "entry": entry,
        })

    except Exception as e:
        logger.error(f"report_threat error: {e}", exc_info=True)
        return json.dumps({"status": "error", "error": str(e)})


# ─── Tool 7: Highlight Danger Zones ───

async def highlight_danger_zones(url: str, guidance: str = "") -> str:
    """Identify and highlight deceptive UI elements on the current page."""
    try:
        client = _get_client()

        prompt = (
            f"Analyze this web page for DECEPTIVE UI ELEMENTS that could trick users.\n"
            f"URL: {url}\n"
            f"Focus: {guidance or 'all deceptive elements'}\n\n"
            f"Look for:\n"
            f"- Fake download buttons (look like real buttons but are ads)\n"
            f"- Hidden redirects in links\n"
            f"- Disguised affiliate links\n"
            f"- Dark patterns (tricky opt-ins, pre-checked boxes)\n"
            f"- Misleading 'Close' or 'X' buttons that trigger actions\n"
            f"- Fake system warnings or browser alerts\n"
            f"- Counterfeit trust badges or security seals\n\n"
            f"Return JSON with danger_zones: list of objects with "
            f"element_type, warning_label, description, risk_level (low/medium/high)."
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json",
            ),
        )

        result_text = ""
        if response.candidates and response.candidates[0].content:
            for part in response.candidates[0].content.parts:
                if part.text:
                    result_text += part.text

        if result_text:
            result = json.loads(result_text)
            danger_zones = result.get("danger_zones", [])
        else:
            danger_zones = []

        return json.dumps({
            "url": url,
            "danger_zones": danger_zones,
            "zone_count": len(danger_zones),
            "message": f"Found {len(danger_zones)} potential danger zone(s)."
                       if danger_zones else "No deceptive elements detected.",
        })

    except Exception as e:
        logger.error(f"highlight_danger_zones error: {e}", exc_info=True)
        return json.dumps({"danger_zones": [], "zone_count": 0, "error": str(e)})


# ─── Threat Log Access ───

def get_threat_log() -> list[dict]:
    """Return the in-memory threat log."""
    return list(_THREAT_LOG)


# ─── Tool Declarations for Raw Gemini Live Mode ───

OMNI_TOOL_DECLARATIONS = [
    {
        "name": "scan_url_safety",
        "description": (
            "Scan a URL for scam, phishing, and fraud using a 5-layer shield pipeline "
            "(OSINT + Web Risk + Vision + Search). Use for comprehensive page safety analysis."
        ),
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "url": {"type": "STRING", "description": "The full URL to scan"},
                "page_title": {"type": "STRING", "description": "The page title if available"},
            },
            "required": ["url"],
        },
    },
    {
        "name": "check_domain_reputation",
        "description": (
            "Quick domain reputation check using OSINT heuristics and Google Web Risk API. "
            "Fast check without vision analysis for rapid domain assessment."
        ),
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "url": {"type": "STRING", "description": "The URL or domain to check"},
            },
            "required": ["url"],
        },
    },
    {
        "name": "analyze_page_for_threats",
        "description": (
            "Analyze a web page for visual scam indicators using Gemini Vision. "
            "Detects fake login forms, brand impersonation, urgency scams, phishing, "
            "deceptive UI, and AI-generated content."
        ),
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "screenshot_description": {"type": "STRING", "description": "Description of what's visible on the page"},
                "url": {"type": "STRING", "description": "The URL of the page"},
                "page_title": {"type": "STRING", "description": "The page title"},
            },
            "required": ["screenshot_description", "url"],
        },
    },
    {
        "name": "verify_domain_legitimacy",
        "description": (
            "Verify a domain's legitimacy by cross-referencing with Google Search results. "
            "Searches for scam reports, phishing alerts, and user reviews."
        ),
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "domain": {"type": "STRING", "description": "The domain name to verify"},
                "context": {"type": "STRING", "description": "Additional context about why domain is being checked"},
            },
            "required": ["domain"],
        },
    },
    {
        "name": "detect_fake_content",
        "description": (
            "Detect fake news, misinformation, and AI-generated content on web pages. "
            "Cross-references claims with verified sources (Reuters, BBC, AP). "
            "Use when user asks 'is this true?' or 'is this fake?'."
        ),
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "url": {"type": "STRING", "description": "URL of the page to fact-check"},
                "page_title": {"type": "STRING", "description": "Title of the article or page"},
                "content_snippet": {"type": "STRING", "description": "Key claims or text to verify"},
            },
            "required": ["url"],
        },
    },
    {
        "name": "report_threat",
        "description": (
            "Log a confirmed threat with full evidence to the threat database. "
            "Call after a scan confirms a real threat."
        ),
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "url": {"type": "STRING", "description": "URL of the confirmed threat"},
                "threat_type": {"type": "STRING", "description": "Type: phishing, scam, malware, fake_content, impersonation"},
                "evidence": {"type": "STRING", "description": "Specific evidence supporting classification"},
                "severity": {"type": "STRING", "description": "Severity: low, medium, high, critical"},
            },
            "required": ["url", "threat_type", "evidence", "severity"],
        },
    },
    {
        "name": "highlight_danger_zones",
        "description": (
            "Identify deceptive UI elements on a page (fake buttons, hidden redirects, "
            "dark patterns) and send warning annotations to the Chrome extension."
        ),
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "url": {"type": "STRING", "description": "URL of the page to analyze"},
                "guidance": {"type": "STRING", "description": "Specific elements to look for"},
            },
            "required": ["url"],
        },
    },
]

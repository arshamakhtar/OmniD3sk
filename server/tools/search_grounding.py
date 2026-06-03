"""
Google Search Grounding Tool.

Uses Gemini Flash with Google Search grounding to research IT support topics,
find latest portal updates, known issues, and solutions from the web.
"""
import asyncio
import hashlib
import json
import logging
import os
from datetime import datetime, timedelta

import google.genai as genai
from google.genai import types

logger = logging.getLogger(__name__)

_client = None
_search_cache = {}  # {query_hash: (result, timestamp)}
CACHE_TTL_MINUTES = 5


def _get_client():
    global _client
    if _client is None:
        project_id = os.getenv("PROJECT_ID", "")
        location = os.getenv("LOCATION", "us-central1")
        _client = genai.Client(vertexai=True, project=project_id, location=location)
    return _client


async def research_support_topic(query: str) -> str:
    """Research an IT support topic using Google Search for latest solutions and updates."""
    
    # Check cache first
    cache_key = hashlib.sha256(query.encode()).hexdigest()
    if cache_key in _search_cache:
        result, ts = _search_cache[cache_key]
        if (datetime.now() - ts).total_seconds() < CACHE_TTL_MINUTES * 60:
            logger.info(f"Cache HIT: research_support_topic({query[:50]}...)")
            return result

    async def _do_research():
        import time
        start = time.time()
        try:
            logger.info(f"Starting search grounding for: {query[:50]}...")
            client = _get_client()
            loop = asyncio.get_running_loop()
            
            logger.info("Calling Gemini with Google Search...")
            response = await loop.run_in_executor(
                None,
                lambda: client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=(
                        f"You are an IT helpdesk expert. Research this topic and give: "
                        f"1) Current known issues/outages, 2) Root cause, 3) Step-by-step fix. "
                        f"Be concise and practical. Topic: {query}"
                    ),
                    config=types.GenerateContentConfig(
                        tools=[types.Tool(google_search=types.GoogleSearch())],
                        temperature=0.2,
                    ),
                )
            )
            
            logger.info(f"Gemini response received after {time.time()-start:.1f}s")

            result_text = ""
            grounding_sources = []

            if response.candidates and response.candidates[0].content:
                for part in response.candidates[0].content.parts:
                    if part.text:
                        result_text += part.text

            if (response.candidates and
                    response.candidates[0].grounding_metadata and
                    response.candidates[0].grounding_metadata.grounding_chunks):
                for chunk in response.candidates[0].grounding_metadata.grounding_chunks:
                    if chunk.web:
                        grounding_sources.append({
                            "title": chunk.web.title or "",
                            "uri": chunk.web.uri or "",
                        })

            result = json.dumps({
                "success": True,
                "query": query,
                "answer": result_text,
                "sources": grounding_sources[:5],
                "source_count": len(grounding_sources),
            })
            
            # Cache the result
            _search_cache[cache_key] = (result, datetime.now())
            elapsed = time.time() - start
            logger.info(f"Cache SET: research_support_topic completed in {elapsed:.1f}s")
            return result

        except Exception as e:
            elapsed = time.time() - start
            logger.error(f"Google Search grounding error after {elapsed:.1f}s: {e}", exc_info=True)
            return json.dumps({
                "success": False,
                "query": query,
                "error": str(e),
                "answer": f"Search grounding failed: {e}. Falling back to internal KB.",
            })

    try:
        return await asyncio.wait_for(_do_research(), timeout=25.0)
    except asyncio.TimeoutError:
        logger.warning(f"research_support_topic timed out after 25s for query: {query[:50]}...")
        return json.dumps({
            "success": False,
            "query": query,
            "error": "Research timed out after 25s",
            "answer": "Web research timed out. The Gemini API or Google Search is running slowly. Proceeding with internal knowledge base only.",
        })


SEARCH_GROUNDING_DECLARATIONS = [
    {
        "name": "research_support_topic",
        "description": (
            "Research an IT support topic using Google Search for latest portal updates, "
            "known outages, and solutions. Use for issues where the internal knowledge base "
            "has no answer, or when you need the latest information about a portal error, "
            "government service update, or technical issue."
        ),
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "query": {
                    "type": "STRING",
                    "description": "The support topic to research — e.g. 'income tax portal login issues today' or 'VFS Schengen visa appointment availability'"
                }
            },
            "required": ["query"]
        }
    }
]

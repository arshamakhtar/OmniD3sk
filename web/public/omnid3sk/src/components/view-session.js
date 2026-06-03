import { GeminiLiveAPI, MultimodalLiveResponseType } from '../lib/gemini-live/geminilive.js';
import { AudioStreamer, AudioPlayer, ScreenCapture } from '../lib/gemini-live/mediaUtils.js';
import './audio-visualizer.js';
import './live-transcript.js';
import './issue-panel.js';
import './diagnostic-tracker.js';
import './agent-guidance.js';

const SYSTEM_PROMPT = `You are the Virtual Internal Assistant for OmniD3sk. You help users navigate government portals, visa applications, tax filing systems, and online services. You are relentless, thorough, and you NEVER close a case with missing information.

PERSONALITY:
- Relentless investigator: You do NOT accept vague answers. If the user says "it's not working," you demand the exact error message, the exact page they are on, and the exact step where it fails.
- Skeptical but helpful: "Trust, but verify." Users unintentionally omit steps. You assume they are leaving things out and you ask follow-up questions to fill gaps.
- SLA-obsessed: Categorize issues into P1 (Showstopper — user completely blocked), P2 (Critical — workaround exists), P3 (Standard — inconvenience).
- Defensive solutioning: Don't just fix errors; ensure the user can complete their full workflow.
- Professional, warm but firm, technically precise. Max 2-3 sentences per response.

MANDATORY INFORMATION CHECKLIST — YOU MUST COLLECT ALL OF THESE:
Before you can consider ANY issue understood, you MUST have collected:
1. User's name
2. Which portal or service they are using (visa application, tax filing, passport, etc.)
3. Exact error message or what they see on screen
4. Which page or section they are on (login, form, payment, upload, status check)
5. What they were trying to do (submit form, upload document, make payment, check status)
6. When it started happening (today? always? after a specific action?)
7. Who is affected (just them, or others they know)
8. What browser they are using
9. Steps they have already tried

DO NOT MOVE ON until you have items 1-7. If the user tries to skip, push back firmly:
"I need to know the exact error message before I can help. Can you read it to me exactly as it appears on screen?"
"Which page were you on when this happened? Login, the form, payment?"
"Is this just affecting you, or are other people having the same problem?"

PROTOCOL:
1. Triage (First 30s): Capture user name, portal name, error message, page. Assess impact and urgency. Do NOT proceed until you have these basics.
2. Sanity Check (Mandatory): Ask user to refresh the page. Check browser, incognito mode, cache. Rule out basic issues first.
3. Tool Blitz: The MOMENT you have an error code or description, call ALL relevant tools:
   - lookup_error_code with the error code
   - lookup_portal_page with the page/section name
   - search_knowledge_base with the error description
   - diagnose_issue to cross-reference everything
   Do NOT wait. Call them immediately. Call multiple tools per turn.
4. Guided Troubleshooting: Instruct user to try:
   - Clear browser cache and cookies
   - Try incognito/private mode
   - Try a different browser
   - Check file sizes before upload
   - Verify date formats
   - Disable popup blocker
5. Resolution Attempt: Try AT LEAST 2-3 approaches before escalating. Check KB, try standard fixes, verify user input. Only escalate after exhausting options.
6. Issue Logging: Call create_issue for EVERY distinct problem identified.
7. Ticket Creation: Call create_itsm_ticket with the FULL Diagnostic Report.

PROBING QUESTIONS:
- "When was the last time this worked correctly for you?"
- "Did anything change recently — new browser, cleared cookies, different device?"
- "Can you tell me exactly what you see on the screen right now?"
- "Did you get any reference number or confirmation before the error?"
- "What language is the portal showing in?"

SCREEN ANALYSIS:
When users share screens, actively call out what you see:
- "I can see you're on the payment page. The error says 'Transaction timed out'."
- Identify error messages, form fields, buttons, status indicators, page sections.
- If you spot an error on screen, immediately call lookup_error_code.
- If you see form fields highlighted in red, call out which fields need attention.

TOOLS — WHEN TO USE EACH:
- search_knowledge_base: Search FIRST when user mentions any error. Try different terms if no results.
- lookup_error_code: Call IMMEDIATELY when you see an error code. No delay.
- lookup_portal_page: Call when user mentions which page they are on.
- diagnose_issue: Use for complex problems to cross-reference KB, errors, and page context.
- create_issue: Log a problem AFTER you have confirmed it.
- create_itsm_ticket: Create after trying to resolve. Include full Diagnostic Report.
- update_itsm_ticket: Update with resolution notes or escalation details.
- research_support_topic: Google Search for latest portal updates and known issues.

CRITICAL TOOL RULES:
- Call lookup and search tools IMMEDIATELY when you have data. Do not announce — just call.
- If KB search returns no results, try different search terms.

TICKET DISCIPLINE — DO NOT RUSH:
- Do NOT create a ticket in the first 2 minutes. Spend that time diagnosing.
- FIRST priority: try to RESOLVE the issue yourself.
- SECOND priority: create a ticket documenting what happened.
- ONE ticket per session. Never create duplicates.

GUARDRAILS:
- Direct instructions only. Never "I am checking." Say "Click the three dots menu and select Clear browsing data."
- No fluff. Focus on the exact error and exact page.
- Empathetic but efficient. Acknowledge frustration once, then focus on solving.
- Never guess. If KB has no match, escalate with full documentation.
- NEVER say "I'll look into it." Fix now or escalate with complete diagnostics.
- Language sensitivity: help translate portal elements if user is struggling.

VOICE-FIRST RULE — MOST IMPORTANT:
- ALWAYS speak a brief verbal acknowledgment BEFORE calling any tools.
- Example: "Got it, let me look that up right now." or "504 timeout — that's a gateway issue. Checking the knowledge base."
- THEN call the tools in the background. The user must hear your voice within 2-3 seconds of finishing their turn.
- NEVER go silent for more than a few seconds. If tools are running, say something like "Looking that up now."

TURN-BASED CONVERSATION — THIS IS CRITICAL:
- You speak ONCE, then WAIT for the user to respond. STOP after speaking.
- ONE response per turn. Never send multiple consecutive messages.
- If you asked a question, STOP and wait for the answer.

CRITICAL SPEECH RULES:
- NEVER repeat yourself. Keep responses to 1-2 sentences MAX.
- Do NOT narrate your actions AFTER tools — the user sees the UI updates.
- Create each ticket ONCE. After calling a tool, move to the NEXT step.
- ALWAYS acknowledge the user verbally first, then call tools.

GREETING:
"Hi, I'm your Virtual Internal Assistant at OmniD3sk. I'm here to help you navigate any portal issues — whether it's visa applications, tax filing, government services, or any online platform. What's your name, and what portal are you working with today?"
After the greeting, ask for their name, the portal, and the error.

ABSOLUTE RULE — TURN DISCIPLINE:
After you finish speaking, STOP. One turn = one response = then silence. WAIT for the user.`;

const TOOL_META = {
    search_knowledge_base:  { label: 'KB Search',      color: '#4d9ff7', icon: '🔍' },
    lookup_error_code:      { label: 'Error Lookup',    color: '#e57373', icon: '⚠' },
    lookup_portal_page:     { label: 'Page Lookup',     color: '#ffb74d', icon: '📋' },
    diagnose_issue:         { label: 'Diagnosis',       color: '#ba68c8', icon: '🔬' },
    create_issue:           { label: 'Issue Logged',    color: '#ff8a65', icon: '📌' },
    create_itsm_ticket:     { label: 'Ticket Created',  color: '#81c784', icon: '🎫' },
    update_itsm_ticket:     { label: 'Ticket Updated',  color: '#81c784', icon: '✏' },
    research_support_topic: { label: 'Web Research',    color: '#4dd0e1', icon: '🌐' },
};

class ViewSession extends HTMLElement {
    constructor() {
        super();
        this.geminiClient = null;
        this.audioStreamer = null;
        this.audioPlayer = null;
        this.screenCapture = null;
        this._isSessionConnected = false;
        this.isScreenSharing = false;
        this.isSpeaking = false;
        this.sessionToken = null;
        this._timerInterval = null;
        this._sessionStartTime = null;
        this._cmdToastTimeout = null;
        this._currentPriority = null;
        this._toolCallCount = 0;
        this._pendingUserTranscript = '';
        this._pendingModelTranscript = '';
        this._panelOpen = false;
        this._activeTab = 'activity';
        this._toolEntries = [];
        this._logEntries = [];
        // Insights state
        this._summaryPoints = [];
        this._currentSentiment = 'neutral';
        this._sentimentHistory = [];
        this._detectedInfo = { user: null, module: null, tcode: null, error: null, issue: null };
    }

    connectedCallback() {
        this.innerHTML = `
            <style>
                /* ═══════════════════════════════════════════════════
                   OMNID3SK — Split Layout
                   Center: Conversation  |  Bottom: Controls
                   Right panel: On-demand activity/logs
                   ═══════════════════════════════════════════════════ */

                .m-root {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow: hidden;
                    background: var(--color-bg);
                }

                /* ─── Top Bar ─── */
                .m-topbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 20px;
                    height: 56px;
                    flex-shrink: 0;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                }
                .m-topbar-left {
                    display: flex; align-items: center; gap: 12px;
                }
                .m-back {
                    background: none; border: none; cursor: pointer;
                    color: var(--color-text-main); opacity: 0.3; padding: 6px;
                    border-radius: 50%; display: flex; transition: all 0.2s;
                    width: 36px; height: 36px; align-items: center; justify-content: center;
                }
                .m-back:hover { opacity: 0.7; background: rgba(255,255,255,0.05); }
                .m-title {
                    font-family: var(--font-heading);
                    font-size: 1rem; font-weight: 700;
                    color: var(--color-text-main);
                }
                .m-subtitle {
                    font-size: 0.7rem; color: var(--color-text-sub); opacity: 0.6;
                    margin-left: 8px; font-weight: 600;
                }

                .m-topbar-center {
                    display: flex; align-items: center; gap: 14px;
                    position: absolute; left: 50%; transform: translateX(-50%);
                }
                .m-live-dot {
                    width: 8px; height: 8px; border-radius: 50%;
                    background: #444; transition: all 0.3s;
                }
                .m-live-dot.on {
                    background: #81c784;
                    box-shadow: 0 0 10px rgba(129,199,132,0.5);
                    animation: mPulse 2s ease-in-out infinite;
                }
                @keyframes mPulse {
                    0%,100% { box-shadow: 0 0 5px rgba(129,199,132,0.3); }
                    50% { box-shadow: 0 0 14px rgba(129,199,132,0.7); }
                }
                .m-status {
                    font-size: 0.65rem; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 0.1em;
                    color: #555; transition: color 0.3s;
                }
                .m-status.on { color: #81c784; }
                .m-timer {
                    font-size: 0.8rem; font-weight: 700;
                    font-variant-numeric: tabular-nums;
                    color: var(--color-text-main); opacity: 0;
                    transition: opacity 0.3s;
                }
                .m-timer.on { opacity: 0.5; }
                .m-sla {
                    font-size: 0.6rem; font-weight: 800;
                    padding: 2px 10px; border-radius: 20px;
                    display: none; letter-spacing: 0.06em;
                    text-transform: uppercase;
                }
                .m-sla.visible { display: inline-flex; }
                .m-sla.p1 { background: rgba(229,115,115,0.12); color: #e57373; border: 1px solid rgba(229,115,115,0.2); }
                .m-sla.p2 { background: rgba(255,183,77,0.12); color: #ffb74d; border: 1px solid rgba(255,183,77,0.2); }
                .m-sla.p3 { background: rgba(129,199,132,0.12); color: #81c784; border: 1px solid rgba(129,199,132,0.2); }

                .m-topbar-right {
                    display: flex; align-items: center; gap: 8px;
                }
                .m-lang {
                    font-size: 0.6rem; font-weight: 700;
                    color: var(--color-accent-secondary);
                    background: rgba(240,171,0,0.06);
                    border: 1px solid rgba(240,171,0,0.1);
                    padding: 2px 10px; border-radius: 20px;
                    display: none; text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                /* ─── Main Content (Bento Grid) ─── */
                .m-body {
                    flex: 1; display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 24px; padding: 24px; min-height: 0;
                }
                .bento-pane {
                    background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; min-height: 0; overflow: hidden; position: relative;
                }
                .bento-header { font-family: var(--font-heading); font-size: 0.85rem; font-weight: 700; color: var(--color-text-main); opacity: 0.8; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; flex-shrink: 0; }
                .m-center {
                    align-items: center; justify-content: center;
                    background-color: #020205;
                    background-image: linear-gradient(rgba(100, 100, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 100, 255, 0.05) 1px, transparent 1px);
                    background-size: 40px 40px;
                    background-position: center;
                    box-shadow: inset 80px 0 150px -50px rgba(80, 40, 255, 0.15), inset -80px 0 150px -50px rgba(80, 40, 255, 0.15);
                }
                .m-conversation {
                    flex: 1;
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                }
                .m-conversation live-transcript {
                    flex: 1;
                    min-height: 0;
                }
                /* ─── Mana Persona Orb (3D Glossy Sphere) ─── */
                .mana-orb {
                    width: 180px; height: 180px; flex-shrink: 0;
                    position: relative;
                    display: flex; align-items: center; justify-content: center;
                    transition: filter 0.7s ease;
                }

                .mana-core {
                    width: 180px; height: 180px; border-radius: 50%;
                    position: relative;
                    overflow: hidden;
                    transition: background 0.7s ease, box-shadow 0.7s ease;
                }

                .mana-specular {
                    position: absolute;
                    width: 50%; height: 40%;
                    top: 10%; left: 12%;
                    border-radius: 50%;
                    background: radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 40%, transparent 70%);
                    filter: blur(8px);
                    pointer-events: none;
                    transition: opacity 0.7s ease;
                }

                /* ── Asleep: dark charcoal ── */
                .mana-orb.state-asleep { filter: none; }
                .mana-orb.state-asleep .mana-core {
                    background: radial-gradient(circle at 38% 32%, #3a3a3a 0%, #222 35%, #141414 70%, #0a0a0a 100%);
                    box-shadow: inset -12px -12px 30px rgba(0,0,0,0.9), inset 6px 6px 15px rgba(255,255,255,0.04);
                }
                .mana-orb.state-asleep .mana-specular { opacity: 0.08; }

                /* ── Idle: deep navy blue ── */
                .mana-orb.state-idle { filter: drop-shadow(0 0 18px rgba(40,90,220,0.35)); }
                .mana-orb.state-idle .mana-core {
                    background: radial-gradient(circle at 38% 32%, #3d6fd4 0%, #1e418a 35%, #0f2155 70%, #080f2a 100%);
                    box-shadow: inset -12px -12px 30px rgba(0,0,30,0.9), inset 6px 6px 15px rgba(100,160,255,0.2);
                    animation: manaIdleFloat 4s ease-in-out infinite;
                }
                .mana-orb.state-idle .mana-specular { opacity: 0.75; }

                /* ── Listening: bright cobalt ── */
                .mana-orb.state-listening { filter: drop-shadow(0 0 24px rgba(60,130,255,0.5)); }
                .mana-orb.state-listening .mana-core {
                    background: radial-gradient(circle at 38% 32%, #5a8eff 0%, #2a58d8 30%, #172fa8 65%, #0c1a70 100%);
                    box-shadow: inset -12px -12px 30px rgba(0,5,50,0.85), inset 6px 6px 15px rgba(130,190,255,0.3);
                    animation: manaListenPulse 1.8s ease-in-out infinite;
                }
                .mana-orb.state-listening .mana-specular { opacity: 0.9; }

                /* ── Thinking: electric indigo/violet ── */
                .mana-orb.state-thinking { filter: drop-shadow(0 0 30px rgba(110,70,255,0.6)); }
                .mana-orb.state-thinking .mana-core {
                    background: radial-gradient(circle at 38% 32%, #8060f0 0%, #4830c0 30%, #251580 65%, #100840 100%);
                    box-shadow: inset -12px -12px 30px rgba(10,0,60,0.85), inset 6px 6px 15px rgba(170,130,255,0.35);
                    animation: manaThinkPulse 1.2s ease-in-out infinite alternate;
                }
                .mana-orb.state-thinking .mana-specular { opacity: 0.95; background: radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(220,180,255,0.5) 40%, transparent 70%); }

                /* ── Speaking: blazing azure ── */
                .mana-orb.state-speaking { filter: drop-shadow(0 0 40px rgba(60,150,255,0.8)); }
                .mana-orb.state-speaking .mana-core {
                    background: radial-gradient(circle at 38% 32%, #80c0ff 0%, #3878f0 25%, #1a50d0 60%, #0c2880 100%);
                    box-shadow: inset -12px -12px 30px rgba(0,10,80,0.8), inset 6px 6px 15px rgba(180,220,255,0.5), 0 0 20px rgba(60,150,255,0.3);
                    animation: manaSpeakPulse 0.35s ease-in-out infinite alternate;
                }
                .mana-orb.state-speaking .mana-specular { opacity: 1; filter: blur(5px); }

                @keyframes manaIdleFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-5px) scale(1.01); } }
                @keyframes manaListenPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
                @keyframes manaThinkPulse { 0% { transform: scale(0.97); } 100% { transform: scale(1.04); } }
                @keyframes manaSpeakPulse { 0% { transform: scale(1.02); } 100% { transform: scale(1.08); } }
                .m-screen-bar.visible { display: block; }
                .m-screen-box { max-width: 240px; aspect-ratio: 16/9; border-radius: 10px; overflow: hidden; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); }
                .m-screen-box video, .m-screen-box img { width: 100%; height: 100%; object-fit: contain; }

                /* ─── Bottom Controls (Controls bar) ─── */
                .m-controls {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 16px 24px;
                    border-top: 1px solid rgba(255,255,255,0.04);
                    flex-shrink: 0;
                    position: relative;
                }

                /* Round control buttons */
                .m-ctrl-btn {
                    width: 48px; height: 48px;
                    border-radius: 50%;
                    border: none;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
                    position: relative;
                    background: rgba(255,255,255,0.08);
                    color: var(--color-text-main);
                }
                .m-ctrl-btn:hover {
                    background: rgba(255,255,255,0.14);
                    transform: scale(1.05);
                }
                .m-ctrl-btn:disabled {
                    opacity: 0.25; cursor: default;
                    transform: none !important;
                }
                .m-ctrl-btn:disabled:hover {
                    background: rgba(255,255,255,0.08);
                }
                .m-ctrl-btn.active-share {
                    background: rgba(229,115,115,0.15);
                    color: #e57373;
                }
                .m-ctrl-btn.muted {
                    background: rgba(234,67,53,0.15);
                    color: #ea4335;
                }
                .m-ctrl-btn.muted svg line.slash { display: block; }
                .m-ctrl-btn:not(.muted) svg line.slash { display: none; }
                .m-ctrl-btn svg { flex-shrink: 0; }

                /* Tooltip */
                .m-ctrl-btn .m-tip {
                    position: absolute; bottom: calc(100% + 8px);
                    left: 50%; transform: translateX(-50%);
                    background: rgba(0,0,0,0.85); color: #fff;
                    font-size: 0.65rem; font-weight: 600;
                    padding: 4px 10px; border-radius: 6px;
                    white-space: nowrap; pointer-events: none;
                    opacity: 0; transition: opacity 0.15s;
                }
                .m-ctrl-btn:hover .m-tip { opacity: 1; }

                /* The big mic/end button */
                .m-mic-btn {
                    width: 56px; height: 56px;
                    border-radius: 50%;
                    border: none;
                    background: var(--color-accent-primary);
                    color: #fff;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
                    box-shadow: 0 4px 20px rgba(77,159,247,0.3);
                }
                .m-mic-btn:hover {
                    transform: scale(1.08);
                    box-shadow: 0 6px 28px rgba(77,159,247,0.45);
                }
                .m-mic-btn.active {
                    background: #ea4335;
                    box-shadow: 0 4px 20px rgba(234,67,53,0.35);
                }
                .m-mic-btn.active:hover {
                    box-shadow: 0 6px 28px rgba(234,67,53,0.5);
                }

                /* Divider between left/right groups */
                .m-ctrl-divider {
                    width: 1px; height: 28px;
                    background: rgba(255,255,255,0.06);
                    margin: 0 6px;
                }

                /* Visualizers in control bar */
                .m-viz-pair {
                    display: flex; align-items: center; gap: 10px;
                }
                .m-viz-slot {
                    display: flex; flex-direction: column;
                    align-items: center; gap: 1px; width: 70px;
                }
                .m-viz-slot audio-visualizer { width: 100%; height: 30px; }
                .m-viz-tag {
                    font-size: 0.5rem; font-weight: 800;
                    text-transform: uppercase; letter-spacing: 0.1em;
                    opacity: 0.4;
                }
                .m-viz-tag.you { color: #81c784; }
                .m-viz-tag.olivia { color: var(--color-accent-primary); }

                /* Panel toggle badge */
                .m-badge {
                    position: absolute; top: -4px; right: -4px;
                    min-width: 16px; height: 16px;
                    border-radius: 8px;
                    background: var(--color-accent-primary);
                    color: #fff; font-size: 0.55rem; font-weight: 800;
                    display: none; align-items: center; justify-content: center;
                    padding: 0 4px;
                }
                .m-badge.visible { display: flex; }

                /* Right controls group (panel toggles) */
                .m-right-controls {
                    display: flex; align-items: center; gap: 8px;
                    flex: 1; justify-content: flex-end;
                }

                /* ═══ Side Panel (Now Right Bento Pane) ═══ */
                .m-panel { flex: 1; display: flex; flex-direction: column; min-height: 0; }
                .m-panel-inner { flex: 1; display: flex; flex-direction: column; min-height: 0; }
                .m-panel-header { display: none; }
                .m-panel-body { flex: 1; overflow-y: auto; overflow-x: hidden; min-height: 0; padding-right: 8px; }
                .m-panel-section { display: none; }
                .m-panel-section.active { display: block; }

                /* ─── Activity Tab (Tool Calls) ─── */
                .m-tool-entry {
                    display: flex; align-items: flex-start; gap: 10px;
                    padding: 10px 12px;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.04);
                    margin-bottom: 8px;
                    animation: mSlideIn 0.3s ease;
                }
                @keyframes mSlideIn {
                    from { opacity: 0; transform: translateX(10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .m-tool-pip {
                    width: 4px; height: 100%; min-height: 32px;
                    border-radius: 2px; flex-shrink: 0;
                }
                .m-tool-body { flex: 1; min-width: 0; }
                .m-tool-head {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 4px;
                }
                .m-tool-name {
                    font-size: 0.75rem; font-weight: 700;
                    display: flex; align-items: center; gap: 6px;
                }
                .m-tool-time {
                    font-size: 0.6rem; opacity: 0.35;
                    font-variant-numeric: tabular-nums;
                }
                .m-tool-args {
                    font-size: 0.68rem; color: var(--color-text-sub);
                    opacity: 0.6; line-height: 1.4;
                    word-break: break-word;
                }
                .m-tool-result {
                    font-size: 0.65rem; color: #81c784;
                    margin-top: 4px; opacity: 0.7;
                }
                .m-empty {
                    text-align: center; padding: 40px 20px;
                    color: var(--color-text-sub); opacity: 0.3;
                    font-size: 0.85rem;
                }

                /* ─── Transcript Tab ─── */
                .m-tx-entry {
                    padding: 8px 12px;
                    border-radius: 8px;
                    margin-bottom: 6px;
                    font-size: 0.78rem;
                    line-height: 1.5;
                    animation: mSlideIn 0.3s ease;
                }
                .m-tx-entry.user {
                    background: rgba(240,171,0,0.04);
                    border-left: 3px solid rgba(240,171,0,0.3);
                }
                .m-tx-entry.model {
                    background: rgba(77,159,247,0.04);
                    border-left: 3px solid rgba(77,159,247,0.3);
                }
                .m-tx-head {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 2px;
                }
                .m-tx-role {
                    font-size: 0.6rem; font-weight: 800;
                    text-transform: uppercase; letter-spacing: 0.08em;
                    opacity: 0.5;
                }
                .m-tx-time {
                    font-size: 0.55rem; opacity: 0.3;
                    font-variant-numeric: tabular-nums;
                }
                .m-tx-text {
                    color: var(--color-text-main); opacity: 0.8;
                }

                /* ─── Logs Tab ─── */
                .m-log-entry {
                    font-family: 'JetBrains Mono', 'Courier New', monospace;
                    font-size: 0.62rem;
                    padding: 4px 8px;
                    border-radius: 4px;
                    margin-bottom: 3px;
                    color: var(--color-text-sub);
                    opacity: 0.7;
                    line-height: 1.5;
                    word-break: break-all;
                    animation: mSlideIn 0.2s ease;
                }
                .m-log-entry .hl { color: var(--color-accent-primary); font-weight: 700; }
                .m-log-entry .val { color: var(--color-accent-secondary); }
                .m-log-entry .key { color: #ba68c8; }
                .m-log-entry .err { color: #e57373; }
                .m-log-entry.tool { border-left: 2px solid #ba68c8; }
                .m-log-entry.ws { border-left: 2px solid var(--color-accent-primary); }
                .m-log-entry.error { border-left: 2px solid #e57373; }
                .m-log-entry.event { border-left: 2px solid var(--color-accent-secondary); }
                .m-log-entry.info { border-left: 2px solid #4dd0e1; }

                /* ─── T-code Toast ─── */
                .m-cmd-toast {
                    position: fixed; top: 64px; left: 50%;
                    transform: translateX(-50%); z-index: 100;
                    background: rgba(77,159,247,0.1);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(77,159,247,0.2);
                    border-radius: 12px; padding: 8px 18px;
                    display: flex; align-items: center; gap: 12px;
                    animation: cmdIn 0.3s ease;
                }
                .m-cmd-toast .cmd-label { font-size: 0.58rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-accent-primary); opacity: 0.7; }
                .m-cmd-toast .cmd-code { font-size: 1rem; font-weight: 800; color: var(--color-text-main); letter-spacing: 0.06em; }
                .m-cmd-toast .cmd-copy { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: var(--color-text-main); cursor: pointer; font-size: 0.58rem; font-weight: 700; padding: 3px 9px; transition: all 0.2s; }
                .m-cmd-toast .cmd-copy:hover { background: rgba(77,159,247,0.12); }
                @keyframes cmdIn { from { opacity:0; transform: translateX(-50%) translateY(-8px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }

                /* ─── Quick Actions ─── */
                .m-qa-bar {
                    display: flex; gap: 8px; padding-top: 16px; justify-content: flex-start; margin-top: auto;
                }
                .m-qa-btn {
                    display: flex; align-items: center; gap: 6px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 8px; padding: 6px 12px;
                    color: var(--color-text-sub);
                    font-size: 0.70rem; font-family: inherit; font-weight: 600;
                    cursor: pointer; transition: all 0.2s;
                }
                .m-qa-btn:hover {
                    background: rgba(255,255,255,0.08); color: var(--color-text-main); fill: rgba(255,255,255,0.1);
                }
                .m-qa-btn:disabled {
                    opacity: 0.3; cursor: default; pointer-events: none;
                }
                .m-qa-btn.mock-inactive {
                    opacity: 0.4; pointer-events: auto;
                }
                .m-qa-btn.mock-inactive:hover {
                    opacity: 0.8;
                }
                .m-qa-btn svg { flex-shrink: 0; }

                /* ─── Chat input bar ─── */
                .m-chat-bar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 24px;
                    border-top: 1px solid rgba(255,255,255,0.04);
                    flex-shrink: 0;
                }
                .m-chat-input {
                    flex: 1;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 24px;
                    padding: 10px 18px;
                    color: var(--color-text-main);
                    font-size: 0.85rem;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s;
                }
                .m-chat-input::placeholder { color: rgba(128,128,128,0.5); }
                .m-chat-input:focus {
                    border-color: var(--color-accent-primary);
                    background: rgba(255,255,255,0.08);
                }
                .m-chat-send {
                    width: 40px; height: 40px;
                    border-radius: 50%;
                    border: none;
                    background: var(--color-accent-primary);
                    color: #fff;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                .m-chat-send:hover { opacity: 0.85; transform: scale(1.05); }
                .m-chat-send:disabled { opacity: 0.3; cursor: default; transform: none; }

                /* ─── Mobile ─── */
                @media (max-width: 768px) {
                    .m-topbar-center { display: none; }
                    .m-panel.open { width: 100%; position: absolute; right: 0; top: 0; bottom: 0; z-index: 50; background: var(--color-bg); }
                    .m-panel-inner { width: 100%; }
                    .m-controls { padding: 12px 16px; gap: 8px; }
                    .m-chat-bar { padding: 8px 16px; }
                    .m-mic-btn { width: 48px; height: 48px; }
                    .m-ctrl-btn { width: 40px; height: 40px; }
                    .m-right-controls { position: static; }
                    .m-controls { flex-wrap: wrap; justify-content: center; }
                }

                /* Scrollbar in panel */
                .m-panel-body::-webkit-scrollbar { width: 3px; }
                .m-panel-body::-webkit-scrollbar-track { background: transparent; }
                .m-panel-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

                /* ─── Sentiment Indicator (topbar) ─── */
                .m-sentiment {
                    font-size: 0.6rem; font-weight: 800;
                    padding: 2px 10px; border-radius: 20px;
                    display: none; letter-spacing: 0.06em;
                    text-transform: uppercase;
                    transition: all 0.3s;
                }
                .m-sentiment.visible { display: inline-flex; align-items: center; gap: 4px; }
                .m-sentiment.calm { background: rgba(129,199,132,0.12); color: #81c784; border: 1px solid rgba(129,199,132,0.2); }
                .m-sentiment.frustrated { background: rgba(229,115,115,0.12); color: #e57373; border: 1px solid rgba(229,115,115,0.2); }
                .m-sentiment.confused { background: rgba(255,183,77,0.12); color: #ffb74d; border: 1px solid rgba(255,183,77,0.2); }
                .m-sentiment.neutral { background: rgba(255,255,255,0.06); color: var(--color-text-sub); border: 1px solid rgba(255,255,255,0.08); }
                .m-sentiment.urgent { background: rgba(186,104,200,0.12); color: #ba68c8; border: 1px solid rgba(186,104,200,0.2); }

                /* ─── Insights Tab ─── */
                .m-insight-section {
                    margin-bottom: 16px;
                }
                .m-insight-label {
                    font-size: 0.6rem; font-weight: 800;
                    text-transform: uppercase; letter-spacing: 0.1em;
                    color: var(--color-text-sub); opacity: 0.5;
                    margin-bottom: 8px;
                }
                .m-summary-point {
                    display: flex; align-items: flex-start; gap: 8px;
                    padding: 8px 10px;
                    border-radius: 8px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.04);
                    margin-bottom: 6px;
                    font-size: 0.75rem;
                    line-height: 1.4;
                    color: var(--color-text-main);
                    animation: mSlideIn 0.3s ease;
                }
                .m-summary-icon {
                    flex-shrink: 0; font-size: 0.85rem; margin-top: 1px;
                }
                .m-info-grid {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
                }
                .m-info-card {
                    padding: 8px 10px;
                    border-radius: 8px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.04);
                }
                .m-info-card-label {
                    font-size: 0.55rem; font-weight: 800;
                    text-transform: uppercase; letter-spacing: 0.08em;
                    color: var(--color-text-sub); opacity: 0.5;
                    margin-bottom: 2px;
                }
                .m-info-card-value {
                    font-size: 0.8rem; font-weight: 700;
                    color: var(--color-text-main);
                }
                .m-info-card-value.empty { opacity: 0.2; }
                .m-sentiment-timeline {
                    display: flex; gap: 3px; align-items: flex-end;
                    height: 24px; padding: 4px 0;
                }
                .m-sentiment-bar {
                    flex: 1; min-width: 3px; max-width: 8px;
                    border-radius: 2px; transition: height 0.3s;
                }
                .m-sentiment-bar.calm { background: #81c784; }
                .m-sentiment-bar.frustrated { background: #e57373; }
                .m-sentiment-bar.confused { background: #ffb74d; }
                .m-sentiment-bar.neutral { background: rgba(255,255,255,0.15); }
                .m-sentiment-bar.urgent { background: #ba68c8; }


            </style>

            <div class="m-root">
                <!-- Top Bar -->
                <div class="m-topbar">
                    <div class="m-topbar-left">
                        <button class="m-back" id="back-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                        </button>
                        <span class="m-title">OmniD3sk</span>
                        <span class="m-subtitle">Olivia</span>
                    </div>

                    <div class="m-topbar-center">
                        <span class="m-live-dot" id="live-dot"></span>
                        <span class="m-status" id="connection-status">Offline</span>
                        <span class="m-timer" id="session-timer">00:00</span>
                        <span class="m-sla" id="sla-badge"></span>
                        <span class="m-sentiment" id="sentiment-badge"></span>
                    </div>

                    <div class="m-topbar-right">
                        <span class="m-lang" id="lang-pill"></span>
                    </div>
                </div>

                <!-- Main Body -->
                <div class="m-body">
                    <!-- Left: Live Transcript -->
                    <div class="bento-pane">
                        <div class="bento-header">Live Transcript</div>
                        <div class="m-conversation">
                            <live-transcript id="transcript"></live-transcript>
                        </div>
                        <div id="tab-transcript" style="display:none;"><div id="transcript-empty"></div></div>
                        
                        <!-- Quick actions -->
                        <div class="m-qa-bar">
                            <button class="m-qa-btn" id="qa-notion" disabled>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M9 4v16"/><path d="M9 12h11"/></svg>
                                Notion
                            </button>
                            <button class="m-qa-btn" id="qa-calendar" disabled>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                Calendar
                            </button>
                            <button class="m-qa-btn mock-inactive" id="qa-discord" disabled>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h.01M15 12h.01M7.5 4.5L6.5 6C5 6 3 7 2 9.5c0 0 1.5 6 5.5 8l.5 1 1-1h6l1 1 .5-1c4-2 5.5-8 5.5-8-1-2.5-3-3.5-4.5-3.5L16.5 4.5"/><path d="M7 16s2 1 5 1 5-1 5-1"/></svg>
                                Discord
                            </button>
                        </div>
                    </div>

                    <!-- Center: Olivia's Core (Mana Orb) -->
                    <div class="bento-pane m-center">
                        <div class="mana-orb state-asleep" id="olivia-orb">
                            <div class="mana-core">
                                <div class="mana-specular"></div>
                            </div>
                        </div>
                        <div class="m-screen-bar" id="screen-section">
                            <div class="m-screen-box" id="screen-preview-box"></div>
                        </div>
                    </div>

                    <!-- Right Panel: System Logs & Activity -->
                    <div class="bento-pane m-panel" id="side-panel">
                        <div class="bento-header">Active Operations</div>
                        <div class="m-panel-inner">
                            <div class="m-panel-header">
                                <!-- Kept hidden so JS dom hooks dont error -->
                                <button class="m-tab active" data-tab="activity">Activity</button>
                                <button class="m-tab" data-tab="insights">Insights</button>
                                <button class="m-tab" data-tab="transcript">Transcript</button>
                                <button class="m-tab" data-tab="logs">Logs</button>
                            </div>
                            <div class="m-panel-body">
                                <div class="m-panel-section active" id="tab-activity">
                                    <div class="m-empty" id="activity-empty">Agent activity will appear here</div>
                                </div>
                                <div class="m-panel-section" id="tab-insights">
                                    <div class="m-insight-section">
                                        <div class="m-insight-label">Detected Info</div>
                                        <div class="m-info-grid" id="info-grid">
                                            <div class="m-info-card"><div class="m-info-card-label">User</div><div class="m-info-card-value empty" id="info-user">—</div></div>
                                            <div class="m-info-card"><div class="m-info-card-label">Category</div><div class="m-info-card-value empty" id="info-module">—</div></div>
                                            <div class="m-info-card"><div class="m-info-card-label">Portal</div><div class="m-info-card-value empty" id="info-tcode">—</div></div>
                                            <div class="m-info-card"><div class="m-info-card-label">Error</div><div class="m-info-card-value empty" id="info-error">—</div></div>
                                        </div>
                                    </div>
                                    <div class="m-insight-section">
                                        <div class="m-insight-label">User Sentiment</div>
                                        <div class="m-sentiment-timeline" id="sentiment-timeline"></div>
                                    </div>
                                    <div class="m-insight-section">
                                        <div class="m-insight-label">Live Summary</div>
                                        <div id="summary-feed"><div class="m-empty" id="summary-empty">Summary will build as conversation progresses</div></div>
                                    </div>
                                </div>
                                <div class="m-panel-section" id="tab-logs">
                                    <div class="m-empty" id="logs-empty">System logs will appear here</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                <!-- Chat input bar -->
                <div class="m-chat-bar">
                    <input type="text" class="m-chat-input" id="chat-input" placeholder="Type a message to Olivia..." disabled autocomplete="off" />
                    <button class="m-chat-send" id="chat-send-btn" disabled>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                </div>

                <!-- Bottom Controls (Controls bar) -->
                <div class="m-controls">
                    <!-- Left group -->
                    <div style="display:flex;align-items:center;gap:8px;flex:1;">
                        <button class="m-ctrl-btn" id="screen-share-btn" disabled>
                            <span class="m-tip">Share Screen</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        </button>
                        <button class="m-ctrl-btn" id="screenshot-btn" disabled>
                            <span class="m-tip">Paste Image</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </button>
                    </div>

                    <!-- Center group -->
                    <button class="m-ctrl-btn" id="mute-btn" disabled>
                        <span class="m-tip">Mute</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                            <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                            <line class="slash" x1="1" y1="1" x2="23" y2="23" stroke="#ea4335" stroke-width="2.5"/>
                        </svg>
                    </button>

                    <div class="m-ctrl-divider"></div>

                    <!-- Center: Viz + Mic -->
                    <div class="m-viz-pair">
                        <div class="m-viz-slot">
                            <audio-visualizer id="user-viz" color="#81c784"></audio-visualizer>
                            <span class="m-viz-tag you">You</span>
                        </div>

                        <button class="m-mic-btn" id="mic-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                                <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                            </svg>
                        </button>

                        <div class="m-viz-slot">
                            <audio-visualizer id="model-viz" color="#4d9ff7"></audio-visualizer>
                            <span class="m-viz-tag olivia">Olivia</span>
                        </div>
                    </div>

                    <!-- Right group -->
                    <div class="m-right-controls">
                        <button class="m-ctrl-btn" id="toggle-activity-btn">
                            <span class="m-tip">Activity</span>
                            <span class="m-badge" id="tool-badge">0</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                        </button>
                        <button class="m-ctrl-btn" id="toggle-insights-btn">
                            <span class="m-tip">Insights</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                        </button>
                        <button class="m-ctrl-btn" id="toggle-transcript-btn">
                            <span class="m-tip">Transcript</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </button>
                        <button class="m-ctrl-btn" id="toggle-logs-btn">
                            <span class="m-tip">Logs</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            <input type="file" id="file-input" accept="image/*" style="display: none;" />
        `;

        this.bindEvents();
    }

    disconnectedCallback() {
        this.cleanup();
        if (this._pasteHandler) document.removeEventListener('paste', this._pasteHandler);
    }

    bindEvents() {
        const backBtn = this.querySelector('#back-btn');
        const micBtn = this.querySelector('#mic-btn');
        const screenShareBtn = this.querySelector('#screen-share-btn');
        const screenshotBtn = this.querySelector('#screenshot-btn');
        const fileInput = this.querySelector('#file-input');
        const statusEl = this.querySelector('#connection-status');

        backBtn.addEventListener('click', () => {
            this.cleanup();
            window.location.href = '/dashboard';
        });

        micBtn.addEventListener('click', async () => {
            this.isSpeaking = !this.isSpeaking;
            if (this.isSpeaking) {
                micBtn.classList.add('active');
                micBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>`;
                await this.startSession(statusEl);
            } else {
                micBtn.classList.remove('active');
                this.endSession();
            }
        });

        screenShareBtn.addEventListener('click', () => this.toggleScreenShare());
        screenshotBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleScreenshotUpload(e));

        // Mute toggle
        this.querySelector('#mute-btn').addEventListener('click', () => this.toggleMute());

        // Chat input
        const chatInput = this.querySelector('#chat-input');
        const chatSendBtn = this.querySelector('#chat-send-btn');
        const sendChat = () => {
            const text = chatInput.value.trim();
            if (!text || !this.geminiClient?.connected) return;
            this.geminiClient.sendTextMessage(text);
            // Show in transcript
            this.querySelector('#transcript').addInputTranscript(text, true);
            this._addTranscriptEntry('user', text, this._elapsed());
            this._extractInfo(text, 'user');
            this._analyzeSentiment(text);
            this._addLogEntry('ws', `<span class="hl">CHAT_SENT</span> <span class="val">${this._escapeForLog(text)}</span>`);
            chatInput.value = '';
        };
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
        });
        chatSendBtn.addEventListener('click', sendChat);

        // Quick action macros
        const sendMacro = (text) => {
            if (!this.geminiClient?.connected) return;
            this.geminiClient.sendTextMessage(text);
            this.querySelector('#transcript').addInputTranscript(text, true);
            this._addTranscriptEntry('user', text, this._elapsed());
            this._extractInfo(text, 'user');
            this._analyzeSentiment(text);
            this._addLogEntry('ws', `<span class="hl">CHAT_SENT</span> <span class="val">${this._escapeForLog(text)}</span>`);
        };

        const qaNotion = this.querySelector('#qa-notion');
        if (qaNotion) qaNotion.addEventListener('click', () => sendMacro('Please save this current threat report to my Notion workspace. Once it is saved, you MUST reply with the exact `notion_url` text provided by the tool response. Do not use markdown link formatting, just output the raw URL string so I can clearly read it.'));

        const qaCalendar = this.querySelector('#qa-calendar');
        if (qaCalendar) qaCalendar.addEventListener('click', () => sendMacro('Please schedule a follow-up meeting on my calendar for this incident. But FIRST, ask me what time I would like the meeting to be scheduled for and wait for my response. Do not schedule it yet. Once I confirm a time and you have successfully scheduled it, reply with the exact raw Google Calendar link from the tool.'));

        const qaDiscord = this.querySelector('#qa-discord');
        if (qaDiscord) qaDiscord.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const orig = btn.innerHTML;
            btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg> Coming Soon`;
            setTimeout(() => btn.innerHTML = orig, 1500);
        });

        // Panel toggle buttons
        this.querySelector('#toggle-activity-btn').addEventListener('click', () => this._togglePanel('activity'));
        this.querySelector('#toggle-insights-btn').addEventListener('click', () => this._togglePanel('insights'));
        this.querySelector('#toggle-transcript-btn').addEventListener('click', () => this._togglePanel('transcript'));
        this.querySelector('#toggle-logs-btn').addEventListener('click', () => this._togglePanel('logs'));

        // Tab switching
        this.querySelectorAll('.m-tab').forEach(tab => {
            tab.addEventListener('click', () => this._switchTab(tab.dataset.tab));
        });

        // Paste handler
        this._pasteHandler = (e) => {
            if (!this._isSessionConnected) return;
            const items = e.clipboardData?.items;
            if (!items) return;
            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const blob = item.getAsFile();
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const base64 = ev.target.result.split(',')[1];
                        this._sendImageToServer(base64);
                        this._showImagePreview(ev.target.result);
                    };
                    reader.readAsDataURL(blob);
                    break;
                }
            }
        };
        document.addEventListener('paste', this._pasteHandler);
    }

    _togglePanel(tab) {
        const panel = this.querySelector('#side-panel');
        if (this._panelOpen && this._activeTab === tab) {
            panel.classList.remove('open');
            this._panelOpen = false;
        } else {
            panel.classList.add('open');
            this._panelOpen = true;
            this._switchTab(tab);
        }
    }

    _switchTab(tab) {
        this._activeTab = tab;
        this.querySelectorAll('.m-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        this.querySelectorAll('.m-panel-section').forEach(s => s.classList.remove('active'));
        this.querySelector(`#tab-${tab}`)?.classList.add('active');
    }

    // ─── Panel data methods ───
    _addToolEntry(name, args, result, meta, time) {
        this._toolCallCount++;
        const badge = this.querySelector('#tool-badge');
        badge.textContent = this._toolCallCount;
        badge.classList.add('visible');

        const container = this.querySelector('#tab-activity');
        const empty = this.querySelector('#activity-empty');
        if (empty) empty.remove();

        const argsStr = JSON.stringify(args || {}).slice(0, 120);
        let resultStr = '';
        if (result) {
            try {
                const r = typeof result === 'string' ? JSON.parse(result) : result;
                if (r.title) resultStr = r.title;
                else if (r.ticket_id) resultStr = `Ticket ${r.ticket_id}`;
                else if (r.source_count) resultStr = `${r.source_count} sources found`;
                else resultStr = JSON.stringify(r).slice(0, 60);
            } catch { resultStr = String(result).slice(0, 60); }
        }

        const entry = document.createElement('div');
        entry.className = 'm-tool-entry';
        entry.innerHTML = `
            <div class="m-tool-pip" style="background:${meta.color}"></div>
            <div class="m-tool-body">
                <div class="m-tool-head">
                    <span class="m-tool-name" style="color:${meta.color}">${meta.icon || ''} ${meta.label}</span>
                    <span class="m-tool-time">${time}</span>
                </div>
                <div class="m-tool-args">${argsStr}</div>
                ${resultStr ? `<div class="m-tool-result">${resultStr}</div>` : ''}
            </div>
        `;
        container.appendChild(entry);
        container.scrollTop = container.scrollHeight;

        // Add to live summary
        const summaryIcons = {
            search_knowledge_base: '🔍', lookup_error_code: '⚠️', lookup_portal_page: '📋',
            diagnose_issue: '🔬', create_issue: '📌', create_itsm_ticket: '🎫',
            update_itsm_ticket: '✏️', research_support_topic: '🌐'
        };
        const icon = summaryIcons[name] || '⚡';
        const summaryText = resultStr ? `${meta.label}: ${resultStr}` : `${meta.label} executed`;
        this._addSummaryPoint(icon, summaryText);
    }

    _addTranscriptEntry(role, text, time) {
        const container = this.querySelector('#tab-transcript');
        const empty = this.querySelector('#transcript-empty');
        if (empty) empty.remove();

        const entry = document.createElement('div');
        entry.className = `m-tx-entry ${role}`;
        entry.innerHTML = `
            <div class="m-tx-head">
                <span class="m-tx-role">${role === 'user' ? 'You' : 'Olivia'}</span>
                <span class="m-tx-time">${time}</span>
            </div>
            <div class="m-tx-text">${text}</div>
        `;
        container.appendChild(entry);
        container.scrollTop = container.scrollHeight;
    }

    _addLogEntry(type, html) {
        const container = this.querySelector('#tab-logs');
        const empty = this.querySelector('#logs-empty');
        if (empty) empty.remove();

        const entry = document.createElement('div');
        entry.className = `m-log-entry ${type}`;
        entry.innerHTML = html;
        container.appendChild(entry);
        container.scrollTop = container.scrollHeight;
    }

    // ─── Sentiment Analysis ───
    _analyzeSentiment(text) {
        const lower = text.toLowerCase();
        const frustrated = /\b(not working|broken|error|fail|wrong|can't|cannot|impossible|terrible|worst|angry|furious|ridiculous|unacceptable|useless|waste|stupid|hate|annoying|frustrated)\b/i;
        const confused = /\b(don't understand|confused|what do you mean|not sure|i don't know|unclear|how do i|what is|help me|lost|stuck)\b/i;
        const urgent = /\b(urgent|asap|emergency|critical|production down|showstopper|blocking|deadline|immediately|p1)\b/i;
        const calm = /\b(thank|thanks|great|good|perfect|yes|okay|ok|sure|understood|got it|appreciate|helpful|works|working|resolved|fixed)\b/i;

        if (frustrated.test(lower)) return 'frustrated';
        if (urgent.test(lower)) return 'urgent';
        if (confused.test(lower)) return 'confused';
        if (calm.test(lower)) return 'calm';
        return 'neutral';
    }

    _updateSentiment(userText) {
        const sentiment = this._analyzeSentiment(userText);
        this._currentSentiment = sentiment;
        this._sentimentHistory.push(sentiment);

        // Update badge
        const badge = this.querySelector('#sentiment-badge');
        if (badge) {
            const labels = { calm: 'Calm', frustrated: 'Frustrated', confused: 'Confused', neutral: 'Neutral', urgent: 'Urgent' };
            const icons = { calm: '😊', frustrated: '😤', confused: '🤔', neutral: '😐', urgent: '🚨' };
            badge.className = `m-sentiment visible ${sentiment}`;
            badge.textContent = `${icons[sentiment]} ${labels[sentiment]}`;
        }

        // Update timeline
        const timeline = this.querySelector('#sentiment-timeline');
        if (timeline) {
            const bar = document.createElement('div');
            const heights = { calm: '40%', neutral: '20%', confused: '60%', frustrated: '80%', urgent: '100%' };
            bar.className = `m-sentiment-bar ${sentiment}`;
            bar.style.height = heights[sentiment];
            timeline.appendChild(bar);
        }
    }

    // ─── Info Extraction ───
    _extractInfo(text, role) {
        if (role === 'user') {
            // Detect user name (e.g., "I'm John", "My name is John", "This is John")
            const nameMatch = text.match(/(?:i'm|i am|my name is|this is|name's)\s+([A-Z][a-z]+)/i);
            if (nameMatch && !this._detectedInfo.user) {
                this._detectedInfo.user = nameMatch[1];
                this._updateInfoCard('info-user', nameMatch[1]);
                this._addSummaryPoint('👤', `User identified: ${nameMatch[1]}`);
            }
        }

        // Portal detection
        const portalMatch = text.match(/\b(visa|passport|income tax|tax filing|ITR|DS-160|VFS|BLS|Aadhaar|PAN|Schengen|embassy|consulate|e-filing|government|portal|UIDAI)\b/i);
        if (portalMatch) {
            const portal = portalMatch[1];
            if (this._detectedInfo.tcode !== portal) {
                this._detectedInfo.tcode = portal;
                this._updateInfoCard('info-tcode', portal);
                this._addSummaryPoint('📋', `Portal detected: ${portal}`);
            }
        }

        // Error codes (e.g., AUTH001, PAY001, FORM001, error 500, error 403)
        const errorMatch = text.match(/\b([A-Z]{2,5}\d{3})\b/) || text.match(/(?:error|code)\s*[:=]?\s*(\d{3,5})\b/i) || text.match(/(?:error|message)\s+(?:code|number|no\.?)\s*[:=]?\s*["']?([A-Z]{2,5}\d{3})["']?/i);
        if (errorMatch) {
            const error = (errorMatch[1] || errorMatch[0]).trim().toUpperCase();
            if (this._detectedInfo.error !== error && error.length >= 3) {
                this._detectedInfo.error = error;
                this._updateInfoCard('info-error', error);
                this._addSummaryPoint('⚠️', `Error code: ${error}`);
            }
        }

        // Issue categories
        const lower = text.toLowerCase();
        let category = null;
        if (/\b(login|password|otp|locked|sign in|authentication)\b/i.test(lower)) category = 'Authentication';
        else if (/\b(payment|transaction|deducted|refund|receipt)\b/i.test(lower)) category = 'Payments';
        else if (/\b(upload|document|file|photo|certificate)\b/i.test(lower)) category = 'Documents';
        else if (/\b(form|validation|submit|field|mandatory)\b/i.test(lower)) category = 'Forms';
        else if (/\b(visa|passport|embassy|consulate|appointment)\b/i.test(lower)) category = 'Visa/Travel';
        else if (/\b(tax|itr|filing|pan|aadhaar)\b/i.test(lower)) category = 'Tax/Identity';
        if (category && this._detectedInfo.module !== category) {
            this._detectedInfo.module = category;
            this._updateInfoCard('info-module', category);
        }
    }

    _updateInfoCard(id, value) {
        const el = this.querySelector(`#${id}`);
        if (el) {
            el.textContent = value;
            el.classList.remove('empty');
        }
    }

    _addSummaryPoint(icon, text) {
        this._summaryPoints.push({ icon, text, time: this._elapsed() });
        const feed = this.querySelector('#summary-feed');
        if (!feed) return;
        const empty = this.querySelector('#summary-empty');
        if (empty) empty.remove();

        const point = document.createElement('div');
        point.className = 'm-summary-point';
        point.innerHTML = `<span class="m-summary-icon">${icon}</span><span>${text}</span>`;
        feed.appendChild(point);
        feed.scrollTop = feed.scrollHeight;
    }


    // ─── Session lifecycle ───
    async startSession(statusEl) {
        try {
            statusEl.textContent = 'Connecting';
            statusEl.classList.remove('on');
            this.setOliviaState('listening');

            const language = this.getAttribute('language') || 'English';
            let systemPrompt = SYSTEM_PROMPT;
            if (language && language !== 'English') {
                systemPrompt += `\n\n# Language\nYou MUST respond in ${language}. ALL your spoken responses must be in ${language}, INCLUDING your very first greeting. Translate the greeting naturally into ${language} — do not speak English at all.\nHowever, all ITSM tickets, diagnostic reports, error code lookups, and technical documentation must remain in English regardless of the conversation language.\nTool function calls and their parameters must always be in English.\nTechnical terms like error codes, URLs, and portal names stay in English even when speaking ${language}.\n`;
            }
            this.geminiClient = new GeminiLiveAPI();
            this.geminiClient.setSystemInstructions(systemPrompt);
            this.geminiClient.setInputAudioTranscription(true);
            this.geminiClient.setOutputAudioTranscription(true);
            this.geminiClient.setVoice('Kore');
            this.geminiClient.setResponseModalities(['AUDIO']);
            this.geminiClient.setEnableFunctionCalls(true);

            this.geminiClient.onReceiveResponse = (r) => this.handleResponse(r);
            this.geminiClient.onConnectionStarted = () => {
                this._addLogEntry('ws', '<span class="hl">WS_OPEN</span> WebSocket session established');
            };
            this.geminiClient.onError = (e) => {
                console.error('Gemini error:', e);
                this._addLogEntry('error', `<span class="hl">WS_ERROR</span> <span class="err">${e?.message || e}</span>`);
            };
            this.geminiClient.onClose = () => {
                this._addLogEntry('ws', '<span class="hl">WS_CLOSE</span> WebSocket disconnected');
            };

            await this.geminiClient.connect('', language);

            this.audioPlayer = new AudioPlayer();
            await this.audioPlayer.init();
            this.audioStreamer = new AudioStreamer(this.geminiClient);
            await this.audioStreamer.start();

            const userViz = this.querySelector('#user-viz');
            const modelViz = this.querySelector('#model-viz');
            if (this.audioStreamer.audioContext && this.audioStreamer.source) userViz.connect(this.audioStreamer.audioContext, this.audioStreamer.source);
            if (this.audioPlayer.audioContext && this.audioPlayer.gainNode) modelViz.connect(this.audioPlayer.audioContext, this.audioPlayer.gainNode);

            this._isSessionConnected = true;
            this.sessionToken = this.geminiClient.sessionToken;
            this._toolCallCount = 0;

            statusEl.textContent = 'Live';
            statusEl.classList.add('on');
            this.querySelector('#live-dot').classList.add('on');
            this.querySelector('#session-timer').classList.add('on');

            this._sessionStartTime = Date.now();
            this._timerInterval = setInterval(() => {
                const el = Math.floor((Date.now() - this._sessionStartTime) / 1000);
                this.querySelector('#session-timer').textContent = `${String(Math.floor(el/60)).padStart(2,'0')}:${String(el%60).padStart(2,'0')}`;
            }, 1000);

            if (language !== 'English') {
                const pill = this.querySelector('#lang-pill');
                if (pill) { pill.style.display = ''; pill.textContent = language; }
            }

            this.querySelector('#screen-share-btn').disabled = false;
            this.querySelector('#screenshot-btn').disabled = false;
            this.querySelector('#mute-btn').disabled = false;
            this.querySelector('#chat-input').disabled = false;
            this.querySelector('#chat-send-btn').disabled = false;
            if (this.querySelector('#qa-notion')) this.querySelector('#qa-notion').disabled = false;
            if (this.querySelector('#qa-calendar')) this.querySelector('#qa-calendar').disabled = false;
            if (this.querySelector('#qa-discord')) this.querySelector('#qa-discord').disabled = false;
            this.querySelector('#transcript').clear();

            this._addLogEntry('info', `<span class="hl">SESSION_INIT</span> lang=<span class="val">${language}</span> engine=<span class="val">omnid3sk-live</span>`);

        } catch (err) {
            console.error('Failed to start:', err);
            this.isSpeaking = false;
            const micBtn = this.querySelector('#mic-btn');
            micBtn.classList.remove('active');
            this._resetMicBtn(micBtn);
            statusEl.textContent = err.status === 429 ? 'Rate limited' : 'Failed';
            statusEl.classList.remove('on');
        }
    }

    _flushTranscriptsToPanel() {
        if (this._pendingUserTranscript.trim()) {
            const text = this._pendingUserTranscript.trim();
            this._addTranscriptEntry('user', text, this._elapsed());
            this._addLogEntry('ws', `<span class="hl">INPUT_TRANSCRIPTION</span> <span class="val">${this._escapeForLog(text)}</span>`);
            this._updateSentiment(text);
            this._extractInfo(text, 'user');
            this._pendingUserTranscript = '';
        }
        if (this._pendingModelTranscript.trim()) {
            const text = this._pendingModelTranscript.trim();
            this._addTranscriptEntry('model', text, this._elapsed());
            this._addLogEntry('ws', `<span class="hl">OUTPUT_TRANSCRIPTION</span> <span class="val">${this._escapeForLog(text)}</span>`);
            this._extractInfo(text, 'model');
            this._pendingModelTranscript = '';
        }
    }

    _escapeForLog(str) {
        const d = document.createElement('div');
        d.textContent = str.length > 100 ? str.slice(0, 100) + '...' : str;
        return d.innerHTML;
    }

    handleResponse(response) {
        switch (response.type) {
            case MultimodalLiveResponseType.AUDIO:
                if (this.audioPlayer) this.audioPlayer.play(response.data);
                this.querySelector('#transcript').showSpeaking();
                this.setOliviaState('speaking');
                break;
            case MultimodalLiveResponseType.INPUT_TRANSCRIPTION:
                if (response.data?.text) {
                    this.querySelector('#transcript').addInputTranscript(response.data.text, response.data.finished);
                    this._pendingUserTranscript += response.data.text;
                }
                break;
            case MultimodalLiveResponseType.OUTPUT_TRANSCRIPTION:
                if (response.data?.text) {
                    this.querySelector('#transcript').addOutputTranscript(response.data.text, response.data.finished);
                    this._detectTcodeCommand(response.data.text);
                    this._pendingModelTranscript += response.data.text;
                }
                break;
            case MultimodalLiveResponseType.INTERRUPTED:
                if (this.audioPlayer) this.audioPlayer.interrupt();
                this.querySelector('#transcript').finalizeAll();
                this._flushTranscriptsToPanel();
                this._addLogEntry('event', '<span class="hl">INTERRUPTED</span> User cut off model response');
                this.setOliviaState('listening');
                break;
            case MultimodalLiveResponseType.TURN_COMPLETE:
                this.querySelector('#transcript').finalizeAll();
                this._flushTranscriptsToPanel();
                this._addLogEntry('debug', 'TURN_COMPLETE');
                this.setOliviaState('listening');
                break;
            case MultimodalLiveResponseType.TOOL_CALL:
                if (response.data?.functionCalls) {
                    for (const fc of response.data.functionCalls) {
                        this.geminiClient.callFunction(fc.name, fc.args);
                        this.geminiClient.sendToolResponse(fc.id, { result: 'success' });
                        this._addLogEntry('tool', `<span class="hl">CLIENT_TOOL_CALL</span> <span class="key">${fc.name}</span>(${JSON.stringify(fc.args).slice(0, 80)})`);
                    }
                }
                break;
            case MultimodalLiveResponseType.SERVER_TOOL_CALL: {
                const meta = TOOL_META[response.data.name] || { label: response.data.name, color: '#888', icon: '' };
                const transcript = this.querySelector('#transcript');
                if (transcript?.showWorking) {
                    transcript.showWorking(meta.label);
                } else if (transcript?.showThinking) {
                    transcript.showThinking();
                }
                this.setOliviaState('thinking');
                this.handleServerToolEvent(response.data);
                
                // Directly inject a clickable link into the transcript if the tool succeeds
                if (response.data.result) {
                    try {
                        const parsedResult = typeof response.data.result === 'string' ? JSON.parse(response.data.result) : response.data.result;
                        if (parsedResult.success) {
                            if (parsedResult.notion_url) {
                                this.querySelector('#transcript').addSystemMessage(`
                                    Notion Report Successfully Generated<br>
                                    <a href="${parsedResult.notion_url}" target="_blank" class="system-link-btn">View in Notion</a>
                                `);
                            }
                            if (parsedResult.htmlLink) {
                                this.querySelector('#transcript').addSystemMessage(`
                                    Calendar Meeting Successfully Scheduled<br>
                                    <a href="${parsedResult.htmlLink}" target="_blank" class="system-link-btn">View Calendar Event</a>
                                `);
                            }
                        }
                    } catch (e) {
                        // ignore JSON parse errors
                    }
                }

                this._addToolEntry(response.data.name, response.data.args, response.data.result, meta, this._elapsed());
                const argsSnippet = JSON.stringify(response.data.args || {}).slice(0, 80);
                this._addLogEntry('tool', `<span class="hl">SERVER_TOOL_CALL</span> <span class="key">${response.data.name}</span>(${argsSnippet})`);
                break;
            }
            case 'tool_status':
                // Handle real-time tool status updates
                this.querySelector('#transcript')?.updateToolStatus(response);
                this._addLogEntry('tool', `<span class="hl">TOOL_STATUS</span> <span class="key">${response.tool}</span> <span class="val">${response.status}</span>`);
                break;
            case 'SESSION_STATE':
                this.handleSessionState(response.data);
                this._addLogEntry('info', `<span class="hl">SESSION_STATE</span> stage=<span class="val">${response.data?.stage || 'n/a'}</span> checkpoints=<span class="val">${response.data?.checkpoints?.length || 0}</span>`);
                break;
            default:
                this._addLogEntry('debug', `<span class="hl">UNKNOWN</span> type=<span class="val">${response.type}</span>`);
        }
    }

    _elapsed() {
        if (!this._sessionStartTime) return '';
        const s = Math.floor((Date.now() - this._sessionStartTime) / 1000);
        return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
    }

    handleSessionState(state) {
        if (state.tickets?.length > 0) {
            const t = state.tickets[state.tickets.length - 1];
            if (t.severity) this._updateSLA(t.severity.toUpperCase());
        } else if (state.issues?.length > 0) {
            const i = state.issues[state.issues.length - 1];
            if (i.severity) this._updateSLA(i.severity.toUpperCase());
        }
        if (state.session_id && !this.sessionToken) this.sessionToken = state.session_id;
    }

    handleServerToolEvent(event) {
        const { name, args = {}, result } = event;
        switch (name) {
            case 'create_issue': {
                const panel = this.querySelector('#issue-panel');
                const slot = this.querySelector('#issues-slot');
                if (panel) {
                    let d = result ? (typeof result === 'string' ? JSON.parse(result) : result) : args;
                    if (d.issue) d = d.issue;
                    if (!d.title && args.title) d = args;
                    panel.addIssue(d);
                    if (slot) slot.classList.add('visible');
                }
                break;
            }
            case 'create_itsm_ticket': {
                if (result) {
                    const info = typeof result === 'string' ? JSON.parse(result) : result;
                    if (info.ticket_id) this.querySelector('#transcript')?.addOutputTranscript(`[Ticket ${info.ticket_id} created]`, true);
                }
                break;
            }
            case 'research_support_topic': {
                if (result) {
                    const r = typeof result === 'string' ? JSON.parse(result) : result;
                    if (r.success && r.source_count > 0) this.querySelector('#transcript')?.addOutputTranscript(`[Researched: ${r.source_count} web sources]`, true);
                }
                break;
            }
        }
    }

    async toggleScreenShare() {
        const btn = this.querySelector('#screen-share-btn');
        const section = this.querySelector('#screen-section');
        const box = this.querySelector('#screen-preview-box');

        if (this.isScreenSharing) {
            if (this.screenCapture) { this.screenCapture.stop(); this.screenCapture = null; }
            this.isScreenSharing = false;
            box.innerHTML = '';
            section.classList.remove('visible');
            btn.classList.remove('active-share');
        } else {
            try {
                this.screenCapture = new ScreenCapture(this.geminiClient);
                this.screenCapture.onStop = () => {
                    this.isScreenSharing = false;
                    box.innerHTML = '';
                    section.classList.remove('visible');
                    btn.classList.remove('active-share');
                };
                const vid = await this.screenCapture.start({ fps: 1, width: 1280, height: 720, quality: 0.7 });
                this.isScreenSharing = true;
                vid.style.cssText = 'width:100%;height:100%;object-fit:contain;';
                box.appendChild(vid);
                section.classList.add('visible');
                btn.classList.add('active-share');
            } catch (e) { console.error('Screen share failed:', e); }
        }
    }

    toggleMute() {
        const btn = this.querySelector('#mute-btn');
        if (!this.audioStreamer) return;
        const muted = btn.classList.toggle('muted');
        this.audioStreamer.muted = muted;
        if (this.audioStreamer.stream) {
            this.audioStreamer.stream.getAudioTracks().forEach(t => { t.enabled = !muted; });
        }
        const tip = btn.querySelector('.m-tip');
        if (tip) tip.textContent = muted ? 'Unmute' : 'Mute';
    }

    _sendImageToServer(b64) {
        if (this.geminiClient?.connected) this.geminiClient.sendMessage({ type: 'image', data: b64 });
    }

    _showImagePreview(dataUrl) {
        const box = this.querySelector('#screen-preview-box');
        const section = this.querySelector('#screen-section');
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
        const existing = box.querySelector('img, video');
        if (existing) existing.remove();
        box.appendChild(img);
        section.classList.add('visible');
    }

    handleScreenshotUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            this._sendImageToServer(ev.target.result.split(',')[1]);
            this._showImagePreview(ev.target.result);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }

    endSession() {
        this.cleanup();
        this._isSessionConnected = false;
        this.isSpeaking = false;
        this.setOliviaState('asleep');

        const micBtn = this.querySelector('#mic-btn');
        if (micBtn) { micBtn.classList.remove('active'); this._resetMicBtn(micBtn); }

        const statusEl = this.querySelector('#connection-status');
        if (statusEl) { statusEl.textContent = 'Ended'; statusEl.classList.remove('on'); }
        this.querySelector('#live-dot')?.classList.remove('on');

        if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }

        this.querySelector('#user-viz')?.disconnect();
        this.querySelector('#model-viz')?.disconnect();
        this.querySelector('#screen-share-btn').disabled = true;
        this.querySelector('#screenshot-btn').disabled = true;
        this.querySelector('#mute-btn').disabled = true;
        this.querySelector('#mute-btn').classList.remove('muted');
        this.querySelector('#chat-input').disabled = true;
        this.querySelector('#chat-send-btn').disabled = true;
        if (this.querySelector('#qa-notion')) this.querySelector('#qa-notion').disabled = true;
        if (this.querySelector('#qa-calendar')) this.querySelector('#qa-calendar').disabled = true;
        if (this.querySelector('#qa-discord')) this.querySelector('#qa-discord').disabled = true;
        this.querySelector('#transcript')?.finalizeAll();

        if (this.sessionToken) {
            setTimeout(() => {
                this.dispatchEvent(new CustomEvent('navigate', {
                    bubbles: true,
                    composed: true,
                    detail: { view: 'summary', token: this.sessionToken }
                }));
            }, 800);
        }
    }

    _resetMicBtn(btn) {
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
    }

    _detectTcodeCommand(text) {
        const m = text.match(/\b([A-Z]{2,4}\d{1,3}[A-Z]?)\b/g);
        if (!m) return;
        for (const t of m) {
            if (['THE','AND','FOR','NOT','YOU','ARE','HAS','WAS','MAX'].includes(t)) continue;
            this._showCmdToast(t);
            break;
        }
    }

    _showCmdToast(tcode) {
        document.querySelector('.m-cmd-toast')?.remove();
        if (this._cmdToastTimeout) clearTimeout(this._cmdToastTimeout);
        const toast = document.createElement('div');
        toast.className = 'm-cmd-toast';
        toast.innerHTML = `<div><span class="cmd-label">Run</span> <span class="cmd-code">${tcode}</span></div><button class="cmd-copy" onclick="navigator.clipboard.writeText('${tcode}');this.textContent='Copied!'">Copy</button>`;
        document.body.appendChild(toast);
        this._cmdToastTimeout = setTimeout(() => { toast.style.opacity='0'; toast.style.transition='opacity 0.3s'; setTimeout(()=>toast.remove(),300); }, 6000);
    }

    _updateSLA(p) {
        const b = this.querySelector('#sla-badge');
        if (!b) return;
        this._currentPriority = p;
        b.className = 'm-sla visible';
        if (p === 'P1') { b.classList.add('p1'); b.textContent = 'P1 \u00b7 15min SLA'; }
        else if (p === 'P2') { b.classList.add('p2'); b.textContent = 'P2 \u00b7 1hr SLA'; }
        else if (p === 'P3') { b.classList.add('p3'); b.textContent = 'P3 \u00b7 4hr SLA'; }
        else b.classList.remove('visible');
    }

    setOliviaState(state) {
        const orb = this.querySelector('#olivia-orb');
        if (!orb) return;
        orb.classList.remove('state-idle', 'state-listening', 'state-thinking', 'state-speaking', 'state-asleep');
        orb.classList.add(`state-${state}`);
    }

    cleanup() {
        if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
        if (this._cmdToastTimeout) { clearTimeout(this._cmdToastTimeout); this._cmdToastTimeout = null; }
        document.querySelector('.m-cmd-toast')?.remove();
        if (this.audioStreamer) { this.audioStreamer.stop(); this.audioStreamer = null; }
        if (this.audioPlayer) { this.audioPlayer.destroy(); this.audioPlayer = null; }
        if (this.screenCapture) { this.screenCapture.stop(); this.screenCapture = null; this.isScreenSharing = false; }
        if (this.geminiClient) { this.geminiClient.disconnect(); this.geminiClient = null; }
    }
}

customElements.define('view-session', ViewSession);

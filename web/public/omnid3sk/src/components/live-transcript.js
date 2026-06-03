/**
 * Live Transcript - Immergo-style with role labels
 */
class LiveTranscript extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._rendered = false;
        
        // Initialize MutationObserver to handle auto-scrolling
        this._observer = new MutationObserver(() => this._internalScroll());
    }

    connectedCallback() {
        if (!this._rendered) {
            this.render();
            this._rendered = true;
            
            const container = this.shadowRoot.querySelector('.transcript-container');
            if (container) {
                this._observer.observe(container, { childList: true, subtree: true, characterData: true });
            }
        }
    }

    disconnectedCallback() {
        this._observer.disconnect();
    }

    _internalScroll() {
        requestAnimationFrame(() => {
            const container = this.shadowRoot.querySelector('.transcript-container');
            if (container) {
                container.scrollTop = container.scrollHeight + 1000;
            }
        });
    }

    addInputTranscript(text, isFinal) {
        this.updateTranscript('user', text, isFinal);
    }

    addOutputTranscript(text, isFinal) {
        this.updateTranscript('model', text, isFinal);
    }

    addSystemMessage(html) {
        this.finalizeAll();
        const container = this.shadowRoot.querySelector('.transcript-container');
        if (!container) return;
        
        const bubble = document.createElement('div');
        bubble.className = `bubble system`;
        
        const label = document.createElement('span');
        label.className = 'bubble-label';
        label.textContent = 'System / Tool Event';
        bubble.appendChild(label);
        
        const content = document.createElement('div');
        content.innerHTML = html;
        bubble.appendChild(content);
        
        container.appendChild(bubble);
        this._internalScroll();
    }

    /** Show "Olivia is thinking..." indicator */
    showThinking() {
        this._removeIndicator();
        const container = this.shadowRoot.querySelector('.transcript-container');
        if (!container) return;
        const indicator = document.createElement('div');
        indicator.className = 'status-indicator thinking';
        indicator.id = 'status-indicator';
        indicator.innerHTML = '<span class="dot-pulse"></span> Olivia is thinking...';
        container.appendChild(indicator);
    }

    /** Show "Olivia is speaking..." indicator */
    showSpeaking() {
        this._removeIndicator();
        const container = this.shadowRoot.querySelector('.transcript-container');
        if (!container) return;
        const indicator = document.createElement('div');
        indicator.className = 'status-indicator speaking';
        indicator.id = 'status-indicator';
        indicator.innerHTML = '<span class="dot-pulse"></span> Olivia is speaking...';
        container.appendChild(indicator);
    }

    /** Show tool-running indicator e.g. "Running Web Research..." */
    showWorking(toolLabel) {
        this._removeIndicator();
        const container = this.shadowRoot.querySelector('.transcript-container');
        if (!container) return;
        const indicator = document.createElement('div');
        indicator.className = 'status-indicator working';
        indicator.id = 'status-indicator';
        indicator.innerHTML = `<span class="dot-pulse"></span> Running ${toolLabel || 'tool'}...`;
        container.appendChild(indicator);
    }

    /** Handle tool status updates from the backend */
    updateToolStatus(toolStatus) {
        const { tool, status, detail } = toolStatus;
        
        // Format tool name for display (e.g., research_support_topic -> Web Research)
        const toolLabel = this._formatToolName(tool);
        
        if (status === 'started') {
            this.showWorking(`${toolLabel}${detail ? ': ' + detail.substring(0, 40) : ''}`);
        } else if (status === 'progress') {
            const indicator = this.shadowRoot.querySelector('#status-indicator');
            if (indicator) {
                indicator.innerHTML = `<span class="dot-pulse"></span> ${toolLabel}: ${detail.substring(0, 50)}...`;
            }
        } else if (status === 'completed') {
            this._removeIndicator();
            this.addSystemMessage(`✅ <strong>${toolLabel}</strong> completed. ${detail ? '(' + detail.substring(0, 50) + ')' : ''}`);
        }
    }

    /** Format tool name for user display */
    _formatToolName(toolName) {
        const names = {
            'research_support_topic': '🔍 Web Research',
            'search_knowledge_base': '📚 Knowledge Base Search',
            'create_itsm_ticket': '🎫 Creating Ticket',
            'update_itsm_ticket': '📝 Updating Ticket',
            'lookup_error_code': '🔎 Lookup Error Code',
            'lookup_portal_page': '🌐 Lookup Portal',
            'create_issue': '⚠️ Creating Issue',
            'diagnose_issue': '🔬 Diagnosis',
            'navigate_user_browser': '🖱️ Navigation',
            'book_calendar_slot': '📅 Booking Calendar',
        };
        return names[toolName] || toolName.replace(/_/g, ' ');
    }

    /** Remove the status indicator */
    _removeIndicator() {
        const existing = this.shadowRoot.querySelector('#status-indicator');
        if (existing) existing.remove();
    }

    finalizeAll() {
        this._removeIndicator();
        const container = this.shadowRoot.querySelector('.transcript-container');
        if (!container) return;
        const activeBubbles = container.querySelectorAll('.bubble.temp');
        activeBubbles.forEach(b => {
            b.classList.remove('temp');
            b.dataset.role = null;
        });
    }

    clear() {
        const container = this.shadowRoot.querySelector('.transcript-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    updateTranscript(role, text, isFinal) {
        const container = this.shadowRoot.querySelector('.transcript-container');
        if (!container) return;

        // Finalize other roles
        const activeBubbles = container.querySelectorAll('.bubble.temp');
        activeBubbles.forEach(b => {
            if (b.dataset.role !== role) {
                b.classList.remove('temp');
                b.dataset.role = null;
            }
        });

        let bubble = container.querySelector(`.bubble.temp[data-role="${role}"]`);

        if (!bubble) {
            bubble = document.createElement('div');
            bubble.className = `bubble temp ${role}`;
            bubble.dataset.role = role;

            const label = document.createElement('span');
            label.className = 'bubble-label';
            label.textContent = role === 'user' ? 'You' : 'Olivia';
            bubble.appendChild(label);

            container.appendChild(bubble);
        }

        const currentText = bubble.textContent;
        const labelText = role === 'user' ? 'You' : 'Olivia';
        const contentText = currentText.replace(labelText, '').trim();
        if (contentText.length > 0 && !contentText.endsWith(' ') && !text.startsWith(' ')) {
            if (/^[a-zA-Z0-9\u00C0-\u024F]/.test(text)) {
                bubble.appendChild(document.createTextNode(' '));
            }
        }

        const span = document.createElement('span');
        span.textContent = text;
        span.className = 'fade-span';
        bubble.appendChild(span);
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    font-family: 'Nunito', system-ui, sans-serif;
                }

                .transcript-container {
                    height: 100%;
                    overflow-y: auto;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    mask-image: linear-gradient(to bottom, transparent 0px, black 60px, black calc(100% - 60px), transparent 100%);
                    -webkit-mask-image: linear-gradient(to bottom, transparent 0px, black 60px, black calc(100% - 60px), transparent 100%);
                }

                .transcript-container::after {
                    content: "";
                    display: block;
                    min-height: 120px;
                    flex-shrink: 0;
                }

                .bubble {
                    max-width: 85%;
                    padding: 0.5rem 1rem;
                    font-size: 1rem;
                    line-height: 1.5;
                    animation: popIn 0.5s ease forwards;
                    word-wrap: break-word;
                    border-radius: 12px;
                }

                .bubble-label {
                    display: block;
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    margin-bottom: 0.2rem;
                    opacity: 0.5;
                }

                .fade-span {
                    animation: fadeIn 1s ease forwards;
                    opacity: 0;
                }

                .bubble.model {
                    align-self: flex-start;
                    color: var(--color-text-main, #eaddcf);
                    text-align: left;
                    background: rgba(77, 159, 247, 0.06);
                    border: 1px solid rgba(77, 159, 247, 0.1);
                }

                .bubble.model .bubble-label {
                    color: var(--color-accent-primary, #4d9ff7);
                }

                .bubble.user {
                    align-self: flex-end;
                    color: var(--color-accent-secondary, #f0ab00);
                    text-align: right;
                    font-weight: 500;
                    background: rgba(240, 171, 0, 0.06);
                    border: 1px solid rgba(240, 171, 0, 0.1);
                }

                .bubble.user .bubble-label {
                    color: var(--color-accent-secondary, #f0ab00);
                }

                .bubble.temp {
                    opacity: 0.7;
                }

                .bubble.system {
                    align-self: center;
                    color: var(--color-text-main, #eaddcf);
                    text-align: center;
                    background: transparent;
                    border: 1px dashed rgba(255, 255, 255, 0.2);
                    padding: 0.8rem 1.5rem;
                    max-width: 90%;
                }
                .bubble.system .bubble-label {
                    color: #aaa;
                    text-align: center;
                    margin-bottom: 0.5rem;
                }
                
                .system-link-btn {
                    display: inline-block;
                    margin-top: 5px;
                    padding: 6px 12px;
                    background: var(--color-accent-primary, #4d9ff7);
                    color: #fff;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    transition: opacity 0.2s;
                }
                .system-link-btn:hover {
                    opacity: 0.8;
                }

                @keyframes popIn {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }

                .transcript-container::-webkit-scrollbar {
                    width: 0px;
                    background: transparent;
                }

                /* Status indicators */
                .status-indicator {
                    align-self: flex-start;
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 6px 14px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    animation: fadeIn 0.5s ease forwards;
                    opacity: 0;
                }
                .status-indicator.thinking {
                    color: var(--color-accent-primary, #4d9ff7);
                    background: rgba(77, 159, 247, 0.06);
                }
                .status-indicator.speaking {
                    color: #81c784;
                    background: rgba(129, 199, 132, 0.06);
                }
                .status-indicator.working {
                    color: #ba68c8;
                    background: rgba(186, 104, 200, 0.06);
                    border: 1px solid rgba(186, 104, 200, 0.12);
                }
                .dot-pulse {
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: currentColor;
                    animation: dotPulse 1.2s ease-in-out infinite;
                }
                @keyframes dotPulse {
                    0%, 100% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
            </style>
            <div class="transcript-container"></div>
        `;
    }
}

customElements.define('live-transcript', LiveTranscript);

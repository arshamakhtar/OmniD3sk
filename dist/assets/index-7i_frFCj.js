(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(s){if(s.ep)return;s.ep=!0;const a=t(s);fetch(s.href,a)}})();class k extends HTMLElement{connectedCallback(){this.innerHTML=`
            <style>
                view-home {
                    display: block;
                    width: 100%;
                    background: #000000 !important;
                    color: #ffffff;
                    /* Core CSS Properties */
                    --bg: #000000;
                    --surface: #141414;
                    --text: #f5f5f5;
                    --muted: #878787;
                    --stroke: #1f1f1f;
                    --accent-grad: linear-gradient(90deg, #89AACC 0%, #4E85BF 100%);
                    
                    font-family: 'General Sans', sans-serif;
                }
                * { box-sizing: border-box; margin: 0; padding: 0; }

                /* Instrument Serif font class */
                .font-display { font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400; }

                .hero-section {
                    position: relative;
                    width: 100%;
                    min-height: 100vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                /* ─── Video Background ─── */
                .bg-video {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    object-fit: cover;
                    object-position: center top;
                    transform: scale(1.4) translateY(12%);
                    z-index: 1;
                    pointer-events: none;
                }
                .overlay {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 2;
                }
                
                /* Bottom fade gradient for hero to blend seamlessly */
                .hero-fade {
                    position: absolute;
                    bottom: -5px; left: 0; width: 100%; height: 40vh;
                    background: linear-gradient(to top, #000000 0%, #000000 10%, rgba(0,0,0,0.8) 30%, transparent 100%);
                    z-index: 3;
                    pointer-events: none;
                }

                /* ─── Navbar ─── */
                .navbar {
                    position: relative; z-index: 10;
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 20px 120px; width: 100%;
                }
                .nav-left { display: flex; align-items: center; gap: 40px; }
                .logo { font-size: 25px; font-weight: 700; letter-spacing: -0.05em; display: flex; align-items: center; gap: 8px; }
                
                .nav-center {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    align-items: center;
                }
                .center-logo {
                    height: 36px;
                    object-fit: contain;
                }
                .nav-links { display: flex; gap: 30px; }
                .nav-links a { color: white; font-size: 14px; font-weight: 500; text-decoration: none; display: flex; align-items: center; gap: 14px; transition: opacity 0.2s; }
                .nav-links a:hover { opacity: 0.7; }
                .chevron { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2; opacity: 0.8; }

                /* ─── Web3 Buttons (Layered Pill Component) ─── */
                .waitlist-btn {
                    position: relative;
                    display: inline-flex;
                    border-radius: 9999px;
                    padding: 0.6px;
                    background: rgba(255, 255, 255, 0.3);
                    border: none;
                    cursor: pointer;
                    overflow: hidden;
                    text-decoration: none;
                    transition: transform 0.3s cubic-bezier(0.19, 1, 0.22, 1);
                }
                .waitlist-btn:hover { transform: scale(1.02); }
                .btn-glow {
                    position: absolute; top: -5px; left: 20%; width: 60%; height: 10px;
                    background: rgba(255, 255, 255, 0.9); filter: blur(8px); z-index: 1; opacity: 0.8;
                }
                .btn-inner {
                    position: relative; z-index: 2; border-radius: 9999px; padding: 11px 29px;
                    font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;
                    font-family: 'General Sans', sans-serif;
                }
                .nav-btn .btn-inner { background: #000; color: #fff; }
                .white-btn .btn-inner { background: #fff; color: #000; }
                .white-btn .btn-glow { background: rgba(0,0,0,0.5); opacity: 0.3; } 
                .beta-btn { background: rgba(255, 255, 255, 0.15); }
                .beta-btn .btn-inner { background: rgba(0, 0, 0, 0.85); color: #fff; backdrop-filter: blur(12px); }
                .badge-beta { background: rgba(0, 212, 170, 0.15); color: #00d4aa; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.05em; }

                /* ─── Hero Content ─── */
                .hero-content {
                    position: relative; z-index: 10;
                    display: flex; flex-direction: column; align-items: center; text-align: center;
                    margin-top: auto; margin-bottom: auto;
                    transform: translateY(-8vh); /* Safely bumps text up into vortex without breaking layout */
                    padding: 40px 20px;
                }
                .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px; padding: 6px 14px; font-size: 13px; font-weight: 500; backdrop-filter: blur(8px); }
                .badge-dot { width: 4px; height: 4px; background: #fff; border-radius: 50%; }
                .hero-heading { 
                    margin-top: 40px; margin-bottom: 24px; max-width: 800px; font-size: 64px; font-weight: 500; line-height: 1.1; 
                    letter-spacing: -0.02em; 
                    background: linear-gradient(110deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,1) 20%, rgba(255,255,255,1) 80%, rgba(255,255,255,0.5) 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; 
                }
                .hero-subtitle { max-width: 680px; font-size: 18px; font-weight: 400; color: #EAEAEA; line-height: 1.6; margin-bottom: 40px; }
                .cta-group { display: flex; gap: 16px; align-items: center; justify-content: center; }

                /* Scroll indicator */
                .scroll-indicator {
                    position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
                    z-index: 10; display: flex; flex-direction: column; align-items: center;
                    gap: 8px; opacity: 0.5;
                }
                .scroll-indicator span { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; }
                .scroll-line { width: 1px; height: 40px; background: rgba(255,255,255,0.2); position: relative; overflow: hidden; }
                .scroll-line::after { content:''; position: absolute; top:0; left:0; width:1px; height:20px; background: #fff; animation: scrollDown 2s infinite ease-in-out; }
                @keyframes scrollDown { 0% { transform: translateY(-20px); } 100% { transform: translateY(40px); } }

                /* Common Generic Section */
                .section { padding: 100px 20px; max-width: 1200px; margin: 0 auto; width: 100%; overflow: hidden; }
                .section-header { margin-bottom: 60px; }
                .eyebrow { display: flex; align-items: center; gap: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3em; color: var(--muted); margin-bottom: 20px; }
                .eyebrow::before { content: ''; width: 32px; height: 1px; background: var(--stroke); }
                .section-title { font-size: 48px; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 20px; color: #ffffff !important; }
                .section-title span.font-display { font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400; color: rgba(255,255,255,0.85); }
                .section-desc { font-size: 16px; color: var(--muted); max-width: 500px; line-height: 1.6; }

                /* ─── Selected Works Bento Box ─── */
                .bento-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 24px;
                }
                .bento-card {
                    position: relative;
                    border-radius: 24px;
                    overflow: hidden;
                    border: 1px solid var(--stroke);
                    background: var(--surface);
                    min-height: 380px;
                    display: flex;
                    align-items: flex-end;
                    padding: 30px;
                    transition: transform 0.4s ease;
                }
                .bento-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.2); }
                .bento-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.4; transition: opacity 0.4s, transform 0.6s ease; }
                .bento-card:hover .bento-img { opacity: 0.7; transform: scale(1.05); }
                .bento-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent 60%); z-index: 1; pointer-events: none; }
                
                .bento-content { position: relative; z-index: 2; width: 100%; display: flex; justify-content: space-between; align-items: flex-end; }
                .bento-title { font-size: 32px; color: #fff; }
                .bento-btn { background: #fff; color: #000; border-radius: 40px; padding: 6px 16px; font-size: 12px; font-weight: 600; opacity: 0; transform: translateY(10px); transition: all 0.3s ease; }
                .bento-card:hover .bento-btn { opacity: 1; transform: translateY(0); }

                .bento-card:nth-child(1) { grid-column: span 7; }
                .bento-card:nth-child(2) { grid-column: span 5; }
                .bento-card:nth-child(3) { grid-column: span 5; }
                .bento-card:nth-child(4) { grid-column: span 7; }

                /* ─── Journal Pills ─── */
                .journal-list { display: flex; flex-direction: column; gap: 16px; }
                .journal-pill {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 24px 32px;
                    background: rgba(20, 20, 20, 0.5);
                    border: 1px solid var(--stroke);
                    border-radius: 9999px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                .journal-pill:hover { background: var(--surface); border-color: rgba(255,255,255,0.15); transform: translateX(8px); }
                .j-left { display: flex; align-items: center; gap: 24px; }
                .j-img { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 1px solid var(--stroke); }
                .j-title { font-size: 20px; font-weight: 500; }
                .j-meta { font-size: 14px; color: var(--muted); }
                
                /* ─── Stats Section ─── */
                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; border-top: 1px solid var(--stroke); padding-top: 60px; }
                .stat-item { display: flex; flex-direction: column; gap: 8px; }
                .stat-num { font-size: 64px; font-weight: 500; font-family: 'Instrument Serif', serif; font-style: italic; background: var(--accent-grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;}
                .stat-label { font-size: 14px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; }

                /* ─── Footer Marquee ─── */
                .footer { padding-top: 80px; padding-bottom: 40px; overflow: hidden; position: relative; border-top: 1px solid var(--stroke); }
                .marquee-container { width: 100vw; overflow: hidden; white-space: nowrap; margin-bottom: 60px; margin-left: calc(-50vw + 50%); }
                .marquee-inner { display: inline-block; animation: marquee 30s linear infinite; font-size: 100px; font-weight: 700; color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,0.1); font-family: 'General Sans', sans-serif; }
                .marquee-inner span { padding-right: 40px; }
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

                .footer-bottom { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: var(--muted); padding: 0 20px; }
                .socials { display: flex; gap: 24px; }
                .socials a { color: var(--text); text-decoration: none; transition: color 0.2s; }
                .socials a:hover { color: #fff; }
                .available { display: flex; align-items: center; gap: 8px; }
                .green-dot { width: 8px; height: 8px; background: #00d4aa; border-radius: 50%; box-shadow: 0 0 8px #00d4aa; }

                @media (max-width: 768px) {
                    .navbar { padding: 20px; }
                    .nav-links { display: none; }
                    .bento-card:nth-child(n) { grid-column: span 12; }
                    .journal-pill { flex-direction: column; border-radius: 24px; text-align: center; gap: 16px; padding: 24px; }
                    .j-left { flex-direction: column; }
                    .stats-grid { grid-template-columns: 1fr; text-align: center; }
                    .footer-bottom { flex-direction: column; gap: 32px; }
                }

                /* Entrance Animations */
                .hero-badge, .hero-heading, .hero-subtitle, .cta-group {
                    animation: fadeInUp 0.8s cubic-bezier(0.19, 1, 0.22, 1) both;
                }
                .hero-heading { 
                    animation: fadeInUp 0.8s cubic-bezier(0.19, 1, 0.22, 1) both, shineSweep 5s linear infinite;
                    animation-delay: 0.1s, 0s; 
                }
                @keyframes shineSweep {
                    0% { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }
                .hero-subtitle { animation-delay: 0.2s; }
                .cta-group { animation-delay: 0.3s; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                /* Scroll Reveal Classes */
                .reveal {
                    opacity: 0;
                    transform: translateY(40px);
                    transition: opacity 0.8s cubic-bezier(0.19, 1, 0.22, 1), transform 0.8s cubic-bezier(0.19, 1, 0.22, 1);
                }
                .reveal.active {
                    opacity: 1;
                    transform: translateY(0);
                }
                .delay-1 { transition-delay: 0.05s; }
                .delay-2 { transition-delay: 0.1s; }
                .delay-3 { transition-delay: 0.15s; }
                .delay-4 { transition-delay: 0.2s; }
            </style>

            <!-- Hero Section -->
            <section class="hero-section">
                <video autoplay loop muted playsinline class="bg-video">
                    <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4" type="video/mp4">
                </video>
                <div class="overlay"></div>
                <div class="hero-fade"></div>

                <nav class="navbar">
                    <div class="nav-left">
                        <div class="logo">
                            OmniD3sk
                        </div>
                    </div>
                    
                    <div class="nav-center">
                        <img src="/omnid3sk/OmniD3sk.png" alt="Center Logo" class="center-logo">
                    </div>

                    <div class="nav-right">
                        <a href="https://github.com/oyelurker/OmniD3sk" target="_blank" class="waitlist-btn nav-btn" style="text-decoration: none;">
                            <div class="btn-inner">GitHub Repo</div>
                        </a>
                    </div>
                </nav>

                <div class="hero-content">
                    <div class="hero-badge">
                        <span class="badge-dot"></span>
                        <span class="badge-text-dim">Autonomous Intelligence</span>
                        <span class="badge-text-bright">v2.0 Beta</span>
                    </div>

                    <h1 class="hero-heading">SecOps at the Speed of Thought</h1>

                    <p class="hero-subtitle">
                        Meet Olivia, your Voice-First AI Agent. OmniD3sk is the autonomous command center for SecOps and IT teams, leveraging real-time voice intelligence to orchestrate workflows, resolve tickets, and heal your infrastructure instantly.
                    </p>

                    <div class="cta-group">
                        <button class="waitlist-btn white-btn" id="start-btn">
                            <div class="btn-glow"></div>
                            <div class="btn-inner">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                                Start Voice Session
                                <span class="badge-beta">BETA</span>
                            </div>
                        </button>
                        
                        <button class="waitlist-btn beta-btn">
                            <div class="btn-inner">Join Waitlist</div>
                        </button>
                    </div>
                </div>

                <div class="scroll-indicator">
                    <span>Scroll</span>
                    <div class="scroll-line"></div>
                </div>
            </section>

            <!-- Selected Works Section -->
            <section class="section reveal">
                <div class="section-header">
                    <div class="eyebrow">Platform Capabilities</div>
                    <h2 class="section-title">Core <span class="font-display">infrastructure</span></h2>
                    <p class="section-desc">A selection of autonomous SecOps and IT workflows orchestrated by the OmniD3sk engine.</p>
                </div>

                <div class="bento-grid">
                    <div class="bento-card reveal delay-1">
                        <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop" class="bento-img" />
                        <div class="bento-overlay"></div>
                        <div class="bento-content">
                            <div class="bento-title font-display">Threat Intelligence</div>
                            <div class="bento-btn">View Module</div>
                        </div>
                    </div>
                    <div class="bento-card reveal delay-2">
                        <img src="https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?q=80&w=1000&auto=format&fit=crop" class="bento-img" />
                        <div class="bento-overlay"></div>
                        <div class="bento-content">
                            <div class="bento-title font-display">
                                Voice Helpdesk (Olivia)
                                <span style="display:block; font-size:15px; font-family:'Inter', sans-serif; font-style:normal; opacity:0.7; margin-top:8px; line-height:1.4;">Powered by Gemini Live. Speak directly to Olivia to diagnose IT issues and auto-generate ITSM tickets without typing a word.</span>
                            </div>
                            <div class="bento-btn">View Module</div>
                        </div>
                    </div>
                    <div class="bento-card reveal delay-1">
                        <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop" class="bento-img" />
                        <div class="bento-overlay"></div>
                        <div class="bento-content">
                            <div class="bento-title font-display">Infrastructure Monitoring</div>
                            <div class="bento-btn">View Module</div>
                        </div>
                    </div>
                    <div class="bento-card reveal delay-2">
                        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" class="bento-img" />
                        <div class="bento-overlay"></div>
                        <div class="bento-content">
                            <div class="bento-title font-display">
                                Custom Playbooks
                                <span style="display:block; font-size:15px; font-family:'Inter', sans-serif; font-style:normal; opacity:0.7; margin-top:8px; line-height:1.4;">Connects directly to Notion, Google Calendar, and your enterprise ITSM dashboards for zero-touch resolution.</span>
                            </div>
                            <div class="bento-btn">View Module</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Journal Section -->
            <section class="section reveal">
                <div class="section-header">
                    <div class="eyebrow">System Logs</div>
                    <h2 class="section-title">Recent <span class="font-display">playbooks</span></h2>
                    <p class="section-desc">Real-time ITSM dashboard syncing and security actions executed by Olivia during active voice sessions.</p>
                </div>

                <div class="journal-list">
                    <div class="journal-pill reveal delay-1">
                        <div class="j-left">
                            <img src="https://images.unsplash.com/photo-1614064641913-6b714041d132?q=80&w=200&auto=format&fit=crop" class="j-img" />
                            <div>
                                <div class="j-title">Network Vulnerability Scan</div>
                                <div class="j-meta">5m avg duration • Security</div>
                            </div>
                        </div>
                        <div class="j-date">Executed April 04, 2026</div>
                    </div>
                    <div class="journal-pill reveal delay-2">
                        <div class="j-left">
                            <img src="https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?q=80&w=200&auto=format&fit=crop" class="j-img" />
                            <div>
                                <div class="j-title font-display">Routine Password Reset Queue</div>
                                <div class="j-meta">2m avg duration • IT Helpdesk</div>
                            </div>
                        </div>
                        <div class="j-date">Executed March 28, 2026</div>
                    </div>
                    <div class="journal-pill reveal delay-3">
                        <div class="j-left">
                            <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=200&auto=format&fit=crop" class="j-img" />
                            <div>
                                <div class="j-title">Cloud Instance Provisioning</div>
                                <div class="j-meta">12m avg duration • Infrastructure</div>
                            </div>
                        </div>
                        <div class="j-date">Executed February 15, 2026</div>
                    </div>
                </div>
            </section>

            <!-- Stats Section -->
            <section class="section reveal">
                <div class="stats-grid">
                    <div class="stat-item reveal delay-1">
                        <div class="stat-num">99.9%</div>
                        <div class="stat-label">System Uptime</div>
                    </div>
                    <div class="stat-item reveal delay-2">
                        <div class="stat-num">10k+</div>
                        <div class="stat-label">Tickets Resolved</div>
                    </div>
                    <div class="stat-item reveal delay-3">
                        <div class="stat-num">< 2s</div>
                        <div class="stat-label">Agent Response Time</div>
                    </div>
                </div>
            </section>

            <!-- Footer Area -->
            <footer class="footer reveal">
                <div class="marquee-container">
                    <div class="marquee-inner">
                        <span>SECURE • AUTOMATE • ORCHESTRATE •</span>
                        <span>SECURE • AUTOMATE • ORCHESTRATE •</span>
                        <span>SECURE • AUTOMATE • ORCHESTRATE •</span>
                        <span>SECURE • AUTOMATE • ORCHESTRATE •</span>
                        <span>SECURE • AUTOMATE • ORCHESTRATE •</span>
                        <span>SECURE • AUTOMATE • ORCHESTRATE •</span>
                    </div>
                </div>

                <div class="footer-bottom reveal delay-1">
                    <div class="socials">
                        <a href="#">Documentation</a>
                        <a href="https://github.com/oyelurker/OmniD3sk" target="_blank">GitHub</a>
                        <a href="#">Waitlist</a>
                        <a href="#">Contact Sales</a>
                    </div>
                    <div class="available">
                        <div class="green-dot"></div>
                        System Secure & Online
                    </div>
                </div>
            </footer>
        `;const e={root:null,rootMargin:"0px",threshold:.15},t=new IntersectionObserver((i,s)=>{i.forEach(a=>{a.isIntersecting&&(a.target.classList.add("active"),s.unobserve(a.target))})},e);this.querySelectorAll(".reveal").forEach(i=>t.observe(i)),this.querySelector("#start-btn").addEventListener("click",()=>{const i="English",s="Guest";this.style.opacity="0",this.style.transform="scale(1.05)",this.style.filter="blur(10px) brightness(1.5)",this.style.transition="all 0.6s cubic-bezier(0.19, 1, 0.22, 1)",setTimeout(()=>{this.dispatchEvent(new CustomEvent("navigate",{bubbles:!0,detail:{view:"session",language:i,userName:s}}))},500)})}}customElements.define("view-home",k);const h={TEXT:"TEXT",AUDIO:"AUDIO",SETUP_COMPLETE:"SETUP COMPLETE",INTERRUPTED:"INTERRUPTED",TURN_COMPLETE:"TURN COMPLETE",TOOL_CALL:"TOOL_CALL",SERVER_TOOL_CALL:"SERVER_TOOL_CALL",ERROR:"ERROR",INPUT_TRANSCRIPTION:"INPUT_TRANSCRIPTION",OUTPUT_TRANSCRIPTION:"OUTPUT_TRANSCRIPTION"};class y{constructor(e){this.data="",this.type="",this.endOfTurn=!1,this.endOfTurn=e?.serverContent?.turnComplete;const t=e?.serverContent?.modelTurn?.parts;try{e?.setupComplete?this.type=h.SETUP_COMPLETE:e?.serverContent?.turnComplete?this.type=h.TURN_COMPLETE:e?.serverContent?.interrupted?this.type=h.INTERRUPTED:e?.serverContent?.inputTranscription?(this.type=h.INPUT_TRANSCRIPTION,this.data={text:e.serverContent.inputTranscription.text||"",finished:e.serverContent.inputTranscription.finished||!1}):e?.serverContent?.outputTranscription?(this.type=h.OUTPUT_TRANSCRIPTION,this.data={text:e.serverContent.outputTranscription.text||"",finished:e.serverContent.outputTranscription.finished||!1}):e?.toolCall?(this.type=h.TOOL_CALL,this.data=e?.toolCall):e?.type==="tool_call"?(this.type=h.SERVER_TOOL_CALL,this.data={name:e.name,args:e.args,result:e.result}):e?.type==="interrupted"?this.type=h.INTERRUPTED:e?.type==="session_state"?(this.type="SESSION_STATE",this.data=e.data):e?.type==="error"?(this.type=h.ERROR,this.data=e.error):t?.length&&t[0].text?(this.data=t[0].text,this.type=h.TEXT):t?.length&&t[0].inlineData&&(this.data=t[0].inlineData.data,this.type=h.AUDIO)}catch{}}}class S{constructor(){this.responseModalities=["AUDIO"],this.systemInstructions="",this.googleGrounding=!1,this.enableAffectiveDialog=!1,this.voiceName="Puck",this.temperature=.7,this.proactivity={proactiveAudio:!1},this.inputAudioTranscription=!1,this.outputAudioTranscription=!1,this.enableFunctionCalls=!1,this.functions=[],this.functionsMap={},this.previousImage=null,this.totalBytesSent=0,this.automaticActivityDetection={disabled:!1,silence_duration_ms:2e3,prefix_padding_ms:500,end_of_speech_sensitivity:"END_SENSITIVITY_LOW",start_of_speech_sensitivity:"START_SENSITIVITY_LOW"},this.connected=!1,this.webSocket=null,this.lastSetupMessage=null,this.onReceiveResponse=e=>{},this.onConnectionStarted=()=>{},this.onErrorMessage=e=>{console.error("[GeminiLiveAPI] Error:",e),this.connected=!1},this.onOpen=()=>{},this.onClose=()=>{},this.onError=()=>{}}setSystemInstructions(e){this.systemInstructions=e}setGoogleGrounding(e){this.googleGrounding=e}setResponseModalities(e){this.responseModalities=e}setVoice(e){this.voiceName=e}setProactivity(e){this.proactivity=e}setInputAudioTranscription(e){this.inputAudioTranscription=e}setOutputAudioTranscription(e){this.outputAudioTranscription=e}setEnableFunctionCalls(e){this.enableFunctionCalls=e}addFunction(e){this.functions.push(e),this.functionsMap[e.name]=e}callFunction(e,t){this.functionsMap[e].runFunction(t)}async connect(e,t="English"){try{const i=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({recaptcha_token:e,language:t})});if(!i.ok){const r=new Error("Authentication failed");throw r.status=i.status,r}const a=(await i.json()).session_token;this.sessionToken=a;const n=`${window.location.protocol==="https:"?"wss:":"ws:"}//${window.location.host}/ws?token=${a}`;this.setupWebSocketToService(n)}catch(i){throw console.error("Connection error:",i),i}}disconnect(){this.webSocket&&(this.webSocket.close(),this.connected=!1)}sendMessage(e){this.webSocket&&this.webSocket.readyState===WebSocket.OPEN&&this.webSocket.send(JSON.stringify(e))}onReceiveMessage(e){if(e.data instanceof ArrayBuffer){const s=new y({serverContent:{modelTurn:{parts:[{inlineData:{data:e.data}}]}}});s.type=h.AUDIO,s.data=e.data,this.onReceiveResponse(s);return}const t=JSON.parse(e.data),i=new y(t);this.onReceiveResponse(i)}setupWebSocketToService(e){this.webSocket=new WebSocket(e),this.webSocket.binaryType="arraybuffer",this.webSocket.onclose=t=>{this.connected=!1,this.onClose&&this.onClose(t)},this.webSocket.onerror=t=>{this.connected=!1,this.onError&&this.onError(t)},this.webSocket.onopen=t=>{this.connected=!0,this.totalBytesSent=0,this.sendInitialSetupMessages(),this.onConnectionStarted(),this.onOpen&&this.onOpen(t)},this.webSocket.onmessage=this.onReceiveMessage.bind(this)}getFunctionDefinitions(){const e=[];for(let t=0;t<this.functions.length;t++){const i=this.functions[t];e.push(i.getDefinition())}return e}sendInitialSetupMessages(){const e=this.getFunctionDefinitions(),t={setup:{generation_config:{response_modalities:this.responseModalities,temperature:this.temperature,speech_config:{voice_config:{prebuilt_voice_config:{voice_name:this.voiceName}}}},system_instruction:{parts:[{text:this.systemInstructions}]},tools:{function_declarations:e},proactivity:this.proactivity,realtime_input_config:{automatic_activity_detection:this.automaticActivityDetection}}};this.inputAudioTranscription&&(t.setup.input_audio_transcription={}),this.outputAudioTranscription&&(t.setup.output_audio_transcription={}),this.googleGrounding&&(t.setup.tools.google_search={},delete t.setup.tools.function_declarations),this.enableAffectiveDialog&&(t.setup.generation_config.enable_affective_dialog=!0),this.lastSetupMessage=t,this.sendMessage(t)}sendTextMessage(e){const t={client_content:{turns:[{role:"user",parts:[{text:e}]}],turn_complete:!0}};this.sendMessage(t)}sendToolResponse(e,t){const i={tool_response:{id:e,response:t}};this.sendMessage(i)}sendRealtimeInputMessage(e,t){const i={realtime_input:{media_chunks:[{mime_type:t,data:e}]}};this.sendMessage(i),this.addToBytesSent(e)}addToBytesSent(e){const i=new TextEncoder().encode(e);this.totalBytesSent+=i.length}getBytesSent(){return this.totalBytesSent}sendAudioMessage(e){this.webSocket&&this.webSocket.readyState===WebSocket.OPEN&&(this.webSocket.send(e),this.totalBytesSent+=e.byteLength)}async sendImageMessage(e,t="image/jpeg"){this.sendRealtimeInputMessage(e,t)}}class T{constructor(e){this.client=e,this.audioContext=null,this.audioWorklet=null,this.mediaStream=null,this.isStreaming=!1,this.sampleRate=16e3}async start(e=null){try{const t={sampleRate:this.sampleRate,echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0};return e&&(t.deviceId={exact:e}),this.mediaStream=await navigator.mediaDevices.getUserMedia({audio:t}),this.audioContext=new(window.AudioContext||window.webkitAudioContext)({sampleRate:this.sampleRate}),await this.audioContext.audioWorklet.addModule("/audio-processors/capture.worklet.js"),this.audioWorklet=new AudioWorkletNode(this.audioContext,"audio-capture-processor"),this.muted=!1,this.audioWorklet.port.onmessage=i=>{if(!(!this.isStreaming||this.muted)&&i.data.type==="audio"){const s=i.data.data,a=this.convertToPCM16(s);this.client&&this.client.connected&&this.client.sendAudioMessage(a)}},this.source=this.audioContext.createMediaStreamSource(this.mediaStream),this.source.connect(this.audioWorklet),this.isStreaming=!0,!0}catch(t){throw console.error("Failed to start audio streaming:",t),t}}stop(){this.isStreaming=!1,this.audioWorklet&&(this.audioWorklet.disconnect(),this.audioWorklet.port.close(),this.audioWorklet=null),this.audioContext&&(this.audioContext.close(),this.audioContext=null),this.mediaStream&&(this.mediaStream.getTracks().forEach(e=>e.stop()),this.mediaStream=null)}convertToPCM16(e){const t=new Int16Array(e.length);for(let i=0;i<e.length;i++){const s=Math.max(-1,Math.min(1,e[i]));t[i]=s*32767}return t.buffer}arrayBufferToBase64(e){const t=new Uint8Array(e);let i="";for(let s=0;s<t.byteLength;s++)i+=String.fromCharCode(t[s]);return window.btoa(i)}}class C{constructor(e){this.client=e,this.video=null,this.canvas=null,this.ctx=null,this.mediaStream=null,this.isStreaming=!1,this.captureInterval=null,this.fps=1,this.quality=.8}initializeElements(e,t){this.video=document.createElement("video"),this.video.srcObject=this.mediaStream,this.video.autoplay=!0,this.video.playsInline=!0,this.video.muted=!0,this.canvas=document.createElement("canvas"),this.canvas.width=e,this.canvas.height=t,this.ctx=this.canvas.getContext("2d")}async waitForVideoReady(){await new Promise(e=>{this.video.onloadedmetadata=e}),this.video.play()}startCapturing(){const e=()=>{this.isStreaming&&(this.ctx.drawImage(this.video,0,0,this.canvas.width,this.canvas.height),this.canvas.toBlob(t=>{if(!t)return;const i=new FileReader;i.onloadend=()=>{const s=i.result.split(",")[1];this.client&&this.client.connected&&this.client.sendImageMessage(s,"image/jpeg")},i.readAsDataURL(t)},"image/jpeg",this.quality))};this.captureInterval=setInterval(e,1e3/this.fps)}stop(){this.isStreaming=!1,this.captureInterval&&(clearInterval(this.captureInterval),this.captureInterval=null),this.mediaStream&&(this.mediaStream.getTracks().forEach(e=>e.stop()),this.mediaStream=null),this.video&&(this.video.srcObject=null,this.video=null),this.canvas=null,this.ctx=null}takeSnapshot(){if(!this.video||!this.canvas)throw new Error("Video not initialized");return this.ctx.drawImage(this.video,0,0,this.canvas.width,this.canvas.height),this.canvas.toDataURL("image/jpeg",this.quality)}getVideoElement(){return this.video}}class _ extends C{async start(e={}){try{const{fps:t=1,width:i=1280,height:s=720,quality:a=.7}=e;return this.fps=t,this.quality=a,this.mediaStream=await navigator.mediaDevices.getDisplayMedia({video:{width:{ideal:i},height:{ideal:s}},audio:!1}),this.initializeElements(i,s),await this.waitForVideoReady(),this.isStreaming=!0,this.startCapturing(),this.mediaStream.getVideoTracks()[0].onended=()=>{this.stop(),this.onStop&&this.onStop()},this.video}catch(t){throw console.error("Failed to start screen capture:",t),t}}stop(){super.stop()}}class E{constructor(){this.audioContext=null,this.workletNode=null,this.gainNode=null,this.isInitialized=!1,this.volume=1,this.sampleRate=24e3}async init(){if(!this.isInitialized)try{if(this.audioContext=new(window.AudioContext||window.webkitAudioContext)({sampleRate:this.sampleRate}),!this.audioContext.audioWorklet)throw new Error("AudioWorklet is not supported. Please use a secure context (HTTPS/localhost) or a modern browser.");await this.audioContext.audioWorklet.addModule("/audio-processors/playback.worklet.js"),this.workletNode=new AudioWorkletNode(this.audioContext,"pcm-processor"),this.gainNode=this.audioContext.createGain(),this.gainNode.gain.value=this.volume,this.workletNode.connect(this.gainNode),this.gainNode.connect(this.audioContext.destination),this.isInitialized=!0}catch(e){throw console.error("Failed to initialize audio player:",e),e}}async play(e){this.isInitialized||await this.init();try{this.audioContext.state==="suspended"&&await this.audioContext.resume();let t;if(e instanceof ArrayBuffer)t=new Uint8Array(e);else if(typeof e=="string"){const a=atob(e);t=new Uint8Array(a.length);for(let o=0;o<a.length;o++)t[o]=a.charCodeAt(o)}else{console.error("Unknown audio data format:",e);return}const i=new Int16Array(t.buffer),s=new Float32Array(i.length);for(let a=0;a<i.length;a++)s[a]=i[a]/32768;this.workletNode.port.postMessage(s)}catch(t){throw console.error("Error playing audio chunk:",t),t}}interrupt(){this.workletNode&&this.workletNode.port.postMessage("interrupt")}setVolume(e){this.volume=Math.max(0,Math.min(1,e)),this.gainNode&&(this.gainNode.gain.value=this.volume)}destroy(){this.audioContext&&(this.audioContext.close(),this.audioContext=null),this.isInitialized=!1}}class I extends HTMLElement{static get observedAttributes(){return["color"]}constructor(){super(),this.active=!1,this.audioContext=null,this.analyser=null,this.source=null,this.dataArray=null,this.animationId=null,this._color=null}get waveColor(){return this._color||this.getAttribute("color")||getComputedStyle(document.documentElement).getPropertyValue("--color-accent-primary").trim()||"#4d9ff7"}attributeChangedCallback(e,t,i){e==="color"&&(this._color=i)}connectedCallback(){this.style.display="block",this.style.width="100%",this.style.height="100%",this.innerHTML='<canvas style="width: 100%; height: 100%; display: block;"></canvas>',this.canvas=this.querySelector("canvas"),this.ctx=this.canvas.getContext("2d"),this.resizeObserver=new ResizeObserver(()=>this.resize()),this.resizeObserver.observe(this),this.resize(),this.drawIdle()}disconnectedCallback(){this.resizeObserver&&this.resizeObserver.disconnect(),this.stopAudio()}resize(){const e=this.getBoundingClientRect();this.canvas.width=e.width,this.canvas.height=e.height,this.active||this.drawIdle()}connect(e,t){this.analyser&&this.disconnect();try{this.audioContext=e,this.analyser=this.audioContext.createAnalyser(),this.analyser.fftSize=2048,this.source=t,this.source.connect(this.analyser);const i=this.analyser.frequencyBinCount;this.dataArray=new Uint8Array(i),this.active=!0,this.animate()}catch(i){console.error("Error connecting visualizer:",i)}}disconnect(){if(this.active=!1,this.animationId&&(cancelAnimationFrame(this.animationId),this.animationId=null),this.source&&this.analyser)try{this.source.disconnect(this.analyser)}catch{}this.analyser=null,this.source=null,this.audioContext=null,this.drawIdle()}stopAudio(){this.disconnect()}drawIdle(){const{width:e,height:t}=this.canvas;this.ctx.clearRect(0,0,e,t),this.ctx.beginPath(),this.ctx.moveTo(0,t/2),this.ctx.lineTo(e,t/2),this.ctx.strokeStyle=this.waveColor,this.ctx.lineWidth=2,this.ctx.globalAlpha=.3,this.ctx.stroke(),this.ctx.globalAlpha=1}animate(){if(!this.active||!this.analyser)return;this.animationId=requestAnimationFrame(()=>this.animate()),this.analyser.getByteTimeDomainData(this.dataArray);const e=this.canvas.width,t=this.canvas.height,i=this.ctx;i.clearRect(0,0,e,t),i.lineWidth=3,i.strokeStyle=this.waveColor,i.beginPath();const s=20,a=.3,o=10;(!this.points||this.points.length!==s)&&(this.points=new Array(s).fill(0));const n=e/(s-1),r=Math.floor(this.dataArray.length/s);for(let c=0;c<s;c++){const d=Math.min(c*r,this.dataArray.length-1);let p=this.dataArray[d]/128-1;const m=c/(s-1),l=Math.sin(m*Math.PI),b=p*(t*.4)*o*l;this.points[c]+=(b-this.points[c])*a}i.moveTo(0,t/2);for(let c=0;c<s;c++){const d=c*n,p=t/2+this.points[c];if(c===0)i.moveTo(d,p);else{const m=(c-1)*n,l=t/2+this.points[c-1],b=(m+d)/2,g=(l+p)/2;i.quadraticCurveTo(m,l,b,g)}}i.lineTo(e,t/2),i.stroke()}}customElements.define("audio-visualizer",I);class L extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._rendered=!1,this._observer=new MutationObserver(()=>this._internalScroll())}connectedCallback(){if(!this._rendered){this.render(),this._rendered=!0;const e=this.shadowRoot.querySelector(".transcript-container");e&&this._observer.observe(e,{childList:!0,subtree:!0,characterData:!0})}}disconnectedCallback(){this._observer.disconnect()}_internalScroll(){requestAnimationFrame(()=>{const e=this.shadowRoot.querySelector(".transcript-container");e&&(e.scrollTop=e.scrollHeight+1e3)})}addInputTranscript(e,t){this.updateTranscript("user",e,t)}addOutputTranscript(e,t){this.updateTranscript("model",e,t)}showThinking(){this._removeIndicator();const e=this.shadowRoot.querySelector(".transcript-container");if(!e)return;const t=document.createElement("div");t.className="status-indicator thinking",t.id="status-indicator",t.innerHTML='<span class="dot-pulse"></span> Olivia is thinking...',e.appendChild(t)}showSpeaking(){this._removeIndicator();const e=this.shadowRoot.querySelector(".transcript-container");if(!e)return;const t=document.createElement("div");t.className="status-indicator speaking",t.id="status-indicator",t.innerHTML='<span class="dot-pulse"></span> Olivia is speaking...',e.appendChild(t)}showWorking(e){this._removeIndicator();const t=this.shadowRoot.querySelector(".transcript-container");if(!t)return;const i=document.createElement("div");i.className="status-indicator working",i.id="status-indicator",i.innerHTML=`<span class="dot-pulse"></span> Running ${e||"tool"}...`,t.appendChild(i)}_removeIndicator(){const e=this.shadowRoot.querySelector("#status-indicator");e&&e.remove()}finalizeAll(){this._removeIndicator();const e=this.shadowRoot.querySelector(".transcript-container");if(!e)return;e.querySelectorAll(".bubble.temp").forEach(i=>{i.classList.remove("temp"),i.dataset.role=null})}clear(){const e=this.shadowRoot.querySelector(".transcript-container");e&&(e.innerHTML="")}updateTranscript(e,t,i){const s=this.shadowRoot.querySelector(".transcript-container");if(!s)return;s.querySelectorAll(".bubble.temp").forEach(p=>{p.dataset.role!==e&&(p.classList.remove("temp"),p.dataset.role=null)});let o=s.querySelector(`.bubble.temp[data-role="${e}"]`);if(!o){o=document.createElement("div"),o.className=`bubble temp ${e}`,o.dataset.role=e;const p=document.createElement("span");p.className="bubble-label",p.textContent=e==="user"?"You":"Olivia",o.appendChild(p),s.appendChild(o)}const n=o.textContent,r=e==="user"?"You":"Olivia",c=n.replace(r,"").trim();c.length>0&&!c.endsWith(" ")&&!t.startsWith(" ")&&/^[a-zA-Z0-9\u00C0-\u024F]/.test(t)&&o.appendChild(document.createTextNode(" "));const d=document.createElement("span");d.textContent=t,d.className="fade-span",o.appendChild(d)}render(){this.shadowRoot.innerHTML=`
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
        `}}customElements.define("live-transcript",L);class A extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.issues=[],this._rendered=!1}connectedCallback(){this._rendered||(this.render(),this._rendered=!0)}addIssue(e){this.issues.push({id:this.issues.length+1,title:e.title||"Untitled Issue",description:e.description||"",severity:e.severity||"medium",transaction:e.transaction_code||"",steps:e.steps_to_reproduce||"",timestamp:new Date().toLocaleTimeString()}),this.renderIssues()}getIssues(){return this.issues}clearIssues(){this.issues=[],this.renderIssues()}renderIssues(){const e=this.shadowRoot.querySelector(".issues-list");if(!e)return;const t=this.shadowRoot.querySelector(".issue-count");if(t&&(t.textContent=this.issues.length),this.issues.length===0){e.innerHTML=`
                <div style="text-align: center; padding: 24px; opacity: 0.5; font-size: 0.85rem;">
                    No issues detected yet. The AI will auto-detect and log issues from your conversation.
                </div>
            `;return}e.innerHTML=this.issues.map(i=>`
            <div class="issue-item" style="animation: slideIn 0.3s ease forwards;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
                    <span class="issue-badge ${i.severity}">${i.severity}</span>
                    <span style="font-size: 0.7rem; opacity: 0.4;">${i.timestamp}</span>
                </div>
                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; color: var(--color-text-main, #eaddcf);">
                    ${i.title}
                </div>
                ${i.transaction?`<div style="font-size: 0.75rem; font-family: monospace; color: var(--color-accent-primary, #4d9ff7); margin-bottom: 4px;">T-Code: ${i.transaction}</div>`:""}
                <div style="font-size: 0.8rem; opacity: 0.7; line-height: 1.4;">
                    ${i.description}
                </div>
                ${i.steps?`<div style="font-size: 0.75rem; opacity: 0.5; margin-top: 4px; font-style: italic;">Steps: ${i.steps}</div>`:""}
            </div>
        `).join("")}render(){this.shadowRoot.innerHTML=`
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    font-family: 'Nunito', system-ui, sans-serif;
                }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }

                .panel-title {
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--color-accent-secondary, #f0ab00);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .issue-count-badge {
                    background: var(--color-accent-secondary, #f0ab00);
                    color: #000;
                    font-size: 0.65rem;
                    font-weight: 800;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .issues-list {
                    padding: 8px;
                    overflow-y: auto;
                    max-height: calc(100% - 40px);
                }

                .issue-item {
                    padding: 10px 12px;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    margin-bottom: 6px;
                    transition: all 0.2s ease;
                }

                .issue-item:hover {
                    border-color: var(--color-accent-primary, #4d9ff7);
                    background: rgba(77, 159, 247, 0.05);
                }

                .issue-badge {
                    font-size: 0.6rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding: 2px 6px;
                    border-radius: 4px;
                }

                .issue-badge.critical {
                    background: rgba(229, 115, 115, 0.2);
                    color: #e57373;
                }
                .issue-badge.high {
                    background: rgba(240, 171, 0, 0.2);
                    color: #f0ab00;
                }
                .issue-badge.medium {
                    background: rgba(77, 159, 247, 0.2);
                    color: #4d9ff7;
                }
                .issue-badge.low {
                    background: rgba(129, 199, 132, 0.2);
                    color: #81c784;
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .issues-list::-webkit-scrollbar {
                    width: 3px;
                }
                .issues-list::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 3px;
                }
            </style>
            <div class="panel-header">
                <span class="panel-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    Issues
                </span>
                <span class="issue-count-badge"><span class="issue-count">0</span></span>
            </div>
            <div class="issues-list">
                <div style="text-align: center; padding: 24px; opacity: 0.5; font-size: 0.85rem;">
                    No issues detected yet. The AI will auto-detect and log issues from your conversation.
                </div>
            </div>
        `}}customElements.define("issue-panel",A);class R extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._rendered=!1,this._expandedStage=null,this._stages=[{key:"initiation",label:"Initiation",status:"pending"},{key:"diagnosis",label:"Diagnosis",status:"pending"},{key:"troubleshoot",label:"Troubleshoot",status:"pending"},{key:"resolution",label:"Resolution",status:"pending"}],this._checkpoints=[]}connectedCallback(){this._rendered||(this.render(),this._rendered=!0)}updateFromState(e){if(!e)return;const t=e.stage||"";this._checkpoints=e.checkpoints||[];const i=["initiation","diagnosis","troubleshoot","resolution"],s=i.indexOf(t.toLowerCase());this._stages=this._stages.map((a,o)=>{let n="pending";return o<s?n="complete":o===s&&(n="active"),{...a,status:n}}),s>=0&&(this._expandedStage=i[s]);for(const a of this._stages){const o=this._checkpoints.filter(n=>n.stage?.toLowerCase()===a.key);o.length>0&&o.every(n=>n.status==="skipped")&&a.status==="complete"&&(a.status="skipped")}this.renderPipeline()}_handleStageClick(e){this._expandedStage=this._expandedStage===e?null:e,this.renderPipeline()}renderPipeline(){const e=this.shadowRoot.querySelector(".rail"),t=this.shadowRoot.querySelector(".checkpoint-details");if(!e||!t)return;e.innerHTML=this._stages.map((a,o)=>{const n=o===this._stages.length-1;n||this._stages[o+1].status;const r=a.status==="complete"||a.status==="skipped"?"filled":"",c=this._expandedStage===a.key,d=this._checkpoints.filter(m=>m.stage?.toLowerCase()===a.key),p=d.filter(m=>m.status==="complete").length;return`
                <div class="step">
                    <button class="node ${a.status} ${c?"selected":""}" data-stage="${a.key}" title="${a.label}">
                        ${a.status==="complete"?'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>':a.status==="active"?'<span class="pulse-dot"></span>':a.status==="skipped"?"—":`<span class="step-num">${o+1}</span>`}
                    </button>
                    <span class="step-label ${a.status}">${a.label}</span>
                    ${d.length>0?`<span class="step-count ${a.status}">${p}/${d.length}</span>`:""}
                </div>
                ${n?"":`<div class="connector ${r}"><div class="connector-fill"></div></div>`}
            `}).join("");const i=this._stages.find(a=>a.key===this._expandedStage),s=i?this._checkpoints.filter(a=>a.stage?.toLowerCase()===i.key):[];s.length>0?(t.innerHTML=`
                <div class="details-header">${i.label} Checkpoints</div>
                <div class="details-list">
                    ${s.map(a=>`
                        <div class="cp-row">
                            <span class="cp-status ${a.status}">
                                ${a.status==="complete"?"✓":a.status==="active"?"◉":a.status==="skipped"?"—":"○"}
                            </span>
                            <span class="cp-text">${a.label}</span>
                            ${a.detail?`<span class="cp-detail">${a.detail}</span>`:""}
                        </div>
                    `).join("")}
                </div>
            `,t.classList.add("visible")):(t.innerHTML="",t.classList.remove("visible")),e.querySelectorAll(".node").forEach(a=>{a.addEventListener("click",()=>this._handleStageClick(a.dataset.stage))})}render(){this.shadowRoot.innerHTML=`
            <style>
                :host {
                    display: block;
                    width: 100%;
                    font-family: 'Nunito', system-ui, sans-serif;
                }

                .tracker {
                    background: var(--color-surface, rgba(255,255,255,0.04));
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 14px;
                    padding: 16px 20px 12px;
                }

                .tracker-label {
                    font-size: 0.65rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--color-accent-secondary, #f0ab00);
                    margin-bottom: 14px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .rail {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    position: relative;
                }

                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    position: relative;
                    z-index: 2;
                    flex-shrink: 0;
                }

                .node {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.15);
                    background: rgba(255,255,255,0.04);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: rgba(255,255,255,0.5);
                    padding: 0;
                    font-family: inherit;
                    position: relative;
                }

                .node:hover {
                    border-color: var(--color-accent-primary, #4d9ff7);
                    transform: scale(1.1);
                }

                .node.selected {
                    transform: scale(1.15);
                }

                .node.complete {
                    border-color: #81c784;
                    background: rgba(129, 199, 132, 0.15);
                    color: #81c784;
                    box-shadow: 0 0 12px rgba(129, 199, 132, 0.2);
                }

                .node.active {
                    border-color: var(--color-accent-primary, #4d9ff7);
                    background: rgba(77, 159, 247, 0.12);
                    color: var(--color-accent-primary, #4d9ff7);
                    box-shadow: 0 0 16px rgba(77, 159, 247, 0.25);
                    animation: nodePulse 2.5s ease-in-out infinite;
                }

                .node.skipped {
                    border-color: rgba(240, 171, 0, 0.4);
                    background: rgba(240, 171, 0, 0.08);
                    color: #f0ab00;
                }

                @keyframes nodePulse {
                    0%, 100% { box-shadow: 0 0 8px rgba(77, 159, 247, 0.15); }
                    50% { box-shadow: 0 0 20px rgba(77, 159, 247, 0.35); }
                }

                .pulse-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: var(--color-accent-primary, #4d9ff7);
                    animation: dotPulse 1.5s ease-in-out infinite;
                }

                @keyframes dotPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.7); }
                }

                .step-num {
                    font-size: 0.75rem;
                    font-weight: 700;
                    opacity: 0.6;
                }

                .step-label {
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: rgba(255,255,255,0.55);
                    text-align: center;
                    white-space: nowrap;
                    transition: color 0.3s;
                }
                .step-label.complete { color: #81c784; }
                .step-label.active { color: var(--color-accent-primary, #4d9ff7); }
                .step-label.skipped { color: #f0ab00; }

                .step-count {
                    font-size: 0.6rem;
                    font-weight: 700;
                    opacity: 0.4;
                    font-family: 'JetBrains Mono', monospace;
                }
                .step-count.complete { color: #81c784; opacity: 0.7; }
                .step-count.active { color: var(--color-accent-primary, #4d9ff7); opacity: 0.7; }

                .connector {
                    flex: 1;
                    height: 2px;
                    background: rgba(255,255,255,0.08);
                    margin-top: 18px;
                    position: relative;
                    border-radius: 1px;
                    overflow: hidden;
                    min-width: 20px;
                }

                .connector-fill {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 0;
                    background: linear-gradient(90deg, #81c784, rgba(129,199,132,0.3));
                    border-radius: 1px;
                    transition: width 0.6s ease;
                }

                .connector.filled .connector-fill {
                    width: 100%;
                }

                /* Checkpoint details dropdown */
                .checkpoint-details {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.35s ease, padding 0.35s ease, opacity 0.25s ease;
                    opacity: 0;
                    margin-top: 0;
                }

                .checkpoint-details.visible {
                    max-height: 300px;
                    opacity: 1;
                    margin-top: 12px;
                    padding-top: 10px;
                    border-top: 1px solid rgba(255,255,255,0.06);
                }

                .details-header {
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: rgba(255,255,255,0.4);
                    margin-bottom: 8px;
                }

                .details-list {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .cp-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 0.78rem;
                    transition: background 0.2s;
                }

                .cp-row:hover {
                    background: rgba(255,255,255,0.03);
                }

                .cp-status {
                    font-size: 0.7rem;
                    width: 16px;
                    text-align: center;
                    flex-shrink: 0;
                }
                .cp-status.complete { color: #81c784; }
                .cp-status.active { color: var(--color-accent-primary, #4d9ff7); }
                .cp-status.skipped { color: #f0ab00; }
                .cp-status.pending { color: rgba(255,255,255,0.2); }

                .cp-text {
                    color: var(--color-text-main, #eaddcf);
                    opacity: 0.8;
                    flex: 1;
                }

                .cp-detail {
                    font-size: 0.68rem;
                    color: var(--color-accent-primary, #4d9ff7);
                    opacity: 0.6;
                    font-family: 'JetBrains Mono', monospace;
                    flex-shrink: 0;
                    max-width: 200px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                @media (max-width: 600px) {
                    .step-label { font-size: 0.6rem; }
                    .node { width: 30px; height: 30px; }
                    .connector { margin-top: 15px; }
                    .tracker { padding: 12px 14px 10px; }
                }
            </style>
            <div class="tracker">
                <div class="tracker-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    Diagnostic Progress
                </div>
                <div class="rail"></div>
                <div class="checkpoint-details"></div>
            </div>
        `,this.renderPipeline()}}customElements.define("diagnostic-tracker",R);class O extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._items=[],this._rendered=!1}connectedCallback(){this._rendered||(this.render(),this._rendered=!0)}setGuidance(e){this._items=Array.isArray(e)?[...e]:[],this._updateVisibility(),this.renderItems()}addGuidance(e){e&&(this._items.push({title:e.title||"Untitled",detail:e.detail||""}),this._updateVisibility(),this.renderItems())}_updateVisibility(){this.style.display=this._items.length===0?"none":""}async _copyToClipboard(e,t){try{await navigator.clipboard.writeText(e);const i=t.textContent;t.textContent="Copied!",t.classList.add("copied"),setTimeout(()=>{t.textContent=i,t.classList.remove("copied")},2e3)}catch{const i=document.createElement("textarea");i.value=e,i.style.position="fixed",i.style.opacity="0",document.body.appendChild(i),i.select(),document.execCommand("copy"),document.body.removeChild(i);const s=t.textContent;t.textContent="Copied!",t.classList.add("copied"),setTimeout(()=>{t.textContent=s,t.classList.remove("copied")},2e3)}}renderItems(){const e=this.shadowRoot.querySelector(".guidance-list");if(!e)return;const t=this.shadowRoot.querySelector(".guidance-count");if(t&&(t.textContent=this._items.length),this._items.length===0){e.innerHTML="";return}e.innerHTML=this._items.map((i,s)=>`
            <div class="guidance-card" style="animation: slideIn 0.3s ease forwards; animation-delay: ${s*.05}s;">
                <div class="card-header">
                    <span class="card-title">${i.title}</span>
                    <button class="copy-btn" data-idx="${s}">Copy</button>
                </div>
                <div class="card-detail">${i.detail}</div>
            </div>
        `).join(""),e.querySelectorAll(".copy-btn").forEach(i=>{i.addEventListener("click",s=>{s.stopPropagation();const a=parseInt(i.dataset.idx,10),o=this._items[a];o&&this._copyToClipboard(`${o.title}: ${o.detail}`,i)})})}render(){this.shadowRoot.innerHTML=`
            <style>
                :host {
                    display: block;
                    width: 100%;
                    font-family: 'Nunito', system-ui, sans-serif;
                }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }

                .panel-title {
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--color-accent-secondary, #f0ab00);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .guidance-count-badge {
                    background: var(--color-accent-secondary, #f0ab00);
                    color: #000;
                    font-size: 0.65rem;
                    font-weight: 800;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .guidance-list {
                    padding: 8px;
                    overflow-y: auto;
                    max-height: calc(100% - 40px);
                }

                .guidance-card {
                    padding: 10px 12px;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    margin-bottom: 6px;
                    transition: all 0.2s ease;
                    opacity: 0;
                }

                .guidance-card:hover {
                    border-color: var(--color-accent-primary, #4d9ff7);
                    background: rgba(77, 159, 247, 0.05);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                    gap: 8px;
                }

                .card-title {
                    font-weight: 700;
                    font-size: 0.9rem;
                    color: var(--color-text-main, #eaddcf);
                    line-height: 1.3;
                }

                .card-detail {
                    font-size: 0.8rem;
                    color: var(--color-text-main, #eaddcf);
                    opacity: 0.7;
                    line-height: 1.5;
                }

                .copy-btn {
                    flex-shrink: 0;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 6px;
                    color: var(--color-text-main, #eaddcf);
                    font-family: inherit;
                    font-size: 0.68rem;
                    font-weight: 600;
                    padding: 3px 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .copy-btn:hover {
                    background: rgba(77, 159, 247, 0.15);
                    border-color: var(--color-accent-primary, #4d9ff7);
                    color: var(--color-accent-primary, #4d9ff7);
                }

                .copy-btn.copied {
                    background: rgba(129, 199, 132, 0.15);
                    border-color: #81c784;
                    color: #81c784;
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .guidance-list::-webkit-scrollbar {
                    width: 3px;
                }
                .guidance-list::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 3px;
                }
            </style>
            <div class="panel-header">
                <span class="panel-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    L2 Guidance
                </span>
                <span class="guidance-count-badge"><span class="guidance-count">0</span></span>
            </div>
            <div class="guidance-list"></div>
        `,this._updateVisibility()}}customElements.define("agent-guidance",O);const M=`You are the Virtual Internal Assistant for OmniD3sk. You help users navigate government portals, visa applications, tax filing systems, and online services. You are relentless, thorough, and you NEVER close a case with missing information.

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
After you finish speaking, STOP. One turn = one response = then silence. WAIT for the user.`,z={search_knowledge_base:{label:"KB Search",color:"#4d9ff7",icon:"🔍"},lookup_error_code:{label:"Error Lookup",color:"#e57373",icon:"⚠"},lookup_portal_page:{label:"Page Lookup",color:"#ffb74d",icon:"📋"},diagnose_issue:{label:"Diagnosis",color:"#ba68c8",icon:"🔬"},create_issue:{label:"Issue Logged",color:"#ff8a65",icon:"📌"},create_itsm_ticket:{label:"Ticket Created",color:"#81c784",icon:"🎫"},update_itsm_ticket:{label:"Ticket Updated",color:"#81c784",icon:"✏"},research_support_topic:{label:"Web Research",color:"#4dd0e1",icon:"🌐"}};class N extends HTMLElement{constructor(){super(),this.geminiClient=null,this.audioStreamer=null,this.audioPlayer=null,this.screenCapture=null,this._isSessionConnected=!1,this.isScreenSharing=!1,this.isSpeaking=!1,this.sessionToken=null,this._timerInterval=null,this._sessionStartTime=null,this._cmdToastTimeout=null,this._currentPriority=null,this._toolCallCount=0,this._pendingUserTranscript="",this._pendingModelTranscript="",this._panelOpen=!1,this._activeTab="activity",this._toolEntries=[],this._logEntries=[],this._summaryPoints=[],this._currentSentiment="neutral",this._sentimentHistory=[],this._detectedInfo={user:null,module:null,tcode:null,error:null,issue:null}}connectedCallback(){this.innerHTML=`
            <style>
                /* ═══════════════════════════════════════════════════
                   RESOLVE — Split Layout
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
                .m-viz-tag.theepa { color: var(--color-accent-primary); }

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
                    display: flex; gap: 8px; padding: 0 24px 8px 24px; justify-content: flex-end;
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
                            <span class="m-viz-tag theepa">Olivia</span>
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
        `,this.bindEvents()}disconnectedCallback(){this.cleanup(),this._pasteHandler&&document.removeEventListener("paste",this._pasteHandler)}bindEvents(){const e=this.querySelector("#back-btn"),t=this.querySelector("#mic-btn"),i=this.querySelector("#screen-share-btn"),s=this.querySelector("#screenshot-btn"),a=this.querySelector("#file-input"),o=this.querySelector("#connection-status");e.addEventListener("click",()=>{this.cleanup(),this.dispatchEvent(new CustomEvent("navigate",{bubbles:!0,detail:{view:"home"}}))}),t.addEventListener("click",async()=>{this.isSpeaking=!this.isSpeaking,this.isSpeaking?(t.classList.add("active"),t.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>',await this.startSession(o)):(t.classList.remove("active"),this.endSession())}),i.addEventListener("click",()=>this.toggleScreenShare()),s.addEventListener("click",()=>a.click()),a.addEventListener("change",l=>this.handleScreenshotUpload(l)),this.querySelector("#mute-btn").addEventListener("click",()=>this.toggleMute());const n=this.querySelector("#chat-input"),r=this.querySelector("#chat-send-btn"),c=()=>{const l=n.value.trim();!l||!this.geminiClient?.connected||(this.geminiClient.sendTextMessage(l),this.querySelector("#transcript").addInputTranscript(l,!0),this._addTranscriptEntry("user",l,this._elapsed()),this._extractInfo(l,"user"),this._analyzeSentiment(l),this._addLogEntry("ws",`<span class="hl">CHAT_SENT</span> <span class="val">${this._escapeForLog(l)}</span>`),n.value="")};n.addEventListener("keydown",l=>{l.key==="Enter"&&!l.shiftKey&&(l.preventDefault(),c())}),r.addEventListener("click",c);const d=l=>{this.geminiClient?.connected&&(this.geminiClient.sendTextMessage(l),this.querySelector("#transcript").addInputTranscript(l,!0),this._addTranscriptEntry("user",l,this._elapsed()),this._extractInfo(l,"user"),this._analyzeSentiment(l),this._addLogEntry("ws",`<span class="hl">CHAT_SENT</span> <span class="val">${this._escapeForLog(l)}</span>`))},p=this.querySelector("#qa-notion");p&&p.addEventListener("click",()=>d("Please save this current threat report to my Notion workspace."));const m=this.querySelector("#qa-calendar");m&&m.addEventListener("click",()=>d("Please schedule a follow-up meeting on my calendar.")),this.querySelector("#toggle-activity-btn").addEventListener("click",()=>this._togglePanel("activity")),this.querySelector("#toggle-insights-btn").addEventListener("click",()=>this._togglePanel("insights")),this.querySelector("#toggle-transcript-btn").addEventListener("click",()=>this._togglePanel("transcript")),this.querySelector("#toggle-logs-btn").addEventListener("click",()=>this._togglePanel("logs")),this.querySelectorAll(".m-tab").forEach(l=>{l.addEventListener("click",()=>this._switchTab(l.dataset.tab))}),this._pasteHandler=l=>{if(!this._isSessionConnected)return;const b=l.clipboardData?.items;if(b){for(const g of b)if(g.type.startsWith("image/")){l.preventDefault();const x=g.getAsFile(),f=new FileReader;f.onload=v=>{const w=v.target.result.split(",")[1];this._sendImageToServer(w),this._showImagePreview(v.target.result)},f.readAsDataURL(x);break}}},document.addEventListener("paste",this._pasteHandler)}_togglePanel(e){const t=this.querySelector("#side-panel");this._panelOpen&&this._activeTab===e?(t.classList.remove("open"),this._panelOpen=!1):(t.classList.add("open"),this._panelOpen=!0,this._switchTab(e))}_switchTab(e){this._activeTab=e,this.querySelectorAll(".m-tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===e)),this.querySelectorAll(".m-panel-section").forEach(t=>t.classList.remove("active")),this.querySelector(`#tab-${e}`)?.classList.add("active")}_addToolEntry(e,t,i,s,a){this._toolCallCount++;const o=this.querySelector("#tool-badge");o.textContent=this._toolCallCount,o.classList.add("visible");const n=this.querySelector("#tab-activity"),r=this.querySelector("#activity-empty");r&&r.remove();const c=JSON.stringify(t||{}).slice(0,120);let d="";if(i)try{const g=typeof i=="string"?JSON.parse(i):i;g.title?d=g.title:g.ticket_id?d=`Ticket ${g.ticket_id}`:g.source_count?d=`${g.source_count} sources found`:d=JSON.stringify(g).slice(0,60)}catch{d=String(i).slice(0,60)}const p=document.createElement("div");p.className="m-tool-entry",p.innerHTML=`
            <div class="m-tool-pip" style="background:${s.color}"></div>
            <div class="m-tool-body">
                <div class="m-tool-head">
                    <span class="m-tool-name" style="color:${s.color}">${s.icon||""} ${s.label}</span>
                    <span class="m-tool-time">${a}</span>
                </div>
                <div class="m-tool-args">${c}</div>
                ${d?`<div class="m-tool-result">${d}</div>`:""}
            </div>
        `,n.appendChild(p),n.scrollTop=n.scrollHeight;const l={search_knowledge_base:"🔍",lookup_error_code:"⚠️",lookup_portal_page:"📋",diagnose_issue:"🔬",create_issue:"📌",create_itsm_ticket:"🎫",update_itsm_ticket:"✏️",research_support_topic:"🌐"}[e]||"⚡",b=d?`${s.label}: ${d}`:`${s.label} executed`;this._addSummaryPoint(l,b)}_addTranscriptEntry(e,t,i){const s=this.querySelector("#tab-transcript"),a=this.querySelector("#transcript-empty");a&&a.remove();const o=document.createElement("div");o.className=`m-tx-entry ${e}`,o.innerHTML=`
            <div class="m-tx-head">
                <span class="m-tx-role">${e==="user"?"You":"Olivia"}</span>
                <span class="m-tx-time">${i}</span>
            </div>
            <div class="m-tx-text">${t}</div>
        `,s.appendChild(o),s.scrollTop=s.scrollHeight}_addLogEntry(e,t){const i=this.querySelector("#tab-logs"),s=this.querySelector("#logs-empty");s&&s.remove();const a=document.createElement("div");a.className=`m-log-entry ${e}`,a.innerHTML=t,i.appendChild(a),i.scrollTop=i.scrollHeight}_analyzeSentiment(e){const t=e.toLowerCase(),i=/\b(not working|broken|error|fail|wrong|can't|cannot|impossible|terrible|worst|angry|furious|ridiculous|unacceptable|useless|waste|stupid|hate|annoying|frustrated)\b/i,s=/\b(don't understand|confused|what do you mean|not sure|i don't know|unclear|how do i|what is|help me|lost|stuck)\b/i,a=/\b(urgent|asap|emergency|critical|production down|showstopper|blocking|deadline|immediately|p1)\b/i,o=/\b(thank|thanks|great|good|perfect|yes|okay|ok|sure|understood|got it|appreciate|helpful|works|working|resolved|fixed)\b/i;return i.test(t)?"frustrated":a.test(t)?"urgent":s.test(t)?"confused":o.test(t)?"calm":"neutral"}_updateSentiment(e){const t=this._analyzeSentiment(e);this._currentSentiment=t,this._sentimentHistory.push(t);const i=this.querySelector("#sentiment-badge");if(i){const a={calm:"Calm",frustrated:"Frustrated",confused:"Confused",neutral:"Neutral",urgent:"Urgent"},o={calm:"😊",frustrated:"😤",confused:"🤔",neutral:"😐",urgent:"🚨"};i.className=`m-sentiment visible ${t}`,i.textContent=`${o[t]} ${a[t]}`}const s=this.querySelector("#sentiment-timeline");if(s){const a=document.createElement("div"),o={calm:"40%",neutral:"20%",confused:"60%",frustrated:"80%",urgent:"100%"};a.className=`m-sentiment-bar ${t}`,a.style.height=o[t],s.appendChild(a)}}_extractInfo(e,t){if(t==="user"){const n=e.match(/(?:i'm|i am|my name is|this is|name's)\s+([A-Z][a-z]+)/i);n&&!this._detectedInfo.user&&(this._detectedInfo.user=n[1],this._updateInfoCard("info-user",n[1]),this._addSummaryPoint("👤",`User identified: ${n[1]}`))}const i=e.match(/\b(visa|passport|income tax|tax filing|ITR|DS-160|VFS|BLS|Aadhaar|PAN|Schengen|embassy|consulate|e-filing|government|portal|UIDAI)\b/i);if(i){const n=i[1];this._detectedInfo.tcode!==n&&(this._detectedInfo.tcode=n,this._updateInfoCard("info-tcode",n),this._addSummaryPoint("📋",`Portal detected: ${n}`))}const s=e.match(/\b([A-Z]{2,5}\d{3})\b/)||e.match(/(?:error|code)\s*[:=]?\s*(\d{3,5})\b/i)||e.match(/(?:error|message)\s+(?:code|number|no\.?)\s*[:=]?\s*["']?([A-Z]{2,5}\d{3})["']?/i);if(s){const n=(s[1]||s[0]).trim().toUpperCase();this._detectedInfo.error!==n&&n.length>=3&&(this._detectedInfo.error=n,this._updateInfoCard("info-error",n),this._addSummaryPoint("⚠️",`Error code: ${n}`))}const a=e.toLowerCase();let o=null;/\b(login|password|otp|locked|sign in|authentication)\b/i.test(a)?o="Authentication":/\b(payment|transaction|deducted|refund|receipt)\b/i.test(a)?o="Payments":/\b(upload|document|file|photo|certificate)\b/i.test(a)?o="Documents":/\b(form|validation|submit|field|mandatory)\b/i.test(a)?o="Forms":/\b(visa|passport|embassy|consulate|appointment)\b/i.test(a)?o="Visa/Travel":/\b(tax|itr|filing|pan|aadhaar)\b/i.test(a)&&(o="Tax/Identity"),o&&this._detectedInfo.module!==o&&(this._detectedInfo.module=o,this._updateInfoCard("info-module",o))}_updateInfoCard(e,t){const i=this.querySelector(`#${e}`);i&&(i.textContent=t,i.classList.remove("empty"))}_addSummaryPoint(e,t){this._summaryPoints.push({icon:e,text:t,time:this._elapsed()});const i=this.querySelector("#summary-feed");if(!i)return;const s=this.querySelector("#summary-empty");s&&s.remove();const a=document.createElement("div");a.className="m-summary-point",a.innerHTML=`<span class="m-summary-icon">${e}</span><span>${t}</span>`,i.appendChild(a),i.scrollTop=i.scrollHeight}async startSession(e){try{e.textContent="Connecting",e.classList.remove("on"),this.setOliviaState("listening");const t=this.getAttribute("language")||"English";let i=M;t&&t!=="English"&&(i+=`

# Language
You MUST respond in ${t}. ALL your spoken responses must be in ${t}, INCLUDING your very first greeting. Translate the greeting naturally into ${t} — do not speak English at all.
However, all ITSM tickets, diagnostic reports, error code lookups, and technical documentation must remain in English regardless of the conversation language.
Tool function calls and their parameters must always be in English.
Technical terms like error codes, URLs, and portal names stay in English even when speaking ${t}.
`),this.geminiClient=new S,this.geminiClient.setSystemInstructions(i),this.geminiClient.setInputAudioTranscription(!0),this.geminiClient.setOutputAudioTranscription(!0),this.geminiClient.setVoice("Kore"),this.geminiClient.setResponseModalities(["AUDIO"]),this.geminiClient.setEnableFunctionCalls(!0),this.geminiClient.onReceiveResponse=o=>this.handleResponse(o),this.geminiClient.onConnectionStarted=()=>{this._addLogEntry("ws",'<span class="hl">WS_OPEN</span> WebSocket session established')},this.geminiClient.onError=o=>{console.error("Gemini error:",o),this._addLogEntry("error",`<span class="hl">WS_ERROR</span> <span class="err">${o?.message||o}</span>`)},this.geminiClient.onClose=()=>{this._addLogEntry("ws",'<span class="hl">WS_CLOSE</span> WebSocket disconnected')},await this.geminiClient.connect("",t),this.audioPlayer=new E,await this.audioPlayer.init(),this.audioStreamer=new T(this.geminiClient),await this.audioStreamer.start();const s=this.querySelector("#user-viz"),a=this.querySelector("#model-viz");if(this.audioStreamer.audioContext&&this.audioStreamer.source&&s.connect(this.audioStreamer.audioContext,this.audioStreamer.source),this.audioPlayer.audioContext&&this.audioPlayer.gainNode&&a.connect(this.audioPlayer.audioContext,this.audioPlayer.gainNode),this._isSessionConnected=!0,this.sessionToken=this.geminiClient.sessionToken,this._toolCallCount=0,e.textContent="Live",e.classList.add("on"),this.querySelector("#live-dot").classList.add("on"),this.querySelector("#session-timer").classList.add("on"),this._sessionStartTime=Date.now(),this._timerInterval=setInterval(()=>{const o=Math.floor((Date.now()-this._sessionStartTime)/1e3);this.querySelector("#session-timer").textContent=`${String(Math.floor(o/60)).padStart(2,"0")}:${String(o%60).padStart(2,"0")}`},1e3),t!=="English"){const o=this.querySelector("#lang-pill");o&&(o.style.display="",o.textContent=t)}this.querySelector("#screen-share-btn").disabled=!1,this.querySelector("#screenshot-btn").disabled=!1,this.querySelector("#mute-btn").disabled=!1,this.querySelector("#chat-input").disabled=!1,this.querySelector("#chat-send-btn").disabled=!1,this.querySelector("#qa-notion")&&(this.querySelector("#qa-notion").disabled=!1),this.querySelector("#qa-calendar")&&(this.querySelector("#qa-calendar").disabled=!1),this.querySelector("#transcript").clear(),this._addLogEntry("info",`<span class="hl">SESSION_INIT</span> lang=<span class="val">${t}</span> engine=<span class="val">omnid3sk-live</span>`)}catch(t){console.error("Failed to start:",t),this.isSpeaking=!1;const i=this.querySelector("#mic-btn");i.classList.remove("active"),this._resetMicBtn(i),e.textContent=t.status===429?"Rate limited":"Failed",e.classList.remove("on")}}_flushTranscriptsToPanel(){if(this._pendingUserTranscript.trim()){const e=this._pendingUserTranscript.trim();this._addTranscriptEntry("user",e,this._elapsed()),this._addLogEntry("ws",`<span class="hl">INPUT_TRANSCRIPTION</span> <span class="val">${this._escapeForLog(e)}</span>`),this._updateSentiment(e),this._extractInfo(e,"user"),this._pendingUserTranscript=""}if(this._pendingModelTranscript.trim()){const e=this._pendingModelTranscript.trim();this._addTranscriptEntry("model",e,this._elapsed()),this._addLogEntry("ws",`<span class="hl">OUTPUT_TRANSCRIPTION</span> <span class="val">${this._escapeForLog(e)}</span>`),this._extractInfo(e,"model"),this._pendingModelTranscript=""}}_escapeForLog(e){const t=document.createElement("div");return t.textContent=e.length>100?e.slice(0,100)+"...":e,t.innerHTML}handleResponse(e){switch(e.type){case h.AUDIO:this.audioPlayer&&this.audioPlayer.play(e.data),this.querySelector("#transcript").showSpeaking(),this.setOliviaState("speaking");break;case h.INPUT_TRANSCRIPTION:e.data?.text&&(this.querySelector("#transcript").addInputTranscript(e.data.text,e.data.finished),this._pendingUserTranscript+=e.data.text);break;case h.OUTPUT_TRANSCRIPTION:e.data?.text&&(this.querySelector("#transcript").addOutputTranscript(e.data.text,e.data.finished),this._detectTcodeCommand(e.data.text),this._pendingModelTranscript+=e.data.text);break;case h.INTERRUPTED:this.audioPlayer&&this.audioPlayer.interrupt(),this.querySelector("#transcript").finalizeAll(),this._flushTranscriptsToPanel(),this._addLogEntry("event",'<span class="hl">INTERRUPTED</span> User cut off model response'),this.setOliviaState("listening");break;case h.TURN_COMPLETE:this.querySelector("#transcript").finalizeAll(),this._flushTranscriptsToPanel(),this._addLogEntry("debug","TURN_COMPLETE"),this.setOliviaState("listening");break;case h.TOOL_CALL:if(e.data?.functionCalls)for(const t of e.data.functionCalls)this.geminiClient.callFunction(t.name,t.args),this.geminiClient.sendToolResponse(t.id,{result:"success"}),this._addLogEntry("tool",`<span class="hl">CLIENT_TOOL_CALL</span> <span class="key">${t.name}</span>(${JSON.stringify(t.args).slice(0,80)})`);break;case h.SERVER_TOOL_CALL:{const t=z[e.data.name]||{label:e.data.name,color:"#888",icon:""},i=this.querySelector("#transcript");i?.showWorking?i.showWorking(t.label):i?.showThinking&&i.showThinking(),this.setOliviaState("thinking"),this.handleServerToolEvent(e.data),this._addToolEntry(e.data.name,e.data.args,e.data.result,t,this._elapsed());const s=JSON.stringify(e.data.args||{}).slice(0,80);this._addLogEntry("tool",`<span class="hl">SERVER_TOOL_CALL</span> <span class="key">${e.data.name}</span>(${s})`);break}case"SESSION_STATE":this.handleSessionState(e.data),this._addLogEntry("info",`<span class="hl">SESSION_STATE</span> stage=<span class="val">${e.data?.stage||"n/a"}</span> checkpoints=<span class="val">${e.data?.checkpoints?.length||0}</span>`);break;default:this._addLogEntry("debug",`<span class="hl">UNKNOWN</span> type=<span class="val">${e.type}</span>`)}}_elapsed(){if(!this._sessionStartTime)return"";const e=Math.floor((Date.now()-this._sessionStartTime)/1e3);return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}handleSessionState(e){if(e.tickets?.length>0){const t=e.tickets[e.tickets.length-1];t.severity&&this._updateSLA(t.severity.toUpperCase())}else if(e.issues?.length>0){const t=e.issues[e.issues.length-1];t.severity&&this._updateSLA(t.severity.toUpperCase())}e.session_id&&!this.sessionToken&&(this.sessionToken=e.session_id)}handleServerToolEvent(e){const{name:t,args:i={},result:s}=e;switch(t){case"create_issue":{const a=this.querySelector("#issue-panel"),o=this.querySelector("#issues-slot");if(a){let n=s?typeof s=="string"?JSON.parse(s):s:i;n.issue&&(n=n.issue),!n.title&&i.title&&(n=i),a.addIssue(n),o&&o.classList.add("visible")}break}case"create_itsm_ticket":{if(s){const a=typeof s=="string"?JSON.parse(s):s;a.ticket_id&&this.querySelector("#transcript")?.addOutputTranscript(`[Ticket ${a.ticket_id} created]`,!0)}break}case"research_support_topic":{if(s){const a=typeof s=="string"?JSON.parse(s):s;a.success&&a.source_count>0&&this.querySelector("#transcript")?.addOutputTranscript(`[Researched: ${a.source_count} web sources]`,!0)}break}}}async toggleScreenShare(){const e=this.querySelector("#screen-share-btn"),t=this.querySelector("#screen-section"),i=this.querySelector("#screen-preview-box");if(this.isScreenSharing)this.screenCapture&&(this.screenCapture.stop(),this.screenCapture=null),this.isScreenSharing=!1,i.innerHTML="",t.classList.remove("visible"),e.classList.remove("active-share");else try{this.screenCapture=new _(this.geminiClient),this.screenCapture.onStop=()=>{this.isScreenSharing=!1,i.innerHTML="",t.classList.remove("visible"),e.classList.remove("active-share")};const s=await this.screenCapture.start({fps:1,width:1280,height:720,quality:.7});this.isScreenSharing=!0,s.style.cssText="width:100%;height:100%;object-fit:contain;",i.appendChild(s),t.classList.add("visible"),e.classList.add("active-share")}catch(s){console.error("Screen share failed:",s)}}toggleMute(){const e=this.querySelector("#mute-btn");if(!this.audioStreamer)return;const t=e.classList.toggle("muted");this.audioStreamer.muted=t,this.audioStreamer.stream&&this.audioStreamer.stream.getAudioTracks().forEach(s=>{s.enabled=!t});const i=e.querySelector(".m-tip");i&&(i.textContent=t?"Unmute":"Mute")}_sendImageToServer(e){this.geminiClient?.connected&&this.geminiClient.sendMessage({type:"image",data:e})}_showImagePreview(e){const t=this.querySelector("#screen-preview-box"),i=this.querySelector("#screen-section"),s=document.createElement("img");s.src=e,s.style.cssText="width:100%;height:100%;object-fit:contain;";const a=t.querySelector("img, video");a&&a.remove(),t.appendChild(s),i.classList.add("visible")}handleScreenshotUpload(e){const t=e.target.files[0];if(!t)return;const i=new FileReader;i.onload=s=>{this._sendImageToServer(s.target.result.split(",")[1]),this._showImagePreview(s.target.result)},i.readAsDataURL(t),e.target.value=""}endSession(){this.cleanup(),this._isSessionConnected=!1,this.isSpeaking=!1,this.setOliviaState("asleep");const e=this.querySelector("#mic-btn");e&&(e.classList.remove("active"),this._resetMicBtn(e));const t=this.querySelector("#connection-status");t&&(t.textContent="Ended",t.classList.remove("on")),this.querySelector("#live-dot")?.classList.remove("on"),this._timerInterval&&(clearInterval(this._timerInterval),this._timerInterval=null),this.querySelector("#user-viz")?.disconnect(),this.querySelector("#model-viz")?.disconnect(),this.querySelector("#screen-share-btn").disabled=!0,this.querySelector("#screenshot-btn").disabled=!0,this.querySelector("#mute-btn").disabled=!0,this.querySelector("#mute-btn").classList.remove("muted"),this.querySelector("#chat-input").disabled=!0,this.querySelector("#chat-send-btn").disabled=!0,this.querySelector("#qa-notion")&&(this.querySelector("#qa-notion").disabled=!0),this.querySelector("#qa-calendar")&&(this.querySelector("#qa-calendar").disabled=!0),this.querySelector("#transcript")?.finalizeAll(),this.sessionToken&&setTimeout(()=>{this.dispatchEvent(new CustomEvent("navigate",{bubbles:!0,composed:!0,detail:{view:"summary",token:this.sessionToken}}))},800)}_resetMicBtn(e){e.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>'}_detectTcodeCommand(e){const t=e.match(/\b([A-Z]{2,4}\d{1,3}[A-Z]?)\b/g);if(t){for(const i of t)if(!["THE","AND","FOR","NOT","YOU","ARE","HAS","WAS","MAX"].includes(i)){this._showCmdToast(i);break}}}_showCmdToast(e){document.querySelector(".m-cmd-toast")?.remove(),this._cmdToastTimeout&&clearTimeout(this._cmdToastTimeout);const t=document.createElement("div");t.className="m-cmd-toast",t.innerHTML=`<div><span class="cmd-label">Run</span> <span class="cmd-code">${e}</span></div><button class="cmd-copy" onclick="navigator.clipboard.writeText('${e}');this.textContent='Copied!'">Copy</button>`,document.body.appendChild(t),this._cmdToastTimeout=setTimeout(()=>{t.style.opacity="0",t.style.transition="opacity 0.3s",setTimeout(()=>t.remove(),300)},6e3)}_updateSLA(e){const t=this.querySelector("#sla-badge");t&&(this._currentPriority=e,t.className="m-sla visible",e==="P1"?(t.classList.add("p1"),t.textContent="P1 · 15min SLA"):e==="P2"?(t.classList.add("p2"),t.textContent="P2 · 1hr SLA"):e==="P3"?(t.classList.add("p3"),t.textContent="P3 · 4hr SLA"):t.classList.remove("visible"))}setOliviaState(e){const t=this.querySelector("#olivia-orb");t&&(t.classList.remove("state-idle","state-listening","state-thinking","state-speaking","state-asleep"),t.classList.add(`state-${e}`))}cleanup(){this._timerInterval&&(clearInterval(this._timerInterval),this._timerInterval=null),this._cmdToastTimeout&&(clearTimeout(this._cmdToastTimeout),this._cmdToastTimeout=null),document.querySelector(".m-cmd-toast")?.remove(),this.audioStreamer&&(this.audioStreamer.stop(),this.audioStreamer=null),this.audioPlayer&&(this.audioPlayer.destroy(),this.audioPlayer=null),this.screenCapture&&(this.screenCapture.stop(),this.screenCapture=null,this.isScreenSharing=!1),this.geminiClient&&(this.geminiClient.disconnect(),this.geminiClient=null)}}customElements.define("view-session",N);class q extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.sessionData=null,this.token=null}connectedCallback(){this.token=this.getAttribute("token"),this.renderLoading(),this.token?this.fetchSummary():this.renderError("No session token provided")}async fetchSummary(){try{const e=await fetch(`/api/session/${this.token}/summary`);if(!e.ok)throw new Error(`Session not found (${e.status})`);this.sessionData=await e.json(),this.renderSummary()}catch(e){this.renderError(e.message)}}renderLoading(){this.shadowRoot.innerHTML=`
            ${this.getStyles()}
            <div class="summary-container">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading session summary...</p>
                </div>
            </div>
        `}renderError(e){this.shadowRoot.innerHTML=`
            ${this.getStyles()}
            <div class="summary-container">
                <div class="error-state">
                    <h2>Session Summary Unavailable</h2>
                    <p>${e}</p>
                    <button class="action-btn primary" id="home-btn">New Session</button>
                </div>
            </div>
        `,this.shadowRoot.querySelector("#home-btn")?.addEventListener("click",()=>this.goHome())}renderSummary(){const e=this.sessionData,t=e.duration_seconds?`${Math.floor(e.duration_seconds/60)}m ${e.duration_seconds%60}s`:"N/A",i=e.start_time?new Date(e.start_time).toLocaleTimeString():"N/A",s=e.end_time?new Date(e.end_time).toLocaleTimeString():"In progress";this.shadowRoot.innerHTML=`
            ${this.getStyles()}
            <div class="summary-container">
                <div class="summary-header">
                    <div class="sys-tag">SESSION_END // REPORT_GENERATED</div>
                    <h1>OMNID3SK // DIAGNOSTIC_REPORT</h1>
                    <p class="subtitle">OmniD3sk Autonomous SecOps &amp; IT Agent &mdash; Post-Session Analysis</p>
                </div>

                <!-- Metadata -->
                <div class="meta-grid">
                    <div class="meta-item">
                        <span class="meta-label">Duration</span>
                        <span class="meta-value">${t}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Category</span>
                        <span class="meta-value">${e.module||"N/A"}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Priority</span>
                        <span class="meta-value priority-${(e.priority||"medium").toLowerCase()}">${e.priority||"N/A"}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Language</span>
                        <span class="meta-value">${e.language||"English"}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Started</span>
                        <span class="meta-value">${i}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Ended</span>
                        <span class="meta-value">${s}</span>
                    </div>
                </div>

                <!-- Diagnostic Pipeline -->
                <div class="section">
                    <h2 class="section-title">Diagnostic Pipeline</h2>
                    <diagnostic-tracker id="summary-tracker"></diagnostic-tracker>
                </div>

                <!-- Issues -->
                ${e.issues&&e.issues.length>0?`
                <div class="section">
                    <h2 class="section-title">Issues Detected (${e.issues.length})</h2>
                    <div class="issues-list">
                        ${e.issues.map(r=>`
                            <div class="issue-card">
                                <span class="severity-badge ${(r.severity||"medium").toLowerCase()}">${r.severity||"medium"}</span>
                                <span class="issue-title">${r.title||"Untitled"}</span>
                                ${r.portal_page?`<span class="tcode">Page: ${r.portal_page}</span>`:""}
                            </div>
                        `).join("")}
                    </div>
                </div>`:""}

                <!-- ITSM Tickets -->
                ${e.tickets&&e.tickets.length>0?`
                <div class="section">
                    <h2 class="section-title">ITSM Tickets</h2>
                    ${e.tickets.map(r=>`
                        <div class="ticket-card">
                            <div class="ticket-id">${r.ticket_id}</div>
                            <div class="ticket-title">${r.title}</div>
                            <div class="ticket-meta">
                                <span class="severity-badge ${(r.severity||"medium").toLowerCase()}">${r.severity||"medium"}</span>
                                <span class="ticket-status">${r.status||"New"}</span>
                            </div>
                        </div>
                    `).join("")}
                </div>`:""}

                <!-- Agent Guidance -->
                ${e.agent_guidance&&e.agent_guidance.length>0?`
                <div class="section">
                    <h2 class="section-title">Specialist Guidance</h2>
                    <div class="guidance-list">
                        ${e.agent_guidance.map(r=>`
                            <div class="guidance-item">
                                <strong>${r.title||""}</strong>
                                <p>${r.detail||r}</p>
                            </div>
                        `).join("")}
                    </div>
                </div>`:""}

                <!-- Inline Feedback -->
                <div class="feedback-bento">
                    <div class="feedback-left">
                        <div class="feedback-title">Rate Agent Resolution</div>
                        <div class="feedback-stars" id="summary-stars">
                            <button class="m-csat-star" data-val="1">★</button>
                            <button class="m-csat-star" data-val="2">★</button>
                            <button class="m-csat-star" data-val="3">★</button>
                            <button class="m-csat-star" data-val="4">★</button>
                            <button class="m-csat-star" data-val="5">★</button>
                        </div>
                    </div>
                    <div class="feedback-right">
                        <input type="text" id="summary-feedback-input" placeholder="Add post-mortem notes..." class="feedback-input">
                        <button id="summary-submit-feedback" class="action-btn primary small">Submit</button>
                    </div>
                </div>

                <!-- Actions -->
                <div class="actions">
                    <button class="action-btn primary" id="download-rca">Download Diagnostic Report</button>
                    <button class="action-btn secondary" id="download-transcript">Download Transcript</button>
                    <button class="action-btn outline" id="new-session">New Session</button>
                </div>
            </div>
        `;const a=this.shadowRoot.querySelector("#summary-tracker");a&&e.checkpoints&&setTimeout(()=>{a.updateFromState({stage:e.stage,checkpoints:e.checkpoints})},100),this.shadowRoot.querySelector("#download-rca").addEventListener("click",()=>this.downloadFile("rca")),this.shadowRoot.querySelector("#download-transcript").addEventListener("click",()=>this.downloadFile("transcript")),this.shadowRoot.querySelector("#new-session").addEventListener("click",()=>this.goHome());const o=this.shadowRoot.querySelectorAll(".m-csat-star");let n=0;o.forEach(r=>{r.addEventListener("click",()=>{this.shadowRoot.querySelector("#summary-submit-feedback").disabled||(n=parseInt(r.dataset.val),o.forEach(c=>c.classList.toggle("active",parseInt(c.dataset.val)<=n)))})}),this.shadowRoot.querySelector("#summary-submit-feedback").addEventListener("click",()=>{if(n===0)return;const r=this.shadowRoot.querySelector("#summary-feedback-input").value;console.log("CSAT Submitted:",{rating:n,notes:r});const c=this.shadowRoot.querySelector("#summary-submit-feedback");c.textContent="Submitted!",c.disabled=!0,this.shadowRoot.querySelector("#summary-feedback-input").disabled=!0,o.forEach(d=>d.style.cursor="default")})}async downloadFile(e){const t=this.shadowRoot.querySelector(`#download-${e}`),i=t.textContent;t.textContent="Downloading...",t.disabled=!0;try{const s=await fetch(`/api/session/${this.token}/${e}`);if(!s.ok)throw new Error("Download failed");const a=await s.blob(),o=URL.createObjectURL(a),n=document.createElement("a");n.href=o,n.download=`resolve-${e}-${this.token.slice(0,8)}.txt`,n.click(),URL.revokeObjectURL(o),t.textContent="Downloaded!",setTimeout(()=>{t.textContent=i,t.disabled=!1},2e3)}catch{t.textContent="Failed - Retry",t.disabled=!1}}goHome(){this.dispatchEvent(new CustomEvent("navigate",{bubbles:!0,composed:!0,detail:{view:"home"}}))}getStyles(){return`<style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

            :host {
                display: block;
                font-family: 'Inter', system-ui, sans-serif;
                color: var(--color-text-main, #e8eaf0);
                min-height: 100vh;
                background: #050508;
                padding: 48px 24px 100px;
            }

            .summary-container {
                max-width: 860px;
                margin: 0 auto;
            }

            /* ── Header ── */
            .summary-header {
                text-align: center;
                margin-bottom: 40px;
                padding-top: 16px;
            }

            .sys-tag {
                font-size: 0.65rem;
                font-weight: 700;
                letter-spacing: 0.18em;
                text-transform: uppercase;
                color: #0070f3;
                margin-bottom: 14px;
                opacity: 0.8;
            }

            .summary-header h1 {
                font-size: 1.75rem;
                font-weight: 800;
                letter-spacing: 0.04em;
                margin: 0 0 10px;
                color: #ffffff;
                font-family: 'Inter', monospace;
            }

            .subtitle {
                font-size: 0.82rem;
                color: #555;
                margin: 0;
                letter-spacing: 0.02em;
            }

            /* ── Bento Card Base ── */
            .bento-card {
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
            }

            /* ── Meta Grid ── */
            .meta-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin-bottom: 32px;
            }

            .meta-item {
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                padding: 14px 16px;
                text-align: center;
                transition: border-color 0.2s;
            }
            .meta-item:hover { border-color: rgba(0,112,243,0.4); }

            .meta-label {
                display: block;
                font-size: 0.62rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: #555;
                margin-bottom: 6px;
            }

            .meta-value {
                display: block;
                font-size: 1rem;
                font-weight: 700;
                color: #e8eaf0;
            }

            .priority-critical { color: #ff4444; }
            .priority-high { color: #ff9500; }
            .priority-medium { color: #0070f3; }
            .priority-low { color: #30d158; }

            /* ── Sections ── */
            .section {
                margin-bottom: 20px;
            }

            .section-title {
                font-size: 0.68rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.14em;
                color: #666;
                margin: 0 0 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(255,255,255,0.06);
            }

            /* ── Issues ── */
            .issues-list {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .issue-card {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 11px 14px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 10px;
                transition: border-color 0.2s;
            }
            .issue-card:hover { border-color: rgba(0,112,243,0.35); }

            /* ── Severity Badges ── */
            .severity-badge {
                font-size: 0.58rem;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                padding: 3px 8px;
                border-radius: 4px;
                flex-shrink: 0;
            }

            .severity-badge.critical { background: rgba(255,40,40,0.15); color: #ff4444; border: 1px solid rgba(255,40,40,0.3); }
            .severity-badge.high     { background: rgba(255,149,0,0.12); color: #ff9500; border: 1px solid rgba(255,149,0,0.25); }
            .severity-badge.medium   { background: rgba(0,112,243,0.12); color: #0070f3; border: 1px solid rgba(0,112,243,0.25); }
            .severity-badge.low      { background: rgba(48,209,88,0.12); color: #30d158; border: 1px solid rgba(48,209,88,0.25); }

            .issue-title {
                font-weight: 600;
                font-size: 0.88rem;
                flex: 1;
                color: #d0d4e0;
            }

            .tcode {
                font-family: 'SF Mono', 'Fira Code', monospace;
                font-size: 0.72rem;
                color: #0070f3;
                flex-shrink: 0;
                background: rgba(0,112,243,0.08);
                padding: 2px 6px;
                border-radius: 4px;
            }

            /* ── ITSM Tickets ── */
            .ticket-card {
                padding: 16px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                margin-bottom: 8px;
                transition: border-color 0.2s;
            }
            .ticket-card:hover { border-color: rgba(0,112,243,0.35); }

            .ticket-id {
                font-family: 'SF Mono', 'Fira Code', monospace;
                font-size: 0.75rem;
                color: #0070f3;
                margin-bottom: 5px;
                letter-spacing: 0.04em;
            }

            .ticket-title {
                font-weight: 700;
                font-size: 0.95rem;
                margin-bottom: 10px;
                color: #e8eaf0;
            }

            .ticket-meta {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .ticket-status {
                font-size: 0.75rem;
                color: #555;
                letter-spacing: 0.04em;
                text-transform: uppercase;
            }

            /* ── Guidance ── */
            .guidance-list {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .guidance-item {
                padding: 14px 16px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 10px;
                font-size: 0.85rem;
                line-height: 1.6;
                transition: border-color 0.2s;
            }
            .guidance-item:hover { border-color: rgba(0,112,243,0.3); }

            .guidance-item strong {
                display: block;
                margin-bottom: 5px;
                color: #0070f3;
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 0.06em;
            }

            .guidance-item p {
                margin: 0;
                color: #999;
            }

            /* ── Feedback Bento ── */
            .feedback-bento {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 20px 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 40px;
                margin-bottom: 20px;
            }

            .feedback-left {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .feedback-title {
                font-size: 0.85rem;
                font-weight: 700;
                color: #e8eaf0;
            }

            .feedback-stars {
                display: flex;
                gap: 4px;
            }

            .m-csat-star {
                background: transparent;
                border: none;
                color: rgba(255,255,255,0.15);
                font-size: 1.3rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
                transition: color 0.2s, transform 0.2s;
            }

            .m-csat-star:hover, .m-csat-star.active {
                color: #0070f3;
                transform: scale(1.1);
            }

            .feedback-right {
                display: flex;
                gap: 12px;
                align-items: center;
            }

            .feedback-input {
                background: rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                padding: 10px 16px;
                color: #e8eaf0;
                font-family: inherit;
                font-size: 0.82rem;
                width: 250px;
                transition: border-color 0.2s;
            }

            .feedback-input:focus {
                outline: none;
                border-color: #0070f3;
            }

            .feedback-input::placeholder {
                color: rgba(255,255,255,0.3);
            }

            .action-btn.small {
                padding: 9px 20px;
                font-size: 0.8rem;
                border-radius: 6px;
            }

            /* ── Actions ── */
            .actions {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-top: 48px;
                flex-wrap: wrap;
            }

            .action-btn {
                padding: 11px 26px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
                border: 1px solid transparent;
                font-family: inherit;
                letter-spacing: 0.02em;
            }

            .action-btn.primary {
                background: #0070f3;
                color: #fff;
                border-color: #0070f3;
                box-shadow: 0 0 20px rgba(0,112,243,0.3);
            }
            .action-btn.primary:hover {
                background: #0060d8;
                box-shadow: 0 0 30px rgba(0,112,243,0.5);
                transform: translateY(-1px);
            }

            .action-btn.secondary {
                background: rgba(0,112,243,0.08);
                color: #0070f3;
                border-color: rgba(0,112,243,0.4);
            }
            .action-btn.secondary:hover { background: rgba(0,112,243,0.15); }

            .action-btn.outline {
                background: transparent;
                color: #666;
                border-color: rgba(255,255,255,0.12);
            }
            .action-btn.outline:hover { border-color: rgba(255,255,255,0.3); color: #aaa; }

            .action-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }

            /* ── Loading / Error ── */
            .loading, .error-state {
                text-align: center;
                padding: 80px 20px;
            }

            .spinner {
                width: 36px;
                height: 36px;
                border: 2px solid rgba(255,255,255,0.08);
                border-top-color: #0070f3;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                margin: 0 auto 16px;
            }

            @keyframes spin { to { transform: rotate(360deg); } }

            .error-state h2 { margin-bottom: 8px; color: #ff4444; }
            .error-state p { color: #555; margin-bottom: 24px; }

            @media (max-width: 600px) {
                .meta-grid { grid-template-columns: repeat(2, 1fr); }
                .actions { flex-direction: column; align-items: stretch; }
                .summary-header h1 { font-size: 1.3rem; }
                .feedback-bento { flex-direction: column; align-items: stretch; gap: 16px; }
                .feedback-input { width: 100%; }
                .feedback-right { flex-direction: column; }
                .feedback-right button { width: 100%; }
            }
        </style>`}}customElements.define("view-summary",q);class P extends HTMLElement{constructor(){super(),this.state={view:"home"}}connectedCallback(){this.innerHTML="",document.body.classList.remove("light-mode"),localStorage.setItem("theme","dark"),this.viewContainer=document.createElement("div"),this.viewContainer.style.height="100%",this.viewContainer.style.width="100%",this.appendChild(this.viewContainer),this.render(),this.addEventListener("navigate",e=>{this.state.view=e.detail.view,this.state.language=e.detail.language||"English",this.state.token=e.detail.token||null,this.render()})}render(){if(!this.viewContainer)return;this.viewContainer.innerHTML="";let e;switch(this.state.view){case"home":e=document.createElement("view-home");break;case"session":e=document.createElement("view-session"),e.setAttribute("language",this.state.language||"English");break;case"summary":e=document.createElement("view-summary"),this.state.token&&e.setAttribute("token",this.state.token);break;default:e=document.createElement("view-home")}e.classList.add("fade-in"),this.viewContainer.appendChild(e)}}customElements.define("app-root",P);const $=document.getElementById("app");$.innerHTML="<app-root></app-root>";

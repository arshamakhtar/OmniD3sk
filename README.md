# ⚡ OmniD3sk
**SecOps at the Speed of Thought.**

<img width="1856" height="886" alt="image" src="https://github.com/user-attachments/assets/1ae4ddde-1a04-4cea-9b24-b6bf267d1f54" />


OmniD3sk is an autonomous, voice-first command center for SecOps and IT teams. Instead of typing into a chatbot or manually navigating dense dashboards, OmniD3sk allows engineers to orchestrate complex infrastructure workflows, resolve incidents, and heal systems using real-time voice intelligence.

Meet **Olivia**, your Voice-First AI Agent. 

---

## 🧠 The Architecture (Voice-First by Design)

Unlike standard text-wrapper LLMs, OmniD3sk is built on a streaming audio architecture powered by **Gemini Live**. 

We built a system that combines a Level 1 IT Support Worker and a Level 1 Cybersecurity Analyst into a single, seamless voice interface. The moment an anomaly is detected, you simply talk to the dashboard. 

* **Real-Time Voice Streaming:** Minimal latency audio processing using WebSockets.
* **The "Bento Box" Command Center:** A custom-built, vanilla JS/CSS dark-mode interface featuring dynamic frosted-glass telemetry panes.
* **Reactive UI State Engine:** Olivia's visual core physically reacts to network latency, switching between `idle`, `listening`, `thinking`, and `speaking` states dynamically.

---

## 🛠️ Core Capabilities & Playbooks

While Olivia handles the voice interrogation, our asynchronous backend fires off multiple tools simultaneously:

- [x] **Autonomous Helpdesk:** Diagnoses user IT issues via voice and categorizes SLA tickets on the fly.
- [x] **Zero-Touch ITSM Integration:** Automatically generates and logs structured Critical Incident tickets (e.g., `INC756EE1C1`) into enterprise dashboards.
- [x] **Threat Intelligence & Reporting:** Compiles post-mortem diagnostic reports and pushes Threat Reports directly to **Notion**.
- [x] **Emergency Orchestration:** Books rapid-response team meetings instantly via **Google Calendar**.

---

## 🚀 Quick Start (Local Deployment)

Want to boot up the command center? Here is how to get Olivia online.

### 1. Clone & Install
```bash
git clone https://github.com/oyelurker/OmniD3sk.git
cd omnid3sk
pip install -r requirements.txt
```

### 2. Environment Variables
Create a `.env` file in the root directory and add your API keys:

```env
PROJECT_ID=your_gcp_project_id
LOCATION=us-central1
GEMINI_API_KEY=your_key_here
NOTION_API_KEY=your_key_here
```

### 3. Initialize the Core
Start the backend WebSocket server and the frontend client:

**Backend:**
```bash
python -m uvicorn server.main:app --port 8080
```

**Frontend:**
```bash
cd web
npm run dev
```

Navigate to `http://localhost:3000/omnid3sk/` in your browser. Click the mic, and say "Hello, Olivia."

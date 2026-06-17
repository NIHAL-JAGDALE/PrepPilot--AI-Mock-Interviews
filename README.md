<div align="center">

<img src="frontend/public/light_theme_logo.png" alt="PrepPilot Logo" height="80"/>

# PrepPilot AI — Mock Interview Platform

**The AI-powered mock interview simulator built for Indian engineering students targeting campus placements.**

[![Node.js](https://img.shields.io/badge/Node.js-≥20.0-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](https://prep-pilot-ai-mock-interviews.vercel.app/) · [Features](#-features) · [Setup](#-getting-started) · [Architecture](#-architecture)

</div>

---
### 🚀 Live Demo
https://prep-pilot-ai-mock-interviews.vercel.app/

---

## 📌 Overview

PrepPilot is a full-stack AI mock interview platform that simulates real placement interview rounds. It uses a multi-AI provider system (Claude → OpenAI → Groq) with automatic failover to ensure your interview **never stops** — even if one AI provider hits a rate limit.

Each session has **3 structured rounds**, real **LeetCode DSA problems** with a live code compiler, **voice input** via Whisper STT, and ends with a **detailed performance report** including a hiring recommendation and personalized 30-day study plan.

---

## ✨ Features

### 🎯 Interview Rounds
- **Round 1 — DSA + Intro:** Real LeetCode problems (Easy/Medium/Hard based on company target), solved live in a Monaco editor with JDoodle code execution
- **Round 2 — Technical:** CS Fundamentals, System Design, project deep-dives from your resume
- **Round 3 — HR & Behavioral:** Soft skills, culture fit, situational questions

### 🤖 Smart AI Engine
- **Multi-AI Failover:** Claude Sonnet (primary) → OpenAI GPT-4o → Groq llama-3.3. Switches silently with full context preserved in PostgreSQL
- **Context summarization:** Auto-compresses conversation history after turn 5 to save tokens while keeping context quality high
- **Prompt caching:** Reduces API costs by up to 70%
- **Resume-aware:** AI personalizes all technical and HR questions based on your uploaded resume

### 🏢 Company & Role Targeting
| Company Mode | DSA Difficulty | Focus Areas |
|---|---|---|
| **FAANG** | Hard | Deep DSA, System Design, Big-O |
| **Startup** | Medium | Full-stack ownership, practical coding |
| **MNC** | Easy | OS, DBMS, CN, SQL, SDLC |

| Role | Focus |
|---|---|
| Frontend | React, DOM, JS, CSS, Browser APIs |
| Backend | APIs, Databases, Node.js, Microservices |
| Full-Stack | End-to-end architecture |
| DSA Heavy | Algorithmic problem solving |

### 💻 Live DSA Compiler
- Real LeetCode problems via GraphQL API
- Monaco editor (same as VS Code)
- JDoodle code execution — supports **Python, JavaScript, C++, Java**
- Auto-injects LeetCode boilerplate (ListNode, TreeNode, imports)

### 🎤 Voice Features
- **TTS (Text-to-Speech):** AI questions read aloud using browser Web Speech API
- **STT (Speech-to-Text):** Record your answers via microphone — transcribed by Groq Whisper (cross-browser, works in Firefox/Safari/Brave)

### 📊 Performance Reports
After completing 10 questions:
- Overall score (0–100) with percentile ranking
- Round-by-round breakdown
- Top strengths + areas to improve
- Hiring recommendation: **Strong Hire / Hire / Borderline / No Hire**
- Personalized **30-day study plan**
- DSA code submission history

### 🔒 Other
- JWT-based authentication (register/login)
- Resume upload: parses **PDF, DOCX, TXT** files
- Interview control commands: `skip`, `hint`, `next round`, `end interview`
- Full session history on dashboard
- Graceful server shutdown, health check endpoint

---

## 🏗 Architecture

```
PrepPilot - AI Mock Interviews/
├── backend/                    # Express.js REST API
│   ├── server.js               # Entry point, middleware, routes
│   ├── db/
│   │   ├── schema.sql          # PostgreSQL schema (6 tables)
│   │   ├── index.js            # DB pool
│   │   └── setup.js            # DB initializer
│   ├── middleware/
│   │   └── auth.js             # JWT auth middleware
│   ├── routes/
│   │   ├── auth.js             # Register / Login
│   │   ├── sessions.js         # Interview session lifecycle + AI routing
│   │   ├── compiler.js         # JDoodle code execution
│   │   ├── problems.js         # LeetCode problem fetcher
│   │   ├── reports.js          # Session report retrieval
│   │   └── transcribe.js       # Groq Whisper STT
│   ├── services/
│   │   ├── aiRouter.js         # Multi-AI orchestrator (Claude→OpenAI→Groq)
│   │   ├── claude.js           # Anthropic Claude SDK wrapper
│   │   ├── openai.js           # OpenAI SDK wrapper
│   │   ├── groq.js             # Groq SDK wrapper
│   │   ├── leetcode.js         # LeetCode GraphQL client
│   │   ├── jdoodle.js          # JDoodle code executor
│   │   ├── summarizer.js       # Context compression
│   │   ├── messageFormatter.js # Provider-specific message formatting
│   │   ├── cachingService.js   # Token cache tracking
│   │   └── reportParser.js     # AI report extraction + DB save
│   └── prompts/
│       └── systemPrompt.js     # Dynamic system prompt generator
│
└── frontend/                   # Vite + React 19 SPA
    ├── src/
    │   ├── pages/
    │   │   ├── Landing.jsx     # Marketing page with animations
    │   │   ├── Login.jsx       # Login / Register
    │   │   ├── Register.jsx    # Registration
    │   │   ├── Dashboard.jsx   # Session history + scores
    │   │   ├── InterviewSetup.jsx  # Configure company/role/resume
    │   │   ├── Interview.jsx   # Live interview UI (chat + DSA panel)
    │   │   └── Report.jsx      # Detailed performance report
    │   ├── components/
    │   │   ├── ChatBubble.jsx  # AI/user message renderer
    │   │   ├── DSAPanel.jsx    # Monaco editor + problem description
    │   │   ├── EvalCard.jsx    # Per-question score card
    │   │   ├── ProviderBadge.jsx   # Active AI indicator
    │   │   ├── TokenStats.jsx  # Token/cache stats display
    │   │   └── ProtectedRoute.jsx  # Auth guard
    │   ├── hooks/
    │   │   └── useSpeech.js    # TTS + STT hooks (Web Speech + Whisper)
    │   └── api/
    │       └── client.js       # Axios API client
    └── public/                 # Static assets & logos
```

### Data Flow
```
User → Frontend (React/Vite)
         ↓ Axios
      Backend (Express)
         ↓
      AI Router → Claude / OpenAI / Groq (with failover)
         ↓
      PostgreSQL (sessions, messages, dsa_problems, evaluations, reports)
         ↓
      LeetCode GraphQL  ←→  JDoodle Code Executor
```

### AI Provider Failover
```
Claude Sonnet (Primary)
    → 429 / 503 / error?
OpenAI GPT-4o (Fallback 1)
    → 429 / 503 / error?
Groq llama-3.3 (Fallback 2)
    → All fail? → 503 to user
```
All messages stored in **neutral format** in PostgreSQL. On provider switch, `messageFormatter.js` translates history to the new provider's format — zero context loss.

---

## 🗄 Database Schema

| Table | Purpose |
|---|---|
| `users` | Auth — UUID, email, bcrypt password |
| `sessions` | Interview sessions — company, role, AI provider, round tracking |
| `messages` | All chat messages in neutral format (role: user/assistant/summary) |
| `dsa_problems` | LeetCode problems assigned per turn + user code + JDoodle result |
| `evaluations` | Per-question scores, feedback, model answers, weak areas |
| `reports` | Final interview report — scores, strengths, study plan, hiring recommendation |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 20
- PostgreSQL (local or hosted, e.g. Railway/Neon)
- API Keys: Anthropic, OpenAI, Groq, JDoodle

### 1. Clone the repository
```bash
git clone https://github.com/your-username/preppilot.git
cd preppilot
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see below)
npm run db:setup    # Creates all tables in PostgreSQL
npm run dev         # Starts backend on http://localhost:3001
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:3001
npm run dev         # Starts frontend on http://localhost:5173
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
# ─── DATABASE ───────────────────────────────────────────────
DATABASE_URL=postgresql://user:pass@localhost:5432/preppilot

# ─── AUTH ───────────────────────────────────────────────────
JWT_SECRET=your-random-secret-here

# ─── AI PROVIDERS ──────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...        # Claude (primary)
OPENAI_API_KEY=sk-...               # GPT-4o (fallback 1)
GROQ_API_KEY=gsk_...                # Groq Whisper STT + llama-3.3 (fallback 2)

# ─── JDOODLE COMPILER ──────────────────────────────────────
JDOODLE_CLIENT_ID=your_client_id
JDOODLE_CLIENT_SECRET=your_client_secret

# ─── SERVER ────────────────────────────────────────────────
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173   # (production only)
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3001
```

> **Note:** At minimum, you need **one** AI API key configured. The system will use whichever providers are available. Groq is free and recommended as a starting point.

---

## 🌐 Deployment

| Service | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Railway](https://railway.app) / [Render](https://render.com) |
| Database | [Railway PostgreSQL](https://railway.app) / [Neon](https://neon.tech) |

**Frontend (`vercel.json`):** Set `VITE_API_URL` to your backend URL.

**Backend (Railway):** Set all `.env` values as environment variables. Run `npm run db:setup` once to initialize the schema.

---

## 🧰 Tech Stack

### Backend
| Tech | Purpose |
|---|---|
| Express.js | REST API server |
| PostgreSQL + `pg` | Primary database |
| `@anthropic-ai/sdk` | Claude AI |
| `openai` | OpenAI GPT-4o |
| `groq-sdk` | Groq llama-3.3 + Whisper STT |
| `jsonwebtoken` + `bcrypt` | Auth |
| `multer` + `pdf-parse` + `mammoth` | Resume parsing |
| `axios` | LeetCode GraphQL + JDoodle API |

### Frontend
| Tech | Purpose |
|---|---|
| React 19 + Vite | SPA framework |
| React Router v7 | Client-side routing |
| TailwindCSS v4 | Utility CSS |
| `@monaco-editor/react` | DSA code editor |
| `recharts` | Score visualizations |
| Web Speech API | TTS (questions read aloud) |
| MediaRecorder + Groq Whisper | Cross-browser STT |

---

## 📱 Pages & Routes

| Route | Page | Auth |
|---|---|---|
| `/` | Landing page | Public |
| `/register` | Registration | Public |
| `/login` | Login | Public |
| `/dashboard` | Session history | ✅ Protected |
| `/interview/new` | Interview setup | ✅ Protected |
| `/interview/:id` | Live interview | ✅ Protected |
| `/report/:sessionId` | Performance report | ✅ Protected |

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `POST` | `/api/sessions/start` | Start new interview session |
| `GET` | `/api/sessions` | List all sessions for user |
| `GET` | `/api/sessions/:id` | Get session + messages + DSA problems |
| `POST` | `/api/sessions/:id/message` | Send message, get AI response |
| `POST` | `/api/sessions/:id/end` | End session |
| `POST` | `/api/sessions/extract-resume` | Parse PDF/DOCX/TXT resume |
| `POST` | `/api/compiler/run` | Execute code via JDoodle |
| `GET` | `/api/problems/:slug` | Fetch LeetCode problem |
| `GET` | `/api/reports/:sessionId` | Get final report |
| `POST` | `/api/transcribe` | Transcribe audio via Whisper |
| `GET` | `/api/health` | Server + DB health check |

---

## 🎮 Interview Control Commands

During an active interview, type these commands at any time:

| Command | Action |
|---|---|
| `skip` | Skip current DSA question (scores 0) |
| `hint` | Request a hint (deducts 1 point) |
| `next round` | Advance to next round (if min questions met) |
| `end interview` | End interview and generate report immediately |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built with ❤️ for India's engineering students</strong><br/>
  <sub>PrepPilot AI © 2026. All rights reserved.</sub>
</div>

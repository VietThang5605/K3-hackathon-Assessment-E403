# Comprehensive Summary of the Repository: Mini Hackathon AI — Batch 03

## 📌 Repository Overview

This repository is designed for the **Mini Hackathon AI — Batch 03** (Track: *"AI cho khoá AI Thực Chiến"*). The project emphasizes **AI Product Thinking (SPEC → Prototype → Demo)** rather than pure code complexity. Teams choose one track, identify evidenced user pain points, design an AI specification, build a working prototype with real AI calls, and evaluate performance using a golden dataset.

- **Duration:** 1.5 Days (Day 1: Discovery, Spec, Prototype, Initial Eval · Day 2: Validation, Dry Run, Demo).
- **Core Philosophy:** Focus on decisions, evidence, boundary conditions, and evaluation quality.

---

## 📁 Repository Structure & Organization

```
Batch03-K3-AI-Product-Hackathon-B6-2-E403/
├── 01-de-bai.md             # Detailed problem statement, 3 tracks, 5 acceptance criteria, 4 difficulty layers
├── 02-guide.md              # 5-phase step-by-step guide (Discovery → Spec → Build → Measure/Validate → Demo)
├── 03-template-ai-spec.md   # Template for AI Specification (spec.md due at 23:59 Day 1)
├── 04-rubric.md             # 100-point grading rubric & verification criteria for 6 checkpoints
├── README.md                # General hackathon guidelines, schedule, submission tree & security policies
├── docker-compose.yml       # Docker container orchestration for frontend & backend
├── .env                     # Environment variables for API keys and configuration
├── backend/                 # Node.js/Express API server & AI evaluation engine
│   ├── Dockerfile           # Docker container setup for backend
│   ├── package.json         # Node.js dependencies (Express, @google/generative-ai, openai, cors, dotenv)
│   ├── src/
│   │   ├── server.js        # Express server routes (/api/health, /api/generate-quiz, /api/eval/run)
│   │   ├── data/
│   │   │   └── mockData.js  # Fallback quiz pool and sample assessment items
│   │   └── services/
│   │       └── aiProvider.js# LLM Integration (Gemini 1.5/2.0 & OpenAI GPT-4o-mini with structured JSON parsing)
│   └── eval/
│       ├── golden_set.json  # 20 benchmark test cases covering 5 evaluation layers
│       ├── run_eval.js      # CLI test runner for automated golden set evaluation
│       └── results_run_1.json# Output metrics from evaluation runs
├── frontend/                # Next.js Web Application
│   ├── Dockerfile           # Docker container setup for frontend
│   ├── package.json         # React 18, Next.js 14, Tailwind CSS, Lucide icons
│   ├── app/
│   │   ├── page.jsx         # Full interactive UI dashboard (Assessment Agent, Quiz Generator, Golden Set Eval Visualizer)
│   │   ├── layout.jsx       # Next.js root layout wrapper
│   │   └── globals.css      # Styling rules and CSS variables
│   └── public/              # Static media assets
├── data/                    # Anonymous course data pack (Confidential)
│   └── vlearn-pack/
│       ├── chatlog/         # Anonymous student-tutor chat logs
│       ├── slides/          # Course slide decks (PDF/Hackathon format)
│       ├── transcript/      # Cleaned lecture transcripts with indexed line markers
│       └── README.md        # Data usage rules and citation guide
└── tham-khao/               # Reference methodology & literature
    ├── Strategyn_JTBD_Playbook.pdf  # Jobs-To-Be-Done methodology guide
    └── worksheet-jtbd-day-du.md      # Full JTBD planning worksheet
```

---

## 🎯 3 Tracks & Key Guidelines (`01-de-bai.md`)

Teams pick **1 of 3 tracks**:
1. **Track A — VLearn Adaptive Platform:** Optimize existing AI tutor (mining chatlogs for failures) or build new AI features (post-lecture comprehension check, online learning experience, instructor gap maps).
2. **Track B — Discord Student Assistant:** Build/optimize a Discord assistant for student questions (intent detection, logistics routing, TA handoff, stuck student alerts).
3. **Track C — Open Track:** Mine data and propose a novel AI product feature for the course adhering to the 5 acceptance criteria.

### 5 Acceptance Criteria for Problems
1. **Specific Pain Point:** Clear user, workflow, bottleneck, and consequences.
2. **Evidenced:** Survey of $\ge 20$ people ($\ge 50\%$ confirmation) OR quantitative data mining ($\ge 5$ verbatim quotes).
3. **Problem Statement & Impact:** No "AI" buzzwords in problem statement; impact table comparing $\ge 3$ candidate features.
4. **One-Sentence Slice:** `[One User] · [One Job] · [One AI Decision] · [One Result]`.
5. **Willing Users:** At least 3 target users willing to test before demo.

---

## ⚙️ Technical Architecture & Stack

### Backend (`backend/`)
- **Runtime:** Node.js + Express.js
- **LLM Integrations (`src/services/aiProvider.js`):**
  - Google Gemini API (`@google/generative-ai`) — model `gemini-1.5-flash` or `gemini-2.0-flash-lite`.
  - OpenAI API (`openai`) — model `gpt-4o-mini`.
  - Smart Fallback System to local `mockData.js` if API keys are absent or requests fail.
- **REST Endpoints (`src/server.js`):**
  - `GET /api/health` — System status check.
  - `POST /api/generate-quiz` — Triggers LLM structured quiz generation based on slide topics.
  - `POST /api/eval/run` — Executes automated golden set benchmark evaluations.

### Frontend (`frontend/`)
- **Framework:** Next.js 14 (App Router) + React + Tailwind CSS.
- **UI Components (`app/page.jsx`):**
  - Interactive VLearn Quiz & Assessment Interface.
  - Concept confidence visualization & source attribution badges.
  - Built-in Benchmark & Evaluation Dashboard for viewing Golden Set results.

### Evaluation Suite (`backend/eval/`)
- **Golden Set Benchmark (`golden_set.json`):** 20 test cases categorized into 5 critical taxonomy layers:
  1. `HAPPY_PATH`: Standard comprehension check creation.
  2. `LOW_CONFIDENCE`: Ambiguous/vague user inputs requiring low-confidence warning flags.
  3. `NO_GROUND_TRUTH`: Requests referencing missing/unsupported slide content.
  4. `OUT_OF_SCOPE`: Non-pedagogical or off-topic requests.
  5. `DOMAIN_SPECIFIC`: Nuanced AI engineering domain questions (RAG, Chunking, Embeddings).
- **Execution Script (`run_eval.js`):** Runs test cases and outputs metrics (`passRate`, `passCount`, `failCount`) saved to `results_run_1.json`.

---

## 🚀 How to Run the Project

### Option A: Via Docker Compose (Recommended)
```bash
docker-compose up --build
```
- Frontend will run on: `http://localhost:3000`
- Backend will run on: `http://localhost:8000`

### Option B: Local Node.js Execution
1. **Backend:**
   ```bash
   cd backend
   npm install
   npm start        # Runs Express server on port 8000
   npm run eval     # Runs Golden Set evaluation benchmark script
   ```
2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev      # Runs Next.js development server on port 3000
   ```

---

## 📊 Evaluation & Grading Rubric (`04-rubric.md`)

Total Score: **100 Points**
- **25 Points — Milestone Checkpoints (CP1 - CP5):** 5 points each for timely verification.
- **75 Points — Artifact Grading:**
  - **R1 (15 pts):** Evidence & Impact (`spec.md` §1-§2 + survey/mining logs).
  - **R2 (15 pts):** Feature Slice & Design (`spec.md` §4).
  - **R3 (11 pts):** Boundary Conditions & Risk Scenarios (`spec.md` §5-§6).
  - **R4 (15 pts):** Testing & Golden Set (`spec.md` §7 + `eval/`).
  - **R5 (8 pts):** Working Prototype (`codebase/` + live demo).
  - **R6 (8 pts):** User Validation (`validation/`).
  - **R7 (3 pts):** Repository Quality & Structure.

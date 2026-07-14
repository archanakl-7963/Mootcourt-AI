# 🏛️ Moot Court AI: Professional Advocate Suite

An AI-powered moot court simulator and legal drafting assistant designed for law students and schools. Moot Court AI acts as an interactive bench panel, allowing students to present oral arguments, respond to legal pushback, study case briefs, and receive professional performance scorecards evaluated by AI Judges.

---

## 🌟 Key Features

*   **⚖️ Interactive Bench Simulation**: Practice mock trials against distinct judge personalities (e.g., Strict High Court Judge, Sympathetic Judge, Procedural Judge).
*   **🎙️ Hands-Free Oral Dictation**: Present arguments verbally using browser-based Speech-to-Text (`webkitSpeechRecognition`) transcription.
*   **🌐 Bilingual (English / हिन्दी) Support**: One-click toggle changes chat, trial pushback, and performance reports between English and Hindi.
*   **📚 Case Facts Indexing (RAG)**: Upload case PDFs, paste text, or select Landmark Indian Cases (e.g., *Kesavananda Bharati*, *Maneka Gandhi*). Documents are indexed using local FAISS vector search.
*   **👩‍🏫 Professor Portal**: Allows faculty to upload custom litigation briefs, view student performance scorecards, and review active class grade ledgers.
*   **⚙️ Admin Console**: A secure administrator interface (auto-bootstrapped on registering the `"admin"` user) to monitor users, view registration dates, and activate/deactivate accounts.
*   **🔁 Session Resumption & Persistence**: Automatically saves and loads your past mock trials from a persistent SQLite database. Click "Resume Arena" to pick up exactly where you left off.

---

## 🏗️ System Architecture

The suite is built as a Single Page Application (React) communicating with a FastAPI (Python) server, with FAISS for semantic context retrieval, and SQLite for database persistence.

```
                  +-----------------------------------+
                  |         React SPA Client          |
                  |     (Vite + Tailwind/Vanilla CSS) |
                  +-----------------+-----------------+
                                    |
                             HTTP   |  (API Calls, Auth, Voice JSON)
                                    v
                  +-----------------+-----------------+
                  |         FastAPI Backend           |
                  |         (Runs on Port 7860)       |
                  +-----------------+-----------------+
                                    |
         +--------------------------+--------------------------+
         | (RAG Context)            | (CRUD Operations)        | (LLM Inference)
         v                          v                          v
 +-------+-------+          +-------+-------+          +-------+-------+
 |  FAISS Index  |          |  SQLite DB    |          | LLM Provider  |
 | (Local RAM)   |          | (mootcourt.db)|          | (Gemini/Local)|
 +---------------+          +---------------+          +---------------+
```

---

## ⚙️ Settings & Configuration

1. **Virtual Environment**: Ensure your dependencies are installed in your Python virtual environment (e.g., `.venv`):
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r backend1/requirements.txt
   ```

2. **Environment Variables**: Copy `.env.example` to `.env` in the backend root directory (`backend1/.env`) and add your Google Gemini API key:
   ```bash
   # In backend1/
   cp .env.example .env
   ```

3. **Persistent Storage (Hugging Face)**:
   The app automatically detects if Hugging Face Persistent Storage is enabled and mounts the SQLite file under `/data/mootcourt.db`. Enable **"Persistent Storage"** in your Space Settings to persist user accounts and sessions forever.

---

## 🚀 Running the Project

### 👨‍💻 Development Mode (Dual Server)
Run both servers with hot-reloading active:

1. **Start the FastAPI backend (Port 8000)**:
   ```bash
   cd backend1
   uvicorn app.main:app --reload --port 8000
   ```
2. **Start the React frontend (Port 5173)**:
   ```bash
   cd backend1/frontend
   npm install
   npm run dev
   ```
   *Vite proxies `/chat`, `/auth`, and `/sessions` requests automatically to the backend on port 8000.*

---

### 📦 Production Deployment (Single-Server Mode)
Build the React frontend into static assets so the FastAPI backend can serve the complete app on a single port:

1. **Compile the React app**:
   ```bash
   cd backend1/frontend
   npm run build
   ```
   *This compiles the React SPA into `backend1/frontend/dist/`.*

2. **Run the production FastAPI server**:
   ```bash
   cd backend1
   uvicorn app.main:app --host 0.0.0.0 --port 7860
   ```
   *Open your browser to `http://localhost:7860` to access the full application.*

---

## 📂 Project Structure

### 🐍 Backend Code (`backend1/app/`)
*   [main.py](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/app/main.py) - App configuration, CORS policies, endpoint routing, and static file serving.
*   [database.py](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/app/database.py) - SQLite manager, migrations handler, user list loaders, and admin privileges managers.
*   [routes/auth.py](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/app/routes/auth.py) - Sign-up/login validators, active account checks, and admin user controller APIs.
*   [routes/simulation.py](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/app/routes/simulation.py) - Chat triggers, mock trials handlers, and grading endpoints.
*   [services/simulation_service.py](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/app/services/simulation_service.py) - Instructions builder for the AI Bench and performance evaluators.

### ⚛️ Frontend Code (`backend1/frontend/src/`)
*   [context/MootCourtContext.jsx](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/frontend/src/context/MootCourtContext.jsx) - Global context provider linking UI states to API endpoints.
*   [components/HomeView.jsx](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/frontend/src/components/HomeView.jsx) - Dashboard displaying the Ashoka Chakra Supreme Court layout and trial flow timeline.
*   [components/JudgeSimulation.jsx](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/frontend/src/components/JudgeSimulation.jsx) - Courtroom simulator managing judge messages and browser text-to-speech speaker toggles.
*   [components/AdminDashboard.jsx](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/frontend/src/components/AdminDashboard.jsx) - Administrator portal displaying user ledgers and status toggles.

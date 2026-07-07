# Moot Court AI: Advocate Workspace & Simulator

An AI-Powered practice partner for law students. It acts as a strict High Court Judge (Mode 1) or a tough Opposing Counsel (Mode 2) to challenge students on oral arguments, and issues a structured performance scorecard (Mode 3) at the end of the trial. It also indexes litigation briefs using local vector search (FAISS) and includes a legal memorial drafter.

---

## 🏛️ System Architecture

The project consists of a React SPA frontend and a FastAPI backend. It persists sessions in a local SQLite database and supports both local LLMs via Ollama and Google Gemini.

```
                  +--------------------------------+
                  |         React Frontend         |
                  |     (Vite Dev or Static HTML)  |
                  +---------------+----------------+
                                  |
                           HTTP   |  (API calls / Sessions)
                                  v
                  +---------------+----------------+
                  |        FastAPI Backend         |
                  |     (Runs on Port 8001)        |
                  +---------------+----------------+
                                  |
        +-------------------------+-------------------------+
        | (RAG Context)           | (CRUD Operations)       | (Inference / Embeddings)
        v                         v                         v
+-------+-------+         +-------+-------+         +-------+-------+
|  FAISS Index  |         | SQLite DB     |         | LLM Provider  |
| (Local RAM)   |         | (mootcourt.db)|         | (Ollama/Gemini|
+---------------+         +---------------+         +---------------+
```

---

## ⚙️ Configuration & Setup

1. **Virtual Environment**: Ensure your dependencies are installed within your Python virtual environment (e.g. at the parent directory `.venv`).
2. **Environment Variables**: Copy `.env.example` to `.env` in the backend root directory (`backend1/.env`):
   ```bash
   cp .env.example .env
   ```
3. **Download Local Models (if using Ollama)**:
   - For chat/simulation: `ollama pull phi3` (or `ollama pull llama3.2`)
   - For vector embeddings (RAG): `ollama pull nomic-embed-text`

---

## 🚀 Running the Project

### Development Mode (Dual Server)
Run both backend and frontend servers with live hot-reloading:

1. **Start the FastAPI backend (Port 8001)**:
   ```bash
   cd backend1
   & "path/to/.venv/Scripts/python" -m uvicorn app.main:app --port 8001 --reload
   ```
2. **Start the React frontend (Port 5173)**:
   ```bash
   cd backend1/frontend
   npm install
   npm run dev
   ```
   *Vite is configured to proxy all `/chat`, `/upload-pdf`, and `/sessions` requests automatically to the backend on port 8001.*

---

## 📦 Production Deployment (Single-Server Mode)

For a production-ready deployment, build the React frontend so it compiles into static assets. The FastAPI backend is configured to detect and serve these files directly, eliminating the need to run separate servers.

1. **Compile the React app**:
   ```bash
   cd backend1/frontend
   npm run build
   ```
   *This compiles the SPA into `backend1/frontend/dist/`.*

2. **Run the production FastAPI backend**:
   ```bash
   cd backend1
   & "path/to/.venv/Scripts/python" -m uvicorn app.main:app --host 0.0.0.0 --port 8001
   ```
   - Open your browser and navigate to `http://localhost:8001`.
   - The backend will serve the user interface automatically and route API calls to the same port.

---

## 📂 Project File Mappings

### Backend Code (`app/`)
- [main.py](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/app/main.py): Sets up database creation hooks, CORS policies, API routing, and serves compiled frontend assets.
- [config.py](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/app/config.py): Stores configurations and handles `.env` loading.
- [database.py](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/app/database.py): Core database manager. Connects to SQLite and handles CRUD operations for past scorecards and transcripts.
- [routes/simulation.py](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/app/routes/simulation.py): API controllers to convense, text, and conclude sessions.
- [services/simulation_service.py](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/app/services/simulation_service.py): Prepares system instructions for the judges/opponents and builds the evaluation prompt.
- [embeddings/embedding_service.py](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/app/embeddings/embedding_service.py): Generates 768-dimension vectors using either Gemini or local `nomic-embed-text`.

### Frontend Code (`frontend/src/`)
- [context/MootCourtContext.jsx](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/frontend/src/context/MootCourtContext.jsx): Stores app context and hooks React functions to FastAPI endpoints.
- [components/JudgeSimulation.jsx](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/frontend/src/components/JudgeSimulation.jsx): Arena interface managing dispute briefings, bench compositions, live trial, and performance report cards.
- [components/UploadPDF.jsx](file:///c:/Users/archa/Desktop/Mootcourt%20AI%20-%20Copy/backend1/frontend/src/components/UploadPDF.jsx): File indexing console and archive list showing past grades.

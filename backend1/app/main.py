from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.config import settings
from app.routes.chat import router as chat_router
from app.routes.pdf import router as pdf_router
from app.routes.simulation import router as simulation_router
from app.routes.auth import router as auth_router
from app.database import init_db

app = FastAPI(
    title=settings.project_name,
    debug=settings.debug
)

# CORS middleware for cross-origin frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# Register API endpoints
app.include_router(chat_router)
app.include_router(pdf_router)
app.include_router(simulation_router)
app.include_router(auth_router)

# Locate and serve compiled frontend client files
frontend_dist = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "frontend",
    "dist"
)

# Initialize and mount static uploads directory for avatars
static_dir = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "static"
)
os.makedirs(os.path.join(static_dir, "avatars"), exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{catchall:path}")
    def serve_frontend_client(catchall: str):
        if catchall.startswith("sessions") or catchall.startswith("chat") or catchall.startswith("upload-pdf") or catchall.startswith("auth") or catchall.startswith("static"):
            return {"detail": "Not Found"}
            
        # Check if requested file exists in frontend dist directory (copied from public/)
        if catchall:
            file_path = os.path.join(frontend_dist, catchall)
            if os.path.isfile(file_path):
                return FileResponse(file_path)
                
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"detail": "Frontend build files missing."}
else:
    @app.get("/")
    def home():
        return {
            "project": settings.project_name,
            "status": "Backend Running (Dev Mode - Frontend not compiled)"
        }
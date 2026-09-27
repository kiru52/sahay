from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import Base, engine
from app.api import api_router
from app.seed_data import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and populate seed data
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        print(f"Notice on seed_database: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": "SAHAY",
        "tagline": "AI-Powered Dynamic Mental Health Monitoring and Distress Prediction System for Victims of Atrocities",
        "core_mission": "Don't wait for distress to become a crisis. Detect change. Understand context. Act early.",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "status": "ONLINE"
    }

@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "system": "SAHAY Multimodal Decision Support"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

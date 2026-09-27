from fastapi import APIRouter
from app.api import auth, victims, checkins, ai, alerts, interventions, analytics, consent

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(victims.router)
api_router.include_router(checkins.router)
api_router.include_router(ai.router)
api_router.include_router(alerts.router)
api_router.include_router(interventions.router)
api_router.include_router(analytics.router)
api_router.include_router(consent.router)

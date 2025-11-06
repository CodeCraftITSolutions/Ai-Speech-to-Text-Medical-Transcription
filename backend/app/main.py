from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
from starlette.requests import Request
from starlette.responses import Response

from app.api.v1 import (
    routes_auth,
    routes_health,
    routes_jobs,
    routes_reports,
    routes_transcribe,
)
from app.infra.logging import logger
from app.infra.telemetry import record_metrics
from app.settings import get_settings

settings = get_settings()

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(record_metrics)

app.include_router(routes_health.router)
app.include_router(routes_auth.router)
app.include_router(routes_jobs.router)
app.include_router(routes_reports.router)
app.include_router(routes_transcribe.router)


@app.on_event("startup")
async def startup_event() -> None:
    logger.info("Starting %s in %s", settings.APP_NAME, settings.ENV)


@app.on_event("shutdown")
async def shutdown_event() -> None:
    logger.info("Shutting down %s", settings.APP_NAME)


@app.get("/metrics")
async def metrics() -> Response:
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    response = await call_next(request)
    return response


__all__ = ["app"]

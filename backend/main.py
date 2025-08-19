# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import transcription, user
from websocket import websocket_endpoint

app = FastAPI()

# CORS Middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(user.router, prefix="/api")
app.include_router(transcription.router, prefix="/api")

# WebSocket endpoint (stubbed for now)
app.add_api_websocket_route("/api/live_transcribe", websocket_endpoint)

from database import engine
import models

print("Creating tables...")
models.Base.metadata.create_all(bind=engine)
print("Tables created successfully.")


from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Probe endpoint for the deployer and pod health checks: root-level (not /api), no DB call.
@app.get("/health", include_in_schema=False)
@app.head("/health", include_in_schema=False)
async def health():
    return {"status": "ok"}

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# ---------- Text to speech (OpenAI TTS via Emergent key, cached in Mongo) ----------
import hashlib
import re
from fastapi import HTTPException, Request, Response
from emergentintegrations.llm.openai import OpenAITextToSpeech

TTS_MODEL = "tts-1"
TTS_VOICE = "nova"
TTS_SPEED = 0.9
TTS_FMT = "mp3"


class TTSRequest(BaseModel):
    text: str = Field(min_length=1, max_length=500)


def clean_for_tts(text: str) -> str:
    text = re.sub(r"[*_#>~|`]", "", text)
    return re.sub(r"\s+", " ", text).strip()


# Simple in-memory limit on NEW (uncached) generations per client IP.
_tts_hits: dict = {}
TTS_LIMIT_PER_MIN = 30


def check_tts_rate(ip: str) -> None:
    now = datetime.now(timezone.utc).timestamp()
    hits = [t for t in _tts_hits.get(ip, []) if now - t < 60]
    if len(hits) >= TTS_LIMIT_PER_MIN:
        raise HTTPException(status_code=429, detail="Demasiadas solicitudes, intenta en un momento")
    hits.append(now)
    _tts_hits[ip] = hits
    if len(_tts_hits) > 1000:  # drop idle clients
        for k in [k for k, v in _tts_hits.items() if not v or now - v[-1] > 60]:
            _tts_hits.pop(k, None)


def tts_key(text: str) -> str:
    raw = f"{text}|{TTS_VOICE}|{TTS_SPEED}|{TTS_MODEL}|{TTS_FMT}"
    return hashlib.sha256(raw.encode()).hexdigest()


@api_router.post("/tts")
async def create_tts(body: TTSRequest, request: Request):
    text = clean_for_tts(body.text)
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")
    key = tts_key(text)
    if not await db.tts_cache.find_one({"_id": key}, {"_id": 1}):
        check_tts_rate((request.headers.get("x-forwarded-for") or "").split(",")[0].strip() or (request.client.host if request.client else "unknown"))
        try:
            tts = OpenAITextToSpeech(api_key=os.environ["EMERGENT_LLM_KEY"])
            audio = await tts.generate_speech(text=text, model=TTS_MODEL, voice=TTS_VOICE, speed=TTS_SPEED, response_format=TTS_FMT)
        except Exception as e:
            logger.error("TTS generation failed: %s", e)
            raise HTTPException(status_code=502, detail="No se pudo generar el audio")
        await db.tts_cache.update_one(
            {"_id": key},
            {"$set": {"audio": audio, "text": text, "created_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
    return {"key": key, "path": f"/api/tts/{key}.{TTS_FMT}"}


@api_router.get("/tts/{key}.mp3")
async def get_tts(key: str):
    doc = await db.tts_cache.find_one({"_id": key}, {"audio": 1})
    if not doc:
        raise HTTPException(status_code=404, detail="Audio not found")
    return Response(content=bytes(doc["audio"]), media_type="audio/mpeg",
                    headers={"Cache-Control": "public, max-age=31536000"})


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

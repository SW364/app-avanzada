# TTS feature tests: POST /api/tts (OpenAI tts-1 via Emergent key, Mongo cache) + GET /api/tts/{key}.mp3
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL").rstrip("/")
TEXT = "I am able to cut."


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="module")
def first(s):
    t0 = time.time()
    r = s.post(f"{BASE_URL}/api/tts", json={"text": TEXT}, timeout=60)
    return r, time.time() - t0


# Health / root
def test_root(s):
    r = s.get(f"{BASE_URL}/api/", timeout=15)
    assert r.status_code == 200
    assert r.json()["message"] == "Hello World"


# POST creates (or returns cached) audio and returns key/path
def test_post_tts(first):
    r, dt = first
    print(f"first POST {dt:.2f}s")
    assert r.status_code == 200, r.text
    d = r.json()
    assert isinstance(d["key"], str) and len(d["key"]) == 64
    assert d["path"] == f"/api/tts/{d['key']}.mp3"


# GET serves mp3 bytes
def test_get_mp3(s, first):
    path = first[0].json()["path"]
    r = s.get(f"{BASE_URL}{path}", timeout=30)
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("audio/mpeg")
    assert len(r.content) > 1000
    # mp3 magic: ID3 tag or frame sync
    assert r.content[:3] == b"ID3" or r.content[0] == 0xFF


# Second POST is cached: same key, fast
def test_cached(s, first):
    t0 = time.time()
    r = s.post(f"{BASE_URL}/api/tts", json={"text": TEXT}, timeout=30)
    dt = time.time() - t0
    print(f"cached POST {dt:.2f}s")
    assert r.status_code == 200
    assert r.json()["key"] == first[0].json()["key"]
    assert dt < 3


# Whitespace/markdown normalisation maps to same key
def test_normalised_same_key(s, first):
    r = s.post(f"{BASE_URL}/api/tts", json={"text": "  I am   able to *cut*. "}, timeout=60)
    assert r.status_code == 200
    assert r.json()["key"] == first[0].json()["key"]


# Validation
@pytest.mark.parametrize("payload,codes", [
    ({"text": ""}, (400, 422)),
    ({"text": "   "}, (400, 422)),
    ({"text": "***"}, (400, 422)),
    ({"text": "a" * 501}, (422,)),
    ({}, (422,)),
])
def test_validation(s, payload, codes):
    r = s.post(f"{BASE_URL}/api/tts", json=payload, timeout=15)
    assert r.status_code in codes, f"{payload} -> {r.status_code} {r.text}"


# Unknown key -> 404
def test_get_unknown(s):
    r = s.get(f"{BASE_URL}/api/tts/{'0'*64}.mp3", timeout=15)
    assert r.status_code == 404

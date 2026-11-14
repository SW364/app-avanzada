# TTS rate-limit tests: cached requests never limited (public URL) + unit test of check_tts_rate (30/min per IP -> 429)
import os
import sys
import pytest
import requests
from fastapi import HTTPException

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL").rstrip("/")
CACHED_TEXT = "I am able to cut."


# Cached text: 35 rapid requests must all succeed (cache hits skip the limiter)
def test_cached_requests_not_rate_limited():
    s = requests.Session()
    first = s.post(f"{BASE_URL}/api/tts", json={"text": CACHED_TEXT}, timeout=60)
    assert first.status_code == 200
    key = first.json()["key"]
    codes = []
    for _ in range(35):
        r = s.post(f"{BASE_URL}/api/tts", json={"text": CACHED_TEXT}, timeout=30)
        codes.append(r.status_code)
        if r.status_code == 200:
            assert r.json()["key"] == key
    assert codes.count(200) == 35, codes


# Unit: limiter allows 30 per IP per minute, 31st -> 429, other IP unaffected
def test_check_tts_rate_unit():
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))
    import server
    ip = "TEST_ip_unit"
    server._tts_hits.pop(ip, None)
    for _ in range(server.TTS_LIMIT_PER_MIN):
        server.check_tts_rate(ip)
    with pytest.raises(HTTPException) as ei:
        server.check_tts_rate(ip)
    assert ei.value.status_code == 429
    server.check_tts_rate("TEST_other_ip")  # separate bucket
    server._tts_hits.pop(ip, None)
    server._tts_hits.pop("TEST_other_ip", None)

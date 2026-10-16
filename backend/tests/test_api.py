import io
import pytest


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


def test_readiness_endpoint(client):
    response = client.get("/api/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"


def test_public_config_no_secrets(client):
    response = client.get("/api/config/public")
    assert response.status_code == 200
    data = response.json()
    assert "project_name" in data
    assert "chat_provider" in data

    # Security check: Ensure no keys or tokens leaked
    for key in data:
        assert "key" not in key.lower() or "configured" in key.lower()
        assert "secret" not in key.lower()
        assert "token" not in key.lower()


def test_chat_interaction(client):
    payload = {"message": "Hello Mimo, tell me a joke!", "session_id": "test-user-1"}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 0
    assert data["character_reaction"] in ["happy", "laughing", "surprised", "jumping", "dancing", "sleeping", "talking"]
    assert data["is_demo_fallback"] is True


def test_chat_empty_message_validation(client):
    payload = {"message": "", "session_id": "test-user-1"}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 422  # Pydantic validation error


def test_avatar_invalid_extension(client):
    file_content = b"fake binary data"
    files = {"file": ("malicious.exe", io.BytesIO(file_content), "application/octet-stream")}
    data = {"session_id": "test-user-1"}
    response = client.post("/api/avatars", files=files, data=data)
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_avatar_valid_upload_and_status_poll(client):
    # Minimal 1x1 GIF / PNG
    png_bytes = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01"
        b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    files = {"file": ("test_avatar.png", io.BytesIO(png_bytes), "image/png")}
    data = {"session_id": "test-user-1"}

    upload_resp = client.post("/api/avatars", files=files, data=data)
    assert upload_resp.status_code == 200
    upload_data = upload_resp.json()
    assert "job_id" in upload_data
    job_id = upload_data["job_id"]

    # Poll status
    status_resp = client.get(f"/api/avatars/{job_id}/status")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert status_data["job_id"] == job_id
    assert status_data["status"] in ["queued", "processing", "succeeded"]

    # Delete avatar (Privacy test)
    del_resp = client.delete(f"/api/avatars/{job_id}")
    assert del_resp.status_code == 200


def test_game_progress_interaction(client):
    # Initial status
    resp = client.get("/api/progress?session_id=test-user-prog")
    assert resp.status_code == 200
    initial_progress = resp.json()
    assert initial_progress["happiness"] >= 0

    # Pet Mimo
    interact_resp = client.post(
        "/api/progress/interact",
        json={"action": "pat", "session_id": "test-user-prog"},
    )
    assert interact_resp.status_code == 200
    new_prog = interact_resp.json()
    assert new_prog["interactions_count"] > 0
    assert new_prog["last_action"] == "pat"


def test_user_settings_persistence(client):
    settings_payload = {
        "sound_enabled": False,
        "sound_volume": 0.5,
        "reduced_motion": True,
        "selected_palette": "sky_mint",
        "selected_accessory": "glasses",
        "selected_environment": "sunny_meadow",
    }
    put_resp = client.put("/api/settings?session_id=test-settings-user", json=settings_payload)
    assert put_resp.status_code == 200
    saved = put_resp.json()
    assert saved["selected_palette"] == "sky_mint"
    assert saved["selected_accessory"] == "glasses"

    # Fetch to verify
    get_resp = client.get("/api/settings?session_id=test-settings-user")
    assert get_resp.status_code == 200
    fetched = get_resp.json()
    assert fetched["sound_enabled"] is False
    assert fetched["reduced_motion"] is True

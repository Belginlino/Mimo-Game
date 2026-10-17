import os
import datetime
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.models import AvatarJob
from app.schemas.schemas import AvatarUploadResponse, AvatarStatusResponse
from app.services.storage.local_storage import storage_service
from app.services.avatar_generation import get_image3d_provider

router = APIRouter(prefix="/avatars", tags=["Avatars"])


@router.post("", response_model=AvatarUploadResponse)
async def upload_and_generate_avatar(
    file: UploadFile = File(...),
    session_id: str = Form(default="guest-session"),
    db: Session = Depends(get_db),
):
    """
    Upload user photo to initiate personalized 3D avatar generation.
    Validates file format/size and creates an asynchronous generation job.
    """
    provider, provider_name, is_configured = get_image3d_provider()
    # Do not retain a personal photo when the real generation provider is unavailable.
    stored_path, _ = await storage_service.save_upload(file, persist=is_configured)

    job_id = str(uuid.uuid4())

    # Create job in database
    job = AvatarJob(
        id=job_id,
        session_id=session_id,
        status="queued" if is_configured else "failed",
        original_filename=file.filename or "photo.jpg",
        stored_image_path=stored_path,
        provider=provider_name,
        progress=10 if is_configured else 0,
        error_message=None if is_configured else "Human avatar generation provider is not verified and configured. Set IMAGE3D_PROVIDER, server credentials, and confirm the provider's human-avatar capability in backend settings.",
        created_at=datetime.datetime.utcnow(),
    )

    if is_configured:
        try:
            provider_task_id = await provider.create_generation_task(stored_path, file.filename or "photo.jpg")
            job.provider_task_id = provider_task_id
            job.status = "processing"
            job.progress = 25
        except Exception as e:
            job.status = "failed"
            job.error_message = f"Failed to submit task to 3D provider: {str(e)}"
        finally:
            # Never retain the submitted source image after an attempt.
            storage_service.delete_file(stored_path)
            job.stored_image_path = ""

    db.add(job)
    db.commit()

    return AvatarUploadResponse(
        job_id=job.id,
        status=job.status,
        message="Photo submitted to the configured avatar provider." if job.status != "failed" else (job.error_message or "Setup required"),
        original_filename=job.original_filename,
        created_at=job.created_at.isoformat(),
    )


@router.get("/{avatar_id}/status", response_model=AvatarStatusResponse)
async def get_avatar_status(avatar_id: str, db: Session = Depends(get_db)):
    """
    Poll the generation status of an avatar 3D model.
    """
    job = db.query(AvatarJob).filter(AvatarJob.id == avatar_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Avatar job not found.")

    if job.status in ("queued", "processing") and job.provider_task_id:
        provider, _, is_configured = get_image3d_provider()
        if is_configured:
            try:
                task_info = await provider.get_task_status(job.provider_task_id)
                job.status = task_info.get("status", job.status)
                job.progress = task_info.get("progress", job.progress)

                if job.status == "succeeded" and not task_info.get("model_url"):
                    job.status = "failed"
                    job.error_message = "Provider reported completion without a downloadable GLB model."
                elif job.status == "succeeded" and task_info.get("model_url"):
                    # Save model locally
                    model_filename = f"{job.id}.glb"
                    model_path = os.path.join(settings.GENERATED_MODELS_DIR, model_filename)
                    try:
                        await provider.download_model_glb(task_info["model_url"], model_path)
                        job.model_filename = model_filename
                        job.model_url = f"/api/avatars/{job.id}/model.glb"
                    except Exception as dl_err:
                        storage_service.delete_file(model_path)
                        job.status = "failed"
                        job.error_message = f"Generated model could not be safely validated or downloaded: {dl_err}"

                elif job.status == "failed":
                    job.error_message = task_info.get("error", "Unknown provider error")

                db.commit()
            except Exception as e:
                # Keep current status without failing query
                pass

    return AvatarStatusResponse(
        job_id=job.id,
        status=job.status,
        progress=job.progress,
        model_url=job.model_url,
        error_message=job.error_message,
        is_rigged=False,
        provider=job.provider,
    )


@router.get("/{avatar_id}/model.glb")
def download_avatar_model(avatar_id: str, db: Session = Depends(get_db)):
    """Serve downloaded GLB asset safely with path checking."""
    job = db.query(AvatarJob).filter(AvatarJob.id == avatar_id).first()
    if not job or not job.model_filename:
        raise HTTPException(status_code=404, detail="Model file not found.")

    abs_path = os.path.abspath(os.path.join(settings.GENERATED_MODELS_DIR, job.model_filename))
    model_root = os.path.abspath(settings.GENERATED_MODELS_DIR)
    if os.path.commonpath([abs_path, model_root]) != model_root or not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail="Asset not found on disk.")

    return FileResponse(abs_path, media_type="model/gltf-binary", filename=f"mimo-avatar-{job.id[:8]}.glb")


@router.delete("/{avatar_id}")
def delete_avatar(avatar_id: str, db: Session = Depends(get_db)):
    """
    Privacy endpoint: permanently delete user uploaded photo, generated model, and job record.
    """
    job = db.query(AvatarJob).filter(AvatarJob.id == avatar_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Avatar job not found.")

    # Delete files
    if job.stored_image_path:
        storage_service.delete_file(job.stored_image_path)
    if job.model_filename:
        model_path = os.path.join(settings.GENERATED_MODELS_DIR, job.model_filename)
        storage_service.delete_file(model_path)

    db.delete(job)
    db.commit()

    return {"message": "Avatar and associated files successfully deleted.", "avatar_id": avatar_id}

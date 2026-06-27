"""
Qevora Cloudinary Manager
Handles: Image Upload, Delete, URL Optimization, Folder Organization
"""
import hashlib
import hmac
import time
import requests
import logging
from typing import Optional, Dict, Any

from config import CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

logger = logging.getLogger("qevora.cloudinary")

CLOUDINARY_BASE_URL = f"https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}"
CLOUDINARY_UPLOAD_URL = f"{CLOUDINARY_BASE_URL}/image/upload"
CLOUDINARY_DESTROY_URL = f"{CLOUDINARY_BASE_URL}/image/destroy"
CLOUDINARY_CDN_BASE = f"https://res.cloudinary.com/{CLOUDINARY_CLOUD_NAME}/image/upload"


def _generate_signature(params: Dict[str, Any]) -> str:
    """Generate SHA-1 signature for authenticated Cloudinary API calls."""
    # Sort params alphabetically (excluding api_key and file)
    sorted_params = "&".join(
        f"{k}={v}"
        for k, v in sorted(params.items())
        if k not in ("api_key", "file", "resource_type", "cloud_name")
    )
    payload = sorted_params + CLOUDINARY_API_SECRET
    return hashlib.sha1(payload.encode()).hexdigest()


def upload_image(
    file_bytes: bytes,
    filename: str,
    folder: str = "qevora",
    project_id: Optional[str] = None,
    transformation: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Upload an image to Cloudinary.
    Returns: {public_id, secure_url, width, height, format, bytes}
    """
    if not CLOUDINARY_CLOUD_NAME:
        raise ValueError("Cloudinary is not configured. Missing CLOUDINARY_CLOUD_NAME.")

    # Build upload folder path
    upload_folder = f"{folder}/{project_id}" if project_id else folder

    timestamp = int(time.time())
    params = {
        "folder": upload_folder,
        "timestamp": timestamp,
    }

    signature = _generate_signature(params)

    try:
        response = requests.post(
            CLOUDINARY_UPLOAD_URL,
            files={"file": (filename, file_bytes, "image/jpeg")},
            data={
                **params,
                "api_key": CLOUDINARY_API_KEY,
                "signature": signature,
            },
            timeout=30,
        )
        response.raise_for_status()
        result = response.json()
        logger.info(f"Image uploaded successfully: {result.get('public_id')}")
        return {
            "public_id": result.get("public_id"),
            "secure_url": result.get("secure_url"),
            "width": result.get("width"),
            "height": result.get("height"),
            "format": result.get("format"),
            "bytes": result.get("bytes"),
            "url": result.get("url"),
        }
    except requests.HTTPError as e:
        logger.error(f"Cloudinary upload failed: {e.response.text}")
        raise ValueError(f"Image upload failed: {e.response.text}")
    except Exception as e:
        logger.error(f"Cloudinary upload error: {e}")
        raise


def delete_image(public_id: str) -> bool:
    """
    Delete an image from Cloudinary by public_id.
    Returns True if deleted successfully.
    """
    if not CLOUDINARY_CLOUD_NAME:
        raise ValueError("Cloudinary is not configured.")

    timestamp = int(time.time())
    params = {
        "public_id": public_id,
        "timestamp": timestamp,
    }
    signature = _generate_signature(params)

    try:
        response = requests.post(
            CLOUDINARY_DESTROY_URL,
            data={
                **params,
                "api_key": CLOUDINARY_API_KEY,
                "signature": signature,
            },
            timeout=15,
        )
        response.raise_for_status()
        result = response.json()
        success = result.get("result") == "ok"
        if success:
            logger.info(f"Image deleted: {public_id}")
        else:
            logger.warning(f"Cloudinary delete returned: {result}")
        return success
    except Exception as e:
        logger.error(f"Cloudinary delete error: {e}")
        return False


def optimize_url(
    public_id: str,
    width: Optional[int] = None,
    height: Optional[int] = None,
    quality: str = "auto",
    format: str = "auto",
    crop: str = "fill",
) -> str:
    """
    Generate an optimized Cloudinary CDN URL with transformations.
    Example: optimize_url("qevora/myimage", width=800, quality="auto", format="webp")
    """
    transformations = [f"q_{quality}", f"f_{format}"]
    if width:
        transformations.append(f"w_{width}")
    if height:
        transformations.append(f"h_{height}")
    if width or height:
        transformations.append(f"c_{crop}")

    transform_str = ",".join(transformations)
    return f"{CLOUDINARY_CDN_BASE}/{transform_str}/{public_id}"


def get_cloudinary_status() -> Dict[str, Any]:
    """Verify Cloudinary credentials by calling the usage endpoint."""
    if not CLOUDINARY_CLOUD_NAME or not CLOUDINARY_API_KEY or not CLOUDINARY_API_SECRET:
        return {"connected": False, "reason": "Cloudinary credentials not configured"}

    try:
        response = requests.get(
            f"https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}/usage",
            auth=(CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET),
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
        return {
            "connected": True,
            "cloud_name": CLOUDINARY_CLOUD_NAME,
            "credits_used": data.get("credits", {}).get("usage", 0),
            "credits_limit": data.get("credits", {}).get("limit", 0),
            "storage_used_mb": round(data.get("storage", {}).get("usage", 0) / (1024 * 1024), 2),
        }
    except Exception as e:
        logger.error(f"Cloudinary health check failed: {e}")
        return {"connected": False, "reason": str(e)}

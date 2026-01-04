import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
    secure=True
)

async def upload_to_cloudinary(file_content: bytes, resource_type: str = "image", folder: str = "hotel"):
    """Upload file to Cloudinary"""
    try:
        result = cloudinary.uploader.upload(
            file_content,
            resource_type=resource_type,
            folder=f"spencer-green/{folder}",
            use_filename=True,
            unique_filename=True
        )
        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "format": result.get("format"),
            "width": result.get("width"),
            "height": result.get("height"),
            "resource_type": result.get("resource_type")
        }
    except Exception as e:
        raise Exception(f"Cloudinary upload error: {str(e)}")

async def delete_from_cloudinary(public_id: str, resource_type: str = "image"):
    """Delete file from Cloudinary"""
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        return result
    except Exception as e:
        raise Exception(f"Cloudinary delete error: {str(e)}")

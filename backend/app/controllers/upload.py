from fastapi import APIRouter, File, UploadFile, Depends
from app.utils.dependencies import get_current_admin
from app.utils.file_storage import save_image

router = APIRouter(prefix="/api/uploads", tags=["Uploads"])


@router.post("", dependencies=[Depends(get_current_admin)])
async def upload_image(file: UploadFile = File(...)):
    url = await save_image(file)
    return {"url": url}

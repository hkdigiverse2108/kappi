from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_admin
from app.database.db import get_database
from app.schemas.contact import ContactContent, EnquiryCreate, EnquiryStatusUpdate
from app.services import contact as contact_service

router = APIRouter(prefix="/api/contact", tags=["Contact"])


@router.get("")
async def get_contact(db=Depends(get_database)):
    return await contact_service.get_contact_page(db)


@router.put("", dependencies=[Depends(get_current_admin)])
async def save_contact(body: ContactContent, db=Depends(get_database)):
    return await contact_service.save_contact_page(db, body.model_dump())


# Sent from the contact form on the website, so no login is needed
@router.post("/enquiries")
async def create_enquiry(body: EnquiryCreate, db=Depends(get_database)):
    return await contact_service.create_enquiry(db, body.model_dump())


@router.get("/enquiries", dependencies=[Depends(get_current_admin)])
async def list_enquiries(db=Depends(get_database)):
    return await contact_service.list_enquiries(db)


@router.patch("/enquiries/{enquiry_id}", dependencies=[Depends(get_current_admin)])
async def update_enquiry(enquiry_id: str, body: EnquiryStatusUpdate, db=Depends(get_database)):
    return await contact_service.update_enquiry_status(db, enquiry_id, body.status)


@router.delete("/enquiries/{enquiry_id}", dependencies=[Depends(get_current_admin)])
async def delete_enquiry(enquiry_id: str, db=Depends(get_database)):
    return await contact_service.delete_enquiry(db, enquiry_id)

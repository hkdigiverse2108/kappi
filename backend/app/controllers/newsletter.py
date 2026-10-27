from fastapi import APIRouter, BackgroundTasks, Depends, Request
from app.utils.dependencies import get_current_admin
from app.database.db import get_database
from app.schemas.newsletter import SubscribeRequest
from app.services import newsletter as newsletter_service
from app.utils.site import site_base_url

router = APIRouter(prefix="/api/newsletter", tags=["Newsletter"])


# Sent from the website footer, so no login is needed
@router.post("/subscribe")
async def subscribe(body: SubscribeRequest, request: Request, background_tasks: BackgroundTasks, db=Depends(get_database)):
    return await newsletter_service.subscribe(db, body.email, body.source, background_tasks, site_base_url(request))


@router.get("/subscribers", dependencies=[Depends(get_current_admin)])
async def list_subscribers(db=Depends(get_database)):
    return await newsletter_service.list_subscribers(db)


@router.delete("/subscribers/{subscriber_id}", dependencies=[Depends(get_current_admin)])
async def delete_subscriber(subscriber_id: str, db=Depends(get_database)):
    return await newsletter_service.delete_subscriber(db, subscriber_id)

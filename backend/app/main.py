import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings, ROOT_DIR
from app.database.db import connect_to_mongo, close_mongo_connection, db
from app.models.product import setup_product_indexes
from app.models.review import setup_review_indexes
from app.models.coupon import setup_coupon_indexes
from app.models.user import setup_user_indexes
from app.models.admin import setup_admin_indexes
from app.models.password_reset import setup_password_reset_indexes
from app.models.contact import setup_enquiry_indexes
from app.models.newsletter import setup_subscriber_indexes
from app.models.order import setup_order_indexes
from app.services.admin_auth import ensure_first_admin
from app.services.contact import ensure_contact_content
from app.services.our_story import ensure_our_story_content
from app.services.footer import ensure_footer_content
from app.services.announcement import ensure_announcement_content
from app.services.home import ensure_shop_seo_content
from app.utils.file_storage import UPLOADS_DIR
from app.services import page_seo as page_seo_service
from app.services.seo_html import inject_seo
from app.controllers.home import router as home_router
from app.controllers.upload import router as upload_router
from app.controllers.product import router as product_router
from app.controllers.review import router as review_router
from app.controllers.coupon import router as coupon_router
from app.controllers.auth import router as auth_router
from app.controllers.account import router as account_router
from app.controllers.admin_auth import router as admin_auth_router
from app.controllers.customer import router as customer_router
from app.controllers.contact import router as contact_router
from app.controllers.newsletter import router as newsletter_router
from app.controllers.our_story import router as our_story_router
from app.controllers.footer import router as footer_router
from app.controllers.announcement import router as announcement_router
from app.controllers.payment_settings import router as payment_settings_router
from app.controllers.faq import router as faq_router
from app.controllers.policy import router as policy_router
from app.controllers.order import router as order_router
from app.controllers.cart_offers import router as cart_offers_router
from app.controllers.seo import router as seo_router

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup events
    await connect_to_mongo()
    await setup_product_indexes(db.db)
    await setup_review_indexes(db.db)
    await setup_coupon_indexes(db.db)
    await setup_user_indexes(db.db)
    await setup_admin_indexes(db.db)
    await setup_password_reset_indexes(db.db)
    await setup_enquiry_indexes(db.db)
    await setup_subscriber_indexes(db.db)
    await setup_order_indexes(db.db)
    await ensure_first_admin(db.db)
    await ensure_contact_content(db.db)
    await ensure_our_story_content(db.db)
    await ensure_footer_content(db.db)
    await ensure_announcement_content(db.db)
    await ensure_shop_seo_content(db.db)
    # Products and reviews have no seed data: they live only in MongoDB and are managed from the admin panel
    yield
    # Shutdown events
    await close_mongo_connection()


app = FastAPI(title="Kapee", lifespan=lifespan, redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Compress JSON responses (the home page response shrinks a lot)
app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.get("/api/health", tags=["Health"])
async def health():
    await db.client.admin.command("ping")
    return {"status": "ok", "db": "connected"}


app.include_router(home_router)
app.include_router(upload_router)
app.include_router(product_router)
app.include_router(review_router)
app.include_router(coupon_router)
app.include_router(auth_router)
app.include_router(account_router)
app.include_router(admin_auth_router)
app.include_router(customer_router)
app.include_router(contact_router)
app.include_router(newsletter_router)
app.include_router(our_story_router)
app.include_router(footer_router)
app.include_router(announcement_router)
app.include_router(payment_settings_router)
app.include_router(faq_router)
app.include_router(policy_router)
app.include_router(order_router)
app.include_router(cart_offers_router)
app.include_router(seo_router)

# Images uploaded from the admin panel
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Production: after "npm run build" the backend also serves the website from frontend/dist,
# putting each page's admin SEO into index.html on every page request
FRONTEND_DIST = ROOT_DIR / "frontend" / "dist"

if (FRONTEND_DIST / "index.html").exists():

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        if full_path.startswith(("api/", "uploads/")):
            raise HTTPException(status_code=404, detail="Not Found")

        file = (FRONTEND_DIST / full_path).resolve()
        if full_path and file.is_file() and file.is_relative_to(FRONTEND_DIST.resolve()):
            return FileResponse(file)

        page = (FRONTEND_DIST / "index.html").read_text(encoding="utf-8")
        try:
            seo = (await page_seo_service.get_page_seo(db.db, full_path))["seo"]
        except Exception:
            logging.exception("Could not load SEO for index.html")
            seo = None
        return HTMLResponse(inject_seo(page, seo), headers={"Cache-Control": "no-cache"})

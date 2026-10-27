from pathlib import Path
from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent


class Settings(BaseSettings):
    # Application configuration
    BACKEND_PORT: int = 5000
    FRONTEND_URL: str = "http://localhost:5173"

    # MongoDB Settings
    MONGO_URI: str
    DB_NAME: str = "kapee"

    # Login (JWT stored in an httpOnly cookie)
    JWT_SECRET: str
    JWT_EXPIRE_DAYS: int = 7
    COOKIE_SECURE: bool = False

    # First admin account, created on startup when there is no admin yet
    ADMIN_NAME: str = "Admin"
    ADMIN_EMAIL: str = ""
    ADMIN_PASSWORD: str = ""

    # Email for password reset OTPs (empty SMTP_USER = print the OTP in the backend log)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    # Read from SMTP_PASSWORD, or SMTP_PASS as written in .env
    SMTP_PASSWORD: str = Field(default="", validation_alias=AliasChoices("SMTP_PASSWORD", "SMTP_PASS"))

    # .env lives in the project root (Kapee_UI/.env), shared with the frontend
    model_config = SettingsConfigDict(env_file=ROOT_DIR / ".env", extra="ignore")


settings = Settings()

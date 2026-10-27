from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    phone: str = Field(min_length=10, max_length=20)
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class LoginOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(pattern=r"^\d{6}$")


class ForgotPasswordRequest(BaseModel):
    # Registered email or mobile number
    identifier: str = Field(min_length=3, max_length=120)


class VerifyOtpRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=120)
    otp: str = Field(pattern=r"^\d{6}$")


class ResetPasswordRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=120)
    resetToken: str = Field(min_length=10)
    password: str = Field(min_length=6, max_length=128)

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Logo } from '../components/common/Logo';
import { useUserStore } from '../store/useUserStore';
import * as authApi from '../api/authApi';

export const Login = ({ defaultMode }) => {
  const [searchParams] = useSearchParams();
  const initialTab = defaultMode || (searchParams.get('tab') === 'signup' ? 'signup' : searchParams.get('tab') === 'forgot' ? 'forgot' : 'login');
  const [activeTab, setActiveTab] = useState(initialTab);

  const navigate = useNavigate();
  const { login, register, verifyLoginOtp } = useUserStore();

  // Sign In / Sign Up states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Sign in step 2: password accepted, waiting for the emailed code
  const [loginOtpStep, setLoginOtpStep] = useState(false);

  // Forgot Password flow states (1: Enter Email/Phone, 2: Enter OTP, 3: New Password, 4: Success)
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [forgotError, setForgotError] = useState('');
  // One-time token from the backend after the OTP is verified, used to set the new password
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP Countdown timer
  useEffect(() => {
    let interval = null;
    if (isTimerActive && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, resendTimer]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setAuthError('');
    setAuthSuccess('');
    setLoginOtpStep(false);
  };

  const startLoginOtpStep = () => {
    setOtpCode(['', '', '', '', '', '']);
    setLoginOtpStep(true);
    setResendTimer(30);
    setIsTimerActive(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsSubmitting(true);
    try {
      if (activeTab === 'login') {
        await login(email, password);
        startLoginOtpStep();
      } else {
        // Registration only creates the account; the customer then signs in
        await register({ name, email, phone, password });
        setPassword('');
        setActiveTab('login');
        setAuthSuccess('Registration complete! Please sign in with your email and password.');
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign in step 2: verify the emailed code
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    const entered = otpCode.join('');
    if (entered.length < 6) {
      setAuthError('Please enter the full 6-digit verification code.');
      return;
    }
    setAuthError('');
    setIsSubmitting(true);
    try {
      await verifyLoginOtp(email, entered);
      navigate('/');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendLoginOtp = async () => {
    if (resendTimer > 0) return;
    setAuthError('');
    try {
      await login(email, password);
      startLoginOtpStep();
    } catch (err) {
      setAuthError(err.message);
    }
  };

  // Step 1: Send OTP
  const handleSendResetCode = (e) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your registered email or mobile number.');
      return;
    }
    setForgotError('');
    setIsLoading(true);
    authApi
      .forgotPassword(forgotIdentifier.trim())
      .then(() => {
        setOtpCode(['', '', '', '', '', '']);
        setForgotStep(2);
        setResendTimer(30);
        setIsTimerActive(true);
      })
      .catch((err) => setForgotError(err.message))
      .finally(() => setIsLoading(false));
  };

  // Handle OTP digit entry
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const entered = otpCode.join('');
    if (entered.length < 6) {
      setForgotError('Please enter the full 6-digit verification code.');
      return;
    }
    setForgotError('');
    setIsLoading(true);
    authApi
      .verifyOtp(forgotIdentifier.trim(), entered)
      .then((data) => {
        setResetToken(data.resetToken);
        setForgotStep(3);
      })
      .catch((err) => setForgotError(err.message))
      .finally(() => setIsLoading(false));
  };

  // Step 3: Set New Password
  const handleResetPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }
    setForgotError('');
    setIsLoading(true);
    authApi
      .resetPassword(forgotIdentifier.trim(), resetToken, newPassword)
      .then(() => {
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
        setForgotStep(4);
      })
      .catch((err) => setForgotError(err.message))
      .finally(() => setIsLoading(false));
  };

  // Resend OTP
  const handleResendCode = () => {
    if (resendTimer > 0) return;
    setForgotError('');
    authApi
      .forgotPassword(forgotIdentifier.trim())
      .then(() => {
        setResendTimer(30);
        setIsTimerActive(true);
        setOtpCode(['', '', '', '', '', '']);
      })
      .catch((err) => setForgotError(err.message));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>
          {activeTab === 'forgot'
            ? 'Reset Password | KAPEE Enterprise'
            : `${activeTab === 'login' ? 'Sign In' : 'Create Account'} | KAPEE Enterprise`}
        </title>
      </Helmet>

      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-10 border border-emerald-soft shadow-xl space-y-6">
        {/* LOGO */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo className="h-10 w-auto" />
          </div>

          {activeTab === 'login' && loginOtpStep ? (
            <>
              <div className="inline-flex p-3 rounded-full bg-emerald-soft text-emerald-deep mx-auto mb-1">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-ink">Verify It's You</h1>
              <p className="text-xs text-muted">
                Enter the 6-digit sign-in code sent to <strong className="text-ink">{email}</strong>.
              </p>
            </>
          ) : activeTab !== 'forgot' ? (
            <>
              <h1 className="font-serif text-2xl font-bold text-ink">
                {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h1>
              <p className="text-xs text-muted">
                {activeTab === 'login'
                  ? 'Sign in to access saved addresses and track live orders.'
                  : 'Join KAPEE to enjoy exclusive offers and express checkout.'}
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex p-3 rounded-full bg-emerald-soft text-emerald-deep mx-auto mb-1">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-ink">
                {forgotStep === 4 ? 'Password Reset Successful' : 'Reset Your Password'}
              </h1>
              <p className="text-xs text-muted">
                {forgotStep === 1 && 'Enter your registered email or mobile to receive a verification OTP code.'}
                {forgotStep === 2 && `Enter the 6-digit OTP code sent to ${forgotIdentifier || 'your email'}.`}
                {forgotStep === 3 && 'Create and confirm your strong new account password.'}
                {forgotStep === 4 && 'Your password has been securely reset. You can now log in.'}
              </p>
            </>
          )}
        </div>

        {/* SIGN IN STEP 2: EMAILED OTP */}
        {activeTab === 'login' && loginOtpStep ? (
          <form onSubmit={handleVerifyLoginOtp} className="space-y-4 text-xs">
            {authError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                {authError}
              </div>
            )}

            <div className="text-center">
              <label className="block font-bold text-ink mb-2">Enter 6-Digit OTP</label>
              <div className="flex justify-center gap-2">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center font-bold text-lg rounded-xl border border-emerald-soft outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20 transition-all"
                  />
                ))}
              </div>
            </div>

            <div className="text-center text-xs text-muted">
              {resendTimer > 0 ? (
                <span>Resend OTP code in <strong className="text-emerald">{resendTimer}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendLoginOtp}
                  className="text-emerald font-bold hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend Code
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full text-xs font-bold py-3 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  Verify & Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setLoginOtpStep(false);
                  setAuthError('');
                }}
                className="text-xs font-semibold text-stone-500 hover:text-emerald inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>
          </form>
        ) : /* REGULAR SIGN IN / SIGN UP TABS */
        activeTab !== 'forgot' ? (
          <>
            <div className="grid grid-cols-2 p-1 bg-ivory rounded-2xl border border-emerald-soft text-xs font-bold">
              <button
                type="button"
                onClick={() => switchTab('login')}
                className={`py-2.5 rounded-xl transition-all ${
                  activeTab === 'login' ? 'bg-white shadow-xs text-emerald-deep' : 'text-muted hover:text-ink'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchTab('signup')}
                className={`py-2.5 rounded-xl transition-all ${
                  activeTab === 'signup' ? 'bg-white shadow-xs text-emerald-deep' : 'text-muted hover:text-ink'
                }`}
              >
                New Account
              </button>
            </div>

            {/* LOGIN / SIGNUP FORM */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {authError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                  {authError}
                </div>
              )}
              {authSuccess && (
                <div className="p-3 rounded-xl bg-emerald-soft border border-emerald-100 text-emerald-deep text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {authSuccess}
                </div>
              )}

              {activeTab === 'signup' && (
                <>
                  <div>
                    <label className="block font-bold text-ink mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Arjun Nambiar"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-emerald-soft outline-none focus:border-emerald"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-ink mb-1">Mobile Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-muted absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98450 12345"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-emerald-soft outline-none focus:border-emerald"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block font-bold text-ink mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-emerald-soft outline-none focus:border-emerald"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-ink">Password</label>
                  {activeTab === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('forgot');
                        setForgotStep(1);
                        setForgotError('');
                        setForgotIdentifier(email || '');
                      }}
                      className="text-[11px] text-emerald hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={activeTab === 'signup' ? 6 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-emerald-soft outline-none focus:border-emerald"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full text-xs font-bold py-3 mt-2 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {activeTab === 'login' ? 'Sign In to Your Account' : 'Complete Registration'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

          </>
        ) : (
          /* FORGOT PASSWORD 4-STEP WIZARD */
          <div className="space-y-4 text-xs">
            {/* Step Indicator Progress */}
            {forgotStep < 4 && (
              <div className="flex items-center justify-between px-2 pb-2 border-b border-emerald-soft/60">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      forgotStep >= 1 ? 'bg-emerald text-white' : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    1
                  </span>
                  <span className={`text-[11px] ${forgotStep === 1 ? 'font-bold text-emerald-deep' : 'text-stone-400'}`}>
                    Identifier
                  </span>
                </div>
                <div className="w-8 h-[2px] bg-stone-200">
                  <div
                    className="h-full bg-emerald transition-all"
                    style={{ width: forgotStep >= 2 ? '100%' : '0%' }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      forgotStep >= 2 ? 'bg-emerald text-white' : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    2
                  </span>
                  <span className={`text-[11px] ${forgotStep === 2 ? 'font-bold text-emerald-deep' : 'text-stone-400'}`}>
                    OTP
                  </span>
                </div>
                <div className="w-8 h-[2px] bg-stone-200">
                  <div
                    className="h-full bg-emerald transition-all"
                    style={{ width: forgotStep >= 3 ? '100%' : '0%' }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      forgotStep >= 3 ? 'bg-emerald text-white' : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    3
                  </span>
                  <span className={`text-[11px] ${forgotStep === 3 ? 'font-bold text-emerald-deep' : 'text-stone-400'}`}>
                    New Pass
                  </span>
                </div>
              </div>
            )}

            {/* Error Message Box */}
            {forgotError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                {forgotError}
              </div>
            )}

            {/* STEP 1: ENTER EMAIL OR PHONE */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Registered Email or Mobile</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="e.g. you@example.com or 9845012345"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-emerald-soft outline-none focus:border-emerald"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    We will send an instant 6-digit OTP verification code to reset your password.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full text-xs font-bold py-3 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Sending Code...
                    </>
                  ) : (
                    <>
                      Send Verification Code <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setForgotError('');
                    }}
                    className="text-xs font-semibold text-stone-500 hover:text-emerald inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: ENTER OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center">
                  <label className="block font-bold text-ink mb-2">Enter 6-Digit OTP</label>
                  <div className="flex justify-center gap-2">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 text-center font-bold text-lg rounded-xl border border-emerald-soft outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20 transition-all"
                      />
                    ))}
                  </div>

                </div>

                {/* Resend Timer */}
                <div className="text-center text-xs text-muted">
                  {resendTimer > 0 ? (
                    <span>Resend OTP code in <strong className="text-emerald">{resendTimer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-emerald font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Resend Code
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full text-xs font-bold py-3 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Continue <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setForgotError('');
                    }}
                    className="text-xs font-semibold text-stone-500 hover:text-emerald inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Change Email / Mobile
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SET NEW PASSWORD */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block font-bold text-ink mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted absolute left-3 top-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-emerald-soft outline-none focus:border-emerald"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted absolute left-3 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-emerald-soft outline-none focus:border-emerald"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full text-xs font-bold py-3 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving Password...
                    </>
                  ) : (
                    <>
                      Save New Password <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 4: SUCCESS */}
            {forgotStep === 4 && (
              <div className="text-center space-y-4 py-2">
                <div className="w-16 h-16 rounded-full bg-emerald-soft text-emerald-deep flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10 text-emerald" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-ink">All Set!</h3>
                  <p className="text-xs text-muted mt-1">
                    Your password has been reset successfully. You can now log into your account using your new password.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    if (forgotIdentifier.includes('@')) {
                      setEmail(forgotIdentifier);
                    }
                    setPassword('');
                    setForgotStep(1);
                    setForgotError('');
                  }}
                  className="btn-primary w-full text-xs font-bold py-3 flex items-center justify-center gap-1.5"
                >
                  Sign In Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;


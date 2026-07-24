import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyOTP } from '../../store/slices/authSlice';
import { authApi } from '../../api/auth';
import { MailCheck, AlertCircle, ShieldCheck, Timer, RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

const OTP_LENGTH = 6;
const OTP_EXPIRY = 600; // 10 minutes in seconds

const OTPVerificationPage = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const location  = useLocation();
  const email     = location.state?.email || 'your email';

  const [otp, setOtp]           = useState(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState(null);
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY);
  const [resendMsg, setResendMsg] = useState(null);
  const inputRefs = Array.from({ length: OTP_LENGTH }, () => useRef(null));
  const hasSentRef = useRef(false); // prevents double-send in React StrictMode

  useEffect(() => {
    if (!location.state?.email) navigate('/signup');
  }, [location, navigate]);

  
  useEffect(() => {
    if (!email || email === 'your email' || hasSentRef.current) return;
    hasSentRef.current = true;
    authApi.sendVerificationEmail({ email }).catch((err) => {
      setError(err.response?.data?.message || 'Failed to send verification code. Click Resend to try again.');
    });
  }, [email]);

  /* Expiry countdown */
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  /* OTP input handlers */
  const handleChange = (index, e) => {
    const val = e.target.value;
    if (isNaN(val)) return;
    const next = [...otp];
    next[index] = val.slice(-1); // only last char
    setOtp(next);
    setError(null);
    if (val && index < OTP_LENGTH - 1) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!paste) return;
    const next = [...otp];
    paste.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    const focusIdx = Math.min(paste.length, OTP_LENGTH - 1);
    inputRefs[focusIdx]?.current?.focus();
  };

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== OTP_LENGTH) { setError('Please enter all 6 digits'); return; }
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(verifyOTP({ email, otp: otpValue })).unwrap();
      navigate('/app/dashboard');
    } catch (err) {
      setError(err || 'Invalid or expired verification code');
      // shake the inputs by resetting — user should re-enter
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs[0].current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  /* Resend */
  const handleResend = async () => {
    setResendMsg(null);
    setError(null);
    try {
      await authApi.sendVerificationEmail({ email });
      setTimeLeft(OTP_EXPIRY);
      setOtp(Array(OTP_LENGTH).fill(''));
      setResendMsg('A new code has been sent.');
      inputRefs[0].current?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend. Please try again.');
    }
  };

  const filled = otp.filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4 bg-background">
      <div className="w-full max-w-md relative">

        {/* Ambient glow — green for verification */}
        <div className="absolute inset-0 -z-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 bg-accent-success/8 rounded-full blur-[80px]" />
        </div>

        <Card className="relative z-10">
          <CardContent className="pt-8 pb-6 px-7 flex flex-col gap-6">

            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-11 h-11 rounded-xl bg-accent-success/10 border border-accent-success/25 flex items-center justify-center mb-1">
                <MailCheck className="w-5 h-5 text-accent-success" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-text-primary">
                Verify your email
              </h1>
              <p className="text-sm text-text-muted">
                Enter the 6-digit code sent to{' '}
                <span className="font-medium text-text-primary">{email}</span>
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-success" />
              <div className="w-8 h-px bg-accent-success" />
              <div className="w-2 h-2 rounded-full bg-accent-success" />
              <div className="w-8 h-px bg-border" />
              <div className="w-2 h-2 rounded-full bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-accent-error/10 border border-accent-error/30 text-accent-error text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Resend confirmation */}
              {resendMsg && !error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-accent-success/10 border border-accent-success/20 text-accent-success text-sm">
                  <RefreshCw className="w-4 h-4 shrink-0" />
                  {resendMsg}
                </div>
              )}

              {/* OTP boxes */}
              <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={inputRefs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`
                      w-11 h-13 text-center text-lg font-semibold font-mono
                      rounded-lg border bg-background text-text-primary
                      ring-0 ring-offset-0
                      focus:outline-none focus:ring-2
                      transition-[border-color,box-shadow] duration-fast
                      ${digit
                        ? 'border-accent-success/60 text-accent-success focus:border-accent-success focus:ring-accent-success/20'
                        : 'border-border hover:border-border-light focus:border-accent-success focus:ring-accent-success/15'
                      }
                    `}
                    style={{ width: '2.75rem', height: '3.25rem' }}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div className="flex gap-1">
                {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-0.5 rounded-full transition-all duration-base ${
                      i < filled ? 'bg-accent-success' : 'bg-border'
                    }`}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="flex justify-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs
                  ${timeLeft < 60
                    ? 'bg-accent-error/10 border-accent-error/30 text-accent-error'
                    : 'bg-surface border-border text-text-muted'
                  }`}
                >
                  <Timer className={`w-3.5 h-3.5 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
                  {timeLeft > 0 ? `Code expires in ${formatTime(timeLeft)}` : 'Code expired'}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full !bg-accent-success hover:!bg-emerald-600 !shadow-none"
                loading={isLoading}
                disabled={filled < OTP_LENGTH || timeLeft === 0}
              >
                {isLoading ? 'Verifying…' : 'Verify & continue'}
              </Button>
            </form>

            {/* Resend */}
            <p className="text-center text-sm text-text-muted">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                className="text-accent-success hover:text-white font-medium transition-colors duration-fast focus:outline-none"
              >
                Resend
              </button>
            </p>

          </CardContent>

          {/* Trust strip */}
          <div className="px-7 py-3 border-t border-border bg-background/40 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-success shrink-0" />
            <span className="text-[11px] text-text-muted">
              End-to-end encrypted · SOC 2 ready · No tracking
            </span>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default OTPVerificationPage;
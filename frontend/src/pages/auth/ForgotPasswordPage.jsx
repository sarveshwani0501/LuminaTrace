import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Timer, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { authApi } from '../../api/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

const ForgotPasswordPage = () => {
  const [email, setEmail]       = useState('');
  const [error, setError]       = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent]     = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    if (!isSent) return;
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isSent, timeLeft]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const validate = () => {
    if (!email)                           { setError('Email is required'); return false; }
    if (!/\S+@\S+\.\S+/.test(email))     { setError('Enter a valid email address'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setError(null);
    try {
      await authApi.requestPasswordReset({ email });
      setIsSent(true);
      setTimeLeft(900);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4 bg-background">
      <div className="w-full max-w-md relative">

        {/* Ambient glow — amber for password reset */}
        <div className="absolute inset-0 -z-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 bg-accent-warning/10 rounded-full blur-[80px]" />
        </div>

        <Card className="relative z-10">
          <CardContent className="pt-8 pb-6 px-7 flex flex-col gap-6">

            {!isSent ? (
              /* ── Request state ─────────────────────────────── */
              <>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-11 h-11 rounded-xl bg-accent-warning/10 border border-accent-warning/25 flex items-center justify-center mb-1">
                    <Mail className="w-5 h-5 text-accent-warning" />
                  </div>
                  <h1 className="text-xl font-semibold tracking-tight text-text-primary">
                    Reset your password
                  </h1>
                  <p className="text-sm text-text-muted max-w-xs">
                    Enter your account email and we'll send you a secure OTP to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-md bg-accent-error/10 border border-accent-error/30 text-accent-error text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <Input
                    label="Email address"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    icon={Mail}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    error={error}
                    autoComplete="email"
                  />

                  <Button
                    type="submit"
                    size="md"
                    className="w-full !bg-accent-warning hover:!bg-amber-500 !shadow-none"
                    loading={isLoading}
                  >
                    {isLoading ? 'Sending OTP…' : 'Send reset OTP'}
                  </Button>
                </form>

                <div className="flex items-center justify-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors duration-fast"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to login
                  </Link>
                </div>
              </>
            ) : (
              /* ── Sent / success state ──────────────────────── */
              <div className="flex flex-col items-center gap-4 text-center py-2">
                <div className="w-14 h-14 rounded-full bg-accent-success/10 border border-accent-success/25 flex items-center justify-center">
                  {/* Different icon from request state — checkmark on envelope */}
                  <svg className="w-7 h-7 text-accent-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="6" width="20" height="14" rx="2" />
                    <path d="M2 9l10 6.5L22 9" strokeLinecap="round" />
                    <path d="M15 16l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <div>
                  <h1 className="text-xl font-semibold text-text-primary mb-1">Check your inbox</h1>
                  <p className="text-sm text-text-muted max-w-xs mx-auto">
                    We've sent an OTP to{' '}
                    <span className="font-medium text-text-primary">{email}</span>.
                    Use it to set a new password.
                  </p>
                </div>

                {/* Expiry timer */}
                <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border font-mono text-sm
                  ${timeLeft < 60
                    ? 'bg-accent-error/10 border-accent-error/30 text-accent-error'
                    : 'bg-surface border-border text-primary'
                  }`}
                >
                  <Timer className={`w-4 h-4 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
                  OTP expires in {formatTime(timeLeft)}
                </div>

                <div className="w-full h-px bg-border" />

                <div className="w-full flex flex-col gap-3">
                  <p className="text-xs text-text-muted">
                    Didn't receive it? Check your spam folder or try another email.
                  </p>
                  <Button
                    variant="ghost"
                    size="md"
                    className="w-full"
                    icon={<RefreshCw className="w-4 h-4" />}
                    onClick={() => { setIsSent(false); setError(null); }}
                  >
                    Try another email
                  </Button>
                </div>
              </div>
            )}
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

export default ForgotPasswordPage;
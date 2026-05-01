import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { KeyRound, ShieldCheck, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { authApi } from '../../api/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

/* ── Password strength (reused from SignupPage) ─────────────────── */
const getStrength = (pw) => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)            s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', 'bg-accent-error', 'bg-accent-warning', 'bg-secondary', 'bg-accent-success'];
const STRENGTH_TEXT   = ['', 'text-accent-error', 'text-accent-warning', 'text-secondary', 'text-accent-success'];

const PasswordStrength = ({ password }) => {
  const s = getStrength(password);
  if (!password) return null;
  return (
    <div className="mt-1.5 flex flex-col gap-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-base ${i <= s ? STRENGTH_COLORS[s] : 'bg-border-light'}`} />
        ))}
      </div>
      <span className={`text-[10px] font-mono ${STRENGTH_TEXT[s]}`}>{STRENGTH_LABELS[s]}</span>
    </div>
  );
};

/* ── Invalid token fallback ─────────────────────────────────────── */
const InvalidTokenView = () => (
  <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4 bg-background">
    <div className="w-full max-w-md">
      <Card>
        <CardContent className="pt-8 pb-6 px-7 flex flex-col items-center gap-5 text-center">
          <div className="w-14 h-14 rounded-full bg-accent-error/10 border border-accent-error/25 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-accent-error" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-primary mb-2">Invalid reset link</h1>
            <p className="text-sm text-text-muted max-w-xs mx-auto">
              This password reset link is invalid or has expired. Please request a new one from the login page.
            </p>
          </div>
          <Link to="/forgot-password" className="w-full">
            <Button variant="secondary" size="md" className="w-full">
              Request new reset link
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  </div>
);

/* ── Page ───────────────────────────────────────────────────────── */
const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token          = searchParams.get('token');
  const navigate       = useNavigate();

  const [data, setData]         = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors]     = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!token) return <InvalidTokenView />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (!data.newPassword)                      e.newPassword = 'Password is required';
    else if (data.newPassword.length < 8)       e.newPassword = 'Must be at least 8 characters';
    if (!data.confirmPassword)                  e.confirmPassword = 'Confirm your password';
    else if (data.newPassword !== data.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: data.newPassword });
      setIsSuccess(true);
    } catch (err) {
      setErrors({ global: err.response?.data?.message || 'Token has expired or is invalid. Please request a new link.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4 bg-background">
      <div className="w-full max-w-md relative">

        {/* Ambient glow — violet */}
        <div className="absolute inset-0 -z-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 bg-primary/12 rounded-full blur-[80px]" />
        </div>

        <Card className="relative z-10">
          <CardContent className="pt-8 pb-6 px-7 flex flex-col gap-6">

            {!isSuccess ? (
              <>
                {/* Header */}
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-1 relative">
                    <KeyRound className="w-5 h-5 text-primary" />
                    {/* Verified badge */}
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-accent-success border-2 border-background flex items-center justify-center">
                      <svg className="w-1.5 h-1.5" viewBox="0 0 6 6" fill="none" stroke="white" strokeWidth="1.5">
                        <path d="M1 3l1.5 1.5L5 1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                  <h1 className="text-xl font-semibold tracking-tight text-text-primary">
                    Set new password
                  </h1>
                  <p className="text-sm text-text-muted">
                    Identity verified. Choose a strong new password below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {errors.global && (
                    <div className="flex items-center gap-2 p-3 rounded-md bg-accent-error/10 border border-accent-error/30 text-accent-error text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errors.global}
                    </div>
                  )}

                  {/* New password + strength */}
                  <div>
                    <Input
                      label="New password"
                      name="newPassword"
                      type="password"
                      placeholder="At least 8 characters"
                      icon={Lock}
                      value={data.newPassword}
                      onChange={handleChange}
                      error={errors.newPassword}
                      autoComplete="new-password"
                    />
                    <PasswordStrength password={data.newPassword} />
                  </div>

                  {/* Confirm */}
                  <Input
                    label="Confirm new password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    icon={Lock}
                    value={data.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    autoComplete="new-password"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full mt-1"
                    loading={isLoading}
                  >
                    {isLoading ? 'Updating password…' : 'Update password'}
                  </Button>
                </form>
              </>
            ) : (
              /* ── Success state ─────────────────────────────── */
              <div className="flex flex-col items-center gap-5 text-center py-2">
                <div className="w-14 h-14 rounded-full bg-accent-success/10 border border-accent-success/25 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-accent-success" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-text-primary mb-2">Password updated</h1>
                  <p className="text-sm text-text-muted max-w-xs mx-auto">
                    Your password has been successfully updated. You can now log in with your new credentials.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigate('/login')}
                >
                  Go to login
                </Button>
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

export default ResetPasswordPage;
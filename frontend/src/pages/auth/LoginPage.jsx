import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import { Mail, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

/* LuminaTrace logomark */
const LogoMark = () => (
  <svg viewBox="0 0 22 22" fill="none" className="w-5 h-5">
    <path
      d="M11 2L3 7v8l8 5 8-5V7L11 2z"
      stroke="#7C3AED" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
    />
    <circle cx="11" cy="11" r="2.5" fill="#7C3AED" />
  </svg>
);

const LoginPage = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const [data, setData]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (!data.email)                          e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email)) e.email = 'Invalid email format';
    if (!data.password)                       e.password = 'Password is required';
    else if (data.password.length < 8)        e.password = 'Must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await dispatch(loginUser(data)).unwrap();
      navigate('/app/dashboard');
    } catch (err) {
      setErrors({ global: err || 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4 bg-background">
      <div className="w-full max-w-md relative">

        {/* Ambient glow — violet for login */}
        <div className="absolute inset-0 -z-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 bg-primary/15 rounded-full blur-[80px]" />
        </div>

        <Card className="relative z-10">
          <CardContent className="pt-8 pb-6 px-7 flex flex-col gap-6">

            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-1">
                <LogoMark />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-text-primary">
                Welcome back
              </h1>
              <p className="text-sm text-text-muted">
                Sign in to your LuminaTrace workspace
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Global error */}
              {errors.global && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-accent-error/10 border border-accent-error/30 text-accent-error text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errors.global}
                </div>
              )}

              {/* Email */}
              <Input
                label="Email address"
                name="email"
                type="email"
                placeholder="name@company.com"
                icon={Mail}
                value={data.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
              />

              {/* Password — label row with inline forgot link */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-secondary">Password</span>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:text-primary-hover transition-colors duration-fast"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={data.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-1"
                loading={isLoading}
              >
                {isLoading ? 'Authenticating…' : 'Sign in to workspace'}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-muted">new to luminatrace?</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Signup link */}
            <p className="text-center text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary hover:text-primary-hover font-medium transition-colors duration-fast"
              >
                Create one →
              </Link>
            </p>
          </CardContent>

          {/* Trust footer strip */}
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

export default LoginPage;
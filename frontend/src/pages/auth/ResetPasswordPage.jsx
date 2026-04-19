import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { authApi } from '../../api/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [data, setData] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!data.newPassword) newErrors.newPassword = 'Password is required';
    else if (data.newPassword.length < 8) newErrors.newPassword = 'Must be at least 8 characters';
    
    if (!data.confirmPassword) newErrors.confirmPassword = 'Confirm your password';
    else if (data.newPassword !== data.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    try {
      await authApi.resetPassword({ token, newPassword: data.newPassword });
      setIsSuccess(true);
    } catch (err) {
      setErrors({ global: err.response?.data?.message || 'The token has expired or is invalid. Please request a new link.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Invalid Link</h1>
        <p className="text-text-secondary mb-6 max-w-md">This password reset link is invalid or missing a security token. Please request a new link from the login page.</p>
        <Link to="/forgot-password">
          <Button variant="secondary">Request Reset Link</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-full max-w-md relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <Card className="relative z-10 w-full p-2">
          <CardContent className="flex flex-col space-y-6 pt-6">
            {!isSuccess ? (
              <>
                <div className="text-center space-y-2">
                  <div className="inline-flex justify-center items-center w-12 h-12 rounded-xl bg-surface-active mb-2 border border-border-light shadow-glass relative">
                    <KeyRound className="w-6 h-6 text-primary" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-success rounded-full border-2 border-surface-active animate-pulse"></div>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-text-primary">Establish New Password</h1>
                  <p className="text-sm text-text-secondary">Your identity has been verified. Choose a strong new password below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {errors.global && (
                    <div className="p-3 bg-accent-error/10 border border-accent-error/50 rounded text-sm text-accent-error text-center">
                      {errors.global}
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-text-primary">New Password</label>
                    <Input 
                      name="newPassword"
                      type="password"
                      placeholder="••••••••" 
                      value={data.newPassword}
                      onChange={e => setData({ ...data, newPassword: e.target.value })}
                      error={errors.newPassword}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-text-primary">Confirm New Password</label>
                    <Input 
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••" 
                      value={data.confirmPassword}
                      onChange={e => setData({ ...data, confirmPassword: e.target.value })}
                      error={errors.confirmPassword}
                    />
                  </div>

                  <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                    {isLoading ? 'Updating Password...' : 'Update Password'}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-6 py-4">
                <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-accent-success/10 border border-accent-success/30 shadow-[0_0_20px_rgba(39,201,63,0.2)] mb-2">
                  <ShieldCheck className="w-8 h-8 text-accent-success" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">Password Reset!</h1>
                <p className="text-sm text-text-secondary max-w-sm mx-auto">
                  Your password has been successfully updated. You can now log into your account using your new credentials.
                </p>
                <div className="pt-4">
                  <Button onClick={() => navigate('/login')} className="w-full">
                    Go to Log in
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

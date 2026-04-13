import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Timer } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes = 900 seconds

  useEffect(() => {
    let timer;
    if (isSent && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft <= 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isSent, timeLeft]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement actual Axios hit to /auth/password-reset/request
      console.log('Requesting reset for: ', email);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setIsSent(true);
      setTimeLeft(900); // reset timer if they submit again
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-full max-w-md relative">
        {/* Background ambient glow matching theme */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent-warning/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <Card className="relative z-10 w-full p-2">
          <CardContent className="flex flex-col space-y-6 pt-6">
            {!isSent ? (
              <>
                <div className="text-center space-y-2">
                  <div className="inline-flex justify-center items-center w-12 h-12 rounded-xl bg-surface-active mb-2 border border-border-light shadow-glass">
                    <Mail className="w-6 h-6 text-accent-warning" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-text-primary">Reset Password</h1>
                  <p className="text-sm text-text-secondary">
                    Enter the email associated with your account and we'll send you a secure link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-accent-error/10 border border-accent-error/50 rounded text-sm text-accent-error text-center">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-text-primary">Email</label>
                    <Input 
                      name="email"
                      type="email" 
                      placeholder="name@company.com" 
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      error={error ? true : false}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-accent-warning hover:bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.3)] border-amber-500 mt-2" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>

                <div className="text-center text-sm">
                  <Link to="/login" className="text-text-secondary hover:text-white font-medium flex items-center justify-center transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Log in
                  </Link>
                </div>
              </>
            ) : (
              // Success State
              <div className="text-center space-y-6 py-4">
                <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-accent-success/10 border border-accent-success/30 shadow-[0_0_20px_rgba(39,201,63,0.2)] mb-2">
                  <Mail className="w-8 h-8 text-accent-success" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">Check your inbox</h1>
                <p className="text-sm text-text-secondary max-w-sm mx-auto">
                  We've emailed a password reset link to <span className="font-medium text-white">{email}</span>. Click the link to securely choose a new password.
                </p>

                <div className="inline-flex items-center space-x-2 bg-surface text-text-muted px-4 py-3 rounded-xl border border-border text-sm font-mono shadow-inner">
                  <Timer className={`w-4 h-4 ${timeLeft < 60 ? 'text-accent-error animate-pulse' : 'text-primary'}`} />
                  <span className={`${timeLeft < 60 ? 'text-accent-error' : 'text-text-primary'}`}>
                    Link expires in {formatTime(timeLeft)}
                  </span>
                </div>

                <div className="pt-6 border-t border-border mt-4">
                  <p className="text-sm text-text-secondary mb-4">Didn't receive it? Check your spam folder.</p>
                  <Button variant="secondary" className="w-full" onClick={() => setIsSent(false)}>
                    Try another email
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

export default ForgotPasswordPage;

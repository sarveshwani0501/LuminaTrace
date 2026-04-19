import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyOTP } from '../../store/slices/authSlice';
import { authApi } from '../../api/auth';
import { MailCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const email = location.state?.email || 'your email';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    // If accessed directly without an email, redirect back to signup
    if (!location.state?.email) {
      navigate('/signup');
    }
  }, [location, navigate]);

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // allow only one char per input
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // move to next input
    if (value && index < 5 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if empty
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs[index - 1].current) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pasteData.some(char => isNaN(char))) return;
    
    const newOtp = [...otp];
    pasteData.forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    
    // Focus last filled input
    const focusIndex = Math.min(pasteData.length, 5);
    inputRefs[focusIndex]?.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await dispatch(verifyOTP({ email, otp: otpValue })).unwrap();
      navigate('/login');
    } catch (err) {
      setError(err || 'Invalid or expired verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
     try {
        await authApi.sendVerificationEmail({ email });
        alert('Verification email sent!');
     } catch (err) {
        alert(err.response?.data?.message || 'Failed to resend');
     }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-full max-w-md relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent-success/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <Card className="relative z-10 w-full p-2">
          <CardContent className="flex flex-col space-y-6 pt-6">
            <div className="text-center space-y-2">
              <div className="inline-flex justify-center items-center w-12 h-12 rounded-xl bg-surface-active mb-2 border border-border-light shadow-glass relative">
                <MailCheck className="w-6 h-6 text-accent-success" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Check your email</h1>
              <p className="text-sm text-text-secondary">
                We've sent a 6-digit verification code to <br className="hidden md:block"/>
                <span className="font-semibold text-text-primary">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-accent-error/10 border border-accent-error/50 rounded text-sm text-accent-error text-center">
                  {error}
                </div>
              )}
              
              <div className="flex justify-center gap-2 sm:gap-4" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border border-border bg-background text-text-primary focus:border-accent-success focus:ring-2 focus:ring-accent-success focus:outline-none transition-all shadow-glass"
                  />
                ))}
              </div>

              <Button type="submit" variant="primary" className="w-full bg-accent-success hover:bg-emerald-600 shadow-glow-secondary" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>

            <div className="text-center text-sm text-text-secondary">
              Didn't receive the code?{' '}
              <button type="button" onClick={handleResend} className="text-accent-success hover:text-white font-medium hover:underline">
                Resend
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OTPVerificationPage;

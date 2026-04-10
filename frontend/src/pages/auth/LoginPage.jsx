import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

const LoginPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!data.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = 'Invalid email format';
    
    if (!data.password) newErrors.password = 'Password is required';
    else if (data.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    
    try {
      // TODO: Implement actual Axios API call to /auth/login
      // const response = await api.post('/auth/login', data);
      
      console.log('Login Placeholder Triggered', data);
      
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // On success, redirect to app loop
      // navigate('/app/dashboard');
    } catch (err) {
      setErrors({ global: 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-full max-w-md relative">
        {/* Background ambient glow matching theme */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <Card className="relative z-10 w-full p-2">
          <CardContent className="flex flex-col space-y-6 pt-6">
            <div className="text-center space-y-2">
              <div className="inline-flex justify-center items-center w-12 h-12 rounded-xl bg-surface-active mb-2 border border-border-light shadow-glass">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Welcome back</h1>
              <p className="text-sm text-text-secondary">Enter your credentials to access your telemetry</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.global && (
                <div className="p-3 bg-accent-error/10 border border-accent-error/50 rounded text-sm text-accent-error text-center">
                  {errors.global}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-primary">Email</label>
                <Input 
                  name="email"
                  type="email" 
                  placeholder="name@company.com" 
                  value={data.email}
                  onChange={handleChange}
                  error={errors.email}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text-primary">Password</label>
                  <a href="#" className="text-xs text-primary hover:text-primary-hover">Forgot password?</a>
                </div>
                <Input 
                  name="password"
                  type="password" 
                  placeholder="••••••••" 
                  value={data.password}
                  onChange={handleChange}
                  error={errors.password}
                />
              </div>

              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? 'Authenticating...' : 'Log in'}
              </Button>
            </form>

            <div className="text-center text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:text-primary-hover font-medium">Sign up</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;

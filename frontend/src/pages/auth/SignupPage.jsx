import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

const SignupPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ 
    full_name: '', 
    email: '', 
    password: '', 
    confirm_password: '',
    organization_name: '' 
  });
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
    if (!data.full_name) newErrors.full_name = 'Full name is required';
    else if (data.full_name.length < 2) newErrors.full_name = 'Name must be at least 2 characters';
    
    if (!data.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = 'Invalid email format';
    
    if (!data.password) newErrors.password = 'Password is required';
    else if (data.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (!data.confirm_password) newErrors.confirm_password = 'Confirm your password';
    else if (data.password !== data.confirm_password) newErrors.confirm_password = 'Passwords do not match';

    if (!data.organization_name) newErrors.organization_name = 'Organization name is required';
    else if (data.organization_name.length < 2) newErrors.organization_name = 'Must be at least 2 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    
    try {
      // Removing confirm_password before sending to backend to match schema
      const submitData = {
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        organization_name: data.organization_name
      };

      // TODO: Implement actual Axios API call to /auth/signup
      // const response = await api.post('/auth/signup', submitData);
      
      console.log('Signup Placeholder Triggered', submitData);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // On success, redirect to OTP view and pass email via state
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err) {
      setErrors({ global: 'Failed to create account. Email may already be in use.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg relative">
        {/* Background ambient glow matching theme */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-secondary/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <Card className="relative z-10 w-full p-2">
          <CardContent className="flex flex-col space-y-6 pt-6">
            <div className="text-center space-y-2">
               <div className="inline-flex justify-center items-center w-12 h-12 rounded-xl bg-surface-active mb-2 border border-border-light shadow-glass">
                <Target className="w-6 h-6 text-secondary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Create an account</h1>
              <p className="text-sm text-text-secondary">Start monitoring your distributed systems.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.global && (
                <div className="p-3 bg-accent-error/10 border border-accent-error/50 rounded text-sm text-accent-error text-center">
                  {errors.global}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-primary">Full Name</label>
                  <Input 
                    name="full_name"
                    placeholder="Jane Doe" 
                    value={data.full_name}
                    onChange={handleChange}
                    error={errors.full_name}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-primary">Work Email</label>
                  <Input 
                    name="email"
                    type="email" 
                    placeholder="jane@company.com" 
                    value={data.email}
                    onChange={handleChange}
                    error={errors.email}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-primary">Password</label>
                  <Input 
                    name="password"
                    type="password" 
                    placeholder="At least 8 chars" 
                    value={data.password}
                    onChange={handleChange}
                    error={errors.password}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-primary">Confirm Password</label>
                  <Input 
                    name="confirm_password"
                    type="password" 
                    placeholder="Repeat password" 
                    value={data.confirm_password}
                    onChange={handleChange}
                    error={errors.confirm_password}
                  />
                </div>
              </div>

              <div className="space-y-1 pt-2">
                 <label className="text-sm font-medium text-text-primary">Organization Name <span className="text-accent-error">*</span></label>
                 <Input 
                   name="organization_name"
                   placeholder="My Awesome Startup" 
                   value={data.organization_name}
                   onChange={handleChange}
                   error={errors.organization_name}
                 />
                 <p className="text-xs text-text-muted mt-1">You will be designated as the owner of this organization.</p>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center text-sm text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-secondary hover:text-white font-medium">Log in</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;

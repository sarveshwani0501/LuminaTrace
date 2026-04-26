import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserPlus, Building2, CheckCircle2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { invitesApi } from '../../api/invites';

const InvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Initialization states
  const [isLoading, setIsLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [pageError, setPageError] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ full_name: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchInviteData = async () => {
      try {
        const response = await invitesApi.getInviteInfo(token);
        setInviteData(response.data);
      } catch (err) {
        setPageError('This invite link is invalid, expired, or has already been used.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchInviteData();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!inviteData.existingUser && !formData.full_name.trim()) {
      errors.full_name = "Full name is required";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!inviteData.existingUser && formData.password.length < 8) {
      errors.password = "Must be at least 8 characters";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFormErrors({});

    try {
      let authResponse;
      
      if (inviteData.existingUser) {
        authResponse = await invitesApi.acceptAsExistingUser(token, { 
           email: inviteData.email, 
           password: formData.password 
        });
      } else {
        authResponse = await invitesApi.acceptAsNewUser(token, { 
           full_name: formData.full_name, 
           password: formData.password 
        });
      }

      // Automatically authenticate the user natively using the fastify cookie injection payload
      if (authResponse.data && authResponse.data.user) {
         dispatch(setUser(authResponse.data.user));
         // By triggering a hard reload locally, Redux bootstrapper will execute `/auth/verify` natively grabbing the new org list!
      }

      setIsSuccess(true);
      
      setTimeout(() => {
         window.location.href = '/app/dashboard'; 
      }, 1500);

    } catch (err) {
      setFormErrors({ global: err.response?.data?.message || err.response?.data?.error || 'Invalid credentials or failed to accept invite.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen px-4">
        <div className="w-12 h-12 rounded-full border-4 border-surface-active border-t-primary animate-spin"></div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Invalid Invite</h1>
        <p className="text-text-secondary mb-6 max-w-md">{pageError}</p>
        <Link to="/">
          <Button variant="secondary">Go to Homepage</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-full max-w-md relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-secondary/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <Card className="relative z-10 w-full p-2">
          <CardContent className="flex flex-col space-y-6 pt-6">
            {!isSuccess ? (
              <>
                <div className="text-center space-y-3">
                  <div className="inline-flex justify-center items-center w-14 h-14 rounded-2xl bg-surface-active mb-2 border border-border-light shadow-glass">
                    <Building2 className="w-7 h-7 text-secondary" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-text-primary">Join {inviteData.organization_name}</h1>
                  <p className="text-sm text-text-secondary max-w-xs mx-auto">
                    You have been invited to collaborate as a <span className="font-semibold text-secondary capitalize">{inviteData.role}</span>.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  {formErrors.global && (
                    <div className="p-3 bg-accent-error/10 border border-accent-error/50 rounded text-sm text-accent-error text-center">
                      {formErrors.global}
                    </div>
                  )}

                  {/* The email is strictly locked to what the invite was generated for */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-text-secondary">Invited Email</label>
                    <Input 
                      value={inviteData.email}
                      disabled
                      className="bg-surface opacity-70 cursor-not-allowed"
                    />
                  </div>

                  {inviteData.existingUser ? (
                    // ─── EXISTING USER SCENARIO ───
                    <div className="space-y-1 mt-4">
                      <div className="flex items-center space-x-2 mb-3 bg-secondary/10 p-3 rounded-lg border border-secondary/20">
                        <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                        <p className="text-xs text-text-primary">
                          We found an existing account for this email. Validate your password to join this new organization.
                        </p>
                      </div>
                      <label className="text-sm font-medium text-text-primary">Verify Password</label>
                      <Input 
                        name="password"
                        type="password"
                        placeholder="••••••••" 
                        value={formData.password}
                        onChange={handleChange}
                        error={formErrors.password}
                      />
                    </div>
                  ) : (
                    // ─── NEW USER SCENARIO ───
                    <>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-text-primary">Full Name</label>
                        <Input 
                          name="full_name"
                          placeholder="John Doe" 
                          value={formData.full_name}
                          onChange={handleChange}
                          error={formErrors.full_name}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-text-primary">Create Password</label>
                        <Input 
                          name="password"
                          type="password"
                          placeholder="••••••••" 
                          value={formData.password}
                          onChange={handleChange}
                          error={formErrors.password}
                        />
                      </div>
                    </>
                  )}

                  <Button type="submit" className="w-full mt-4 shadow-glow-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Joining...' : inviteData.existingUser ? 'Accept Invite' : 'Create Account & Join'}
                  </Button>
                </form>
                
                <p className="text-xs text-center text-text-muted mt-4">
                  By accepting, you agree to LuminaTrace's Terms of Service and Privacy Policy.
                </p>
              </>
            ) : (
              // ─── SUCCESS STATE ───
              <div className="text-center space-y-6 py-8">
                <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-accent-success/10 border border-accent-success/30 shadow-[0_0_20px_rgba(39,201,63,0.2)] mb-2 animate-bounce">
                  <UserPlus className="w-8 h-8 text-accent-success" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">Welcome to the team!</h1>
                <p className="text-sm text-text-secondary">
                  You have successfully joined <span className="font-semibold text-white">{inviteData.organization_name}</span>. Redirecting you to the dashboard...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvitePage;

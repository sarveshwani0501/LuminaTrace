import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserPlus, Building2, CheckCircle2, Lock, User, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { invitesApi } from '../../api/invites';

/* ── Loading skeleton ───────────────────────────────────────────── */
const LoadingView = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-border border-t-secondary animate-spin" />
      <span className="text-sm text-text-muted font-mono">Validating invite…</span>
    </div>
  </div>
);

/* ── Invalid invite fallback ────────────────────────────────────── */
const InvalidInviteView = ({ message }) => (
  <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4 bg-background">
    <div className="w-full max-w-md">
      <Card>
        <CardContent className="pt-8 pb-6 px-7 flex flex-col items-center gap-5 text-center">
          <div className="w-14 h-14 rounded-full bg-accent-error/10 border border-accent-error/25 flex items-center justify-center">
            <Building2 className="w-7 h-7 text-accent-error" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-primary mb-2">Invalid invite</h1>
            <p className="text-sm text-text-muted max-w-xs mx-auto">{message}</p>
          </div>
          <Link to="/" className="w-full">
            <Button variant="secondary" size="md" className="w-full">Go to homepage</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  </div>
);

/* ── Page ───────────────────────────────────────────────────────── */
const InvitePage = () => {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();

  const [isLoading, setIsLoading]   = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [pageError, setPageError]   = useState(null);

  const [formData, setFormData]     = useState({ full_name: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]   = useState(false);

  useEffect(() => {
    if (!token) return;
    invitesApi.getInviteInfo(token)
      .then(r => setInviteData(r.data))
      .catch(() => setPageError('This invite link is invalid, expired, or has already been used.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (!inviteData.existingUser && !formData.full_name.trim()) e.full_name = 'Full name is required';
    if (!formData.password)                                      e.password = 'Password is required';
    else if (!inviteData.existingUser && formData.password.length < 8) e.password = 'Must be at least 8 characters';
    setFormErrors(e);
    return Object.keys(e).length === 0;
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
          password: formData.password,
        });
      } else {
        authResponse = await invitesApi.acceptAsNewUser(token, {
          full_name: formData.full_name,
          password: formData.password,
        });
      }
      if (authResponse.data?.user) dispatch(setUser(authResponse.data.user));
      setIsSuccess(true);
      setTimeout(() => { window.location.href = '/app/dashboard'; }, 1500);
    } catch (err) {
      setFormErrors({
        global: err.response?.data?.message || err.response?.data?.error || 'Invalid credentials or failed to accept invite.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)  return <LoadingView />;
  if (pageError)  return <InvalidInviteView message={pageError} />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4 bg-background">
      <div className="w-full max-w-md relative">

        {/* Ambient glow — cyan for invites */}
        <div className="absolute inset-0 -z-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 bg-secondary/8 rounded-full blur-[80px]" />
        </div>

        <Card className="relative z-10">
          <CardContent className="pt-8 pb-6 px-7 flex flex-col gap-6">

            {!isSuccess ? (
              <>
                {/* Header */}
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-11 h-11 rounded-xl bg-secondary/10 border border-secondary/25 flex items-center justify-center mb-1">
                    <Building2 className="w-5 h-5 text-secondary" />
                  </div>
                  <h1 className="text-xl font-semibold tracking-tight text-text-primary">
                    Join {inviteData.organization_name}
                  </h1>
                  <p className="text-sm text-text-muted">
                    You've been invited to collaborate as a{' '}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-badge bg-secondary/10 text-secondary border border-secondary/20 text-xs font-mono capitalize">
                      {inviteData.role}
                    </span>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                  {formErrors.global && (
                    <div className="flex items-center gap-2 p-3 rounded-md bg-accent-error/10 border border-accent-error/30 text-accent-error text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {formErrors.global}
                    </div>
                  )}

                  {/* Locked email */}
                  <Input
                    label="Invited email"
                    value={inviteData.email}
                    disabled
                    hint="This email is locked to the invite."
                  />

                  {inviteData.existingUser ? (
                    /* ── Existing user ── */
                    <>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/6 border border-secondary/20">
                        <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                        <p className="text-xs text-text-secondary leading-relaxed">
                          We found an existing account for this email.
                          Confirm your password to join <span className="text-text-primary font-medium">{inviteData.organization_name}</span>.
                        </p>
                      </div>
                      <Input
                        label="Verify your password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={formData.password}
                        onChange={handleChange}
                        error={formErrors.password}
                        autoComplete="current-password"
                      />
                    </>
                  ) : (
                    /* ── New user ── */
                    <>
                      <Input
                        label="Full name"
                        name="full_name"
                        placeholder="Jane Doe"
                        icon={User}
                        value={formData.full_name}
                        onChange={handleChange}
                        error={formErrors.full_name}
                        autoComplete="name"
                      />
                      <Input
                        label="Create a password"
                        name="password"
                        type="password"
                        placeholder="At least 8 characters"
                        icon={Lock}
                        value={formData.password}
                        onChange={handleChange}
                        error={formErrors.password}
                        hint="Min. 8 characters"
                        autoComplete="new-password"
                      />
                    </>
                  )}

                  <Button
                    type="submit"
                    variant="outline"
                    size="md"
                    className="w-full mt-1 !text-secondary !border-secondary/40 hover:!bg-secondary/10 hover:!border-secondary"
                    loading={isSubmitting}
                  >
                    {isSubmitting
                      ? 'Joining…'
                      : inviteData.existingUser ? 'Accept invite' : 'Create account & join'
                    }
                  </Button>
                </form>

                <p className="text-[11px] text-center text-text-muted">
                  By accepting, you agree to LuminaTrace's{' '}
                  <span className="text-text-secondary underline underline-offset-2 cursor-pointer">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-text-secondary underline underline-offset-2 cursor-pointer">Privacy Policy</span>.
                </p>
              </>
            ) : (
              /* ── Success state ─────────────────────────────── */
              <div className="flex flex-col items-center gap-5 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-accent-success/10 border border-accent-success/25 flex items-center justify-center">
                  {/* Steady icon — no bounce */}
                  <UserPlus className="w-7 h-7 text-accent-success" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-text-primary mb-2">Welcome to the team!</h1>
                  <p className="text-sm text-text-muted max-w-xs mx-auto">
                    You've joined{' '}
                    <span className="font-medium text-text-primary">{inviteData.organization_name}</span>.
                    Redirecting you to your dashboard…
                  </p>
                </div>
                {/* Redirect indicator */}
                <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Taking you to the dashboard
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

export default InvitePage;
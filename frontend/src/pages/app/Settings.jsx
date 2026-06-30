import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShieldCheck, Map, Users, Copy, Check,
  Trash2, RotateCw, CheckCircle2, AlertTriangle,
  Send, X, Inbox, KeyRound, Lock, Mail, User
} from 'lucide-react';
import { authApi }    from '../../api/auth';
import { projectApi } from '../../api/project';
import { orgApi }     from '../../api/org';
import { fetchProjects }      from '../../store/slices/projectSlice';
import { fetchOrganizations } from '../../store/slices/orgSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';


const useFeedback = () => {
  const [msg, setMsg] = useState(null);
  const show = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3500);
  };
  return [msg, show];
};


const CopyButton = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      title={`Copy ${label}`}
      className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-md transition-colors duration-fast"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-accent-success" />
        : <Copy className="w-3.5 h-3.5" />
      }
    </button>
  );
};


const InlineFeedback = ({ msg }) => {
  if (!msg) return null;
  const isError = msg.type === 'error';
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm
      ${isError
        ? 'bg-accent-error/10 text-accent-error border border-accent-error/25'
        : 'bg-accent-success/10 text-accent-success border border-accent-success/25'
      }`}
    >
      {isError
        ? <AlertTriangle className="w-4 h-4 shrink-0" />
        : <CheckCircle2 className="w-4 h-4 shrink-0" />
      }
      <span>{msg.text}</span>
    </div>
  );
};


const ListEmpty = ({ label }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
    <Inbox className="w-8 h-8 text-border" />
    <p className="text-xs font-mono text-text-muted">{label}</p>
  </div>
);


const Section = ({ title, subtitle, children, className = '' }) => (
  <div className={`bg-surface border border-border rounded-card overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-border bg-background/30">
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);


const MemberAvatar = ({ name, email }) => {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : (email?.[0] ?? '?').toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
      <span className="text-xs font-semibold text-primary font-mono">{initials}</span>
    </div>
  );
};


const DangerActionModal = ({ title, description, expectedText, confirmLabel, onClose, onConfirm }) => {
  const [inputText, setInputText] = useState('');
  const isMatch = inputText === expectedText;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isMatch) onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-accent-error/30 rounded-card shadow-elevated w-full max-w-lg overflow-hidden relative">

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-error/8 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-accent-error/20 bg-accent-error/5">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-accent-error" />
            <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-md transition-colors duration-fast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <p className="text-sm text-text-secondary leading-relaxed">{description}</p>

          <div className="bg-surface border border-border rounded-md p-4 flex flex-col gap-2">
            <label className="text-xs text-text-muted">
              Type <span className="font-mono font-semibold text-text-primary select-all">{expectedText}</span> to confirm.
            </label>
            <input
              required
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className={`w-full bg-background border rounded-md px-3 py-2 font-mono text-sm text-text-primary
                focus:outline-none focus:ring-2 ring-offset-0 transition-[border-color,box-shadow] duration-fast
                ${isMatch
                  ? 'border-accent-error focus:border-accent-error focus:ring-accent-error/20'
                  : 'border-border hover:border-border-light focus:border-accent-error focus:ring-accent-error/15'
                }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              disabled={!isMatch}
            >
              {confirmLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


const Settings = () => {
  const dispatch = useDispatch();
  const { currentOrg }     = useSelector(state => state.org);
  const { currentProject } = useSelector(state => state.project);
  const { user }           = useSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState('profile');

  const [activeDangerModal, setActiveDangerModal] = useState(null);
  const [pwdForm, setPwdForm]         = useState({ current: '', next: '', confirm: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [projectNameInput, setProjectNameInput] = useState('');

  const [members, setMembers]               = useState([]);
  const [invites, setInvites]               = useState([]);
  const [isLoadingOrgData, setIsLoadingOrgData] = useState(false);

  const isOwner          = currentOrg?.role === 'owner';
  const canManageProject = isOwner;
  const canDeleteProject = isOwner;
  const canManageMembers = isOwner;

  const apiKeyDisplay = currentProject?.api_key_preview
    ? `${currentProject.api_key_preview}${'•'.repeat(28)}`
    : null;

  const [pwdFeedback,    showPwdFeedback]    = useFeedback();
  const [projFeedback,   showProjFeedback]   = useFeedback();
  const [inviteFeedback, showInviteFeedback] = useFeedback();

  useEffect(() => {
    if (currentProject) setProjectNameInput(currentProject.name || '');
  }, [currentProject]);

  const loadOrgData = useCallback(async () => {
    if (activeTab !== 'org' || !currentOrg) return;
    setIsLoadingOrgData(true);
    try {
      const [memRes, invRes] = await Promise.allSettled([
        orgApi.getMembers(currentOrg.id),
        isOwner
          ? orgApi.getInvites(currentOrg.id)
          : Promise.resolve({ data: { invites: [] } }),
      ]);
      if (memRes.status === 'fulfilled') setMembers(memRes.value.data.organizationMembers || memRes.value.data || []);
      if (invRes.status === 'fulfilled') {
        const data = invRes.value.data;
        setInvites(data?.invites || (Array.isArray(data) ? data : []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingOrgData(false);
    }
  }, [activeTab, currentOrg, isOwner]);

  useEffect(() => { loadOrgData(); }, [loadOrgData]);

  /* Handlers (logic unchanged) */
  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.next !== pwdForm.confirm) {
      showPwdFeedback('New passwords do not match.', 'error');
      return;
    }
    try {
      await authApi.changePassword({ oldPassword: pwdForm.current, newPassword: pwdForm.next });
      showPwdFeedback('Password updated successfully.');
      setPwdForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      showPwdFeedback(err.response?.data?.message || 'Incorrect current password.', 'error');
    }
  };

  const handleUpdateProjectName = async () => {
    if (!currentOrg || !currentProject || !projectNameInput) return;
    try {
      await projectApi.updateProject(currentOrg.id, currentProject.id, { name: projectNameInput });
      dispatch(fetchProjects(currentOrg.id));
      showProjFeedback('Project name saved.');
    } catch (err) {
      showProjFeedback('Failed to update project name.', 'error');
    }
  };

  const handleRotateKey = async () => {
    try {
      await projectApi.rotateApiKey(currentOrg.id, currentProject.id);
      dispatch(fetchProjects(currentOrg.id));
      showProjFeedback('API key rotated. Update all connected services immediately.');
      setActiveDangerModal(null);
    } catch (err) {
      showProjFeedback('Failed to rotate API key.', 'error');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectApi.deleteProject(currentOrg.id, currentProject.id);
      setActiveDangerModal(null);
      window.location.reload();
    } catch (err) {
      showProjFeedback('Failed to delete project.', 'error');
      setActiveDangerModal(null);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      await orgApi.createInvite(currentOrg.id, { email: inviteEmail, role: 'member' });
      setInviteEmail('');
      loadOrgData();
      showInviteFeedback(`Invitation sent to ${inviteEmail}.`);
    } catch (err) {
      showInviteFeedback(err.response?.data?.message || 'Failed to send invitation.', 'error');
    }
  };

  const handleRevokeInvite = async (inviteId) => {
    try {
      await orgApi.deleteInvite(currentOrg.id, inviteId);
      loadOrgData();
      showInviteFeedback('Invitation revoked.');
    } catch (err) {
      showInviteFeedback('Failed to revoke invitation.', 'error');
    }
  };

  const handleExpelMember = async (memberId) => {
    try {
      await orgApi.removeMember(currentOrg.id, memberId);
      loadOrgData();
    } catch (err) {
      showInviteFeedback('Failed to remove member.', 'error');
    }
  };

  /* Tab definitions */
  const TABS = [
    { key: 'profile', label: 'Profile & security', icon: ShieldCheck, show: true },
    { key: 'project', label: 'Project',             icon: Map,         show: !!currentProject },
    { key: 'org',     label: 'Organization',        icon: Users,       show: !!currentOrg },
  ].filter(t => t.show);

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="w-full flex justify-center min-h-[calc(100vh-80px)] overflow-y-auto pb-12">
      <div className="w-full max-w-3xl px-4 pt-8 flex flex-col gap-7">

        {/* Page header */}
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Settings</h1>
            <p className="text-sm text-text-muted mt-1">
              Manage your profile, project configuration, and organization members.
            </p>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1.5 bg-surface border border-border p-1.5 rounded-lg w-fit">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-fast border focus:outline-none
                  ${activeTab === tab.key
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'border-transparent text-text-muted hover:text-text-primary hover:bg-surface-hover'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: Profile & Security */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-5">

            {/* Profile info — read only */}
            <Section title="Profile" subtitle="Your account identity — contact support to change these.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Email address</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-md opacity-70 cursor-not-allowed">
                    <Mail className="w-4 h-4 text-text-muted shrink-0" />
                    <span className="text-base text-text-secondary font-mono select-all">{user?.email || '—'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Full name</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-md opacity-70 cursor-not-allowed">
                    <User className="w-4 h-4 text-text-muted shrink-0" />
                    <span className="text-base text-text-secondary select-all">{user?.full_name || '—'}</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Change password */}
            <Section title="Change password" subtitle="Choose a strong password of at least 8 characters.">
              <form onSubmit={handlePwdSubmit} className="flex flex-col gap-4 max-w-sm">
                <Input
                  label="Current password"
                  type="password"
                  icon={Lock}
                  value={pwdForm.current}
                  onChange={e => setPwdForm({ ...pwdForm, current: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <Input
                  label="New password"
                  type="password"
                  icon={Lock}
                  value={pwdForm.next}
                  onChange={e => setPwdForm({ ...pwdForm, next: e.target.value })}
                  required
                  minLength={8}
                  hint="Minimum 8 characters"
                  autoComplete="new-password"
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  icon={Lock}
                  value={pwdForm.confirm}
                  onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                {pwdFeedback && <InlineFeedback msg={pwdFeedback} />}
                <div className="flex justify-start">
                  <Button type="submit" variant="primary" size="md">
                    Update password
                  </Button>
                </div>
              </form>
            </Section>

          </div>
        )}

        {/* TAB 2: Project Configuration */}
        {activeTab === 'project' && currentProject && (
          <div className="flex flex-col gap-5">

            {/* Project details */}
            <Section title="Project details" subtitle="Name and identifier for this monitoring workspace.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Project name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Project name</label>
                  <input
                    type="text"
                    value={projectNameInput}
                    onChange={e => setProjectNameInput(e.target.value)}
                    readOnly={!canManageProject}
                    className={`w-full bg-background border rounded-md px-3 py-2 text-base text-text-primary
                      ring-0 ring-offset-0 focus:outline-none focus:ring-2
                      transition-[border-color,box-shadow] duration-fast
                      ${canManageProject
                        ? 'border-border hover:border-border-light focus:border-primary focus:ring-primary/20'
                        : 'border-border opacity-60 cursor-not-allowed'
                      }`}
                  />
                </div>

                {/* Project ID — copy only */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Project ID</label>
                  <div className="flex items-center bg-background border border-border rounded-md pr-1 overflow-hidden">
                    <span className="flex-1 px-3 py-2 font-mono text-sm text-text-muted select-all truncate">
                      {currentProject.id}
                    </span>
                    <CopyButton text={currentProject.id} label="Project ID" />
                  </div>
                </div>
              </div>

              {canManageProject && (
                <div className="flex flex-col gap-3 mt-5 pt-5 border-t border-border">
                  {projFeedback && <InlineFeedback msg={projFeedback} />}
                  <div className="flex items-center gap-2.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setProjectNameInput(currentProject.name || '')}
                      disabled={projectNameInput === currentProject.name}
                    >
                      Discard
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleUpdateProjectName}
                      disabled={projectNameInput === currentProject.name}
                    >
                      Save changes
                    </Button>
                  </div>
                </div>
              )}
            </Section>

            {/* SDK ingestion key */}
            <Section
              title="SDK ingestion key"
              subtitle="Use this key in your SDK configuration. The full key was shown once at creation — only a preview is stored."
            >
              {apiKeyDisplay ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center bg-background border border-border rounded-md pr-1 overflow-hidden max-w-lg">
                    <span className="flex-1 px-3 py-2.5 font-mono text-sm text-primary select-all truncate">
                      {apiKeyDisplay}
                    </span>
                    <CopyButton text={currentProject.api_key_preview} label="API key preview" />
                  </div>
                  <p className="text-sm text-text-muted font-mono">
                    Only the first 12 characters are stored. Rotate below if the key has been compromised.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-accent-warning/5 border border-accent-warning/25 rounded-md max-w-lg">
                  <AlertTriangle className="w-5 h-5 text-accent-warning shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-accent-warning">Key preview unavailable</p>
                    <p className="text-sm text-text-muted mt-0.5">
                      This project was created before previews were stored. Rotate the key below to generate a new one.
                    </p>
                  </div>
                  {canManageProject && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setActiveDangerModal('rotate')}
                    >
                      Generate new key
                    </Button>
                  )}
                </div>
              )}
            </Section>

            {/* Danger zone */}
            {canManageProject && (
              <div className="border border-accent-error/25 bg-accent-error/3 rounded-card overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-error/8 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-2 px-6 py-4 border-b border-accent-error/15 bg-accent-error/5 relative z-10">
                  <AlertTriangle className="w-5 h-5 text-accent-error" />
                  <h3 className="text-base font-semibold text-accent-error">Danger zone</h3>
                </div>

                <div className="relative z-10 divide-y divide-border/50">

                  {/* Rotate key */}
                  <div className="flex items-center justify-between gap-6 px-6 py-5">
                    <div>
                      <p className="text-base font-medium text-text-primary">Rotate API key</p>
                      <p className="text-sm text-text-muted mt-0.5">
                        Immediately invalidates the current key. All connected services will stop sending data until updated.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 !text-accent-error !border-accent-error/40 hover:!bg-accent-error/8 hover:!border-accent-error"
                      onClick={() => setActiveDangerModal('rotate')}
                    >
                      <RotateCw className="w-4 h-4 mr-1.5" />
                      Rotate key
                    </Button>
                  </div>

                  {/* Delete project */}
                  {canDeleteProject && (
                    <div className="flex items-center justify-between gap-6 px-6 py-5">
                      <div>
                        <p className="text-base font-medium text-text-primary">Delete project</p>
                        <p className="text-sm text-text-muted mt-0.5">
                          Permanently removes all logs, metrics, traces, alerts and configuration. This cannot be undone.
                        </p>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        className="shrink-0"
                        onClick={() => setActiveDangerModal('delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Delete project
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Organization */}
        {activeTab === 'org' && currentOrg && (
          <div className="flex flex-col gap-5">

            {/* Invite member */}
            {canManageMembers && (
              <Section
                title="Invite member"
                subtitle="Send an email invitation. The recipient will join as a member and can be promoted later."
              >
                <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4">
                  <div className="flex gap-2.5 items-start max-w-lg">
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="colleague@company.com"
                        icon={Mail}
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        required
                        autoComplete="off"
                      />
                    </div>
                    <Button type="submit" variant="primary" size="md" icon={<Send className="w-3.5 h-3.5" />}>
                      Send invite
                    </Button>
                  </div>

                  {inviteFeedback && <InlineFeedback msg={inviteFeedback} />}
                </form>

                {/* Pending invitations */}
                {invites.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-border flex flex-col gap-2">
                    <p className="text-sm font-medium text-text-muted uppercase tracking-widest font-mono mb-1">
                      Pending invitations
                    </p>
                    {invites.map(inv => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between px-3 py-2.5 bg-background border border-border rounded-md"
                      >
                        <div className="flex items-center gap-2.5">
                          <Mail className="w-4 h-4 text-text-muted shrink-0" />
                          <span className="text-base font-mono text-text-secondary">{inv.email}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-text-muted">
                            {new Date(inv.created_at).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleRevokeInvite(inv.id)}
                            className="text-sm text-accent-error hover:text-accent-error/80 font-medium transition-colors duration-fast"
                          >
                            Revoke
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {/* Member list */}
            <div className="bg-surface border border-border rounded-card overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/30">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Members</h3>
                  <p className="text-sm text-text-muted mt-0.5">{members.length} active member{members.length !== 1 ? 's' : ''}</p>
                </div>
                <span className="text-xs font-mono text-text-muted bg-background border border-border rounded px-2 py-1">
                  {members.length} active
                </span>
              </div>

              {/* Table header */}
              <div className="grid px-6 py-2.5 border-b border-border bg-background/20 text-xs font-mono uppercase tracking-widest text-text-muted"
                style={{ gridTemplateColumns: '2fr 1fr 1fr auto' }}
              >
                <span>Member</span>
                <span>Role</span>
                <span>Joined</span>
                <span />
              </div>

              {isLoadingOrgData ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-base text-text-muted font-mono">Loading members…</p>
                </div>
              ) : members.length === 0 ? (
                <ListEmpty label="No members found in this organization." />
              ) : (
                <div className="divide-y divide-border/50">
                  {members.map(member => {
                    const isMemberOwner = member.role === 'owner';
                    const name  = member.user_name || member.full_name;
                    const email = member.user_email || member.email;
                    return (
                      <div
                        key={member.id}
                        className="grid items-center px-6 py-3.5 hover:bg-surface-hover transition-colors duration-fast"
                        style={{ gridTemplateColumns: '2fr 1fr 1fr auto' }}
                      >
                        {/* Member identity */}
                        <div className="flex items-center gap-3 min-w-0">
                          <MemberAvatar name={name} email={email} />
                          <div className="min-w-0">
                            <p className="text-base font-medium text-text-primary flex items-center gap-1.5 truncate">
                              {name || 'Member'}
                              {isMemberOwner && (
                                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                              )}
                            </p>
                            <p className="text-sm font-mono text-text-muted truncate">{email}</p>
                          </div>
                        </div>

                        {/* Role badge */}
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-badge text-xs font-mono uppercase tracking-wide border
                            ${isMemberOwner
                              ? 'text-primary bg-primary/10 border-primary/20'
                              : member.role === 'admin'
                                ? 'text-secondary bg-secondary/10 border-secondary/20'
                                : 'text-text-muted bg-surface-active border-border-light'
                            }`}
                          >
                            {member.role}
                          </span>
                        </div>

                        {/* Joined date */}
                        <span className="text-sm font-mono text-text-muted">
                          {member.joined_at
                            ? new Date(member.joined_at).toISOString().split('T')[0]
                            : '—'}
                        </span>

                        {/* Remove action */}
                        <div className="flex justify-end">
                          {canManageMembers && !isMemberOwner && (
                            <button
                              onClick={() => handleExpelMember(member.id || member.user_id)}
                              title="Remove member"
                              className="p-1.5 text-text-muted hover:text-accent-error hover:bg-accent-error/8 rounded-md transition-colors duration-fast"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Danger modals */}
      {activeDangerModal === 'rotate' && (
        <DangerActionModal
          title="Rotate API key"
          description="Rotating the key will immediately invalidate the current one. All services using it will stop sending data until you update them with the new key."
          expectedText="ROTATE"
          confirmLabel="Rotate key"
          onClose={() => setActiveDangerModal(null)}
          onConfirm={handleRotateKey}
        />
      )}

      {activeDangerModal === 'delete' && (
        <DangerActionModal
          title={`Delete project: ${currentProject?.name}`}
          description={`This will permanently delete "${currentProject?.name}" and all its logs, metrics, traces, and configuration. This action cannot be undone.`}
          expectedText={currentProject?.name}
          confirmLabel="Delete project"
          onClose={() => setActiveDangerModal(null)}
          onConfirm={handleDeleteProject}
        />
      )}

    </div>
  );
};

export default Settings;
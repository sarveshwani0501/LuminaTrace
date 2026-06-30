import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Bell, CheckCircle2, AlertTriangle, Clock,
  Server, Trash2, Filter, Plus, X, ChevronDown,
  Inbox, AlertCircle, Check
} from 'lucide-react';
import { alertsApi } from '../../api/alerts';
import Button from '../../components/ui/Button';


const AVAILABLE_METRICS = [
  { id: 'cpu_usage',          label: 'CPU Usage',              unit: '%',     placeholder: 'e.g. 85.0',   defaultCondition: '>', min: 0, max: 100    },
  { id: 'memory_used_percent',label: 'Memory Utilization',     unit: '%',     placeholder: 'e.g. 90.0',   defaultCondition: '>', min: 0, max: 100    },
  { id: 'response_time',      label: 'API Latency',            unit: 'ms',    placeholder: 'e.g. 1500',   defaultCondition: '>', min: 0, max: 60000  },
  { id: 'active_connections', label: 'Active Connections',     unit: 'count', placeholder: 'e.g. 500',    defaultCondition: '>', min: 0, max: 100000 },
  { id: 'error_count',        label: 'Error Count',            unit: 'count', placeholder: 'e.g. 50',     defaultCondition: '>', min: 0, max: 100000 },
  { id: 'http_request_count', label: 'Request Volume',         unit: 'count', placeholder: 'e.g. 10000',  defaultCondition: '>', min: 0, max: 1000000},
];

const CONDITION_OPTIONS = [
  { value: '>',  label: 'Greater than (>)'  },
  { value: '<',  label: 'Less than (<)'     },
  { value: '==', label: 'Equals (==)'       },
];


const getMetricLabel = (metricId) =>
  AVAILABLE_METRICS.find(m => m.id === metricId)?.label ?? metricId;

const getMetricUnit = (metricId) =>
  AVAILABLE_METRICS.find(m => m.id === metricId)?.unit ?? '';

const calculateDuration = (start, end) => {
  const d1 = new Date(start);
  const d2 = end ? new Date(end) : new Date();
  const diffMins = Math.floor((d2 - d1) / 60000);
  if (diffMins < 60) return `${diffMins}m`;
  const hrs = Math.floor(diffMins / 60);
  return `${hrs}h ${diffMins % 60}m`;
};


const EmptyState = ({ label, sub }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <Inbox className="w-8 h-8 text-border" />
    <div>
      <p className="text-sm font-medium text-text-muted">{label}</p>
      {sub && <p className="text-xs text-text-muted/60 mt-1 max-w-xs mx-auto">{sub}</p>}
    </div>
  </div>
);


const CustomSelect = ({ options, valueKey, labelKey, value, onChange, label, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const selectedObj = options.find(o => o[valueKey] === value) ?? options[0];

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && (
        <label className="block text-xs font-mono text-text-muted uppercase tracking-widest mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className={`w-full bg-background border rounded-md px-3 py-2 text-sm text-text-primary flex items-center justify-between
          ring-0 ring-offset-0 focus:outline-none focus:ring-2 transition-[border-color,box-shadow] duration-fast
          ${isOpen
            ? 'border-primary ring-primary/20'
            : 'border-border hover:border-border-light focus:border-primary focus:ring-primary/20'
          }`}
      >
        <span>{selectedObj[labelKey]}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-fast ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-surface-elevated border border-border-light rounded-lg shadow-elevated z-50 overflow-hidden max-h-48 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt[valueKey]}
              type="button"
              onClick={() => { onChange(opt[valueKey]); setIsOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors duration-fast text-left
                ${value === opt[valueKey]
                  ? 'bg-surface-hover text-text-primary'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
            >
              <span>{opt[labelKey]}</span>
              {value === opt[valueKey] && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    aria-checked={checked}
    role="switch"
    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-base focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background
      ${checked ? 'bg-primary' : 'bg-border-light'}`}
  >
    <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform duration-base ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
  </button>
);


const CreateRuleModal = ({ projectId, onClose, onSaveComplete }) => {
  const [formData, setFormData] = useState({
    metric_id: AVAILABLE_METRICS[0].id,
    condition: AVAILABLE_METRICS[0].defaultCondition,
    threshold: '',
    email: '',
  });
  const [errorMsg,     setErrorMsg]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeMetric = AVAILABLE_METRICS.find(m => m.id === formData.metric_id) ?? AVAILABLE_METRICS[0];

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && !isSubmitting) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.threshold || isNaN(formData.threshold)) {
      return setErrorMsg('Threshold must be a valid numeric value.');
    }

    const numericThreshold = Number(formData.threshold);
    if (activeMetric.min !== undefined && numericThreshold < activeMetric.min) {
      return setErrorMsg(`${activeMetric.label} cannot be lower than ${activeMetric.min}.`);
    }
    if (activeMetric.max !== undefined && numericThreshold > activeMetric.max) {
      return setErrorMsg(`${activeMetric.label} cannot exceed ${activeMetric.max}${activeMetric.unit === '%' ? '%' : ''}.`);
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      return setErrorMsg('Please enter a valid email address.');
    }

    try {
      setIsSubmitting(true);
      const payload = {
        metricName: activeMetric.id,
        condition:  formData.condition,
        threshold:  numericThreshold,
        email:      formData.email,
      };
      await alertsApi.createRule(projectId, payload);
      onSaveComplete();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to create alert rule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}
    >
      <div className="bg-background border border-border rounded-card shadow-elevated w-full max-w-lg overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border bg-surface">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">New alert rule</h2>
            <p className="text-xs font-mono text-text-muted mt-0.5">
              Set a threshold — get notified when it's breached
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-md transition-colors duration-fast disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 bg-background">

          {/* Error banner */}
          {errorMsg && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-accent-error/10 border border-accent-error/30 text-accent-error text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Metric selector */}
          <CustomSelect
            label="Metric"
            options={AVAILABLE_METRICS}
            valueKey="id"
            labelKey="label"
            value={formData.metric_id}
            onChange={(val) => {
              const newMetric = AVAILABLE_METRICS.find(m => m.id === val);
              setFormData({ ...formData, metric_id: val, condition: newMetric.defaultCondition, threshold: '' });
            }}
          />

          {/* Condition + Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <CustomSelect
              label="Condition"
              options={CONDITION_OPTIONS}
              valueKey="value"
              labelKey="label"
              value={formData.condition}
              onChange={(val) => setFormData({ ...formData, condition: val })}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-text-muted uppercase tracking-widest">
                  Threshold
                </label>
                <span className="text-[10px] font-mono text-primary">{activeMetric.unit}</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={activeMetric.placeholder}
                  value={formData.threshold}
                  onChange={e => {
                    const val  = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = val.split('.');
                    const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : val;
                    setFormData({ ...formData, threshold: formatted });
                  }}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 pr-10 text-sm text-text-primary placeholder:text-text-muted
                    ring-0 ring-offset-0 focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20
                    hover:border-border-light transition-[border-color,box-shadow] duration-fast"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-text-muted pointer-events-none">
                  {activeMetric.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Notification email */}
          <div>
            <label className="block text-xs font-mono text-text-muted uppercase tracking-widest mb-1.5">
              Notification email
            </label>
            <input
              type="text"
              placeholder="oncall@company.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted
                ring-0 ring-offset-0 focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20
                hover:border-border-light transition-[border-color,box-shadow] duration-fast"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create rule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


const Alerts = () => {
  const { currentProject } = useSelector(state => state.project);
  const projectId = currentProject?.id;

  const [activeTab,   setActiveTab]   = useState('history');
  const [events,      setEvents]      = useState([]);
  const [rules,       setRules]       = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading,   setIsLoading]   = useState(true);

  
  const fetchAlertData = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [rulesRes, eventsRes] = await Promise.allSettled([
        alertsApi.getRules(projectId),
        alertsApi.getEvents(projectId),
      ]);
      if (rulesRes.status  === 'fulfilled') setRules(rulesRes.value.data?.rules   || []);
      if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data?.events || []);
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchAlertData(); }, [fetchAlertData]);

 
  const firingCount   = useMemo(() => events.filter(e => e.status === 'firing').length,   [events]);
  const resolvedCount = useMemo(() => events.filter(e => e.status === 'resolved').length, [events]);

  const mttr = useMemo(() => {
    const resolved = events.filter(e => e.status === 'resolved' && e.resolved_at && e.triggered_at);
    if (!resolved.length) return 0;
    const totalMins = resolved.reduce((acc, ev) => {
      return acc + (new Date(ev.resolved_at) - new Date(ev.triggered_at)) / 60000;
    }, 0);
    return Math.round(totalMins / resolved.length);
  }, [events]);

  
  const handleRuleToggle = async (id, currentStatus) => {
    // Optimistic update
    setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: !currentStatus } : r));
    try {
      await alertsApi.toggleRule(projectId, id, !currentStatus);
    } catch (err) {
      // Revert on failure
      setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: currentStatus } : r));
      console.error(err);
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      await alertsApi.deleteRule(projectId, id);
      setRules(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-80px)] overflow-hidden gap-5 px-1 pb-4 pt-1">

      {/* Header  */}
      <div className="flex items-start justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Alerts</h1>
          <p className="text-sm text-text-muted mt-1">Real-time alerting and threshold monitoring</p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          New alert rule
        </Button>
      </div>

      {/* KPI ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">

        {/* Firing */}
        <div className="bg-surface border border-border rounded-card p-5 relative overflow-hidden group transition-all duration-base hover:border-border-light hover:shadow-elevated">
          <p className="text-[10px] font-mono uppercase tracking-widest text-accent-error mb-2">Firing now</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold font-mono leading-none text-accent-error">{firingCount}</span>
            {firingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-accent-error bg-accent-error/10 border border-accent-error/25 rounded px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-error animate-pulse" />
                Action required
              </span>
            )}
          </div>
          <div className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-slow pointer-events-none bg-accent-error" />
        </div>

        {/* MTTR */}
        <div className="bg-surface border border-border rounded-card p-5 relative overflow-hidden group transition-all duration-base hover:border-border-light hover:shadow-elevated">
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">Avg MTTR</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-semibold font-mono leading-none text-text-primary">{mttr}</span>
            <span className="text-base text-text-muted font-mono">min</span>
          </div>
          <p className="text-[10px] font-mono text-text-muted/60 mt-1">Mean time to resolve</p>
          <div className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-slow pointer-events-none bg-primary" />
        </div>

        {/* Resolved */}
        <div className="bg-surface border border-border rounded-card p-5 relative overflow-hidden group transition-all duration-base hover:border-border-light hover:shadow-elevated">
          <p className="text-[10px] font-mono uppercase tracking-widest text-accent-success mb-2">Resolved</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold font-mono leading-none text-accent-success">{resolvedCount}</span>
            <span className="text-[10px] font-mono text-accent-success/70 bg-accent-success/8 border border-accent-success/20 rounded px-2 py-0.5">
              stable
            </span>
          </div>
          <div className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-slow pointer-events-none bg-accent-success" />
        </div>

      </div>

      {/* Tabbed console  */}
      <div className="flex-1 min-h-0 bg-surface border border-border rounded-card flex flex-col overflow-hidden">

        {/* Tab nav */}
        <div className="flex border-b border-border bg-background/30 px-4 shrink-0">
          {[
            { key: 'history', label: 'Recent triggers', icon: Clock   },
            { key: 'rules',   label: 'Alert rules',     icon: Filter  },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors duration-fast
                  ${activeTab === tab.key
                    ? 'border-primary text-text-primary'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {/* Badge on history tab when there are firing events */}
                {tab.key === 'history' && firingCount > 0 && (
                  <span className="text-[9px] font-mono font-semibold text-accent-error bg-accent-error/10 border border-accent-error/25 rounded-full px-1.5 py-px">
                    {firingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-h-0 overflow-y-auto">

          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm font-mono text-text-muted">Loading…</p>
            </div>

          ) : activeTab === 'history' ? (
            /* History tab  */
            <div className="flex flex-col h-full">
              <div
                className="grid px-5 py-2.5 border-b border-border bg-background/20 sticky top-0 z-10
                  text-[9px] font-mono uppercase tracking-widest text-text-muted select-none"
                style={{ gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr' }}
              >
                <div>Alert</div>
                <div>Triggered value</div>
                <div>Server</div>
                <div>Duration</div>
                <div className="text-right">Status</div>
              </div>

              {events.length === 0 ? (
                <EmptyState
                  label="No alerts triggered yet."
                  sub="Your system is stable. Alerts will appear here when a threshold is breached."
                />
              ) : (
                events.map(ev => (
                  <div
                    key={ev.event_id}
                    className="grid items-center px-5 py-3.5 border-b border-border/40 last:border-b-0 hover:bg-surface-hover transition-colors duration-fast"
                    style={{ gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr' }}
                  >
                    {/* Alert description */}
                    <div>
                      <p className="text-sm font-medium text-text-primary truncate">
                        {getMetricLabel(ev.metric_name)}
                      </p>
                      <p className="text-[10px] font-mono text-text-muted mt-0.5 truncate">
                        {ev.metric_name} {ev.condition} {ev.threshold}
                      </p>
                    </div>

                    {/* Triggered value — with unit context */}
                    <div>
                      <span className={`font-mono text-sm font-semibold ${ev.status === 'firing' ? 'text-accent-error' : 'text-log-warning'}`}>
                        {ev.triggered_value}
                        <span className="text-text-muted font-normal text-[10px] ml-0.5">
                          {getMetricUnit(ev.metric_name)}
                        </span>
                      </span>
                    </div>

                    {/* Server */}
                    <div className="flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span className="font-mono text-xs text-text-secondary truncate">
                        {ev.server_name || ev.server_hostname || 'Unknown'}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="font-mono text-xs text-text-muted">
                      {calculateDuration(ev.triggered_at, ev.resolved_at)}
                    </div>

                    {/* Status pill */}
                    <div className="flex justify-end">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-mono font-semibold uppercase tracking-wide
                        ${ev.status === 'firing'
                          ? 'bg-accent-error/8 text-accent-error border-accent-error/25'
                          : 'bg-accent-success/8 text-accent-success border-accent-success/25'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ev.status === 'firing' ? 'bg-accent-error animate-pulse' : 'bg-accent-success'}`} />
                        {ev.status === 'firing' ? 'Firing' : 'Resolved'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

          ) : (
            /* Rules tab */
            <div className="flex flex-col h-full">
              <div
                className="grid px-5 py-2.5 border-b border-border bg-background/20 sticky top-0 z-10
                  text-[9px] font-mono uppercase tracking-widest text-text-muted select-none"
                style={{ gridTemplateColumns: '2fr 1.5fr 2fr 1fr 1fr' }}
              >
                <div>Metric</div>
                <div>Condition</div>
                <div>Notify</div>
                <div className="text-center">Enabled</div>
                <div className="text-right">Action</div>
              </div>

              {rules.length === 0 ? (
                <EmptyState
                  label="No alert rules configured."
                  sub="Create a rule to get notified when a metric crosses a threshold."
                />
              ) : (
                rules.map(rule => (
                  <div
                    key={rule.id}
                    className={`grid items-center px-5 py-3.5 border-b border-border/40 last:border-b-0 transition-all duration-fast
                      ${rule.is_active ? 'hover:bg-surface-hover' : 'opacity-50 bg-background/20'}`}
                    style={{ gridTemplateColumns: '2fr 1.5fr 2fr 1fr 1fr' }}
                  >
                    {/* Metric name */}
                    <p className="text-sm font-medium text-text-primary truncate">
                      {getMetricLabel(rule.metric_name)}
                    </p>

                    {/* Condition — show metric name + condition + threshold */}
                    <div>
                      <span className="inline-flex items-center px-2 py-px bg-background border border-border rounded text-[10px] font-mono text-text-secondary tracking-wide">
                        {rule.metric_name} {rule.condition} {rule.threshold}
                      </span>
                    </div>

                    {/* Notification email */}
                    <p className="text-xs font-mono text-text-muted truncate pr-3">
                      {rule.notification_email}
                    </p>

                    {/* Toggle */}
                    <div className="flex justify-center">
                      <Toggle
                        checked={rule.is_active}
                        onChange={() => handleRuleToggle(rule.id, rule.is_active)}
                      />
                    </div>

                    {/* Delete */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        title="Delete rule"
                        className="p-1.5 text-text-muted hover:text-accent-error hover:bg-accent-error/8 rounded-md transition-colors duration-fast"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <CreateRuleModal
          projectId={projectId}
          onClose={() => setIsModalOpen(false)}
          onSaveComplete={() => {
            setActiveTab('rules');
            fetchAlertData();
          }}
        />
      )}
    </div>
  );
};

export default Alerts;
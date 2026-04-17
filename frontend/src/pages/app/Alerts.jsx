import React, { useState } from 'react';
import { 
  Bell, CheckCircle2, AlertTriangle, Clock, Server, 
  Trash2, Search, Filter, Plus, X, ChevronDown
} from 'lucide-react';

const mockEvents = [
  { event_id: 'ev_1', metric_name: 'API Latency', condition: '>', threshold: 1000, triggered_value: 1420, status: 'firing', triggered_at: '2024-05-20T14:10:00Z', resolved_at: null, server_name: 'gateway-node-01', notification_email: 'ops@luminatrace.com' },
  { event_id: 'ev_2', metric_name: 'CPU Usage', condition: '>', threshold: 85, triggered_value: 92.4, status: 'firing', triggered_at: '2024-05-20T13:45:00Z', resolved_at: null, server_name: 'auth-master-db', notification_email: 'ops@luminatrace.com' },
  { event_id: 'ev_3', metric_name: 'DB Connections', condition: '>', threshold: 500, triggered_value: 610, status: 'resolved', triggered_at: '2024-05-20T10:00:00Z', resolved_at: '2024-05-20T10:18:00Z', server_name: 'postgres-writer', notification_email: 'ops@luminatrace.com' },
  { event_id: 'ev_4', metric_name: '5xx Error Rate', condition: '>', threshold: 5, triggered_value: 8.2, status: 'resolved', triggered_at: '2024-05-19T22:00:00Z', resolved_at: '2024-05-19T22:03:48Z', server_name: 'payment-worker', notification_email: 'billing@luminatrace.com' },
];

const mockRules = [
  { id: 'ru_1', metric_name: 'API Latency', condition: '>', threshold: 1000, notification_email: 'ops@luminatrace.com', is_active: true },
  { id: 'ru_2', metric_name: 'CPU Usage', condition: '>', threshold: 85, notification_email: 'ops@luminatrace.com', is_active: true },
  { id: 'ru_3', metric_name: 'DB Connections', condition: '>', threshold: 500, notification_email: 'ops@luminatrace.com', is_active: false },
  { id: 'ru_4', metric_name: '5xx Error Rate', condition: '>', threshold: 5, notification_email: 'billing@luminatrace.com', is_active: true },
];

const AVAILABLE_METRICS = [
  { id: 'cpu_usage', label: 'CPU Usage', unit: '%', placeholder: 'e.g. 85.0', defaultCondition: '>', min: 0, max: 100 },
  { id: 'memory_usage', label: 'Memory Utilization', unit: '%', placeholder: 'e.g. 90.0', defaultCondition: '>', min: 0, max: 100 },
  { id: 'api_latency', label: 'API Latency', unit: 'ms', placeholder: 'e.g. 1500', defaultCondition: '>', min: 0, max: 60000 },
  { id: 'db_connections', label: 'DB Connections', unit: 'count', placeholder: 'e.g. 500', defaultCondition: '>', min: 0, max: 100000 },
  { id: 'error_rate_5xx', label: '5xx Error Rate', unit: '%', placeholder: 'e.g. 5.0', defaultCondition: '>', min: 0, max: 100 },
  { id: 'disk_usage', label: 'Disk Space Usage', unit: '%', placeholder: 'e.g. 95.0', defaultCondition: '>', min: 0, max: 100 },
  { id: 'uptime', label: 'System Uptime', unit: 'sec', placeholder: 'e.g. 86400', defaultCondition: '<', min: 0, max: 315360000 },
];

const CONDITION_OPTIONS = [
  { value: '>', label: 'Greater than (>)' },
  { value: '<', label: 'Less than (<)' },
  { value: '==', label: 'Equals (==)' },
];

// Custom styled dark theme select
const CustomSelect = ({ options, valueKey, labelKey, value, onChange, label, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedObj = options.find(o => o[valueKey] === value) || options[0];
  
  return (
    <div className={`relative ${className}`}>
      <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1.5">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#11151c] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 cursor-pointer flex justify-between items-center hover:border-[#a5b4fc] transition-colors"
      >
        <span>{selectedObj[labelKey]}</span>
        <ChevronDown className={`w-4 h-4 text-[#8b949e] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <React.Fragment>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-[105%] left-0 right-0 bg-[#161b22] border border-[#2d333b] rounded-lg shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto no-scrollbar">
            {options.map(opt => (
              <div 
                key={opt[valueKey]}
                onClick={() => { onChange(opt[valueKey]); setIsOpen(false); }}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#1c212b] transition-colors flex items-center justify-between ${value === opt[valueKey] ? 'bg-[#1c212b] text-white' : 'text-[#c9d1d9]'}`}
              >
                <span>{opt[labelKey]}</span>
                {value === opt[valueKey] && <CheckCircle2 className="w-4 h-4 text-[#818cf8]" />}
              </div>
            ))}
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

const CreateRuleModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({ 
    metric_id: AVAILABLE_METRICS[0].id, 
    condition: AVAILABLE_METRICS[0].defaultCondition, 
    threshold: '', 
    email: '' 
  });
  
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamically resolve references
  const activeMetric = AVAILABLE_METRICS.find(m => m.id === formData.metric_id) || AVAILABLE_METRICS[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Strict Validations
    if (!formData.threshold || isNaN(formData.threshold)) {
      return setErrorMsg('Threshold must be a valid numeric value.');
    }
    
    // Contextual Metric Boundary Validations
    const numericThreshold = Number(formData.threshold);
    if (activeMetric.min !== undefined && numericThreshold < activeMetric.min) {
       return setErrorMsg(`Invalid input: ${activeMetric.label} cannot be lower than ${activeMetric.min}.`);
    }
    if (activeMetric.max !== undefined && numericThreshold > activeMetric.max) {
       return setErrorMsg(`Invalid input: ${activeMetric.label} cannot exceed ${activeMetric.max}${activeMetric.unit === '%' ? '%' : ''}.`);
    }

    // Robust Regex Email validation preventing naive spoofing
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      return setErrorMsg('Please enter a strictly valid email routing address.');
    }

    onSave({
      id: `ru_${Math.random().toString(36).substr(2,9)}`,
      metric_name: activeMetric.label,
      condition: formData.condition,
      threshold: numericThreshold,
      notification_email: formData.email,
      is_active: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0d1117] border border-[#2d333b] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col pt-1">
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2d333b] bg-[#161b22]">
          <div>
             <h2 className="text-white font-bold text-lg mb-0.5">Configure Telemetry Rule</h2>
             <p className="text-xs font-mono text-[#8b949e]">Define thresholds to monitor anomalies across your cosmic cluster.</p>
          </div>
          <button onClick={onClose} className="p-2 ml-4 hover:bg-white/10 rounded-full transition-colors text-[#8b949e] hover:text-white">
             <X className="w-5 h-5"/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-[#0a0c10]">
          
          {errorMsg && (
            <div className="w-full bg-[#450a0a]/50 border border-[#7f1d1d] text-[#fca5a5] px-4 py-3 rounded-lg text-sm flex items-start animate-in fade-in">
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <CustomSelect 
            label="Target Telemetry Metric"
            options={AVAILABLE_METRICS}
            valueKey="id"
            labelKey="label"
            value={formData.metric_id}
            onChange={(val) => {
               const newMetric = AVAILABLE_METRICS.find(m => m.id === val);
               setFormData({ ...formData, metric_id: val, condition: newMetric.defaultCondition, threshold: '' });
            }}
          />
          
          <div className="flex space-x-4">
            <CustomSelect 
              className="w-[45%]"
              label="Evaluation"
              options={CONDITION_OPTIONS}
              valueKey="value"
              labelKey="label"
              value={formData.condition}
              onChange={(val) => setFormData({...formData, condition: val})}
            />

            <div className="w-[55%]">
              <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1.5 flex justify-between">
                 Threshold Value <span className="text-[#6366f1]">{activeMetric.unit}</span>
              </label>
              <div className="relative">
                 <input 
                    type="text" // using text combined with custom validation to allow flexible UX before strict cast
                    placeholder={activeMetric.placeholder} 
                    value={formData.threshold} 
                    onChange={e => {
                       // Only allow numbers and one decimal dot
                       const val = e.target.value.replace(/[^0-9.]/g, '');
                       const parts = val.split('.');
                       const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : val;
                       setFormData({...formData, threshold: formatted});
                    }}
                    className="w-full bg-[#11151c] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#a5b4fc] transition-colors" 
                 />
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#4b5563] pointer-events-none">
                    {activeMetric.unit}
                 </span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1.5 flex justify-between">
               Notification Routing <span className="text-[10px] text-[#4b5563] lowercase">Email</span>
            </label>
            <input 
               type="text" 
               placeholder="oncall.engineer@luminatrace.io" 
               value={formData.email} 
               onChange={e => setFormData({...formData, email: e.target.value})} 
               className="w-full bg-[#11151c] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#a5b4fc] transition-colors" 
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-[#2d333b] pt-5 mt-2">
             <button type="button" onClick={onClose} className="px-5 py-2 text-sm text-[#8b949e] hover:text-white font-medium transition-colors">Abort</button>
             <button type="submit" className="px-6 py-2 bg-gradient-to-r from-[#818cf8] to-[#c084fc] hover:opacity-90 text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_rgba(129,140,248,0.3)] transition-all flex items-center">
                Deploy Monitor
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Alerts = () => {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'rules'
  const [events, setEvents] = useState(mockEvents);
  const [rules, setRules] = useState(mockRules);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const firingCount = events.filter(e => e.status === 'firing').length;
  const resolvedCount = events.filter(e => e.status === 'resolved').length;

  const calculateDuration = (start, end) => {
    const d1 = new Date(start);
    const d2 = end ? new Date(end) : new Date();
    const diffMins = Math.floor((d2 - d1) / 60000);
    if (diffMins < 60) return `${diffMins}m`;
    const hrs = Math.floor(diffMins / 60);
    const remaining = diffMins % 60;
    return `${hrs}h ${remaining}m`;
  };

  const handleRuleToggle = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: !r.is_active } : r));
  };

  const handleDeleteRule = (id) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-80px)] overflow-hidden space-y-6 px-2 pb-4 pt-2">
      
      {/* Header Row */}
      <div className="flex justify-between items-start shrink-0">
         <div>
           <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Active Alerts</h1>
           <p className="text-sm font-mono text-[#8b949e]">Real-time monitoring of cosmic telemetry anomalies.</p>
         </div>
         <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-gradient-to-r from-[#818cf8] to-[#c084fc] hover:opacity-90 text-white rounded-lg shadow-[0_0_20px_rgba(129,140,248,0.3)] font-semibold text-sm transition-all flex items-center">
            <Bell className="w-4 h-4 mr-2" />
            New Monitor
         </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
         <div className="bg-[#11151c] border border-white/5 rounded-xl p-5 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef4444]/5 blur-[50px] rounded-full point-events-none"></div>
            <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase mb-2">Total Firing Alerts</span>
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-bold font-mono text-white tracking-tighter">{firingCount}</span>
              <span className="text-xs font-mono text-[#fca5a5] flex items-center bg-[#450a0a] px-1.5 py-0.5 rounded border border-[#7f1d1d]"><AlertTriangle className="w-3 h-3 mr-1"/> Action Req</span>
            </div>
         </div>
         
         <div className="bg-[#11151c] border border-white/5 rounded-xl p-5 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#a5b4fc]/5 blur-[50px] rounded-full point-events-none"></div>
            <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase mb-2">Mean Time to Resolve</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-bold font-mono text-white tracking-tighter">18</span>
              <span className="text-xl font-mono text-[#8b949e]">m</span>
              <span className="text-xs font-mono text-[#06b6d4] ml-3">~ -2m</span>
            </div>
         </div>

         <div className="bg-[#11151c] border border-white/5 rounded-xl p-5 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 blur-[50px] rounded-full point-events-none"></div>
            <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase mb-2">Total Resolved</span>
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-bold font-mono text-white tracking-tighter">{resolvedCount}</span>
              <span className="text-xs text-[#8b949e] font-mono">STABLE</span>
            </div>
         </div>
      </div>

      {/* Main Tabbed Console */}
      <div className="flex-1 min-h-0 bg-[#11151c] border border-white/5 rounded-xl flex flex-col overflow-hidden">
         
         {/* Tab Headers */}
         <div className="w-full border-b border-[#2d333b] bg-[#161b22] px-6 py-0 flex space-x-8 shrink-0">
            <button 
              onClick={() => setActiveTab('history')}
              className={`py-4 text-sm font-medium border-b-2 flex items-center transition-colors ${activeTab === 'history' ? 'border-[#a5b4fc] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'}`}
            >
               <Clock className="w-4 h-4 mr-2" /> Recent Triggers
            </button>
            <button 
              onClick={() => setActiveTab('rules')}
              className={`py-4 text-sm font-medium border-b-2 flex items-center transition-colors ${activeTab === 'rules' ? 'border-[#a5b4fc] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'}`}
            >
               <Filter className="w-4 h-4 mr-2" /> Configured Rules
            </button>
         </div>

         {/* Content Area Rendering */}
         <div className="flex-1 overflow-y-auto w-full no-scrollbar relative">
           
           {activeTab === 'history' && (
             <div className="w-full">
                <div className="w-full border-b border-[#2d333b] px-6 py-3 flex text-[10px] font-mono tracking-widest text-[#8b949e] uppercase sticky top-0 bg-[#11151c]/95 backdrop-blur z-10">
                  <div className="w-[30%]">Alert Description Context</div>
                  <div className="w-[15%]">Violated Value</div>
                  <div className="w-[20%]">Server Target</div>
                  <div className="w-[15%]">Duration Active</div>
                  <div className="w-[20%] text-right pr-4">Status</div>
                </div>

                {events.map((ev) => (
                  <div key={ev.event_id} className="w-full px-6 py-4 flex items-center border-b border-white/5 hover:bg-[#161b22] transition-colors">
                     <div className="w-[30%]">
                        <h4 className="text-white text-sm font-semibold truncate">{ev.metric_name} Anomaly</h4>
                        <p className="text-xs font-mono text-[#8b949e] mt-1 truncate">Condition: {ev.metric_name} {ev.condition} {ev.threshold}</p>
                     </div>
                     <div className="w-[15%]">
                        <span className="font-mono text-sm text-[#fca5a5]">{ev.triggered_value}</span>
                     </div>
                     <div className="w-[20%] flex items-center text-[#c9d1d9] text-xs font-mono">
                        <Server className="w-3.5 h-3.5 mr-2 text-[#8b949e]"/> {ev.server_name}
                     </div>
                     <div className="w-[15%] font-mono text-xs text-[#8b949e]">
                        {calculateDuration(ev.triggered_at, ev.resolved_at)}
                     </div>
                     <div className="w-[20%] flex justify-end">
                        <span className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded-full border ${ev.status === 'firing' ? 'bg-[#450a0a]/50 text-[#ef4444] border-[#7f1d1d]' : 'bg-[#064e3b]/50 text-[#10b981] border-[#065f46]'}`}>
                          {ev.status.toUpperCase()}
                        </span>
                     </div>
                  </div>
                ))}
             </div>
           )}

           {activeTab === 'rules' && (
             <div className="w-full">
                <div className="w-full border-b border-[#2d333b] px-6 py-3 flex text-[10px] font-mono tracking-widest text-[#8b949e] uppercase sticky top-0 bg-[#11151c]/95 backdrop-blur z-10">
                  <div className="w-[30%]">Monitored Metric</div>
                  <div className="w-[15%]">Condition Evaluated</div>
                  <div className="w-[25%]">Routing Details</div>
                  <div className="w-[15%] text-center">Active State</div>
                  <div className="w-[15%] text-right pr-4">Actions</div>
                </div>

                {rules.map((rule) => (
                  <div key={rule.id} className={`w-full px-6 py-4 flex items-center border-b border-white/5 transition-colors ${rule.is_active ? 'hover:bg-[#161b22]' : 'opacity-60 bg-black/20'}`}>
                     <div className="w-[30%] font-semibold text-white text-sm">
                        {rule.metric_name}
                     </div>
                     <div className="w-[15%]">
                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded font-mono text-xs text-[#c9d1d9] tracking-wider">
                           METRIC {rule.condition} {rule.threshold}
                        </span>
                     </div>
                     <div className="w-[25%] text-[#8b949e] text-xs font-mono truncate pr-4">
                        {rule.notification_email}
                     </div>
                     <div className="w-[15%] flex justify-center">
                        <button 
                           onClick={() => handleRuleToggle(rule.id)}
                           className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${rule.is_active ? 'bg-[#818cf8]' : 'bg-[#4b5563]'}`}
                        >
                           <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${rule.is_active ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                     </div>
                     <div className="w-[15%] flex justify-end">
                        <button onClick={() => handleDeleteRule(rule.id)} className="p-1.5 text-[#8b949e] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded bg-transparent transition-colors">
                           <Trash2 className="w-4 h-4"/>
                        </button>
                     </div>
                  </div>
                ))}
             </div>
           )}

         </div>
      </div>
      
      {isModalOpen && <CreateRuleModal onClose={() => setIsModalOpen(false)} onSave={(newRule) => { setRules([newRule, ...rules]); setActiveTab('rules'); }} />}
      
    </div>
  );
};

export default Alerts;

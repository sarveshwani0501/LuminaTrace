import React, { useState } from 'react';
import { Activity, Plus, Server, Code } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardContent } from '../ui/Card';

const EmptyProjectState = ({ onCreate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onCreate(formData);
    }
  };

  if (isCreating) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
        <CardContent className="pt-8 relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-surface-active flex items-center justify-center border border-border-light">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Create New Project</h2>
              <p className="text-sm text-text-secondary">Set up an environment to receive telemetry data.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-text-primary">Project Name <span className="text-accent-error">*</span></label>
              <Input 
                autoFocus
                placeholder="e.g., Production API Database"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-text-primary">Description (Optional)</label>
              <Input 
                placeholder="Microservice that handles user checkouts"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex space-x-3 pt-4 border-t border-border mt-6">
              <Button type="submit" className="w-full sm:w-auto">Generate API Key</Button>
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-8 group">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-secondary/20 blur-[50px] rounded-full pointer-events-none transition-all duration-500 group-hover:bg-secondary/30 group-hover:w-40 group-hover:h-40"></div>
        <div className="relative w-20 h-20 bg-surface-active border border-border rounded-2xl flex items-center justify-center shadow-glass z-10 transition-transform duration-300 group-hover:scale-105">
          <Activity className="w-10 h-10 text-secondary" />
        </div>
        
        {/* Floating elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-background border border-border-light rounded-lg flex items-center justify-center shadow-glass delay-100 transition-transform duration-300 group-hover:-translate-y-2 group-hover:translate-x-2 z-20">
          <Code className="w-4 h-4 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-3">No projects found</h2>
      <p className="text-text-secondary max-w-sm mx-auto mb-8">
        Your organization doesn't have any telemtry environments set up yet. Create one to obtain your API key and start tracing.
      </p>

      <Button onClick={() => setIsCreating(true)} size="lg" className="shadow-glow-primary">
        <Plus className="w-5 h-5 mr-2 -ml-1" /> Create Your First Project
      </Button>
    </div>
  );
};

export default EmptyProjectState;

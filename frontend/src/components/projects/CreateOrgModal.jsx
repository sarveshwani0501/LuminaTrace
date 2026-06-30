import React, { useState } from 'react';
import { Building2, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

import { useDispatch } from 'react-redux';
import { createOrganization } from '../../store/slices/orgSlice';

const CreateOrgModal = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [orgName, setOrgName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orgName.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await dispatch(createOrganization({ name: orgName.trim() })).unwrap();
      onSuccess(result);
      onClose();
    } catch (err) {
      console.error('Failed to create organization:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-card shadow-elevated w-full max-w-md overflow-hidden flex flex-col relative">
        
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-base font-semibold text-text-primary">Create Organization</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-active transition-colors duration-fast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-sm text-text-secondary">
            You will automatically be assigned the{' '}
            <span className="text-text-primary font-medium">Owner</span> role.
          </p>

          <Input
            autoFocus
            required
            label="Organization Name"
            placeholder="e.g. Stark Industries"
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
          />

          {/* Footer */}
          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isLoading}
              disabled={!orgName.trim() || isLoading}
            >
              Create Organization
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrgModal;
import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { clearData } from '../utils/storage';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';

import PageHeader from '../Components/PageHeader';
import ConfirmDialog from '../Components/ConfirmDialog';

const Settings = () => {
  const [settings, setSettings] = useSettings();
  const toast = useToast();
  const confirmDialog = useConfirm();
  
  // Local state for the form so we don't update settings on every keystroke
  const [formData, setFormData] = useState({ ...settings });

  const handleSave = () => {
    setSettings(formData);
    toast.success('Settings saved successfully!');
  };

  const handleClearData = () => {
    confirmDialog.confirm({
      title: 'Danger: Clear All Data',
      message: 'Are you absolutely sure you want to clear all CRM data? This includes all Customers, Leads, Tasks, Deals, and Activity history. This action CANNOT be undone.',
      confirmText: 'Yes, Delete Everything',
      isDanger: true,
      onConfirm: () => {
        clearData(['customers', 'leads', 'deals', 'tasks', 'activityLog']);
        toast.success('All data has been wiped clean.');
        // Optional: Force a hard reload to ensure UI clears completely
        setTimeout(() => window.location.reload(), 1500);
      }
    });
  };

  const exportAllData = () => {
    const data = {
      customers: JSON.parse(localStorage.getItem('customers') || '[]'),
      leads: JSON.parse(localStorage.getItem('leads') || '[]'),
      tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
      deals: JSON.parse(localStorage.getItem('deals') || '[]'),
      activityLog: JSON.parse(localStorage.getItem('activityLog') || '[]'),
      settings: JSON.parse(localStorage.getItem('crmSettings') || '{}')
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup downloaded successfully.');
  };

  return (
    <div className="settings-page slide-in-top">
      <PageHeader 
        title="Settings" 
        subtitle="Manage your personal preferences and system configurations."
      />

      <div className="form-grid">
        {/* Profile Settings Card */}
        <div className="card full-width">
          <div className="card-header">
            <span className="card-title">👤 User Profile</span>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input 
                  type="text" className="form-input" 
                  value={formData.userName} 
                  onChange={e => setFormData({...formData, userName: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" className="form-input" 
                  value={formData.userEmail} 
                  onChange={e => setFormData({...formData, userEmail: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input 
                  type="text" className="form-input" 
                  value={formData.userRole} 
                  onChange={e => setFormData({...formData, userRole: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input 
                  type="text" className="form-input" 
                  value={formData.companyName} 
                  onChange={e => setFormData({...formData, companyName: e.target.value})} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Defaults Card */}
        <div className="card full-width">
          <div className="card-header">
            <span className="card-title">⚙️ System Defaults</span>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Default Customer Status</label>
                <select 
                  className="form-select" 
                  value={formData.defaultStatus} 
                  onChange={e => setFormData({...formData, defaultStatus: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Default Priority Level</label>
                <select 
                  className="form-select" 
                  value={formData.defaultPriority} 
                  onChange={e => setFormData({...formData, defaultPriority: e.target.value})}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Default Lead Source</label>
                <select 
                  className="form-select" 
                  value={formData.defaultLeadSource} 
                  onChange={e => setFormData({...formData, defaultLeadSource: e.target.value})}
                >
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="mt-20 flex" style={{ marginTop: '24px' }}>
              <button className="btn btn-primary btn-lg" onClick={handleSave}>
                💾 Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* Data Management Card */}
        <div className="card full-width" style={{ border: '1px solid var(--danger-light)' }}>
          <div className="card-header" style={{ background: 'var(--danger-light)' }}>
            <span className="card-title" style={{ color: 'var(--danger)' }}>⚠️ Data Management</span>
          </div>
          <div className="card-body">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Export your data as a backup JSON file, or permanently delete all CRM data. 
              <strong> Deleting data cannot be undone.</strong>
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" onClick={exportAllData}>
                📦 Export Full Backup
              </button>
              <button className="btn btn-danger" onClick={handleClearData}>
                🗑️ Clear All System Data
              </button>
            </div>
          </div>
        </div>

      </div>

      <ConfirmDialog {...confirmDialog.confirmConfig} isOpen={confirmDialog.isOpen} onClose={confirmDialog.close} />
    </div>
  );
};

export default Settings;
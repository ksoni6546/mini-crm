import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSettings } from '../hooks/useSettings';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';
import { logActivity } from '../utils/activityLogger';

import PageHeader from '../Components/PageHeader';
import SearchBar from '../Components/SearchBar';
import FilterTabs from '../Components/FilterTabs';
import DataTable from '../Components/DataTable';
import FormModal from '../Components/FormModal';
import Badge from '../Components/Badge';
import ConfirmDialog from '../Components/ConfirmDialog';

const Leads = () => {
  const [leads, setLeads] = useLocalStorage('leads', []);
  const [customers, setCustomers] = useLocalStorage('customers', []);
  const [settings] = useSettings();
  const toast = useToast();
  const confirmDialog = useConfirm();

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', 
    status: 'New', 
    source: settings.defaultLeadSource || 'Website'
  });

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          (l.company && l.company.toLowerCase().includes(searchText.toLowerCase()));
    const matchesStatus = filterStatus === 'All' || l.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Actions
  const handleOpenForm = (lead = null) => {
    if (lead) {
      setFormData({ ...lead });
      setEditId(lead.id);
    } else {
      setFormData({
        name: '', email: '', phone: '', company: '', 
        status: 'New', 
        source: settings.defaultLeadSource || 'Website'
      });
      setEditId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.company.trim()) {
      toast.warning('Name and Company are required.');
      return;
    }

    if (editId) {
      const updated = leads.map(l => l.id === editId ? { ...formData, id: editId, createdAt: l.createdAt } : l);
      setLeads(updated);
      logActivity('Lead', `Updated lead: ${formData.name}`);
      toast.success('Lead updated successfully.');
      if (selectedLead?.id === editId) setSelectedLead({ ...formData, id: editId });
    } else {
      const newLead = { ...formData, id: Date.now(), createdAt: new Date().toLocaleDateString('en-IN') };
      setLeads([...leads, newLead]);
      logActivity('Lead', `Added new lead: ${formData.name} from ${formData.source}`);
      toast.success('Lead added successfully.');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id, name) => {
    confirmDialog.confirm({
      title: 'Delete Lead',
      message: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      confirmText: 'Delete Lead',
      onConfirm: () => {
        setLeads(leads.filter(l => l.id !== id));
        logActivity('Lead', `Deleted lead: ${name}`);
        toast.info('Lead deleted.');
        if (selectedLead?.id === id) setSelectedLead(null);
      }
    });
  };

  const handleConvertToCustomer = (lead) => {
    confirmDialog.confirm({
      title: 'Convert to Customer',
      message: `Are you sure you want to convert ${lead.name} into an Active Customer? They will be removed from Leads.`,
      confirmText: 'Convert',
      isDanger: false,
      onConfirm: () => {
        const newCustomer = {
          id: Date.now(),
          name: lead.name,
          email: lead.email || '',
          phone: lead.phone || '',
          company: lead.company,
          status: 'Active',
          priority: 'Medium',
          followUpDate: '',
          note: `Converted from lead. Source: ${lead.source || 'Unknown'}`,
        };
        
        setCustomers([...customers, newCustomer]);
        setLeads(leads.filter(l => l.id !== lead.id));
        
        logActivity('Customer', `Converted lead ${lead.name} to customer`);
        toast.success(`${lead.name} converted to customer!`);
        if (selectedLead?.id === lead.id) setSelectedLead(null);
      }
    });
  };

  const exportToCSV = () => {
    if (leads.length === 0) {
      toast.warning('No leads to export.');
      return;
    }
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Source', 'Status', 'Created Date'];
    const rows = leads.map(l => [
      `"${l.name}"`, `"${l.email || ''}"`, `"${l.phone || ''}"`, `"${l.company}"`, 
      `"${l.source}"`, `"${l.status}"`, `"${l.createdAt}"`
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'leads.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Export downloaded.');
  };

  // Table config
  const columns = [
    { key: 'name', label: 'Lead', render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
            {val.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{val}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.company}</div>
          </div>
        </div>
      )
    },
    { key: 'contact', label: 'Contact', render: (_, row) => (
      <div>
        <div style={{ fontSize: '13px' }}>{row.email || '—'}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.phone || ''}</div>
      </div>
    )},
    { key: 'source', label: 'Source', render: val => (
        <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {val || 'Website'}
        </span>
      )
    },
    { key: 'status', label: 'Status', render: val => <Badge variant={val}>{val}</Badge> },
    { key: 'createdAt', label: 'Added On', render: val => <span className="text-muted text-sm">{val}</span> }
  ];

  return (
    <div className="leads-page slide-in-top">
      <PageHeader 
        title="Lead Pipeline" 
        subtitle={`Track and convert your ${leads.length} leads.`}
        action={() => handleOpenForm()}
        actionText="Add Lead"
      />

      <div className="card">
        <div className="card-header">
          <FilterTabs 
            tabs={['All', 'New', 'Contacted', 'Qualified', 'Lost']} 
            activeTab={filterStatus} 
            onTabChange={setFilterStatus}
            counts={{
              'All': leads.length,
              'New': leads.filter(l => l.status === 'New').length,
              'Contacted': leads.filter(l => l.status === 'Contacted').length,
              'Qualified': leads.filter(l => l.status === 'Qualified').length,
              'Lost': leads.filter(l => l.status === 'Lost').length,
            }}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <SearchBar value={searchText} onChange={setSearchText} placeholder="Search leads..." />
            <button className="btn btn-ghost btn-sm" onClick={exportToCSV}>Export</button>
          </div>
        </div>
        
        <DataTable 
          columns={columns}
          data={filteredLeads}
          onRowClick={setSelectedLead}
          emptyTitle="Pipeline is empty"
          emptyMessage="Add some leads to get started."
          actions={(row) => (
            <div style={{ display: 'flex' }}>
              <button className="action-btn convert" onClick={() => handleConvertToCustomer(row)}>Convert</button>
              <button className="action-btn edit" onClick={() => handleOpenForm(row)}>Edit</button>
              <button className="action-btn delete" onClick={() => handleDelete(row.id, row.name)}>Delete</button>
            </div>
          )}
        />
      </div>

      {/* Detail Panel */}
      {selectedLead && (
        <div className="card mt-20 slide-in-top">
          <div className="card-header">
            <span className="card-title">🎯 {selectedLead.name}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedLead(null)}>Close</button>
          </div>
          <div className="card-body">
            <div className="form-grid three-col">
              <div>
                <div className="form-label">Contact</div>
                <div className="mt-4">{selectedLead.email || '—'}</div>
                <div className="text-muted mt-4">{selectedLead.phone || '—'}</div>
              </div>
              <div>
                <div className="form-label">Company & Source</div>
                <div className="mt-4">{selectedLead.company}</div>
                <div className="text-muted mt-4">{selectedLead.source}</div>
              </div>
              <div>
                <div className="form-label">Status & Tracking</div>
                <div className="mt-4"><Badge variant={selectedLead.status}>{selectedLead.status}</Badge></div>
                <div className="text-muted mt-4">Added: {selectedLead.createdAt}</div>
              </div>
            </div>
            <div className="mt-20 flex gap-12">
               <button className="btn btn-success" onClick={() => handleConvertToCustomer(selectedLead)}>Convert to Customer</button>
               <button className="btn btn-ghost" onClick={() => handleOpenForm(selectedLead)}>Edit Details</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <FormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Lead Details"
        onSubmit={handleSave}
        isEdit={!!editId}
      >
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Lead Name *</label>
            <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 890" />
          </div>
          <div className="form-group">
            <label className="form-label">Company *</label>
            <input className="form-input" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="Acme Corp" />
          </div>
          <div className="form-group">
            <label className="form-label">Source</label>
            <select className="form-select" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Social Media">Social Media</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Email Campaign">Email Campaign</option>
              <option value="Trade Show">Trade Show</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group full-width">
            <label className="form-label">Status</label>
            <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog {...confirmDialog.confirmConfig} isOpen={confirmDialog.isOpen} onClose={confirmDialog.close} />
    </div>
  );
};

export default Leads;
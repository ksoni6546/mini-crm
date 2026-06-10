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

const Customers = () => {
  const [customers, setCustomers] = useLocalStorage('customers', []);
  const [settings] = useSettings();
  const toast = useToast();
  const confirmDialog = useConfirm();

  const [searchText, setSearchText] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', note: '', 
    status: settings.defaultStatus || 'Active', 
    priority: settings.defaultPriority || 'Medium', 
    followUpDate: ''
  });

  // Derived state
  const alertCustomers = customers.filter(c => {
    if (!c.followUpDate) return false;
    const followUp = new Date(c.followUpDate);
    const today = new Date();
    followUp.setHours(0,0,0,0); today.setHours(0,0,0,0);
    return followUp <= today;
  });

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          (c.company && c.company.toLowerCase().includes(searchText.toLowerCase()));
    const matchesPriority = filterPriority === 'All' || c.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  // Actions
  const handleOpenForm = (customer = null) => {
    if (customer) {
      setFormData({ ...customer });
      setEditId(customer.id);
    } else {
      setFormData({
        name: '', email: '', phone: '', company: '', note: '', 
        status: settings.defaultStatus || 'Active', 
        priority: settings.defaultPriority || 'Medium', 
        followUpDate: ''
      });
      setEditId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.warning('Name and Email are required.');
      return;
    }

    if (editId) {
      const updated = customers.map(c => c.id === editId ? { ...formData, id: editId } : c);
      setCustomers(updated);
      logActivity('Customer', `Updated customer: ${formData.name}`);
      toast.success('Customer updated successfully.');
      if (selectedCustomer?.id === editId) setSelectedCustomer({ ...formData, id: editId });
    } else {
      const newCustomer = { ...formData, id: Date.now() };
      setCustomers([...customers, newCustomer]);
      logActivity('Customer', `Added new customer: ${formData.name}`);
      toast.success('Customer added successfully.');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id, name) => {
    confirmDialog.confirm({
      title: 'Delete Customer',
      message: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      confirmText: 'Delete Customer',
      onConfirm: () => {
        setCustomers(customers.filter(c => c.id !== id));
        logActivity('Customer', `Deleted customer: ${name}`);
        toast.info('Customer deleted.');
        if (selectedCustomer?.id === id) setSelectedCustomer(null);
      }
    });
  };

  const exportToCSV = () => {
    if (customers.length === 0) {
      toast.warning('No customers to export.');
      return;
    }
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Priority', 'Follow-Up Date', 'Notes'];
    const rows = customers.map(c => [
      `"${c.name}"`, `"${c.email}"`, `"${c.phone || ''}"`, `"${c.company || ''}"`, 
      `"${c.status}"`, `"${c.priority}"`, `"${c.followUpDate || ''}"`, `"${(c.note || '').replace(/"/g, '""')}"`
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'customers.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Export downloaded.');
  };

  // Table config
  const columns = [
    { key: 'name', label: 'Customer', render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
            {val.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{val}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.email}</div>
          </div>
        </div>
      )
    },
    { key: 'company', label: 'Company', render: val => val || '—' },
    { key: 'priority', label: 'Priority', render: val => <Badge variant={val}>{val}</Badge> },
    { key: 'status', label: 'Status', render: val => <Badge variant={val}>{val}</Badge> },
    { key: 'followUpDate', label: 'Follow Up', render: val => {
        if (!val) return '—';
        const d = new Date(val); const t = new Date(); d.setHours(0,0,0,0); t.setHours(0,0,0,0);
        const isOverdue = d < t; const isToday = d.getTime() === t.getTime();
        return (
          <span style={{ color: isOverdue ? 'var(--danger)' : isToday ? 'var(--warning)' : 'inherit', fontWeight: (isOverdue || isToday) ? 600 : 400 }}>
            {val} {isOverdue ? '🚨' : isToday ? '⚡' : ''}
          </span>
        );
      } 
    }
  ];

  return (
    <div className="customers-page slide-in-top">
      <PageHeader 
        title="Customers" 
        subtitle={`Manage your ${customers.length} customer relationships.`}
        action={() => handleOpenForm()}
        actionText="Add Customer"
      />

      {alertCustomers.length > 0 && (
        <div className="alert-banner warning">
          <div style={{ fontSize: '24px' }}>⚠️</div>
          <div>
            <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '2px' }}>Follow-Up Required</div>
            <div style={{ fontSize: '13px', color: '#b45309' }}>
              {alertCustomers.length} customer(s) require your attention today or are overdue.
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <FilterTabs 
            tabs={['All', 'High', 'Medium', 'Low']} 
            activeTab={filterPriority} 
            onTabChange={setFilterPriority}
            counts={{
              'All': customers.length,
              'High': customers.filter(c => c.priority === 'High').length,
              'Medium': customers.filter(c => c.priority === 'Medium').length,
              'Low': customers.filter(c => c.priority === 'Low').length,
            }}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <SearchBar value={searchText} onChange={setSearchText} placeholder="Search customers..." />
            <button className="btn btn-ghost btn-sm" onClick={exportToCSV}>Export</button>
          </div>
        </div>
        
        <DataTable 
          columns={columns}
          data={filteredCustomers}
          onRowClick={setSelectedCustomer}
          emptyTitle="No customers found"
          emptyMessage="Try adjusting your search or add a new customer."
          actions={(row) => (
            <div style={{ display: 'flex' }}>
              <button className="action-btn edit" onClick={() => handleOpenForm(row)}>Edit</button>
              <button className="action-btn delete" onClick={() => handleDelete(row.id, row.name)}>Delete</button>
            </div>
          )}
        />
      </div>

      {/* Customer Detail Sidebar/Panel (Inline below table for now, styled nicer) */}
      {selectedCustomer && (
        <div className="card mt-20 slide-in-top">
          <div className="card-header">
            <span className="card-title">👤 {selectedCustomer.name}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedCustomer(null)}>Close Details</button>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div>
                <div className="form-label">Contact</div>
                <div className="mt-4"><a href={`mailto:${selectedCustomer.email}`} style={{ color: 'var(--info)', fontWeight: 500 }}>{selectedCustomer.email}</a></div>
                <div className="text-muted mt-4">{selectedCustomer.phone || 'No phone number'}</div>
              </div>
              <div>
                <div className="form-label">Details</div>
                <div className="mt-4"><strong>Company:</strong> {selectedCustomer.company || '—'}</div>
                <div className="mt-4">
                  <Badge variant={selectedCustomer.status}>{selectedCustomer.status}</Badge>
                  <span style={{ margin: '0 8px' }}>•</span>
                  <Badge variant={selectedCustomer.priority}>{selectedCustomer.priority} Priority</Badge>
                </div>
              </div>
              <div className="full-width">
                <div className="form-label">Notes</div>
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                  {selectedCustomer.note || <span className="text-muted">No notes recorded.</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <FormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Customer Details"
        onSubmit={handleSave}
        isEdit={!!editId}
      >
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 890" />
          </div>
          <div className="form-group">
            <label className="form-label">Company</label>
            <input className="form-input" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="Acme Corp" />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-select" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="form-group full-width">
            <label className="form-label">Follow-Up Date</label>
            <input className="form-input" type="date" value={formData.followUpDate} onChange={e => setFormData({...formData, followUpDate: e.target.value})} />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Additional details..." />
          </div>
        </div>
      </FormModal>

      <ConfirmDialog {...confirmDialog.confirmConfig} isOpen={confirmDialog.isOpen} onClose={confirmDialog.close} />
    </div>
  );
};

export default Customers;
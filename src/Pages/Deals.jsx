import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
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

const Deals = () => {
  const [deals, setDeals] = useLocalStorage('deals', []);
  const [customers] = useLocalStorage('customers', []);
  const toast = useToast();
  const confirmDialog = useConfirm();

  const [searchText, setSearchText] = useState('');
  const [filterStage, setFilterStage] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '', customerId: '', value: '', 
    stage: 'Prospecting', expectedCloseDate: ''
  });

  const filteredDeals = deals.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesStage = filterStage === 'All' || d.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const totalValue = filteredDeals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);

  // Actions
  const handleOpenForm = (deal = null) => {
    if (deal) {
      setFormData({ ...deal });
      setEditId(deal.id);
    } else {
      setFormData({
        name: '', customerId: '', value: '', 
        stage: 'Prospecting', expectedCloseDate: ''
      });
      setEditId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.value) {
      toast.warning('Deal name and value are required.');
      return;
    }

    if (editId) {
      const updated = deals.map(d => d.id === editId ? { ...formData, value: Number(formData.value), id: editId, createdAt: d.createdAt } : d);
      setDeals(updated);
      logActivity('Deal', `Updated deal: ${formData.name}`);
      toast.success('Deal updated successfully.');
    } else {
      const newDeal = { ...formData, value: Number(formData.value), id: Date.now(), createdAt: new Date().toLocaleDateString('en-IN') };
      setDeals([...deals, newDeal]);
      logActivity('Deal', `Created deal: ${formData.name} for ₹${formData.value}`);
      toast.success('Deal created successfully.');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id, name) => {
    confirmDialog.confirm({
      title: 'Delete Deal',
      message: `Are you sure you want to delete deal "${name}"?`,
      confirmText: 'Delete Deal',
      onConfirm: () => {
        setDeals(deals.filter(d => d.id !== id));
        logActivity('Deal', `Deleted deal: ${name}`);
        toast.info('Deal deleted.');
      }
    });
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // Table config
  const columns = [
    { key: 'name', label: 'Deal Name', render: (val, row) => (
        <div style={{ fontWeight: 600 }}>{val}</div>
      )
    },
    { key: 'customerId', label: 'Customer', render: (val) => {
        const c = customers.find(c => c.id.toString() === val.toString());
        return c ? c.name : <span className="text-muted">No Customer linked</span>;
      }
    },
    { key: 'value', label: 'Value', render: val => <span style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(val)}</span> },
    { key: 'stage', label: 'Pipeline Stage', render: val => <Badge variant={val}>{val}</Badge> },
    { key: 'expectedCloseDate', label: 'Expected Close', render: val => val || '—' }
  ];

  return (
    <div className="deals-page slide-in-top">
      <PageHeader 
        title="Deals & Pipeline" 
        subtitle={`Total Pipeline Value: ${formatCurrency(totalValue)}`}
        action={() => handleOpenForm()}
        actionText="Add Deal"
      />

      <div className="card">
        <div className="card-header">
          <FilterTabs 
            tabs={['All', 'Prospecting', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']} 
            activeTab={filterStage} 
            onTabChange={setFilterStage}
            counts={{
              'All': deals.length,
              'Prospecting': deals.filter(d => d.stage === 'Prospecting').length,
              'Proposal': deals.filter(d => d.stage === 'Proposal').length,
              'Negotiation': deals.filter(d => d.stage === 'Negotiation').length,
              'Closed Won': deals.filter(d => d.stage === 'Closed Won').length,
              'Closed Lost': deals.filter(d => d.stage === 'Closed Lost').length,
            }}
          />
          <SearchBar value={searchText} onChange={setSearchText} placeholder="Search deals..." />
        </div>
        
        <DataTable 
          columns={columns}
          data={filteredDeals}
          emptyTitle="Pipeline is empty"
          emptyMessage="No deals found matching your criteria."
          actions={(row) => (
            <div style={{ display: 'flex' }}>
              <button className="action-btn edit" onClick={() => handleOpenForm(row)}>Edit</button>
              <button className="action-btn delete" onClick={() => handleDelete(row.id, row.name)}>Delete</button>
            </div>
          )}
        />
      </div>

      {/* Add/Edit Modal */}
      <FormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Deal Details"
        onSubmit={handleSave}
        isEdit={!!editId}
      >
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Deal Name *</label>
            <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Website Redesign Project" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Customer</label>
            <select className="form-select" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
              <option value="">Select a customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Deal Value (₹) *</label>
            <input className="form-input" type="number" min="0" step="1000" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} placeholder="50000" />
          </div>
          <div className="form-group">
            <label className="form-label">Stage</label>
            <select className="form-select" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
              <option value="Prospecting">Prospecting</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Expected Close Date</label>
            <input className="form-input" type="date" value={formData.expectedCloseDate} onChange={e => setFormData({...formData, expectedCloseDate: e.target.value})} />
          </div>
        </div>
      </FormModal>

      <ConfirmDialog {...confirmDialog.confirmConfig} isOpen={confirmDialog.isOpen} onClose={confirmDialog.close} />
    </div>
  );
};

export default Deals;
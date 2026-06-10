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

const Tasks = () => {
  const [tasks, setTasks] = useLocalStorage('tasks', []);
  const [customers] = useLocalStorage('customers', []);
  const [leads] = useLocalStorage('leads', []);
  const toast = useToast();
  const confirmDialog = useConfirm();

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '', description: '', dueDate: '', 
    priority: 'Medium', assignedTo: '', relatedToId: '', relatedToType: ''
  });

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'Completed') return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    due.setHours(0,0,0,0); today.setHours(0,0,0,0);
    return due < today;
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchText.toLowerCase()) || 
                          (t.assignedTo && t.assignedTo.toLowerCase().includes(searchText.toLowerCase()));
    
    let matchesFilter = true;
    if (filterStatus === 'Pending') matchesFilter = t.status === 'Pending';
    if (filterStatus === 'Completed') matchesFilter = t.status === 'Completed';
    if (filterStatus === 'Overdue') matchesFilter = isOverdue(t);
    
    return matchesSearch && matchesFilter;
  });

  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const overdueCount = tasks.filter(t => isOverdue(t)).length;

  // Actions
  const handleOpenForm = (task = null) => {
    if (task) {
      setFormData({ ...task });
      setEditId(task.id);
    } else {
      setFormData({
        title: '', description: '', dueDate: '', 
        priority: 'Medium', assignedTo: '', relatedToId: '', relatedToType: ''
      });
      setEditId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.warning('Task title is required.');
      return;
    }

    if (editId) {
      const updated = tasks.map(t => t.id === editId ? { ...formData, id: editId, status: t.status, createdAt: t.createdAt } : t);
      setTasks(updated);
      logActivity('Task', `Updated task: ${formData.title}`);
      toast.success('Task updated successfully.');
    } else {
      const newTask = { ...formData, id: Date.now(), status: 'Pending', createdAt: new Date().toLocaleDateString('en-IN') };
      setTasks([...tasks, newTask]);
      logActivity('Task', `Created new task: ${formData.title}`);
      toast.success('Task added successfully.');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id, title) => {
    confirmDialog.confirm({
      title: 'Delete Task',
      message: `Are you sure you want to delete "${title}"?`,
      confirmText: 'Delete Task',
      onConfirm: () => {
        setTasks(tasks.filter(t => t.id !== id));
        logActivity('Task', `Deleted task: ${title}`);
        toast.info('Task deleted.');
      }
    });
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    const updated = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
    setTasks(updated);
    if (newStatus === 'Completed') toast.success('Task marked as completed! 🎉');
  };

  // Combine entities for dropdown
  const linkableEntities = [
    ...customers.map(c => ({ id: c.id, name: c.name, type: 'Customer' })),
    ...leads.map(l => ({ id: l.id, name: l.name, type: 'Lead' }))
  ];

  // Table config
  const columns = [
    { key: 'status', label: 'Done', render: (val, row) => (
        <input 
          type="checkbox" 
          checked={val === 'Completed'} 
          onChange={() => toggleStatus(row.id, val)}
          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
        />
      ), sortable: false
    },
    { key: 'title', label: 'Task', render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: row.status === 'Completed' ? 'var(--text-muted)' : 'inherit', textDecoration: row.status === 'Completed' ? 'line-through' : 'none' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>{row.description}</div>
        </div>
      )
    },
    { key: 'dueDate', label: 'Due Date', render: (val, row) => {
        const over = isOverdue(row);
        return (
          <span style={{ color: over ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: over ? 700 : 400 }}>
            {val || '—'} {over && '🚨'}
          </span>
        );
      }
    },
    { key: 'priority', label: 'Priority', render: val => <Badge variant={val}>{val}</Badge> },
    { key: 'assignedTo', label: 'Assigned To', render: val => val || <span className="text-muted">Unassigned</span> },
    { key: 'relatedToId', label: 'Related To', render: (val, row) => {
        if (!val) return '—';
        const entity = linkableEntities.find(e => e.id.toString() === val.toString());
        return entity ? (
          <Badge variant={entity.type === 'Customer' ? 'active' : 'new'}>
            {entity.name} ({entity.type})
          </Badge>
        ) : '—';
      }
    }
  ];

  return (
    <div className="tasks-page slide-in-top">
      <PageHeader 
        title="Tasks" 
        subtitle={`You have ${pendingCount} pending tasks.`}
        action={() => handleOpenForm()}
        actionText="Add Task"
      />

      <div className="card">
        <div className="card-header">
          <FilterTabs 
            tabs={['All', 'Pending', 'Completed', 'Overdue']} 
            activeTab={filterStatus} 
            onTabChange={setFilterStatus}
            counts={{
              'All': tasks.length,
              'Pending': pendingCount,
              'Completed': completedCount,
              'Overdue': overdueCount,
            }}
          />
          <SearchBar value={searchText} onChange={setSearchText} placeholder="Search tasks..." />
        </div>
        
        <DataTable 
          columns={columns}
          data={filteredTasks}
          emptyTitle="No tasks found"
          emptyMessage="Enjoy your free time, or add a new task."
          actions={(row) => (
            <div style={{ display: 'flex' }}>
              <button className="action-btn edit" onClick={() => handleOpenForm(row)}>Edit</button>
              <button className="action-btn delete" onClick={() => handleDelete(row.id, row.title)}>Delete</button>
            </div>
          )}
        />
      </div>

      {/* Add/Edit Modal */}
      <FormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Task Details"
        onSubmit={handleSave}
        isEdit={!!editId}
      >
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Task Title *</label>
            <input className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="What needs to be done?" autoFocus />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Add more details..." />
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input className="form-input" type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-select" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Assigned To</label>
            <input className="form-input" value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} placeholder="Assignee name" />
          </div>
          <div className="form-group">
            <label className="form-label">Related To</label>
            <select className="form-select" value={formData.relatedToId} onChange={e => {
                const entity = linkableEntities.find(ent => ent.id.toString() === e.target.value);
                setFormData({...formData, relatedToId: e.target.value, relatedToType: entity ? entity.type : ''});
              }}>
              <option value="">None</option>
              {linkableEntities.map(entity => (
                <option key={entity.id} value={entity.id}>{entity.name} ({entity.type})</option>
              ))}
            </select>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog {...confirmDialog.confirmConfig} isOpen={confirmDialog.isOpen} onClose={confirmDialog.close} />
    </div>
  );
};

export default Tasks;
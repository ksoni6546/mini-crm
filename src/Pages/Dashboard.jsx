import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import StatCard from '../Components/StatCard';
import PageHeader from '../Components/PageHeader';
import Badge from '../Components/Badge';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [customers] = useLocalStorage('customers', []);
  const [leads] = useLocalStorage('leads', []);
  const [activityLog] = useLocalStorage('activityLog', []);
  const [deals] = useLocalStorage('deals', []);
  const [tasks] = useLocalStorage('tasks', []);
  const [settings] = useLocalStorage('crmSettings', { userName: 'Admin' });

  // --- Computed stats ---
  const activeCustomers = customers.filter(c => c.status === 'Active');
  const newLeads = leads.filter(l => l.status === 'New');
  const qualifiedLeads = leads.filter(l => l.status === 'Qualified');
  
  // Tasks stats
  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tasksDueToday = pendingTasks.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    due.setHours(0,0,0,0);
    return due.getTime() === today.getTime();
  });

  const overdueTasks = pendingTasks.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    due.setHours(0,0,0,0);
    return due.getTime() < today.getTime();
  });

  // Deals stats
  const pipelineValue = deals.filter(d => d.stage !== 'Closed Lost').reduce((sum, d) => sum + (d.value || 0), 0);
  const wonValue = deals.filter(d => d.stage === 'Closed Won').reduce((sum, d) => sum + (d.value || 0), 0);
  
  // Lead bar chart data
  const leadStatuses = [
    { label: 'New', count: newLeads.length, color: 'var(--info)' },
    { label: 'Contacted', count: leads.filter(l => l.status === 'Contacted').length, color: 'var(--warning)' },
    { label: 'Qualified', count: qualifiedLeads.length, color: 'var(--purple)' },
    { label: 'Lost', count: leads.filter(l => l.status === 'Lost').length, color: 'var(--danger)' },
  ];
  const maxLeadCount = Math.max(...leadStatuses.map(s => s.count), 1);

  // Formatting helpers
  const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  
  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFirstName = (name) => {
    return name ? name.split(' ')[0] : 'there';
  };

  return (
    <div className="dashboard-page slide-in-top">
      <PageHeader 
        title={`${getGreeting()}, ${getFirstName(settings.userName)}! 👋`} 
        subtitle={`Here's what's happening with your business today. (${new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })})`}
      />

      {/* Primary Stats Grid */}
      <div className="stats-grid">
        <StatCard 
          title="Total Revenue" 
          value={wonValue} 
          isCurrency={true}
          subtitle="From won deals" 
          icon="💰" 
          colorClass="green" 
        />
        <StatCard 
          title="Pipeline Value" 
          value={pipelineValue} 
          isCurrency={true}
          subtitle="Potential revenue" 
          icon="📈" 
          colorClass="blue" 
        />
        <StatCard 
          title="Active Customers" 
          value={activeCustomers.length} 
          subtitle={`Out of ${customers.length} total`} 
          icon="👥" 
          colorClass="purple" 
        />
        <StatCard 
          title="Pending Tasks" 
          value={pendingTasks.length} 
          subtitle={overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : 'All caught up!'} 
          icon="📋" 
          colorClass={overdueTasks.length > 0 ? 'red' : 'amber'} 
        />
      </div>

      <div className="dashboard-grid">
        {/* Lead Pipeline Visualizer */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🎯 Lead Pipeline</span>
            <Link to="/leads" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="card-body">
            {leads.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-state-icon" style={{ fontSize: '32px' }}>🌱</div>
                <h3>Pipeline is empty</h3>
                <p>Add some leads to see your conversion funnel here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {leadStatuses.map(s => {
                  const widthPercent = Math.round((s.count / maxLeadCount) * 100);
                  return (
                    <div key={s.label} className="lead-bar-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '80px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{s.label}</div>
                      <div style={{ flex: 1, height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${widthPercent}%`, 
                            height: '100%', 
                            background: s.color,
                            borderRadius: '4px',
                            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                          }} 
                        />
                      </div>
                      <div style={{ width: '30px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.count}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Task Center */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚡ Action Items</span>
            <Link to="/tasks" className="btn btn-ghost btn-sm">Manage Tasks</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {pendingTasks.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <div className="empty-state-icon" style={{ fontSize: '32px' }}>🎉</div>
                <h3>All caught up!</h3>
                <p>No pending tasks on your plate.</p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none' }}>
                {/* Show overdue first, then today, then upcoming */}
                {[...overdueTasks, ...tasksDueToday, ...pendingTasks.filter(t => !overdueTasks.includes(t) && !tasksDueToday.includes(t))].slice(0, 5).map(task => {
                  const isOverdue = overdueTasks.includes(task);
                  const isToday = tasksDueToday.includes(task);
                  return (
                    <li key={task.id} style={{ 
                      padding: '16px 24px', 
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isOverdue ? 'var(--danger-light)' : 'transparent'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{task.title}</div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <Badge variant={task.priority}>{task.priority}</Badge>
                          {task.dueDate && (
                            <span style={{ fontSize: '12px', color: isOverdue ? 'var(--danger)' : 'var(--text-muted)', fontWeight: isOverdue ? 700 : 500 }}>
                              {isOverdue ? '🚨 Overdue: ' : isToday ? '⚡ Today: ' : '📅 '}{task.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card full-width">
          <div className="card-header">
            <span className="card-title">🕒 Recent Activity Log</span>
          </div>
          <div className="card-body">
            {activityLog.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <p>No activity recorded yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activityLog.slice(0, 5).map(log => (
                  <div key={log.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ 
                      width: '32px', height: '32px', 
                      borderRadius: '50%', 
                      background: 'var(--bg-secondary)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', flexShrink: 0
                    }}>
                      {log.type === 'Customer' ? '👥' : log.type === 'Lead' ? '🎯' : log.type === 'Deal' ? '💰' : log.type === 'Task' ? '📋' : '✨'}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {log.message}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {log.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
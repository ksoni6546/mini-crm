import React, { useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import PageHeader from '../Components/PageHeader';
import StatCard from '../Components/StatCard';

const Reports = () => {
  const [deals] = useLocalStorage('deals', []);
  const [leads] = useLocalStorage('leads', []);
  const [customers] = useLocalStorage('customers', []);

  // Compute stats
  const totalRevenue = deals.filter(d => d.stage === 'Closed Won').reduce((sum, d) => sum + Number(d.value), 0);
  const totalPipeline = deals.filter(d => d.stage !== 'Closed Lost').reduce((sum, d) => sum + Number(d.value), 0);
  
  // Deals by stage for chart
  const dealsByStage = useMemo(() => {
    const stages = ['Prospecting', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
    return stages.map(stage => ({
      stage,
      count: deals.filter(d => d.stage === stage).length,
      value: deals.filter(d => d.stage === stage).reduce((sum, d) => sum + Number(d.value), 0)
    }));
  }, [deals]);

  // Lead sources for pie chart (CSS-based)
  const leadsBySource = useMemo(() => {
    const sources = {};
    leads.forEach(l => {
      const s = l.source || 'Website';
      sources[s] = (sources[s] || 0) + 1;
    });
    return Object.entries(sources)
      .map(([name, count]) => ({ name, count, percentage: Math.round((count / Math.max(leads.length, 1)) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  const maxStageValue = Math.max(...dealsByStage.map(d => d.value), 1);
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="reports-page slide-in-top">
      <PageHeader 
        title="Reports & Analytics" 
        subtitle="Business intelligence and performance metrics."
      />

      <div className="stats-grid">
        <StatCard title="Win Rate" value={`${deals.length ? Math.round((deals.filter(d => d.stage === 'Closed Won').length / deals.length) * 100) : 0}%`} icon="🏆" colorClass="amber" />
        <StatCard title="Total Pipeline" value={formatCurrency(totalPipeline)} icon="📈" colorClass="blue" />
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon="💰" colorClass="green" />
        <StatCard title="Conversion Rate" value={`${leads.length ? Math.round((customers.length / (leads.length + customers.length)) * 100) : 0}%`} subtitle="Lead to Customer" icon="🎯" colorClass="purple" />
      </div>

      <div className="form-grid">
        {/* Deal Pipeline Value Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Pipeline Value by Stage</span>
          </div>
          <div className="card-body">
            {deals.length === 0 ? (
              <div className="empty-state">
                <p>No deals data available for charts.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {dealsByStage.map(s => {
                  const widthPercent = Math.round((s.value / maxStageValue) * 100);
                  return (
                    <div key={s.stage}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600 }}>{s.stage} ({s.count})</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(s.value)}</span>
                      </div>
                      <div style={{ width: '100%', height: '12px', background: 'var(--bg-secondary)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${widthPercent}%`, 
                            height: '100%', 
                            background: s.stage === 'Closed Won' ? 'var(--success)' : s.stage === 'Closed Lost' ? 'var(--danger)' : 'var(--primary)',
                            borderRadius: '6px',
                            transition: 'width 1s ease'
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Lead Sources Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🧲 Top Lead Sources</span>
          </div>
          <div className="card-body">
            {leadsBySource.length === 0 ? (
              <div className="empty-state">
                <p>No lead data available.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {leadsBySource.map((s, idx) => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ 
                      width: '40px', height: '40px', 
                      borderRadius: '50%', 
                      background: `hsl(${220 + (idx * 40)}, 70%, 60%)`, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 'bold'
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.count} Leads</div>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800 }}>
                      {s.percentage}%
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

export default Reports;

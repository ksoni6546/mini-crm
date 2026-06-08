import { useState, useEffect } from 'react'

function Dashboard() {

// Read live data from localStorage so numbers update as you add records
const [customers, setCustomers] = useState([])
const [leads, setLeads] = useState([])
const [activityLog, setActivityLog] = useState([])

function loadData() {
setCustomers(JSON.parse(localStorage.getItem('customers')) || [])
setLeads(JSON.parse(localStorage.getItem('leads')) || [])
setActivityLog(JSON.parse(localStorage.getItem('activityLog')) || [])
}

useEffect(function () {
loadData()

// Re-load whenever another page changes data
window.addEventListener('crm:storageUpdated', loadData)
window.addEventListener('storage', loadData)

return function () {
window.removeEventListener('crm:storageUpdated', loadData)
window.removeEventListener('storage', loadData)
}
}, [])

// --- Computed stats ---
let activeCustomers = customers.filter(c => c.status === 'Active')
let inactiveCustomers = customers.filter(c => c.status === 'Inactive')

let newLeads = leads.filter(l => l.status === 'New')
let contactedLeads = leads.filter(l => l.status === 'Contacted')
let qualifiedLeads = leads.filter(l => l.status === 'Qualified')
let lostLeads = leads.filter(l => l.status === 'Lost')

// Conversion rate: qualified / total leads
let conversionRate = leads.length > 0
? Math.round((qualifiedLeads.length / leads.length) * 100)
: 0

// Lead bar chart data
let leadStatuses = [
{ label: 'New', count: newLeads.length, color: '#0891b2' },
{ label: 'Contacted', count: contactedLeads.length, color: '#d97706' },
{ label: 'Qualified', count: qualifiedLeads.length, color: '#16a34a' },
{ label: 'Lost', count: lostLeads.length, color: '#dc2626' },
]

let maxLeadCount = Math.max(...leadStatuses.map(s => s.count), 1)

return (

<div className="dashboard-page">

{/* Page Header */}
<div className="page-header">
<div className="page-header-left">
<h1>Dashboard</h1>
<p>Welcome back!</p>
</div>
<div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
</div>
</div>

{/* Stat Cards Row */}
<div className="stats-grid">

<div className="stat-card">
<div className="stat-icon blue">👥</div>
<div className="stat-info">
<div className="stat-label">Total Customers</div>
<div className="stat-value">{customers.length}</div>
<div className="stat-sub">{activeCustomers.length} active</div>
</div>
</div>

<div className="stat-card">
<div className="stat-icon green">✅</div>
<div className="stat-info">
<div className="stat-label">Active Customers</div>
<div className="stat-value">{activeCustomers.length}</div>
<div className="stat-sub">{inactiveCustomers.length} inactive</div>
</div>
</div>

<div className="stat-card">
<div className="stat-icon amber">🎯</div>
<div className="stat-info">
<div className="stat-label">Total Leads</div>
<div className="stat-value">{leads.length}</div>
<div className="stat-sub">{newLeads.length} new this cycle</div>
</div>
</div>

<div className="stat-card">
<div className="stat-icon cyan">📈</div>
<div className="stat-info">
<div className="stat-label">Qualified Leads</div>
<div className="stat-value">{qualifiedLeads.length}</div>
<div className="stat-sub">{conversionRate}% conversion rate</div>
</div>
</div>

</div>

{/* Bottom Grid: Lead Chart + Activity Feed */}
<div className="dashboard-grid">

{/* Lead Pipeline Chart */}
<div className="card">
<div className="card-header">
<span className="card-title">📊 Lead Pipeline Breakdown</span>
</div>
<div className="card-body">
{
leads.length === 0 ? (
<div className="no-activity">
No leads yet. Add leads to see the pipeline chart.
</div>
) : (
leadStatuses.map(function (s) {

let widthPercent = Math.round((s.count / maxLeadCount) * 100)

return (
<div key={s.label} className="lead-bar-row">
<div className="lead-bar-label">{s.label}</div>
<div className="lead-bar-track">
<div
className="lead-bar-fill"
style={{ width: widthPercent + '%', background: s.color }}
/>
</div>
<div className="lead-bar-count">{s.count}</div>
</div>
)

})
)
}

{/* Customer split bar */}
{
customers.length > 0 && (
<div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
<div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>
Customer Status Split
</div>

<div style={{ height: 24, borderRadius: 6, overflow: 'hidden', display: 'flex', gap: 2 }}>

<div
style={{
flex: activeCustomers.length,
background: '#16a34a',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
fontSize: 11,
fontWeight: 700,
color: 'white',
minWidth: 30
}}
>
{activeCustomers.length > 0 ? activeCustomers.length : ''}
</div>

<div
style={{
flex: inactiveCustomers.length,
background: '#94a3b8',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
fontSize: 11,
fontWeight: 700,
color: 'white',
minWidth: inactiveCustomers.length > 0 ? 30 : 0
}}
>
{inactiveCustomers.length > 0 ? inactiveCustomers.length : ''}
</div>

</div>

<div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
<div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
<span style={{ width: 10, height: 10, borderRadius: 2, background: '#16a34a', display: 'inline-block' }} />
Active
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
<span style={{ width: 10, height: 10, borderRadius: 2, background: '#94a3b8', display: 'inline-block' }} />
Inactive
</div>
</div>
</div>
)
}

</div>
</div>

{/* Recent Activity Feed */}
<div className="card">
<div className="card-header">
<span className="card-title">🕐 Recent Activity</span>
<span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
Last {Math.min(activityLog.length, 6)} actions
</span>
</div>
<div className="card-body">
{
activityLog.length === 0 ? (
<div className="no-activity">
No activity yet. Start by adding customers or leads!
</div>
) : (
<ul className="activity-list">
{
activityLog.slice(0, 6).map(function (log) {
return (
<li key={log.id} className="activity-item">
<div className="activity-dot" />
<div>
<div className="activity-text">{log.message}</div>
<div className="activity-time">{log.time}</div>
</div>
</li>
)
})
}
</ul>
)
}
</div>
</div>

{/* Quick Summary Card */}
<div className="card full-width">
<div className="card-header">
<span className="card-title">📋 Quick Summary</span>
</div>
<div className="card-body">
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>

<div style={{ textAlign: 'center', padding: '12px 0' }}>
<div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
{customers.length}
</div>
<div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Total Customers</div>
</div>

<div style={{ textAlign: 'center', padding: '12px 0', borderLeft: '1px solid var(--border)' }}>
<div style={{ fontSize: 32, fontWeight: 800, color: '#16a34a', fontFamily: 'var(--font-mono)' }}>
{activeCustomers.length}
</div>
<div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Active</div>
</div>

<div style={{ textAlign: 'center', padding: '12px 0', borderLeft: '1px solid var(--border)' }}>
<div style={{ fontSize: 32, fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-mono)' }}>
{leads.length}
</div>
<div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Total Leads</div>
</div>

<div style={{ textAlign: 'center', padding: '12px 0', borderLeft: '1px solid var(--border)' }}>
<div style={{ fontSize: 32, fontWeight: 800, color: '#0891b2', fontFamily: 'var(--font-mono)' }}>
{conversionRate}%
</div>
<div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Conversion Rate</div>
</div>

</div>
</div>
</div>

</div>

</div>

)

}

export default Dashboard
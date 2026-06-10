import { useState, useEffect } from 'react'

function Settings() {

// Profile settings
const [userName, setUserName] = useState('Admin User')
const [userEmail, setUserEmail] = useState('admin@crmPro.com')
const [userPhone, setUserPhone] = useState('')
const [userRole, setUserRole] = useState('CRM Manager')
const [companyName, setCompanyName] = useState('CRM Pro')

// Preferences
const [defaultStatus, setDefaultStatus] = useState('Active')
const [defaultPriority, setDefaultPriority] = useState('Medium')
const [defaultLeadSource, setDefaultLeadSource] = useState('Website')

// UI feedback
const [saved, setSaved] = useState(false)

// Stats for the info cards
const [totalCustomers, setTotalCustomers] = useState(0)
const [totalLeads, setTotalLeads] = useState(0)

// Load saved settings and live counts on first render
useEffect(function () {

let savedSettings = JSON.parse(localStorage.getItem('crmSettings'))

if (savedSettings) {
setUserName(savedSettings.userName || 'Admin User')
setUserEmail(savedSettings.userEmail || 'admin@crmPro.com')
setUserPhone(savedSettings.userPhone || '')
setUserRole(savedSettings.userRole || 'CRM Manager')
setCompanyName(savedSettings.companyName || 'CRM Pro')
setDefaultStatus(savedSettings.defaultStatus || 'Active')
setDefaultPriority(savedSettings.defaultPriority || 'Medium')
setDefaultLeadSource(savedSettings.defaultLeadSource || 'Website')
}

let customers = JSON.parse(localStorage.getItem('customers')) || []
let leads = JSON.parse(localStorage.getItem('leads')) || []
setTotalCustomers(customers.length)
setTotalLeads(leads.length)

}, [])

function saveSettings() {

let settings = {
userName,
userEmail,
userPhone,
userRole,
companyName,
defaultStatus,
defaultPriority,
defaultLeadSource
}

localStorage.setItem('crmSettings', JSON.stringify(settings))
window.dispatchEvent(new Event('crm:storageUpdated'))

setSaved(true)
setTimeout(function () { setSaved(false) }, 3000)

}

function clearAllData() {

let confirmed = window.confirm(
'Are you sure you want to delete ALL customers, leads and activity logs? This cannot be undone.'
)

if (!confirmed) return

localStorage.removeItem('customers')
localStorage.removeItem('leads')
localStorage.removeItem('activityLog')
window.dispatchEvent(new Event('crm:storageUpdated'))

setTotalCustomers(0)
setTotalLeads(0)

alert('All data has been cleared successfully.')

}

return (

<div className="settings-page">

{/* Page Header */}
<div className="page-header">
<div className="page-header-left">
<h1>Settings</h1>
<p>Manage your profile, preferences and CRM configuration</p>
</div>

{/* Save success message */}
{saved && (
<div style={{
background: 'var(--success-light)',
color: 'var(--success)',
padding: '8px 18px',
borderRadius: 8,
fontSize: 13,
fontWeight: 600
}}>
✅ Settings saved successfully!
</div>
)}
</div>

{/* CRM Stats Overview */}
<div className="stats-grid" style={{ marginBottom: 28 }}>

<div className="stat-card">
<div className="stat-icon blue">👥</div>
<div className="stat-info">
<div className="stat-label">Total Customers</div>
<div className="stat-value">{totalCustomers}</div>
<div className="stat-sub">Stored in local database</div>
</div>
</div>

<div className="stat-card">
<div className="stat-icon amber">🎯</div>
<div className="stat-info">
<div className="stat-label">Total Leads</div>
<div className="stat-value">{totalLeads}</div>
<div className="stat-sub">In pipeline</div>
</div>
</div>

<div className="stat-card">
<div className="stat-icon green">💾</div>
<div className="stat-info">
<div className="stat-label">Data Storage</div>
<div className="stat-value">Local</div>
<div className="stat-sub">localStorage (browser)</div>
</div>
</div>

<div className="stat-card">
<div className="stat-icon cyan">⚙️</div>
<div className="stat-info">
<div className="stat-label">CRM Version</div>
<div className="stat-value">v1.0</div>
<div className="stat-sub">React + Vite</div>
</div>
</div>

</div>

{/* Profile Settings */}
<div className="card" style={{ marginBottom: 22 }}>

<div className="card-header">
<span className="card-title">👤 Profile Information</span>
</div>

<div className="card-body">
<div className="form-grid">

<div className="form-group">
<label className="form-label">Full Name</label>
<input
className="form-input"
type="text"
placeholder="Your name"
value={userName}
onChange={function (e) { setUserName(e.target.value) }}
/>
</div>

<div className="form-group">
<label className="form-label">Email Address</label>
<input
className="form-input"
type="email"
placeholder="your@email.com"
value={userEmail}
onChange={function (e) { setUserEmail(e.target.value) }}
/>
</div>

<div className="form-group">
<label className="form-label">Phone Number</label>
<input
className="form-input"
type="text"
placeholder="+91 98765 43210"
value={userPhone}
onChange={function (e) { setUserPhone(e.target.value) }}
/>
</div>

<div className="form-group">
<label className="form-label">Role / Designation</label>
<input
className="form-input"
type="text"
placeholder="e.g. CRM Manager"
value={userRole}
onChange={function (e) { setUserRole(e.target.value) }}
/>
</div>

<div className="form-group full-width">
<label className="form-label">Company / Organisation Name</label>
<input
className="form-input"
type="text"
placeholder="e.g. Tata Consultancy Services"
value={companyName}
onChange={function (e) { setCompanyName(e.target.value) }}
/>
</div>

</div>
</div>

</div>

{/* CRM Preferences */}
<div className="card" style={{ marginBottom: 22 }}>

<div className="card-header">
<span className="card-title">🛠️ CRM Preferences</span>
</div>

<div className="card-body">
<div className="form-grid">

<div className="form-group">
<label className="form-label">Default Customer Status</label>
<select
className="form-select"
value={defaultStatus}
onChange={function (e) { setDefaultStatus(e.target.value) }}
>
<option value="Active">Active</option>
<option value="Inactive">Inactive</option>
</select>
</div>

<div className="form-group">
<label className="form-label">Default Customer Priority</label>
<select
className="form-select"
value={defaultPriority}
onChange={function (e) { setDefaultPriority(e.target.value) }}
>
<option value="High">High</option>
<option value="Medium">Medium</option>
<option value="Low">Low</option>
</select>
</div>

<div className="form-group full-width">
<label className="form-label">Default Lead Source</label>
<select
className="form-select"
value={defaultLeadSource}
onChange={function (e) { setDefaultLeadSource(e.target.value) }}
>
<option value="Website">Website</option>
<option value="Referral">Referral</option>
<option value="Social Media">Social Media</option>
<option value="Cold Call">Cold Call</option>
<option value="Email Campaign">Email Campaign</option>
<option value="Trade Show">Trade Show</option>
<option value="Other">Other</option>
</select>
</div>

</div>
</div>

</div>

{/* About This CRM */}
<div className="card" style={{ marginBottom: 22 }}>

<div className="card-header">
<span className="card-title">ℹ️ About This CRM</span>
</div>

<div className="card-body">
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

<div>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
Project Name
</div>
<div style={{ fontSize: 15, fontWeight: 600 }}>CRM Pro — Business Suite</div>
</div>

<div>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
Built With
</div>
<div style={{ fontSize: 15, fontWeight: 600 }}>React.js + Vite</div>
</div>

<div>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
Features
</div>
<div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
Customer Management, Lead Pipeline,<br />
Priority Tracking, Follow-Up Dates,<br />
Lead Source Tracking, Activity Log
</div>
</div>

<div>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
Data Storage
</div>
<div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
All data is stored locally in your browser using localStorage.<br />
No backend or internet connection required.
</div>
</div>

</div>
</div>

</div>

{/* Save Button */}
<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>

<button className="btn btn-primary" onClick={saveSettings}>
💾 Save Settings
</button>

<button
className="btn btn-ghost"
onClick={clearAllData}
style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
>
🗑️ Clear All Data
</button>

</div>

</div>

)

}

export default Settings
import { useState, useEffect } from 'react'

function Leads() {

const [leads, setLeads] = useState([])
const [leadName, setLeadName] = useState('')
const [leadEmail, setLeadEmail] = useState('')
const [leadPhone, setLeadPhone] = useState('')
const [company, setCompany] = useState('')
const [status, setStatus] = useState('New')
const [leadSource, setLeadSource] = useState('Website')
const [editId, setEditId] = useState(null)
const [searchText, setSearchText] = useState('')
const [selectedLead, setSelectedLead] = useState(null)
const [showForm, setShowForm] = useState(false)
const [filterStatus, setFilterStatus] = useState('All')

// Load leads from localStorage on first render
useEffect(function () {
let saved = JSON.parse(localStorage.getItem('leads'))
if (saved) {
setLeads(saved)
}
}, [])

// Save leads to localStorage whenever they change
useEffect(function () {
localStorage.setItem('leads', JSON.stringify(leads))
window.dispatchEvent(new Event('crm:storageUpdated'))
}, [leads])

// --- CRUD Functions ---

function addLead() {

if (
leadName.trim() === '' ||
leadEmail.trim() === '' ||
company.trim() === ''
) {
alert('Please enter lead name, email and company')
return
}

let newLead = {
id: Date.now(),
name: leadName,
email: leadEmail,
phone: leadPhone,
company: company,
status: status,
source: leadSource,
createdAt: new Date().toLocaleDateString('en-IN')
}

setLeads([...leads, newLead])
clearForm()
setShowForm(false)

}

function editLead(lead) {
setLeadName(lead.name)
setLeadEmail(lead.email || '')
setLeadPhone(lead.phone || '')
setCompany(lead.company)
setStatus(lead.status)
setLeadSource(lead.source || 'Website')
setEditId(lead.id)
setShowForm(true)
}

function updateLead() {

let updated = leads.map(function (lead) {
if (lead.id === editId) {
return {
...lead,
name: leadName,
email: leadEmail,
phone: leadPhone,
company: company,
status: status,
source: leadSource
}
}
return lead
})

setLeads(updated)
clearForm()
setEditId(null)
setShowForm(false)

}

function deleteLead(leadId) {

let updated = leads.filter(function (lead) {
return lead.id !== leadId
})

setLeads(updated)

if (selectedLead && selectedLead.id === leadId) {
setSelectedLead(null)
}

}

function convertToCustomer(lead) {

let customers = JSON.parse(localStorage.getItem('customers')) || []

let newCustomer = {
id: Date.now(),
name: lead.name,
email: lead.email || '',
phone: lead.phone || '',
company: lead.company,
status: 'Active',
priority: 'Medium',
followUpDate: '',
note: 'Converted from lead. Source: ' + (lead.source || 'Unknown'),
activity: [
{
id: Date.now() + 1,
type: 'Conversion',
message: 'Converted from lead to customer',
time: new Date().toLocaleString()
}
]
}

customers.push(newCustomer)
localStorage.setItem('customers', JSON.stringify(customers))

// Add to global activity log
let activityLog = JSON.parse(localStorage.getItem('activityLog')) || []
activityLog.unshift({
id: Date.now(),
type: 'Conversion',
message: 'Converted lead ' + lead.name + ' to customer',
time: new Date().toLocaleString()
})
localStorage.setItem('activityLog', JSON.stringify(activityLog))

window.dispatchEvent(new Event('crm:storageUpdated'))

deleteLead(lead.id)
alert(lead.name + ' has been converted to a customer!')

}

function clearForm() {
setLeadName('')
setLeadEmail('')
setLeadPhone('')
setCompany('')
setStatus('New')
setLeadSource('Website')
}

// Badge color for lead status
function statusBadge(s) {
if (s === 'New') return 'badge badge-new'
if (s === 'Contacted') return 'badge badge-contacted'
if (s === 'Qualified') return 'badge badge-qualified'
return 'badge badge-lost'
}

// Filter by status tab + search text
let filteredLeads = leads.filter(function (lead) {

let matchesSearch = lead.name.toLowerCase().includes(searchText.toLowerCase()) ||
lead.company.toLowerCase().includes(searchText.toLowerCase())

let matchesFilter = filterStatus === 'All' || lead.status === filterStatus

return matchesSearch && matchesFilter

})

// Count per status for tab badges
function countByStatus(s) {
return leads.filter(function (l) { return l.status === s }).length
}

return (

<div className="leads-page">

{/* Page Header */}
<div className="page-header">
<div className="page-header-left">
<h1>Leads</h1>
<p>{leads.length} total leads in pipeline</p>
</div>
<button
className="btn btn-primary"
onClick={function () {
clearForm()
setEditId(null)
setShowForm(!showForm)
}}
>
{showForm ? '✕ Cancel' : '+ Add Lead'}
</button>
</div>

{/* Add / Edit Form */}
{showForm && (
<div className="card mb-20">
<div className="card-header">
<span className="card-title">
{editId ? '✏️ Update Lead' : '➕ New Lead'}
</span>
</div>
<div className="card-body">

<div className="form-grid">

<div className="form-group">
<label className="form-label">Lead Name *</label>
<input
className="form-input"
type="text"
placeholder="e.g. Kartik Soni"
value={leadName}
onChange={function (e) { setLeadName(e.target.value) }}
/>
</div>

<div className="form-group">
<label className="form-label">Email Address *</label>
<input
className="form-input"
type="email"
placeholder="e.g. kartik@gmail.com"
value={leadEmail}
onChange={function (e) { setLeadEmail(e.target.value) }}
/>
</div>

<div className="form-group">
<label className="form-label">Phone Number</label>
<input
className="form-input"
type="text"
placeholder="e.g. +91 9876500000"
value={leadPhone}
onChange={function (e) { setLeadPhone(e.target.value) }}
/>
</div>

<div className="form-group">
<label className="form-label">Company *</label>
<input
className="form-input"
type="text"
placeholder="e.g. In Time Tec"
value={company}
onChange={function (e) { setCompany(e.target.value) }}
/>
</div>

<div className="form-group">
<label className="form-label">Lead Status</label>
<select
className="form-select"
value={status}
onChange={function (e) { setStatus(e.target.value) }}
>
<option value="New">New</option>
<option value="Contacted">Contacted</option>
<option value="Qualified">Qualified</option>
<option value="Lost">Lost</option>
</select>
</div>

<div className="form-group">
<label className="form-label">Lead Source</label>
<select
className="form-select"
value={leadSource}
onChange={function (e) { setLeadSource(e.target.value) }}
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

<div style={{ marginTop: 8 }}>
{editId ? (
<button className="btn btn-warning" onClick={updateLead}>
✏️ Update Lead
</button>
) : (
<button className="btn btn-primary" onClick={addLead}>
➕ Add Lead
</button>
)}
</div>

</div>
</div>
)}

{/* Status Filter Tabs */}
<div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>

{['All', 'New', 'Contacted', 'Qualified', 'Lost'].map(function (tab) {
return (
<button
key={tab}
onClick={function () { setFilterStatus(tab) }}
style={{
padding: '7px 16px',
borderRadius: 8,
border: 'none',
fontSize: 13,
fontWeight: 600,
cursor: 'pointer',
fontFamily: 'var(--font-main)',
background: filterStatus === tab ? 'var(--primary)' : 'white',
color: filterStatus === tab ? 'white' : 'var(--text-secondary)',
boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
transition: 'all 0.15s ease'
}}
>
{tab} {tab !== 'All' ? '(' + countByStatus(tab) + ')' : '(' + leads.length + ')'}
</button>
)
})}

</div>

{/* Leads Table */}
<div className="card">

<div className="card-header">
<span className="card-title">Lead Pipeline</span>
<div className="search-bar">
<input
type="text"
placeholder="Search by name or company..."
value={searchText}
onChange={function (e) { setSearchText(e.target.value) }}
/>
</div>
</div>

<div className="table-wrapper">
<table>
<thead>
<tr>
<th>#</th>
<th>Name</th>
<th>Email</th>
<th>Phone</th>
<th>Company</th>
<th>Source</th>
<th>Status</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{filteredLeads.length === 0 ? (
<tr>
<td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
No leads found
</td>
</tr>
) : (
filteredLeads.map(function (lead, index) {
return (
<tr
key={lead.id}
onClick={function () { setSelectedLead(lead) }}
>
<td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{index + 1}</td>
<td style={{ fontWeight: 600 }}>{lead.name}</td>
<td style={{ color: 'var(--text-secondary)' }}>{lead.email || '—'}</td>
<td style={{ color: 'var(--text-secondary)' }}>{lead.phone || '—'}</td>
<td>{lead.company}</td>
<td>
<span style={{
fontSize: 12,
padding: '2px 8px',
borderRadius: 12,
background: 'var(--primary-light)',
color: 'var(--primary)',
fontWeight: 600
}}>
{lead.source || 'Website'}
</span>
</td>
<td>
<span className={statusBadge(lead.status)}>
{lead.status}
</span>
</td>
<td onClick={function (e) { e.stopPropagation() }}>
<button
className="edit-btn"
onClick={function () { editLead(lead) }}
>
Edit
</button>
<button
className="edit-btn"
style={{ background: '#16a34a', marginRight: 6 }}
onClick={function () { convertToCustomer(lead) }}
>
Convert
</button>
<button
className="delete-btn"
onClick={function () { deleteLead(lead.id) }}
>
Delete
</button>
</td>
</tr>
)
})
)}
</tbody>
</table>
</div>

</div>

{/* Lead Details Panel */}
{selectedLead && (
<div className="card" style={{ marginTop: 20 }}>
<div className="card-header">
<span className="card-title">🎯 {selectedLead.name} — Lead Details</span>
<button
className="btn btn-ghost btn-sm"
onClick={function () { setSelectedLead(null) }}
>
✕ Close
</button>
</div>
<div className="card-body">

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

<div>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Email</div>
<div style={{ fontWeight: 500 }}>{selectedLead.email || '—'}</div>
</div>

<div>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Phone</div>
<div style={{ fontWeight: 500 }}>{selectedLead.phone || '—'}</div>
</div>

<div>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Company</div>
<div style={{ fontWeight: 500 }}>{selectedLead.company}</div>
</div>

<div>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Lead Source</div>
<div style={{ fontWeight: 500 }}>{selectedLead.source || 'Website'}</div>
</div>

<div>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Status</div>
<span className={statusBadge(selectedLead.status)}>
{selectedLead.status}
</span>
</div>

<div>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Created</div>
<div style={{ fontWeight: 500 }}>{selectedLead.createdAt || '—'}</div>
</div>

</div>

</div>
</div>
)}

</div>

)

}

export default Leads
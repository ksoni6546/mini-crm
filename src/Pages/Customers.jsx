import { useEffect, useState } from 'react'

function Customers() {

const [customers, setCustomers] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
const [searchText, setSearchText] = useState('')
const [selectedCustomer, setSelectedCustomer] = useState(null)
const [activityLog, setActivityLog] = useState([])

// Form fields
const [newName, setNewName] = useState('')
const [newEmail, setNewEmail] = useState('')
const [newPhone, setNewPhone] = useState('')
const [newCompany, setNewCompany] = useState('')
const [newStatus, setNewStatus] = useState('Active')
const [newNote, setNewNote] = useState('')
const [newPriority, setNewPriority] = useState('Medium')
const [newFollowUp, setNewFollowUp] = useState('')
const [editId, setEditId] = useState(null)
const [showForm, setShowForm] = useState(false)
const [filterPriority, setFilterPriority] = useState('All')

function normalizeCustomers(list) {
return list.map(function (customer) {
return {
...customer,
activity: customer.activity || [],
priority: customer.priority || 'Medium',
followUpDate: customer.followUpDate || ''
}
})
}

function loadSavedCustomers() {
let saved = JSON.parse(localStorage.getItem('customers'))
if (Array.isArray(saved)) return normalizeCustomers(saved)
return null
}

// Check if follow-up date is today or overdue
function getFollowUpAlert(dateStr) {
if (!dateStr) return null
let today = new Date()
let followUp = new Date(dateStr)
today.setHours(0, 0, 0, 0)
followUp.setHours(0, 0, 0, 0)
let diff = (followUp - today) / (1000 * 60 * 60 * 24)
if (diff < 0) return 'overdue'
if (diff === 0) return 'today'
if (diff <= 3) return 'soon'
return null
}

useEffect(function () {
let savedLogs = JSON.parse(localStorage.getItem('activityLog')) || []
setActivityLog(savedLogs)
let savedCustomers = loadSavedCustomers()
if (savedCustomers !== null) {
setCustomers(savedCustomers)
setLoading(false)
if (savedCustomers.length > 0) return
}
fetch('https://jsonplaceholder.typicode.com/users')
.then(function (res) { return res.json() })
.then(function (data) {
let mapped = data.map(function (user) {
return {
...user,
phone: user.phone || '',
company: user.company?.name || '',
status: 'Active',
priority: 'Medium',
followUpDate: '',
note: '',
activity: []
}
})
setCustomers(mapped)
setLoading(false)
})
.catch(function () {
setError('Failed to load customers')
setLoading(false)
})
}, [])

useEffect(function () {
function handleUpdate() {
let savedLogs = JSON.parse(localStorage.getItem('activityLog')) || []
let savedCustomers = loadSavedCustomers() || []
setActivityLog(savedLogs)
setCustomers(savedCustomers)
setSelectedCustomer(function (prev) {
if (!prev) return prev
return savedCustomers.find(function (x) { return x.id === prev.id }) || prev
})
}
window.addEventListener('crm:storageUpdated', handleUpdate)
window.addEventListener('storage', handleUpdate)
return function () {
window.removeEventListener('crm:storageUpdated', handleUpdate)
window.removeEventListener('storage', handleUpdate)
}
}, [])

useEffect(function () {
if (!loading) {
try { localStorage.setItem('customers', JSON.stringify(customers)) } catch (e) {}
}
}, [customers, loading])

// --- CSV Export ---
function exportToCSV() {
let headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Priority', 'Follow-Up Date', 'Notes']
let rows = customers.map(function (c) {
return [
c.name, c.email, c.phone || '',
c.company || '', c.status,
c.priority || 'Medium',
c.followUpDate || '',
(c.note || '').replace(/,/g, ' ')
].join(',')
})
let csvContent = [headers.join(','), ...rows].join('\n')
let blob = new Blob([csvContent], { type: 'text/csv' })
let url = URL.createObjectURL(blob)
let a = document.createElement('a')
a.href = url
a.download = 'customers.csv'
a.click()
URL.revokeObjectURL(url)
}

// --- CRUD ---
function addCustomer() {
if (newName.trim() === '' || newEmail.trim() === '') {
alert('Please enter both name and email')
return
}
let newCustomer = {
id: Date.now(), name: newName, email: newEmail,
phone: newPhone, company: newCompany, note: newNote,
status: newStatus, priority: newPriority,
followUpDate: newFollowUp, activity: []
}
let next = [...customers, newCustomer]
setCustomers(next)
try { localStorage.setItem('customers', JSON.stringify(next)); window.dispatchEvent(new Event('crm:storageUpdated')) } catch (e) {}
clearForm()
setShowForm(false)
}

function editCustomer(customer) {
setNewName(customer.name); setNewEmail(customer.email)
setNewPhone(customer.phone || ''); setNewCompany(customer.company || '')
setNewStatus(customer.status); setNewNote(customer.note || '')
setNewPriority(customer.priority || 'Medium')
setNewFollowUp(customer.followUpDate || '')
setEditId(customer.id); setShowForm(true)
}

function updateCustomer() {
let updated = customers.map(function (c) {
if (c.id === editId) {
return { ...c, name: newName, email: newEmail, phone: newPhone,
company: newCompany, note: newNote, status: newStatus,
priority: newPriority, followUpDate: newFollowUp }
}
return c
})
setCustomers(updated)
try { localStorage.setItem('customers', JSON.stringify(updated)); window.dispatchEvent(new Event('crm:storageUpdated')) } catch (e) {}
clearForm(); setEditId(null); setShowForm(false)
}

function deleteCustomer(customerId) {
let updated = customers.filter(function (c) { return c.id !== customerId })
setCustomers(updated)
if (selectedCustomer && selectedCustomer.id === customerId) setSelectedCustomer(null)
try { localStorage.setItem('customers', JSON.stringify(updated)); window.dispatchEvent(new Event('crm:storageUpdated')) } catch (e) {}
}

function toggleStatus(customerId) {
let updated = customers.map(function (c) {
if (c.id === customerId) return { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' }
return c
})
setCustomers(updated)
try { localStorage.setItem('customers', JSON.stringify(updated)); window.dispatchEvent(new Event('crm:storageUpdated')) } catch (e) {}
}

function clearForm() {
setNewName(''); setNewEmail(''); setNewPhone(''); setNewCompany('')
setNewStatus('Active'); setNewNote(''); setNewPriority('Medium'); setNewFollowUp('')
}

function priorityBadge(p) {
if (p === 'High') return 'badge badge-high'
if (p === 'Low') return 'badge badge-low'
return 'badge badge-medium'
}

if (loading) return <div className="loading-state">Loading Customers...</div>
if (error) return <div className="loading-state">{error}</div>

// Follow-up alerts — customers due today or overdue
let alertCustomers = customers.filter(function (c) {
let alert = getFollowUpAlert(c.followUpDate)
return alert === 'today' || alert === 'overdue'
})

let filteredCustomers = customers.filter(function (c) {
let matchSearch = c.name.toLowerCase().includes(searchText.toLowerCase()) ||
(c.company || '').toLowerCase().includes(searchText.toLowerCase())
let matchPriority = filterPriority === 'All' || c.priority === filterPriority
return matchSearch && matchPriority
})

return (

<div className="customers-page">

{/* Page Header */}
<div className="page-header">
<div className="page-header-left">
<h1>Customers</h1>
<p>{customers.length} total — {customers.filter(c => c.status === 'Active').length} active</p>
</div>
<div style={{ display: 'flex', gap: 10 }}>
<button className="btn btn-ghost" onClick={exportToCSV}>
⬇️ Export CSV
</button>
<button
className="btn btn-primary"
onClick={function () { clearForm(); setEditId(null); setShowForm(!showForm) }}
>
{showForm ? '✕ Cancel' : '+ Add Customer'}
</button>
</div>
</div>

{/* Follow-Up Alert Banner */}
{alertCustomers.length > 0 && (
<div style={{
background: '#fef3c7', border: '1px solid #f59e0b',
borderRadius: 10, padding: '12px 18px', marginBottom: 20,
display: 'flex', alignItems: 'center', gap: 12
}}>
<span style={{ fontSize: 20 }}>⚠️</span>
<div>
<div style={{ fontWeight: 700, fontSize: 14, color: '#92400e' }}>
Follow-Up Alert — {alertCustomers.length} customer{alertCustomers.length > 1 ? 's' : ''} need attention!
</div>
<div style={{ fontSize: 13, color: '#b45309', marginTop: 3 }}>
{alertCustomers.map(function (c) { return c.name }).join(', ')}
</div>
</div>
</div>
)}

{/* Add / Edit Form */}
{showForm && (
<div className="card mb-20">
<div className="card-header">
<span className="card-title">{editId ? '✏️ Update Customer' : '➕ New Customer'}</span>
</div>
<div className="card-body">
<div className="form-grid">

<div className="form-group">
<label className="form-label">Full Name *</label>
<input className="form-input" type="text" placeholder="e.g. Rahul Sharma"
value={newName} onChange={function (e) { setNewName(e.target.value) }} />
</div>

<div className="form-group">
<label className="form-label">Email Address *</label>
<input className="form-input" type="email" placeholder="e.g. rahul@company.com"
value={newEmail} onChange={function (e) { setNewEmail(e.target.value) }} />
</div>

<div className="form-group">
<label className="form-label">Phone Number</label>
<input className="form-input" type="text" placeholder="+91 98765 43210"
value={newPhone} onChange={function (e) { setNewPhone(e.target.value) }} />
</div>

<div className="form-group">
<label className="form-label">Company</label>
<input className="form-input" type="text" placeholder="e.g. Tata Consultancy"
value={newCompany} onChange={function (e) { setNewCompany(e.target.value) }} />
</div>

<div className="form-group">
<label className="form-label">Status</label>
<select className="form-select" value={newStatus}
onChange={function (e) { setNewStatus(e.target.value) }}>
<option value="Active">Active</option>
<option value="Inactive">Inactive</option>
</select>
</div>

<div className="form-group">
<label className="form-label">Priority</label>
<select className="form-select" value={newPriority}
onChange={function (e) { setNewPriority(e.target.value) }}>
<option value="High">High</option>
<option value="Medium">Medium</option>
<option value="Low">Low</option>
</select>
</div>

<div className="form-group">
<label className="form-label">Follow-Up Date</label>
<input className="form-input" type="date" value={newFollowUp}
onChange={function (e) { setNewFollowUp(e.target.value) }} />
</div>

<div className="form-group full-width">
<label className="form-label">Notes</label>
<textarea className="form-textarea" placeholder="Any notes about this customer..."
value={newNote} onChange={function (e) { setNewNote(e.target.value) }} />
</div>

</div>
<div style={{ marginTop: 8 }}>
{editId
? <button className="btn btn-warning" onClick={updateCustomer}>✏️ Update Customer</button>
: <button className="btn btn-primary" onClick={addCustomer}>➕ Add Customer</button>
}
</div>
</div>
</div>
)}

{/* Priority Filter Tabs */}
<div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
{['All', 'High', 'Medium', 'Low'].map(function (tab) {
return (
<button key={tab} onClick={function () { setFilterPriority(tab) }}
style={{
padding: '7px 16px', borderRadius: 8, border: 'none',
fontSize: 13, fontWeight: 600, cursor: 'pointer',
fontFamily: 'var(--font-main)',
background: filterPriority === tab ? 'var(--primary)' : 'white',
color: filterPriority === tab ? 'white' : 'var(--text-secondary)',
boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'all 0.15s ease'
}}
>
{tab} ({tab === 'All' ? customers.length : customers.filter(c => c.priority === tab).length})
</button>
)
})}
</div>

{/* Customers Table */}
<div className="card">
<div className="card-header">
<span className="card-title">All Customers</span>
<div className="search-bar">
<input type="text" placeholder="Search by name or company..."
value={searchText} onChange={function (e) { setSearchText(e.target.value) }} />
</div>
</div>
<div className="table-wrapper">
<table>
<thead>
<tr>
<th>#</th><th>Name</th><th>Email</th><th>Phone</th>
<th>Company</th><th>Priority</th><th>Follow-Up</th>
<th>Status</th><th>Actions</th>
</tr>
</thead>
<tbody>
{filteredCustomers.length === 0 ? (
<tr>
<td colSpan="9" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
No customers found
</td>
</tr>
) : (
filteredCustomers.map(function (customer, index) {
let alert = getFollowUpAlert(customer.followUpDate)
return (
<tr key={customer.id}
onClick={function () { setSelectedCustomer(customer) }}
style={{ background: alert === 'overdue' ? '#fff5f5' : alert === 'today' ? '#fffbeb' : 'transparent' }}
>
<td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{index + 1}</td>
<td style={{ fontWeight: 600 }}>{customer.name}</td>
<td style={{ color: 'var(--text-secondary)' }}>{customer.email}</td>
<td style={{ color: 'var(--text-secondary)' }}>{customer.phone || '—'}</td>
<td>{customer.company || '—'}</td>
<td><span className={priorityBadge(customer.priority)}>{customer.priority || 'Medium'}</span></td>
<td style={{ fontSize: 13 }}>
{customer.followUpDate ? (
<span style={{
color: alert === 'overdue' ? 'var(--danger)' : alert === 'today' ? 'var(--warning)' : 'var(--text-secondary)',
fontWeight: (alert === 'overdue' || alert === 'today') ? 700 : 400
}}>
{customer.followUpDate}
{alert === 'overdue' && ' 🚨'}
{alert === 'today' && ' ⚡'}
{alert === 'soon' && ' 🔔'}
</span>
) : '—'}
</td>
<td>
<span className={customer.status === 'Active' ? 'badge badge-active' : 'badge badge-inactive'}>
{customer.status}
</span>
</td>
<td onClick={function (e) { e.stopPropagation() }}>
<button className="edit-btn" onClick={function () { editCustomer(customer) }}>Edit</button>
<button className="edit-btn" style={{ background: 'var(--info)' }}
onClick={function () { toggleStatus(customer.id) }}>Toggle</button>
<button className="delete-btn" onClick={function () { deleteCustomer(customer.id) }}>Delete</button>
</td>
</tr>
)
})
)}
</tbody>
</table>
</div>
</div>

{/* Customer Details Panel */}
{selectedCustomer && (
<div className="card" style={{ marginTop: 20 }}>
<div className="card-header">
<span className="card-title">👤 {selectedCustomer.name} — Details</span>
<button className="btn btn-ghost btn-sm" onClick={function () { setSelectedCustomer(null) }}>✕ Close</button>
</div>
<div className="card-body">
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
<div>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Email</div>
<div style={{ fontWeight: 500 }}>{selectedCustomer.email}</div>
</div>
<div>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Phone</div>
<div style={{ fontWeight: 500 }}>{selectedCustomer.phone || '—'}</div>
</div>
<div>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Company</div>
<div style={{ fontWeight: 500 }}>{selectedCustomer.company || '—'}</div>
</div>
<div>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Priority</div>
<span className={priorityBadge(selectedCustomer.priority)}>{selectedCustomer.priority || 'Medium'}</span>
</div>
<div>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Follow-Up Date</div>
<div style={{ fontWeight: 500 }}>{selectedCustomer.followUpDate || 'Not set'}</div>
</div>
<div>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Status</div>
<span className={selectedCustomer.status === 'Active' ? 'badge badge-active' : 'badge badge-inactive'}>
{selectedCustomer.status}
</span>
</div>
{selectedCustomer.note && (
<div style={{ gridColumn: '1 / -1' }}>
<div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Notes</div>
<div style={{ fontSize: 14, color: 'var(--text-secondary)', background: 'var(--bg)', padding: '10px 14px', borderRadius: 8 }}>
{selectedCustomer.note}
</div>
</div>
)}
</div>
</div>
</div>
)}

{/* Recent Activity */}
{activityLog.length > 0 && (
<div className="card" style={{ marginTop: 20 }}>
<div className="card-header"><span className="card-title">🕐 Recent Activity</span></div>
<div className="card-body">
<ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
{activityLog.slice(0, 5).map(function (log) {
return (
<li key={log.id} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '8px 12px', background: 'var(--bg)', borderRadius: 8 }}>
{log.time} — {log.message}
</li>
)
})}
</ul>
</div>
</div>
)}

</div>

)

}

export default Customers
import { useState, useEffect } from 'react'

function Deals() {

const [deals, setDeals] = useState([])
const [title, setTitle] = useState('')
const [customer, setCustomer] = useState('')
const [value, setValue] = useState('')
const [stage, setStage] = useState('Prospecting')
const [closeDate, setCloseDate] = useState('')
const [notes, setNotes] = useState('')
const [editId, setEditId] = useState(null)
const [showForm, setShowForm] = useState(false)
const [filterStage, setFilterStage] = useState('All')
const [searchText, setSearchText] = useState('')

// Load deals from localStorage
useEffect(function () {
let saved = JSON.parse(localStorage.getItem('deals')) || []
setDeals(saved)
}, [])

// Save deals on every change
useEffect(function () {
localStorage.setItem('deals', JSON.stringify(deals))
window.dispatchEvent(new Event('crm:storageUpdated'))
}, [deals])

function addDeal() {
if (title.trim() === '' || customer.trim() === '' || value === '') {
alert('Please enter deal title, customer and value')
return
}
let newDeal = {
id: Date.now(),
title: title,
customer: customer,
value: parseFloat(value),
stage: stage,
closeDate: closeDate,
notes: notes,
createdAt: new Date().toLocaleDateString('en-IN')
}
setDeals([...deals, newDeal])
clearForm()
setShowForm(false)
}

function editDeal(deal) {
setTitle(deal.title); setCustomer(deal.customer)
setValue(deal.value); setStage(deal.stage)
setCloseDate(deal.closeDate || ''); setNotes(deal.notes || '')
setEditId(deal.id); setShowForm(true)
}

function updateDeal() {
let updated = deals.map(function (d) {
if (d.id === editId) {
return { ...d, title, customer, value: parseFloat(value), stage, closeDate, notes }
}
return d
})
setDeals(updated)
clearForm(); setEditId(null); setShowForm(false)
}

function deleteDeal(dealId) {
setDeals(deals.filter(function (d) { return d.id !== dealId }))
}

function clearForm() {
setTitle(''); setCustomer(''); setValue('')
setStage('Prospecting'); setCloseDate(''); setNotes('')
}

// CSV Export for Deals
function exportToCSV() {
let headers = ['Title', 'Customer', 'Value (INR)', 'Stage', 'Close Date', 'Notes']
let rows = deals.map(function (d) {
return [
d.title, d.customer, d.value,
d.stage, d.closeDate || '',
(d.notes || '').replace(/,/g, ' ')
].join(',')
})
let csvContent = [headers.join(','), ...rows].join('\n')
let blob = new Blob([csvContent], { type: 'text/csv' })
let url = URL.createObjectURL(blob)
let a = document.createElement('a')
a.href = url; a.download = 'deals.csv'; a.click()
URL.revokeObjectURL(url)
}

function stageBadge(s) {
if (s === 'Prospecting') return 'badge badge-new'
if (s === 'Proposal') return 'badge badge-contacted'
if (s === 'Negotiation') return 'badge badge-medium'
if (s === 'Closed Won') return 'badge badge-qualified'
if (s === 'Closed Lost') return 'badge badge-lost'
return 'badge badge-new'
}

// Format currency
function formatINR(amount) {
return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

// Computed stats
let totalRevenue = deals.filter(d => d.stage === 'Closed Won').reduce((sum, d) => sum + d.value, 0)
let pipelineValue = deals.filter(d => d.stage !== 'Closed Lost').reduce((sum, d) => sum + d.value, 0)
let closedWon = deals.filter(d => d.stage === 'Closed Won').length
let closedLost = deals.filter(d => d.stage === 'Closed Lost').length
let winRate = (closedWon + closedLost) > 0
? Math.round((closedWon / (closedWon + closedLost)) * 100) : 0

let filteredDeals = deals.filter(function (d) {
let matchSearch = d.title.toLowerCase().includes(searchText.toLowerCase()) ||
d.customer.toLowerCase().includes(searchText.toLowerCase())
let matchStage = filterStage === 'All' || d.stage === filterStage
return matchSearch && matchStage
})

let stages = ['Prospecting', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']

return (

<div className="customers-page">

{/* Page Header */}
<div className="page-header">
<div className="page-header-left">
<h1>Deals</h1>
<p>{deals.length} deals — {formatINR(pipelineValue)} in pipeline</p>
</div>
<div style={{ display: 'flex', gap: 10 }}>
<button className="btn btn-ghost" onClick={exportToCSV}>⬇️ Export CSV</button>
<button className="btn btn-primary"
onClick={function () { clearForm(); setEditId(null); setShowForm(!showForm) }}>
{showForm ? '✕ Cancel' : '+ Add Deal'}
</button>
</div>
</div>

{/* Stats Cards */}
<div className="stats-grid" style={{ marginBottom: 24 }}>

<div className="stat-card">
<div className="stat-icon green">💰</div>
<div className="stat-info">
<div className="stat-label">Total Revenue</div>
<div className="stat-value" style={{ fontSize: 20 }}>{formatINR(totalRevenue)}</div>
<div className="stat-sub">Closed won deals</div>
</div>
</div>

<div className="stat-card">
<div className="stat-icon blue">📊</div>
<div className="stat-info">
<div className="stat-label">Pipeline Value</div>
<div className="stat-value" style={{ fontSize: 20 }}>{formatINR(pipelineValue)}</div>
<div className="stat-sub">All active deals</div>
</div>
</div>

<div className="stat-card">
<div className="stat-icon amber">🏆</div>
<div className="stat-info">
<div className="stat-label">Deals Won</div>
<div className="stat-value">{closedWon}</div>
<div className="stat-sub">{winRate}% win rate</div>
</div>
</div>

<div className="stat-card">
<div className="stat-icon cyan">📋</div>
<div className="stat-info">
<div className="stat-label">Total Deals</div>
<div className="stat-value">{deals.length}</div>
<div className="stat-sub">{closedLost} lost</div>
</div>
</div>

</div>

{/* Pipeline Stage Overview */}
<div className="card" style={{ marginBottom: 24 }}>
<div className="card-header">
<span className="card-title">📊 Pipeline by Stage</span>
</div>
<div className="card-body">
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
{stages.map(function (s) {
let stageDeals = deals.filter(function (d) { return d.stage === s })
let stageValue = stageDeals.reduce(function (sum, d) { return sum + d.value }, 0)
return (
<div key={s} style={{
textAlign: 'center', padding: '16px 12px',
background: 'var(--bg)', borderRadius: 10,
border: '1px solid var(--border)'
}}>
<div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
{stageDeals.length}
</div>
<div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 4 }}>{s}</div>
<div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{formatINR(stageValue)}</div>
</div>
)
})}
</div>
</div>
</div>

{/* Add / Edit Form */}
{showForm && (
<div className="card mb-20">
<div className="card-header">
<span className="card-title">{editId ? '✏️ Update Deal' : '➕ New Deal'}</span>
</div>
<div className="card-body">
<div className="form-grid">

<div className="form-group">
<label className="form-label">Deal Title *</label>
<input className="form-input" type="text" placeholder="e.g. Annual Software License"
value={title} onChange={function (e) { setTitle(e.target.value) }} />
</div>

<div className="form-group">
<label className="form-label">Customer Name *</label>
<input className="form-input" type="text" placeholder="e.g. Rahul Sharma"
value={customer} onChange={function (e) { setCustomer(e.target.value) }} />
</div>

<div className="form-group">
<label className="form-label">Deal Value (INR) *</label>
<input className="form-input" type="number" placeholder="e.g. 150000"
value={value} onChange={function (e) { setValue(e.target.value) }} />
</div>

<div className="form-group">
<label className="form-label">Deal Stage</label>
<select className="form-select" value={stage}
onChange={function (e) { setStage(e.target.value) }}>
<option value="Prospecting">Prospecting</option>
<option value="Proposal">Proposal</option>
<option value="Negotiation">Negotiation</option>
<option value="Closed Won">Closed Won</option>
<option value="Closed Lost">Closed Lost</option>
</select>
</div>

<div className="form-group">
<label className="form-label">Expected Close Date</label>
<input className="form-input" type="date" value={closeDate}
onChange={function (e) { setCloseDate(e.target.value) }} />
</div>

<div className="form-group full-width">
<label className="form-label">Notes</label>
<textarea className="form-textarea" placeholder="Deal notes, requirements, key contacts..."
value={notes} onChange={function (e) { setNotes(e.target.value) }} />
</div>

</div>
<div style={{ marginTop: 8 }}>
{editId
? <button className="btn btn-warning" onClick={updateDeal}>✏️ Update Deal</button>
: <button className="btn btn-primary" onClick={addDeal}>➕ Add Deal</button>
}
</div>
</div>
</div>
)}

{/* Stage Filter Tabs */}
<div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
{['All', ...stages].map(function (tab) {
return (
<button key={tab} onClick={function () { setFilterStage(tab) }}
style={{
padding: '7px 14px', borderRadius: 8, border: 'none',
fontSize: 13, fontWeight: 600, cursor: 'pointer',
fontFamily: 'var(--font-main)',
background: filterStage === tab ? 'var(--primary)' : 'white',
color: filterStage === tab ? 'white' : 'var(--text-secondary)',
boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'all 0.15s ease'
}}
>
{tab} ({tab === 'All' ? deals.length : deals.filter(d => d.stage === tab).length})
</button>
)
})}
</div>

{/* Deals Table */}
<div className="card">
<div className="card-header">
<span className="card-title">All Deals</span>
<div className="search-bar">
<input type="text" placeholder="Search deals..."
value={searchText} onChange={function (e) { setSearchText(e.target.value) }} />
</div>
</div>
<div className="table-wrapper">
<table>
<thead>
<tr>
<th>#</th><th>Deal Title</th><th>Customer</th>
<th>Value</th><th>Stage</th><th>Close Date</th><th>Actions</th>
</tr>
</thead>
<tbody>
{filteredDeals.length === 0 ? (
<tr>
<td colSpan="7" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
No deals found. Add your first deal!
</td>
</tr>
) : (
filteredDeals.map(function (deal, index) {
return (
<tr key={deal.id}>
<td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{index + 1}</td>
<td style={{ fontWeight: 600 }}>{deal.title}</td>
<td style={{ color: 'var(--text-secondary)' }}>{deal.customer}</td>
<td style={{ fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
{formatINR(deal.value)}
</td>
<td><span className={stageBadge(deal.stage)}>{deal.stage}</span></td>
<td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{deal.closeDate || '—'}</td>
<td>
<button className="edit-btn" onClick={function () { editDeal(deal) }}>Edit</button>
<button className="delete-btn" onClick={function () { deleteDeal(deal.id) }}>Delete</button>
</td>
</tr>
)
})
)}
</tbody>
</table>
</div>
</div>

</div>

)

}

export default Deals
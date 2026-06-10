import { useState, useEffect } from 'react'

function Tasks() {

const [tasks, setTasks] = useState([])
const [title, setTitle] = useState('')
const [description, setDescription] = useState('')
const [dueDate, setDueDate] = useState('')
const [priority, setPriority] = useState('Medium')
const [assignedTo, setAssignedTo] = useState('')
const [relatedTo, setRelatedTo] = useState('')
const [editId, setEditId] = useState(null)
const [showForm, setShowForm] = useState(false)
const [filterStatus, setFilterStatus] = useState('All')
const [searchText, setSearchText] = useState('')

// Load tasks from localStorage
useEffect(function () {
let saved = JSON.parse(localStorage.getItem('tasks')) || []
setTasks(saved)
}, [])

// Save tasks to localStorage on every change
useEffect(function () {
localStorage.setItem('tasks', JSON.stringify(tasks))
window.dispatchEvent(new Event('crm:storageUpdated'))
}, [tasks])

function addTask() {

if (title.trim() === '') {
alert('Please enter a task title')
return
}

let newTask = {
id: Date.now(),
title: title,
description: description,
dueDate: dueDate,
priority: priority,
assignedTo: assignedTo,
relatedTo: relatedTo,
status: 'Pending',
createdAt: new Date().toLocaleDateString('en-IN')
}

setTasks([...tasks, newTask])
clearForm()
setShowForm(false)

}

function updateTask() {

let updated = tasks.map(function (t) {
if (t.id === editId) {
return {
...t,
title: title,
description: description,
dueDate: dueDate,
priority: priority,
assignedTo: assignedTo,
relatedTo: relatedTo
}
}
return t
})

setTasks(updated)
clearForm()
setEditId(null)
setShowForm(false)

}

function deleteTask(taskId) {
setTasks(tasks.filter(function (t) { return t.id !== taskId }))
}

function toggleTaskStatus(taskId) {
let updated = tasks.map(function (t) {
if (t.id === taskId) {
return {
...t,
status: t.status === 'Pending' ? 'Completed' : 'Pending'
}
}
return t
})
setTasks(updated)
}

function editTask(task) {
setTitle(task.title)
setDescription(task.description || '')
setDueDate(task.dueDate || '')
setPriority(task.priority || 'Medium')
setAssignedTo(task.assignedTo || '')
setRelatedTo(task.relatedTo || '')
setEditId(task.id)
setShowForm(true)
}

function clearForm() {
setTitle('')
setDescription('')
setDueDate('')
setPriority('Medium')
setAssignedTo('')
setRelatedTo('')
}

// Check if task is overdue
function isOverdue(task) {
if (!task.dueDate || task.status === 'Completed') return false
return new Date(task.dueDate) < new Date()
}

function priorityBadge(p) {
if (p === 'High') return 'badge badge-high'
if (p === 'Low') return 'badge badge-low'
return 'badge badge-medium'
}

let filteredTasks = tasks.filter(function (t) {

let matchSearch = t.title.toLowerCase().includes(searchText.toLowerCase()) ||
(t.assignedTo || '').toLowerCase().includes(searchText.toLowerCase())

let matchFilter = filterStatus === 'All' ||
(filterStatus === 'Pending' && t.status === 'Pending') ||
(filterStatus === 'Completed' && t.status === 'Completed') ||
(filterStatus === 'Overdue' && isOverdue(t))

return matchSearch && matchFilter

})

let pendingCount = tasks.filter(function (t) { return t.status === 'Pending' }).length
let completedCount = tasks.filter(function (t) { return t.status === 'Completed' }).length
let overdueCount = tasks.filter(function (t) { return isOverdue(t) }).length

return (

<div className="customers-page">

{/* Page Header */}
<div className="page-header">
<div className="page-header-left">
<h1>Tasks</h1>
<p>{tasks.length} total tasks — {pendingCount} pending, {completedCount} completed</p>
</div>
<button
className="btn btn-primary"
onClick={function () {
clearForm()
setEditId(null)
setShowForm(!showForm)
}}
>
{showForm ? '✕ Cancel' : '+ Add Task'}
</button>
</div>

{/* Stats Row */}
<div className="stats-grid" style={{ marginBottom: 24 }}>

<div className="stat-card">
<div className="stat-icon amber">📋</div>
<div className="stat-info">
<div className="stat-label">Total Tasks</div>
<div className="stat-value">{tasks.length}</div>
<div className="stat-sub">All tasks</div>
</div>
</div>

<div className="stat-card">
<div className="stat-icon blue">⏳</div>
<div className="stat-info">
<div className="stat-label">Pending</div>
<div className="stat-value">{pendingCount}</div>
<div className="stat-sub">Yet to complete</div>
</div>
</div>

<div className="stat-card">
<div className="stat-icon green">✅</div>
<div className="stat-info">
<div className="stat-label">Completed</div>
<div className="stat-value">{completedCount}</div>
<div className="stat-sub">Done</div>
</div>
</div>

<div className="stat-card">
<div className="stat-icon red">🚨</div>
<div className="stat-info">
<div className="stat-label">Overdue</div>
<div className="stat-value">{overdueCount}</div>
<div className="stat-sub">Past due date</div>
</div>
</div>

</div>

{/* Add / Edit Form */}
{showForm && (
<div className="card mb-20">
<div className="card-header">
<span className="card-title">
{editId ? '✏️ Update Task' : '➕ New Task'}
</span>
</div>
<div className="card-body">

<div className="form-grid">

<div className="form-group full-width">
<label className="form-label">Task Title *</label>
<input
className="form-input"
type="text"
placeholder="e.g. Follow up with Rahul Sharma"
value={title}
onChange={function (e) { setTitle(e.target.value) }}
/>
</div>

<div className="form-group full-width">
<label className="form-label">Description</label>
<textarea
className="form-textarea"
placeholder="What needs to be done?"
value={description}
onChange={function (e) { setDescription(e.target.value) }}
/>
</div>

<div className="form-group">
<label className="form-label">Due Date</label>
<input
className="form-input"
type="date"
value={dueDate}
onChange={function (e) { setDueDate(e.target.value) }}
/>
</div>

<div className="form-group">
<label className="form-label">Priority</label>
<select
className="form-select"
value={priority}
onChange={function (e) { setPriority(e.target.value) }}
>
<option value="High">High</option>
<option value="Medium">Medium</option>
<option value="Low">Low</option>
</select>
</div>

<div className="form-group">
<label className="form-label">Assigned To</label>
<input
className="form-input"
type="text"
placeholder="e.g. Sales Team / Admin"
value={assignedTo}
onChange={function (e) { setAssignedTo(e.target.value) }}
/>
</div>

<div className="form-group">
<label className="form-label">Related To (Customer / Lead)</label>
<input
className="form-input"
type="text"
placeholder="e.g. Rahul Sharma / Infosys"
value={relatedTo}
onChange={function (e) { setRelatedTo(e.target.value) }}
/>
</div>

</div>

<div style={{ marginTop: 8 }}>
{editId ? (
<button className="btn btn-warning" onClick={updateTask}>
✏️ Update Task
</button>
) : (
<button className="btn btn-primary" onClick={addTask}>
➕ Add Task
</button>
)}
</div>

</div>
</div>
)}

{/* Filter Tabs */}
<div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
{['All', 'Pending', 'Completed', 'Overdue'].map(function (tab) {
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
{tab === 'All' && 'All (' + tasks.length + ')'}
{tab === 'Pending' && 'Pending (' + pendingCount + ')'}
{tab === 'Completed' && 'Completed (' + completedCount + ')'}
{tab === 'Overdue' && '🚨 Overdue (' + overdueCount + ')'}
</button>
)
})}
</div>

{/* Tasks Table */}
<div className="card">

<div className="card-header">
<span className="card-title">All Tasks</span>
<div className="search-bar">
<input
type="text"
placeholder="Search tasks..."
value={searchText}
onChange={function (e) { setSearchText(e.target.value) }}
/>
</div>
</div>

<div className="table-wrapper">
<table>
<thead>
<tr>
<th>✓</th>
<th>Task</th>
<th>Description</th>
<th>Due Date</th>
<th>Priority</th>
<th>Assigned To</th>
<th>Related To</th>
<th>Status</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{filteredTasks.length === 0 ? (
<tr>
<td colSpan="9" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
No tasks found. Add your first task!
</td>
</tr>
) : (
filteredTasks.map(function (task) {
return (
<tr
key={task.id}
style={{
opacity: task.status === 'Completed' ? 0.6 : 1,
background: isOverdue(task) ? '#fff5f5' : 'transparent'
}}
>
<td>
<input
type="checkbox"
checked={task.status === 'Completed'}
onChange={function () { toggleTaskStatus(task.id) }}
style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--primary)' }}
/>
</td>
<td style={{
fontWeight: 600,
textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
color: task.status === 'Completed' ? 'var(--text-muted)' : 'var(--text-primary)'
}}>
{task.title}
</td>
<td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
{task.description ? task.description.slice(0, 40) + (task.description.length > 40 ? '...' : '') : '—'}
</td>
<td style={{
fontSize: 13,
color: isOverdue(task) ? 'var(--danger)' : 'var(--text-secondary)',
fontWeight: isOverdue(task) ? 700 : 400
}}>
{task.dueDate || '—'}
{isOverdue(task) && <span style={{ marginLeft: 4 }}>🚨</span>}
</td>
<td>
<span className={priorityBadge(task.priority)}>
{task.priority}
</span>
</td>
<td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
{task.assignedTo || '—'}
</td>
<td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
{task.relatedTo || '—'}
</td>
<td>
<span className={task.status === 'Completed' ? 'badge badge-active' : 'badge badge-contacted'}>
{task.status}
</span>
</td>
<td onClick={function (e) { e.stopPropagation() }}>
<button
className="edit-btn"
onClick={function () { editTask(task) }}
>
Edit
</button>
<button
className="delete-btn"
onClick={function () { deleteTask(task.id) }}
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

</div>

)

}

export default Tasks
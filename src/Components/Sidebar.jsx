import { NavLink } from 'react-router-dom'

// Icons as simple SVG components — no extra library needed
function IconDashboard() {
return (
<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<rect x="3" y="3" width="7" height="7" rx="1" />
<rect x="14" y="3" width="7" height="7" rx="1" />
<rect x="3" y="14" width="7" height="7" rx="1" />
<rect x="14" y="14" width="7" height="7" rx="1" />
</svg>
)
}

function IconCustomers() {
return (
<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
<circle cx="9" cy="7" r="4" />
<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
<path d="M16 3.13a4 4 0 0 1 0 7.75" />
</svg>
)
}

function IconLeads() {
return (
<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
<polyline points="16 7 22 7 22 13" />
</svg>
)
}

function IconTasks() {
return (
<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M9 11l3 3L22 4" />
<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7" />
<path d="M7 10V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6" />
</svg>
)
}

function IconDeals() {
return (
<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.2a3 3 0 0 0-2.12.88L3 9l4.08 3.12A3 3 0 0 0 9.2 13H17a3 3 0 0 0 0-6z" />
</svg>
)
}

function IconSettings() {
return (
<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<circle cx="12" cy="12" r="3" />
<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
</svg>
)
}

// Navigation links config — easy to add more pages later
const navLinks = [
{ to: '/', label: 'Dashboard', Icon: IconDashboard },
{ to: '/customers', label: 'Customers', Icon: IconCustomers },
{ to: '/leads', label: 'Leads', Icon: IconLeads },
{ to: '/tasks', label: 'Tasks', Icon: IconTasks },
{ to: '/deals', label: 'Deals', Icon: IconDeals },
{ to: '/settings', label: 'Settings', Icon: IconSettings },
]

function Sidebar() {

return (

<aside className="sidebar">

{/* Brand / Logo */}
<div className="sidebar-brand">
<div className="brand-icon">C</div>
<div className="brand-text">
<span className="brand-name">CRM Pro</span>
<span className="brand-tagline">Business Suite</span>
</div>
</div>

{/* Navigation Menu */}
<nav className="sidebar-nav">

<p className="nav-section-label">Main Menu</p>

{navLinks.map(function (link) {

return (

<NavLink
key={link.to}
to={link.to}
end={link.to === '/'}
className={function ({ isActive }) {
return isActive ? 'nav-item nav-item-active' : 'nav-item'
}}
>
<span className="nav-icon">
<link.Icon />
</span>
<span className="nav-label">{link.label}</span>
</NavLink>

)

})}

</nav>

{/* Bottom user info */}
<div className="sidebar-footer">
<div className="user-avatar">A</div>
<div className="user-info">
<span className="user-name">Admin User</span>
<span className="user-role">CRM Manager</span>
</div>
</div>

</aside>

)

}

export default Sidebar
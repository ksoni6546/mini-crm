import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './Pages/Dashboard'
import Customers from './Pages/Customers'
import Leads from './Pages/Leads'
import Tasks from './Pages/Tasks'
import Deals from './Pages/Deals'
import Settings from './Pages/Settings'
import Sidebar from './Components/Sidebar'
import './App.css'

function App() {

return (

<BrowserRouter>

<div className="app-layout">

{/* Sidebar stays on left, main content on right */}
<Sidebar />

<main className="main-content">

<Routes>

<Route
path="/"
element={<Dashboard />}
/>

<Route
path="/customers"
element={<Customers />}
/>

<Route
path="/leads"
element={<Leads />}
/>

<Route
path="/tasks"
element={<Tasks />}
/>

<Route
path="/deals"
element={<Deals />}
/>

<Route
path="/settings"
element={<Settings />}
/>

</Routes>

</main>

</div>

</BrowserRouter>

)

}

export default App
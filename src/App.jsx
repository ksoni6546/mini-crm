import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './Pages/Dashboard'
import Customers from './Pages/Customers'
import Settings from './Pages/Settings'
import './App.css'
import Leads from './Pages/Leads'

import Navbar from './Components/Navbar'
function App() {
  return (
    <BrowserRouter>
      <Navbar />
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
          path="/settings"
          element={<Settings />}
        />

      </Routes>
    </BrowserRouter>

  )
}

export default App
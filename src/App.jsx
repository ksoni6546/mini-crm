import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './Pages/Dashboard'
import Customers from './Pages/Customers'
import Leads from './Pages/Leads'
import Tasks from './Pages/Tasks'
import Deals from './Pages/Deals'
import Settings from './Pages/Settings'
// New pages
import Reports from './Pages/Reports'
import NotFound from './Pages/NotFound'

import Sidebar from './Components/Sidebar'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeProvider } from './contexts/ThemeContext'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">
              <div className="page-container">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  
                  {/* Catch-all 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
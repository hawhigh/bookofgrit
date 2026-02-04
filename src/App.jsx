
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SuccessPage from './pages/SuccessPage'
import CancelPage from './pages/CancelPage'
import AdminPage from './pages/AdminPage'
import DashboardPage from './pages/DashboardPage'
import { Navigate } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Typo handling & 404 redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App

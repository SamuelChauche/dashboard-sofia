import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <div className="app__bg" aria-hidden="true" />
        <Navbar />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ExperimentDetail from './pages/ExperimentDetail'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experiment/:id" element={<ExperimentDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App


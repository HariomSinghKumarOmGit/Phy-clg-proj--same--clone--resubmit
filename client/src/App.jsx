import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ExperimentDetail from './pages/ExperimentDetail'
import ExperimentStepsPage from './pages/ExperimentStepsPage'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experiment/:id" element={<ExperimentDetail />} />
        <Route path="/experiment/:id/procedure" element={<ExperimentStepsPage type="procedure" />} />
        <Route path="/experiment/:id/precautions" element={<ExperimentStepsPage type="precautions" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App


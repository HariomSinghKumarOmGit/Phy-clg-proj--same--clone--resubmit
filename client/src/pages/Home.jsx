import { useEffect, useState } from 'react'
import API from '../utils/api'
import { loadExperiments } from '../utils/loadExperiments'
import ExperimentList from '../components/ExperimentList'
import '../styles/Home.css'

export default function Home() {
  const [experiments, setExperiments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try API first, fallback to JSON file
    API.get('/experiments')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setExperiments(res.data)
        } else {
          // If API returns empty, try loading from JSON
          loadExperiments().then(data => {
            setExperiments(data)
          })
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch experiments from API, trying JSON file:', err)
        // Fallback to loading from JSON file
        loadExperiments().then(data => {
          setExperiments(data)
          setLoading(false)
        }).catch(jsonErr => {
          console.error('Failed to load experiments from JSON:', jsonErr)
          setLoading(false)
        })
      })
  }, [])

  return (
    <div className="home-container">
      <header className="hero-section">
        <h1 className="hero-title">⚛️ Physics Lab Assistant</h1>
        <p className="hero-subtitle">Your Smart Virtual Physics Mentor</p>
      </header>

      <main className="content-section">
        <div className="welcome-section">
          <h2>Available Experiments</h2>
          {loading ? (
            <p className="loading">Loading experiments...</p>
          ) : (
            <ExperimentList data={experiments} />
          )}
        </div>
      </main>
    </div>
  )
}


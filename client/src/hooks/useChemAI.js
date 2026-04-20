import { useState } from 'react'
import API from '../utils/api'

export function useChemAI() {
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState(null)

  async function askChemAI(query, mode = 'explain', experimentContext = '') {
    if (!query || !query.trim()) return

    setLoading(true)
    setError(null)
    
    try {
      const response = await API.post('/ai/ask', {
        query,
        mode,
        experimentContext
      })
      
      const data = response.data
      setAnswer(data.answer || data.text || '')
      return data
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to get AI response'
      setError(errorMsg)
      console.error('ChemAI error:', err)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  return { 
    answer, 
    loading, 
    error,
    askChemAI,
    clearAnswer: () => setAnswer('')
  }
}



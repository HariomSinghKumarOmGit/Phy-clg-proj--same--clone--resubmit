import axios from 'axios'
import { buildChemPrompt } from './PromptBuilder.js'
import { loadContext, loadExperimentContext } from './contextManager.js'
import dotenv from 'dotenv'

dotenv.config()

let geminiKey = null

// Initialize Gemini API
try {
  if (process.env.GEMINI_API_KEY) {
    geminiKey = process.env.GEMINI_API_KEY
    console.log('✅ Gemini API client initialized')
  } else {
    console.warn('⚠️ GEMINI_API_KEY not set - using mock responses')
  }
} catch (err) {
  console.error('❌ Gemini initialization error:', err.message)
}

export async function handleChemAI(req, res) {
  try {
    const { query, mode, experimentContext } = req.body

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' })
    }

    // Load context
    const baseContext = loadContext()
    const expContext = experimentContext ? loadExperimentContext(experimentContext) : ''
    const fullContext = [baseContext, expContext].filter(Boolean).join('\n')

    // Build prompt
    const prompt = buildChemPrompt(query, fullContext, mode)

    // If Gemini is not configured, return mock response
    if (!geminiKey || !process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        answer: `[Mock Response] This is a placeholder response. To enable real AI responses, add your GEMINI_API_KEY to the server .env file.

Query: "${query}"
Context: ${experimentContext || 'General chemistry question'}

Example real response would be generated here using Gemini AI.`,
        isMock: true
      })
    }

    // Call Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const text = response.data.candidates[0].content.parts[0].text

    res.json({ 
      success: true, 
      answer: text,
      mode,
      isMock: false
    })
  } catch (err) {
    console.error('❌ AI Controller error:', err)
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Error generating AI response' 
    })
  }
}


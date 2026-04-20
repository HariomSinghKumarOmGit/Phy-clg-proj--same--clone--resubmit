import axios from 'axios'

export const askQuestion = async (req, res) => {
  try {
    const { question, experimentId, context } = req.body

    // TODO: Implement OpenAI API integration
    // Placeholder response for Phase 1
    res.json({
      response: 'AI assistant functionality will be implemented in Phase 2',
      question,
      experimentId
    })
  } catch (error) {
    res.status(500).json({ error: 'Error processing question' })
  }
}



import { buildPrompt } from '../utils/aiPromptBuilder.js'

export const ask = async (req, res) => {
  try {
    const { question, experimentContext } = req.body
    const prompt = buildPrompt(experimentContext || '', question || '')

    // Placeholder OpenAI call
    const mockAnswer =
      'Phenolphthalein is used because it changes color near the equivalence point in acid-base titrations.'

    return res.json({
      answer: mockAnswer,
      prompt,
    })
  } catch (err) {
    res.status(500).json({ error: 'Error generating AI response' })
  }
}




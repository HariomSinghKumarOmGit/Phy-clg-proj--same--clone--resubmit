import { generatePDF } from '../utils/generatePDF.js'
import { sendMail } from '../utils/sendMail.js'

export const generateReport = async (req, res) => {
  try {
    const { id } = req.params
    const { data, email } = req.body

    const pdf = await generatePDF({ experimentId: id, ...data })

    if (email) {
      await sendMail({
        to: email,
        subject: 'ChemAI Lab Report',
        text: 'Your lab report is attached.',
        attachments: [pdf],
      })
    }

    res.json({
      message: 'Report generated (mock)',
      pdf,
    })
  } catch (error) {
    res.status(500).json({ error: 'Error generating report' })
  }
}


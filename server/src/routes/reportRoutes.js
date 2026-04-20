import express from 'express'
import { generateReport } from '../controllers/reportController.js'

const router = express.Router()

router.post('/:id', generateReport)

export default router



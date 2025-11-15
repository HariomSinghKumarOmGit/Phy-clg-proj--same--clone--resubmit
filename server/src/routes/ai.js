import express from 'express'
import { ask } from '../controllers/aiController.js'

const router = express.Router()

router.post('/', ask)

export default router




import express from 'express'
import { getExperiments, getExperimentById } from '../controllers/experimentController.js'

const router = express.Router()

router.get('/', getExperiments)
router.get('/:id', getExperimentById)

export default router




import fs from 'fs'
import path from 'path'
import Experiment from '../models/Experiment.js'

const fallbackPath = path.resolve(process.cwd(), '../docs/experiments.json')

export const getExperiments = async (req, res) => {
  try {
    let experiments = []
    try {
      experiments = await Experiment.find()
      if (!experiments || experiments.length === 0) {
        const raw = fs.readFileSync(fallbackPath, 'utf-8')
        experiments = JSON.parse(raw)
      }
    } catch (e) {
      const raw = fs.readFileSync(fallbackPath, 'utf-8')
      experiments = JSON.parse(raw)
    }
    res.json(experiments)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching experiments' })
  }
}

export const getExperimentById = async (req, res) => {
  try {
    const { id } = req.params
    let experiment = null
    try {
      experiment = await Experiment.findById(id)
    } catch {}

    if (!experiment) {
      const raw = fs.readFileSync(fallbackPath, 'utf-8')
      const list = JSON.parse(raw)
      experiment = list.find((e) => String(e.id) === String(id))
      if (!experiment) return res.status(404).json({ error: 'Experiment not found' })
    }
    res.json(experiment)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching experiment' })
  }
}


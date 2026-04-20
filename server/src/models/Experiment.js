import mongoose from 'mongoose'

const stepSchema = new mongoose.Schema({
  stepNo: Number,
  instruction: String,
  image: String,
  explanation: String
})

const experimentSchema = new mongoose.Schema({
  title: String,
  category: String,
  objective: String,
  materials: [String],
  steps: [stepSchema],
  reactionEquation: String,
  safetyNotes: String
})

export default mongoose.model('Experiment', experimentSchema)


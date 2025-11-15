import dotenv from 'dotenv'

dotenv.config()

const requiredKeys = ['PORT', 'MONGO_URI']

const missing = requiredKeys.filter((key) => !process.env[key])
if (missing.length) {
  console.warn(`⚠️ Missing env keys: ${missing.join(', ')}`)
}

export const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  N8N_WEBHOOK: process.env.N8N_WEBHOOK || '',
}




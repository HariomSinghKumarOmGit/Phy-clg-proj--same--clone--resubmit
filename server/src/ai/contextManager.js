import fs from 'fs'
import path from 'path'

export function loadContext() {
  try {
    // Try to load context from docs folder
    const contextPath = path.resolve(process.cwd(), '../docs/context.txt')
    if (fs.existsSync(contextPath)) {
      const data = fs.readFileSync(contextPath, 'utf8')
      return data
    }
    return ''
  } catch (err) {
    console.warn('⚠️ Could not load context file:', err.message)
    return ''
  }
}

export function loadExperimentContext(experimentTitle) {
  return `Current experiment: ${experimentTitle}`
}



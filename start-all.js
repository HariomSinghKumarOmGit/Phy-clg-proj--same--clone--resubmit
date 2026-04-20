import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const clientPath = path.resolve(__dirname, 'client')
const serverPath = path.resolve(__dirname, 'server')

function run(command, cwd, label) {
  console.log(`🚀 Starting ${label}...`)
  const proc = spawn(command, { shell: true, cwd })
  
  proc.stdout.on('data', d => {
    const output = d.toString().trim()
    if (output) console.log(`[${label}] ${output}`)
  })
  
  proc.stderr.on('data', d => {
    const output = d.toString().trim()
    if (output) console.error(`[${label}-ERR] ${output}`)
  })
  
  proc.on('close', code => {
    console.log(`[${label}] Process exited with code ${code}`)
  })
}

console.log('🧪 Launching ChemAI Lab locally...')
console.log('📁 Client path:', clientPath)
console.log('📁 Server path:', serverPath)
console.log('---')

// Start both servers
run('npm run dev', serverPath, 'SERVER')
run('npm run dev', clientPath, 'CLIENT')

console.log('✅ Both servers are starting...')
console.log('🌐 Frontend will be available at: http://localhost:5173')
console.log('🌐 Backend will be available at: http://localhost:5005')


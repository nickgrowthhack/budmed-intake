const fs = require('fs')
const path = require('path')

const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'PUBLIC_FUNCTION_BASE_URL',
  'PUBLIC_INTAKE_BASE_URL'
]

for (const key of required) {
  if (!process.env[key] || String(process.env[key]).trim() === '') {
    throw new Error(`Missing environment variable: ${key}`)
  }
}

const templatePath = path.join(__dirname, '..', 'config.template.js')
const targetPath = path.join(__dirname, '..', 'config.js')

const template = fs.readFileSync(templatePath, 'utf8')

let output = template
for (const key of required) {
  const value = String(process.env[key])
  const placeholder = `{{${key}}}`
  output = output.split(placeholder).join(value)
}

fs.writeFileSync(targetPath, output, 'utf8')

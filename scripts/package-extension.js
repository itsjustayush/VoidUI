import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.resolve(rootDir, 'dist')
const releaseDir = path.resolve(rootDir, 'release')

if (!fs.existsSync(distDir)) {
  console.log('Building project before packaging...')
  execSync('npm run build', { stdio: 'inherit', cwd: rootDir })
}

if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true })
}

const pkg = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf-8'))
const version = pkg.version || '1.0.0'

const chromeZip = path.resolve(releaseDir, `VoidUI-Extension-v${version}.zip`)
const firefoxZip = path.resolve(releaseDir, `VoidUI-Firefox-v${version}.zip`)

try {
  // Package Chrome / Chromium (Helium, Brave, Edge, Arc)
  if (fs.existsSync(chromeZip)) fs.unlinkSync(chromeZip)
  console.log(`Packaging Chromium extension to ${chromeZip}...`)
  execSync(`powershell -command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${chromeZip}' -Force"`, { stdio: 'inherit' })
  console.log(`✓ Chromium extension packaged: ${chromeZip}`)

  // Package Firefox version
  const firefoxDist = path.resolve(rootDir, 'dist_firefox')
  if (fs.existsSync(firefoxDist)) fs.rmSync(firefoxDist, { recursive: true, force: true })
  fs.cpSync(distDir, firefoxDist, { recursive: true })
  const ffManifest = path.resolve(rootDir, 'manifest.firefox.json')
  if (fs.existsSync(ffManifest)) {
    fs.copyFileSync(ffManifest, path.resolve(firefoxDist, 'manifest.json'))
  }
  if (fs.existsSync(firefoxZip)) fs.unlinkSync(firefoxZip)
  console.log(`Packaging Firefox extension to ${firefoxZip}...`)
  execSync(`powershell -command "Compress-Archive -Path '${firefoxDist}\\*' -DestinationPath '${firefoxZip}' -Force"`, { stdio: 'inherit' })
  fs.rmSync(firefoxDist, { recursive: true, force: true })
  console.log(`✓ Firefox extension packaged: ${firefoxZip}`)
} catch (err) {
  console.error('Packaging error:', err)
}


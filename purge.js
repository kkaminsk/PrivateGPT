import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import os from 'os'

// PrivateGPT signature patterns for identifying residual data
const PRIVATEGPT_SIGNATURES = [
  'privategpt',
  'PrivateGPT',
  'private-gpt'
]

/**
 * Startup purge - cleans up any residual data from previous sessions
 * This handles cases where the app crashed or was terminated abnormally
 */
export function startupPurge() {
  console.log('[PrivateGPT] Running startup purge...')

  const locations = []

  // Electron userData directory
  try {
    const userDataPath = app.getPath('userData')
    locations.push(userDataPath)
  } catch (e) {
    // app.getPath may not be available before app is ready
  }

  // System temp directory
  locations.push(os.tmpdir())

  // Platform-specific temp locations
  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA
    if (localAppData) {
      locations.push(path.join(localAppData, 'Temp'))
    }
  }

  let filesDeleted = 0

  for (const location of locations) {
    if (!location || !fs.existsSync(location)) continue

    try {
      const files = fs.readdirSync(location)

      for (const file of files) {
        // Check if file matches PrivateGPT signature
        const matchesSignature = PRIVATEGPT_SIGNATURES.some(sig =>
          file.toLowerCase().includes(sig.toLowerCase())
        )

        if (matchesSignature) {
          const filePath = path.join(location, file)

          try {
            const stats = fs.statSync(filePath)

            if (stats.isDirectory()) {
              // Recursively delete directory
              fs.rmSync(filePath, { recursive: true, force: true })
            } else {
              // Overwrite file with zeros before deletion
              const size = stats.size
              if (size > 0 && size < 10 * 1024 * 1024) { // Only overwrite files < 10MB
                const zeros = Buffer.alloc(size, 0)
                fs.writeFileSync(filePath, zeros)
              }
              fs.unlinkSync(filePath)
            }

            filesDeleted++
            console.log(`[PrivateGPT] Purged: ${filePath}`)
          } catch (e) {
            console.warn(`[PrivateGPT] Failed to purge ${filePath}: ${e.message}`)
          }
        }
      }
    } catch (e) {
      console.warn(`[PrivateGPT] Failed to scan ${location}: ${e.message}`)
    }
  }

  console.log(`[PrivateGPT] Startup purge complete. Files deleted: ${filesDeleted}`)
  return filesDeleted
}

/**
 * Shutdown purge - securely clears all session data
 * @param {import('./secure-session.js').SecureSessionManager} sessionManager
 */
export function shutdownPurge(sessionManager) {
  console.log('[PrivateGPT] Running shutdown purge...')

  // Purge secure session data
  if (sessionManager) {
    sessionManager.purge()
    console.log('[PrivateGPT] Session data purged')
  }

  // Clear any environment variables that might contain sensitive data
  // (defensive measure)
  delete process.env.PRIVATEGPT_SESSION

  console.log('[PrivateGPT] Shutdown purge complete')
}

/**
 * Register shutdown purge handlers
 * @param {import('./secure-session.js').SecureSessionManager} sessionManager
 */
export function registerShutdownHandlers(sessionManager) {
  const runPurge = () => {
    shutdownPurge(sessionManager)
  }

  // Handle normal quit
  app.on('before-quit', runPurge)

  // Handle window close on non-macOS
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      runPurge()
    }
  })

  // Handle unexpected termination signals
  process.on('SIGINT', () => {
    runPurge()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    runPurge()
    process.exit(0)
  })

  console.log('[PrivateGPT] Shutdown handlers registered')
}

export default { startupPurge, shutdownPurge, registerShutdownHandlers }

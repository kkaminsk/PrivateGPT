import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import OpenAI from 'openai'
import { FoundryLocalManager } from 'foundry-local-sdk'
import { SecureSessionManager } from './secure-session.js'
import { FileProcessor } from './file-processor.js'
import { startupPurge, registerShutdownHandlers } from './purge.js'

// Global variables
let mainWindow
let aiClient = null
let modelName = null
let endpoint = null
let apiKey = ""
let currentModelId = null
let hasVisionSupport = false

// Known model context sizes (tokens)
// Models not in this list will not show context indicator
const MODEL_CONTEXT_SIZES = {
  'phi-3-mini-4k': 4096,
  'phi-3-mini-128k': 131072,
  'phi-4-mini': 131072,
  'phi-4-mini-instruct': 131072,
  'llama-3.2-1b': 131072,
  'llama-3.2-3b': 131072,
  'qwen2.5-0.5b': 32768,
  'qwen2.5-1.5b': 32768,
  'qwen2.5-3b': 32768,
  'mistral-7b': 32768,
  'deepseek-r1-distill-qwen-1.5b': 65536,
  'deepseek-r1-distill-qwen-7b': 65536
}

// Initialize secure session manager
const sessionManager = new SecureSessionManager()

// Create and initialize the FoundryLocalManager
const foundryManager = new FoundryLocalManager()

// IPC Handlers

// Send message to AI model
ipcMain.handle('send-message', async (_, messages, maxTokens = 2048) => {
  return sendMessage(messages, maxTokens)
})

// Get list of local models
ipcMain.handle('get-local-models', async () => {
  try {
    const models = await foundryManager.listCachedModels()
    return { success: true, models }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Switch to a different model
ipcMain.handle('switch-model', async (_, modelId) => {
  try {
    console.log(`[PrivateGPT] Switching to model: ${modelId}`)

    const initResult = await foundryManager.init(modelId)
    modelName = initResult.id
    endpoint = foundryManager.endpoint
    apiKey = foundryManager.apiKey
    currentModelId = modelId

    // Check for vision support (heuristic based on model name)
    hasVisionSupport = checkVisionSupport(modelId)

    // Get context size if known
    const contextSize = getModelContextSize(modelId)

    aiClient = new OpenAI({
      apiKey: apiKey,
      baseURL: endpoint
    })

    // Clear attachments when switching models
    sessionManager.clearAttachments()

    return {
      success: true,
      endpoint: endpoint,
      modelName: modelName,
      hasVisionSupport: hasVisionSupport,
      contextSize: contextSize
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Attach a file
ipcMain.handle('attach-file', async (_, filePath) => {
  try {
    // Get model-specific file size limit
    const contextSize = currentModelId ? getModelContextSize(currentModelId) : null
    const maxTextBytes = FileProcessor.getMaxTextSizeForModel(contextSize)

    const result = await FileProcessor.processFile(filePath, maxTextBytes)

    if (!result.success) {
      return result
    }

    // Generate unique ID for attachment
    const attachmentId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store encrypted attachment
    sessionManager.storeAttachment(attachmentId, result.data)

    return {
      success: true,
      attachment: {
        id: attachmentId,
        name: result.data.name,
        type: result.data.type,
        size: result.data.size,
        estimatedTokens: result.data.estimatedTokens
      },
      warning: result.warning
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Remove an attachment
ipcMain.handle('remove-attachment', async (_, attachmentId) => {
  try {
    sessionManager.removeAttachment(attachmentId)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Get all current attachments
ipcMain.handle('get-attachments', async () => {
  try {
    const attachments = sessionManager.getAllAttachments()
    // Return only metadata, not full content
    return {
      success: true,
      attachments: attachments.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        size: a.size
      }))
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Clear all attachments
ipcMain.handle('clear-attachments', async () => {
  try {
    sessionManager.clearAttachments()
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Open file dialog
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'All Supported', extensions: ['md', 'txt', 'json', 'xml', 'yaml', 'yml', 'csv', 'jpg', 'jpeg', 'png', 'gif', 'webp'] },
      { name: 'Text Files', extensions: ['md', 'txt', 'json', 'xml', 'yaml', 'yml', 'csv'] },
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }
    ]
  })

  return { canceled: result.canceled, filePaths: result.filePaths }
})

// Save file dialog
ipcMain.handle('save-file', async (_, content, defaultFilename) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultFilename || 'export.txt',
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'Markdown', extensions: ['md'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (result.canceled || !result.filePath) {
      return { success: true, canceled: true }
    }

    fs.writeFileSync(result.filePath, content, 'utf8')
    return { success: true, canceled: false, filePath: result.filePath }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Get vision support status
ipcMain.handle('get-vision-support', async () => {
  return { hasVisionSupport }
})

// Get current token usage estimate
ipcMain.handle('get-token-estimate', async (_, userMessage, conversationHistory) => {
  try {
    const contextSize = currentModelId ? getModelContextSize(currentModelId) : null
    const attachments = sessionManager.getAllAttachments()

    if (!contextSize) {
      return { success: true, hasContextInfo: false }
    }

    const validation = FileProcessor.validateTokenLimit(
      userMessage || '',
      attachments,
      conversationHistory || [],
      contextSize
    )

    return {
      success: true,
      hasContextInfo: true,
      totalTokens: validation.totalTokens,
      limit: validation.limit,
      percentUsed: validation.percentUsed,
      breakdown: validation.breakdown,
      warning: validation.warning,
      valid: validation.valid
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Retry starting Foundry service
ipcMain.handle('retry-foundry-start', async () => {
  return ensureFoundryRunning()
})

// Check if Foundry is installed (can start service)
ipcMain.handle('check-foundry-installed', async () => {
  try {
    // Try to check if service is running - if it fails, Foundry is not installed
    await foundryManager.isServiceRunning()
    return { installed: true }
  } catch (error) {
    // Try to start service - if that also fails, definitely not installed
    try {
      await foundryManager.startService()
      return { installed: true }
    } catch (startError) {
      return { installed: false, error: startError.message }
    }
  }
})

// Check if any models are cached
ipcMain.handle('check-models-available', async () => {
  try {
    const models = await foundryManager.listCachedModels()
    return {
      available: models && models.length > 0,
      count: models ? models.length : 0,
      models: models || []
    }
  } catch (error) {
    return { available: false, count: 0, error: error.message }
  }
})

/**
 * Check if model likely supports vision based on model ID/name
 * @param {string} modelId
 * @returns {boolean}
 */
function checkVisionSupport(modelId) {
  const visionKeywords = ['vision', 'llava', 'multimodal', 'mm', 'visual', 'image']
  const lowerModelId = modelId.toLowerCase()
  return visionKeywords.some(keyword => lowerModelId.includes(keyword))
}

/**
 * Get context size for a model if known
 * @param {string} modelId
 * @returns {number|null} Context size in tokens, or null if unknown
 */
function getModelContextSize(modelId) {
  const lowerModelId = modelId.toLowerCase()
  // Check for exact match first
  if (MODEL_CONTEXT_SIZES[lowerModelId]) {
    return MODEL_CONTEXT_SIZES[lowerModelId]
  }
  // Check for partial match (model ID might have suffixes like -cuda-gpu)
  for (const [key, value] of Object.entries(MODEL_CONTEXT_SIZES)) {
    if (lowerModelId.includes(key) || key.includes(lowerModelId)) {
      return value
    }
  }
  return null
}

/**
 * Check if an error is a token/context limit error from Foundry
 * @param {Error} error - The error to check
 * @returns {boolean}
 */
function isTokenLimitError(error) {
  const message = error?.message?.toLowerCase() || ''
  return message.includes('too large') ||
         message.includes('context') ||
         message.includes('token') ||
         message.includes('maximum') ||
         message.includes('exceeds') ||
         message.includes('limit')
}

/**
 * Create user-friendly message for token limit errors
 * @param {Error} error - The original error
 * @param {number} contextSize - Model's context size
 * @returns {string}
 */
function formatTokenLimitError(error, contextSize) {
  const contextStr = contextSize ? `${(contextSize / 1024).toFixed(0)}K` : 'unknown'
  return `Message too large for model context (${contextStr} tokens). Suggestions:\n` +
         `• Attach a smaller file or reduce file content\n` +
         `• Clear conversation history (New Chat)\n` +
         `• Switch to a model with larger context window`
}

/**
 * Ensure Foundry Local service is running
 * Attempts to start the service if not running, with retry logic
 * @returns {Promise<{status: 'running'|'started'|'not-installed'|'failed', error?: string}>}
 */
async function ensureFoundryRunning() {
  const MAX_RETRIES = 3
  const RETRY_DELAY = 1000
  const STARTUP_TIMEOUT = 10000

  console.log('[PrivateGPT] Checking Foundry Local status...')

  // Check if already running
  try {
    if (await foundryManager.isServiceRunning()) {
      console.log('[PrivateGPT] Foundry Local is already running')
      mainWindow?.webContents.send('foundry-ready')
      return { status: 'running' }
    }
  } catch (error) {
    // isServiceRunning threw - likely not installed
    console.log('[PrivateGPT] Foundry Local check failed:', error.message)
    return { status: 'not-installed', error: error.message }
  }

  // Try to start the service
  console.log('[PrivateGPT] Foundry Local not running, attempting to start...')
  mainWindow?.webContents.send('foundry-starting')

  try {
    await foundryManager.startService()
  } catch (error) {
    console.log('[PrivateGPT] Failed to start Foundry Local:', error.message)
    // startService failed - likely not installed
    return { status: 'not-installed', error: error.message }
  }

  // Wait for service to be ready with retry logic
  const startTime = Date.now()
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))

    try {
      if (await foundryManager.isServiceRunning()) {
        console.log(`[PrivateGPT] Foundry Local started successfully (attempt ${attempt})`)
        mainWindow?.webContents.send('foundry-ready')
        return { status: 'started' }
      }
    } catch (error) {
      console.log(`[PrivateGPT] Service check attempt ${attempt} failed:`, error.message)
    }

    if (Date.now() - startTime > STARTUP_TIMEOUT) {
      break
    }
  }

  console.log('[PrivateGPT] Foundry Local startup timed out')
  mainWindow?.webContents.send('foundry-failed')
  return { status: 'failed', error: 'Service startup timed out' }
}

/**
 * Send message to AI model
 * @param {object[]} messages - Chat messages
 * @param {number} maxTokens - Maximum tokens for response
 */
async function sendMessage(messages, maxTokens = 2048) {
  try {
    if (!aiClient) {
      throw new Error('No model selected. Please select a local model first.')
    }

    // Get current attachments
    const attachments = sessionManager.getAllAttachments()

    // Get context size for validation
    const contextSize = currentModelId ? getModelContextSize(currentModelId) : null

    // Pre-send token validation
    if (contextSize && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      const userMessage = lastMessage.role === 'user' ? lastMessage.content : ''
      const previousMessages = messages.slice(0, -1)

      const validation = FileProcessor.validateTokenLimit(
        userMessage,
        attachments,
        previousMessages,
        contextSize
      )

      // Send warning if approaching limit
      if (validation.warning) {
        mainWindow.webContents.send('token-warning', {
          message: validation.warning,
          totalTokens: validation.totalTokens,
          limit: validation.limit,
          percentUsed: validation.percentUsed
        })
      }

      // Block if exceeding limit
      if (!validation.valid) {
        mainWindow.webContents.send('token-limit-exceeded', {
          message: validation.error,
          totalTokens: validation.totalTokens,
          limit: validation.limit,
          breakdown: validation.breakdown
        })
        return { success: false, error: validation.error, tokenLimitExceeded: true }
      }
    }

    // Process the last user message with attachments
    const processedMessages = [...messages]
    if (attachments.length > 0 && processedMessages.length > 0) {
      const lastMessage = processedMessages[processedMessages.length - 1]

      if (lastMessage.role === 'user') {
        const { content, warnings } = FileProcessor.formatMessageWithAttachments(
          lastMessage.content,
          attachments,
          hasVisionSupport
        )

        processedMessages[processedMessages.length - 1] = {
          ...lastMessage,
          content: content
        }

        // Send warnings to renderer
        if (warnings.length > 0) {
          mainWindow.webContents.send('attachment-warnings', warnings)
        }
      }
    }

    // Clear attachments after sending
    sessionManager.clearAttachments()
    mainWindow.webContents.send('attachments-cleared')

    const stream = await aiClient.chat.completions.create({
      model: modelName,
      messages: processedMessages,
      max_tokens: maxTokens,
      stream: true
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        mainWindow.webContents.send('chat-chunk', content)
      }
    }

    mainWindow.webContents.send('chat-complete')
    return { success: true }
  } catch (error) {
    // Always send chat-complete on error so frontend can recover
    mainWindow.webContents.send('chat-complete')

    // Check if this is a token limit error from Foundry
    if (isTokenLimitError(error)) {
      const contextSize = currentModelId ? getModelContextSize(currentModelId) : null
      const userFriendlyError = formatTokenLimitError(error, contextSize)
      mainWindow.webContents.send('token-limit-exceeded', {
        message: userFriendlyError,
        originalError: error.message
      })
      return { success: false, error: userFriendlyError, tokenLimitExceeded: true }
    }

    return { success: false, error: error.message }
  }
}

/**
 * Create the main application window
 */
async function createWindow() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const preloadPath = path.join(__dirname, 'preload.cjs')

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    title: 'PrivateGPT',
    icon: path.join(__dirname, 'icon', 'icon256.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      enableRemoteModule: false,
      sandbox: false
    }
  })

  Menu.setApplicationMenu(null)

  console.log('[PrivateGPT] Creating main window')
  mainWindow.loadFile('chat.html')

  // Check and start Foundry Local on page load
  mainWindow.webContents.on('did-finish-load', async () => {
    const result = await ensureFoundryRunning()
    if (result.status === 'not-installed') {
      mainWindow.webContents.send('foundry-not-installed')
    } else if (result.status === 'failed') {
      mainWindow.webContents.send('foundry-failed', result.error)
    }
    // 'running' and 'started' are handled via foundry-ready event
  })

  return mainWindow
}

// App lifecycle
app.whenReady().then(async () => {
  // Run startup purge before anything else
  startupPurge()

  // Register shutdown handlers
  registerShutdownHandlers(sessionManager)

  // Create window
  await createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

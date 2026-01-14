import fs from 'fs'
import path from 'path'

// File size limits
const DEFAULT_TEXT_FILE_LIMIT = 100 * 1024  // 100KB
const IMAGE_FILE_LIMIT = 10 * 1024 * 1024  // 10MB

// Token estimation constants
const CHARS_PER_TOKEN = 4  // Average characters per token (conservative estimate)
const RESPONSE_TOKEN_RESERVE = 2048  // Reserve tokens for model response

// Allowed file extensions
const TEXT_EXTENSIONS = ['.md', '.txt', '.json', '.xml', '.yaml', '.yml', '.csv']
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

// MIME types for images
const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp'
}

/**
 * FileProcessor - Handles file reading, validation, and processing
 */
export class FileProcessor {
  /**
   * Check if file extension is allowed
   * @param {string} filePath - Path to file
   * @returns {{allowed: boolean, type: 'text'|'image'|null, error?: string}}
   */
  static validateExtension(filePath) {
    const ext = path.extname(filePath).toLowerCase()

    if (TEXT_EXTENSIONS.includes(ext)) {
      return { allowed: true, type: 'text' }
    }

    if (IMAGE_EXTENSIONS.includes(ext)) {
      return { allowed: true, type: 'image' }
    }

    return {
      allowed: false,
      type: null,
      error: `Unsupported file type: ${ext}. Supported types: ${[...TEXT_EXTENSIONS, ...IMAGE_EXTENSIONS].join(', ')}`
    }
  }

  /**
   * Get MIME type for image file
   * @param {string} filePath - Path to image file
   * @returns {string}
   */
  static getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase()
    return MIME_TYPES[ext] || 'application/octet-stream'
  }

  /**
   * Process a file for attachment
   * @param {string} filePath - Path to file
   * @param {number} maxTextBytes - Maximum bytes for text files (optional)
   * @returns {Promise<{success: boolean, data?: object, error?: string, warning?: string}>}
   */
  static async processFile(filePath, maxTextBytes = DEFAULT_TEXT_FILE_LIMIT) {
    // Validate extension
    const validation = this.validateExtension(filePath)
    if (!validation.allowed) {
      return { success: false, error: validation.error }
    }

    // Check file exists
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `File not found: ${filePath}` }
    }

    // Get file stats
    const stats = fs.statSync(filePath)
    const fileName = path.basename(filePath)

    if (validation.type === 'text') {
      return this.processTextFile(filePath, fileName, stats.size, maxTextBytes)
    } else {
      return this.processImageFile(filePath, fileName, stats.size)
    }
  }

  /**
   * Process a text file
   * @param {string} filePath - Path to file
   * @param {string} fileName - File name
   * @param {number} fileSize - File size in bytes
   * @param {number} maxBytes - Maximum bytes to read (optional, defaults to 100KB)
   * @returns {Promise<{success: boolean, data?: object, error?: string, warning?: string}>}
   */
  static async processTextFile(filePath, fileName, fileSize, maxBytes = DEFAULT_TEXT_FILE_LIMIT) {
    let warning = null
    const effectiveLimit = Math.min(maxBytes, DEFAULT_TEXT_FILE_LIMIT)

    // Check size limit
    if (fileSize > effectiveLimit) {
      const limitKB = Math.round(effectiveLimit / 1024)
      warning = `File truncated to ${limitKB}KB (original size: ${Math.round(fileSize / 1024)}KB)`
    }

    try {
      // Read file with size limit
      const fd = fs.openSync(filePath, 'r')
      const buffer = Buffer.alloc(Math.min(fileSize, effectiveLimit))
      fs.readSync(fd, buffer, 0, buffer.length, 0)
      fs.closeSync(fd)

      const content = buffer.toString('utf8')
      const estimatedTokens = this.estimateTokens(content)

      return {
        success: true,
        data: {
          name: fileName,
          type: 'text',
          content: content,
          size: fileSize,
          truncated: fileSize > effectiveLimit,
          estimatedTokens: estimatedTokens
        },
        warning
      }
    } catch (error) {
      return { success: false, error: `Failed to read file: ${error.message}` }
    }
  }

  /**
   * Process an image file
   * @param {string} filePath - Path to file
   * @param {string} fileName - File name
   * @param {number} fileSize - File size in bytes
   * @returns {Promise<{success: boolean, data?: object, error?: string, warning?: string}>}
   */
  static async processImageFile(filePath, fileName, fileSize) {
    // Check size limit
    if (fileSize > IMAGE_FILE_LIMIT) {
      return {
        success: false,
        error: `Image file too large: ${Math.round(fileSize / 1024 / 1024)}MB. Maximum size: 10MB`
      }
    }

    try {
      const buffer = fs.readFileSync(filePath)
      const base64 = buffer.toString('base64')
      const mimeType = this.getMimeType(filePath)

      return {
        success: true,
        data: {
          name: fileName,
          type: 'image',
          content: base64,
          mimeType: mimeType,
          dataUrl: `data:${mimeType};base64,${base64}`,
          size: fileSize
        }
      }
    } catch (error) {
      return { success: false, error: `Failed to read image: ${error.message}` }
    }
  }

  /**
   * Format attachments for chat API message
   * @param {string} userMessage - User's text message
   * @param {object[]} attachments - Array of attachment data objects
   * @param {boolean} hasVisionSupport - Whether model supports vision
   * @returns {{content: any, warnings: string[]}}
   */
  static formatMessageWithAttachments(userMessage, attachments, hasVisionSupport = true) {
    const warnings = []

    if (!attachments || attachments.length === 0) {
      return { content: userMessage, warnings }
    }

    const textAttachments = attachments.filter(a => a.type === 'text')
    const imageAttachments = attachments.filter(a => a.type === 'image')

    // Build text content with file contents
    let textContent = userMessage

    if (textAttachments.length > 0) {
      textContent += '\n\n--- Attached Files ---'
      for (const att of textAttachments) {
        textContent += `\n\n[File: ${att.name}]\n${att.content}`
        if (att.truncated) {
          textContent += '\n[Note: File was truncated to 100KB]'
        }
      }
    }

    // If no images, return text only
    if (imageAttachments.length === 0) {
      return { content: textContent, warnings }
    }

    // Handle images
    if (!hasVisionSupport) {
      warnings.push('Selected model does not support vision. Images will not be analyzed.')
      // Return text only with image names mentioned
      const imageNames = imageAttachments.map(a => a.name).join(', ')
      textContent += `\n\n[Images attached but not analyzed (no vision support): ${imageNames}]`
      return { content: textContent, warnings }
    }

    // Build multimodal content array for vision-capable models
    const content = [
      { type: 'text', text: textContent }
    ]

    for (const img of imageAttachments) {
      content.push({
        type: 'image_url',
        image_url: {
          url: img.dataUrl,
          detail: 'auto'
        }
      })
    }

    return { content, warnings }
  }

  /**
   * Get supported file types description
   * @returns {string}
   */
  static getSupportedTypesDescription() {
    return `Text files: ${TEXT_EXTENSIONS.join(', ')}\nImages: ${IMAGE_EXTENSIONS.join(', ')}`
  }

  /**
   * Estimate token count for text content
   * Uses character-based heuristic (~4 chars per token average)
   * @param {string} text - Text content to estimate
   * @returns {number} Estimated token count
   */
  static estimateTokens(text) {
    if (!text) return 0
    return Math.ceil(text.length / CHARS_PER_TOKEN)
  }

  /**
   * Get effective context limit for attachments (total context minus response reserve)
   * @param {number} contextSize - Model's total context size in tokens
   * @returns {number} Available tokens for input (prompt + attachments)
   */
  static getEffectiveContextLimit(contextSize) {
    if (!contextSize) return null
    return Math.max(0, contextSize - RESPONSE_TOKEN_RESERVE)
  }

  /**
   * Calculate maximum text file size (in bytes) for a given model context
   * @param {number} contextSize - Model's total context size in tokens
   * @param {number} reserveTokens - Tokens to reserve for conversation history and response
   * @returns {number} Maximum file size in bytes
   */
  static getMaxTextSizeForModel(contextSize, reserveTokens = 4096) {
    if (!contextSize) return DEFAULT_TEXT_FILE_LIMIT

    // Calculate available tokens for file content
    const availableTokens = Math.max(0, contextSize - reserveTokens)

    // Convert tokens to bytes (tokens * chars per token)
    const maxBytes = availableTokens * CHARS_PER_TOKEN

    // Cap at default limit for large context models
    return Math.min(maxBytes, DEFAULT_TEXT_FILE_LIMIT)
  }

  /**
   * Estimate total tokens for a message with attachments
   * @param {string} userMessage - User's text message
   * @param {object[]} attachments - Array of attachment data objects
   * @param {object[]} conversationHistory - Previous messages in conversation
   * @returns {{totalTokens: number, breakdown: {message: number, attachments: number, history: number}}}
   */
  static estimateMessageTokens(userMessage, attachments = [], conversationHistory = []) {
    // Estimate user message tokens
    const messageTokens = this.estimateTokens(userMessage || '')

    // Estimate attachment tokens (text files only, images handled differently)
    let attachmentTokens = 0
    for (const att of attachments) {
      if (att.type === 'text' && att.content) {
        // Include file header overhead
        const headerOverhead = `\n\n[File: ${att.name}]\n`.length
        attachmentTokens += this.estimateTokens(att.content) + Math.ceil(headerOverhead / CHARS_PER_TOKEN)
      }
    }

    // Estimate conversation history tokens
    let historyTokens = 0
    for (const msg of conversationHistory) {
      if (typeof msg.content === 'string') {
        historyTokens += this.estimateTokens(msg.content)
      } else if (Array.isArray(msg.content)) {
        // Multimodal content
        for (const part of msg.content) {
          if (part.type === 'text') {
            historyTokens += this.estimateTokens(part.text)
          }
        }
      }
      // Add small overhead for role markers
      historyTokens += 4
    }

    return {
      totalTokens: messageTokens + attachmentTokens + historyTokens,
      breakdown: {
        message: messageTokens,
        attachments: attachmentTokens,
        history: historyTokens
      }
    }
  }

  /**
   * Validate if message is within token limits
   * @param {string} userMessage - User's text message
   * @param {object[]} attachments - Array of attachment data objects
   * @param {object[]} conversationHistory - Previous messages
   * @param {number} contextSize - Model's context size in tokens
   * @returns {{valid: boolean, totalTokens: number, limit: number, percentUsed: number, warning?: string, error?: string}}
   */
  static validateTokenLimit(userMessage, attachments, conversationHistory, contextSize) {
    if (!contextSize) {
      // Unknown context size - allow but can't validate
      return { valid: true, totalTokens: 0, limit: 0, percentUsed: 0 }
    }

    const effectiveLimit = this.getEffectiveContextLimit(contextSize)
    const { totalTokens, breakdown } = this.estimateMessageTokens(userMessage, attachments, conversationHistory)
    const percentUsed = Math.round((totalTokens / effectiveLimit) * 100)

    const result = {
      valid: true,
      totalTokens,
      limit: effectiveLimit,
      percentUsed,
      breakdown
    }

    if (totalTokens > effectiveLimit) {
      result.valid = false
      result.error = `Message exceeds context limit (~${totalTokens.toLocaleString()} tokens, limit: ~${effectiveLimit.toLocaleString()}). Try: reduce file size, clear history, or switch to a larger context model.`
    } else if (percentUsed >= 80) {
      result.warning = `Approaching context limit (${percentUsed}% used). Consider reducing content for reliable responses.`
    }

    return result
  }
}

export default FileProcessor

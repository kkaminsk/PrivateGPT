import fs from 'fs'
import path from 'path'

// File size limits
const TEXT_FILE_LIMIT = 100 * 1024  // 100KB
const IMAGE_FILE_LIMIT = 10 * 1024 * 1024  // 10MB

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
   * @returns {Promise<{success: boolean, data?: object, error?: string, warning?: string}>}
   */
  static async processFile(filePath) {
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
      return this.processTextFile(filePath, fileName, stats.size)
    } else {
      return this.processImageFile(filePath, fileName, stats.size)
    }
  }

  /**
   * Process a text file
   * @param {string} filePath - Path to file
   * @param {string} fileName - File name
   * @param {number} fileSize - File size in bytes
   * @returns {Promise<{success: boolean, data?: object, error?: string, warning?: string}>}
   */
  static async processTextFile(filePath, fileName, fileSize) {
    let warning = null

    // Check size limit
    if (fileSize > TEXT_FILE_LIMIT) {
      warning = `File truncated to 100KB (original size: ${Math.round(fileSize / 1024)}KB)`
    }

    try {
      // Read file with size limit
      const fd = fs.openSync(filePath, 'r')
      const buffer = Buffer.alloc(Math.min(fileSize, TEXT_FILE_LIMIT))
      fs.readSync(fd, buffer, 0, buffer.length, 0)
      fs.closeSync(fd)

      const content = buffer.toString('utf8')

      return {
        success: true,
        data: {
          name: fileName,
          type: 'text',
          content: content,
          size: fileSize,
          truncated: fileSize > TEXT_FILE_LIMIT
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
}

export default FileProcessor

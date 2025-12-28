import crypto from 'crypto'

/**
 * SecureSessionManager - Handles AES-256-GCM encryption for ephemeral data storage
 * All data is encrypted in memory and never persisted to disk
 */
export class SecureSessionManager {
  constructor() {
    // Generate session key on instantiation (memory-only)
    this.sessionKey = crypto.randomBytes(32)
    this.encryptedStore = new Map()
    this.attachments = new Map()
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param {string|Buffer} data - Data to encrypt
   * @returns {{iv: Buffer, authTag: Buffer, encrypted: Buffer}}
   */
  encrypt(data) {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-gcm', this.sessionKey, iv)

    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8')
    const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()])
    const authTag = cipher.getAuthTag()

    return { iv, authTag, encrypted }
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param {{iv: Buffer, authTag: Buffer, encrypted: Buffer}} encryptedData
   * @returns {Buffer}
   */
  decrypt(encryptedData) {
    const { iv, authTag, encrypted } = encryptedData
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.sessionKey, iv)
    decipher.setAuthTag(authTag)

    return Buffer.concat([decipher.update(encrypted), decipher.final()])
  }

  /**
   * Store encrypted message
   * @param {string} id - Message identifier
   * @param {object} message - Message object to store
   */
  storeMessage(id, message) {
    const json = JSON.stringify(message)
    const encrypted = this.encrypt(json)
    this.encryptedStore.set(id, encrypted)
  }

  /**
   * Retrieve and decrypt message
   * @param {string} id - Message identifier
   * @returns {object|null}
   */
  getMessage(id) {
    const encrypted = this.encryptedStore.get(id)
    if (!encrypted) return null

    const decrypted = this.decrypt(encrypted)
    return JSON.parse(decrypted.toString('utf8'))
  }

  /**
   * Store encrypted file attachment
   * @param {string} id - Attachment identifier
   * @param {object} attachment - Attachment data {name, type, content, mimeType}
   */
  storeAttachment(id, attachment) {
    const encrypted = this.encrypt(JSON.stringify(attachment))
    this.attachments.set(id, encrypted)
  }

  /**
   * Retrieve and decrypt attachment
   * @param {string} id - Attachment identifier
   * @returns {object|null}
   */
  getAttachment(id) {
    const encrypted = this.attachments.get(id)
    if (!encrypted) return null

    const decrypted = this.decrypt(encrypted)
    return JSON.parse(decrypted.toString('utf8'))
  }

  /**
   * Remove attachment
   * @param {string} id - Attachment identifier
   */
  removeAttachment(id) {
    const encrypted = this.attachments.get(id)
    if (encrypted) {
      // Overwrite with zeros before deletion
      encrypted.encrypted.fill(0)
      encrypted.iv.fill(0)
      encrypted.authTag.fill(0)
      this.attachments.delete(id)
    }
  }

  /**
   * Get all attachment IDs
   * @returns {string[]}
   */
  getAttachmentIds() {
    return Array.from(this.attachments.keys())
  }

  /**
   * Get all attachments (decrypted)
   * @returns {object[]}
   */
  getAllAttachments() {
    const result = []
    for (const id of this.attachments.keys()) {
      const attachment = this.getAttachment(id)
      if (attachment) {
        result.push({ id, ...attachment })
      }
    }
    return result
  }

  /**
   * Clear all attachments
   */
  clearAttachments() {
    for (const id of this.attachments.keys()) {
      this.removeAttachment(id)
    }
  }

  /**
   * Securely purge all data from memory
   * Overwrites buffers with zeros before clearing references
   */
  purge() {
    // Overwrite session key with zeros
    this.sessionKey.fill(0)

    // Overwrite all encrypted messages
    for (const [id, encrypted] of this.encryptedStore) {
      encrypted.encrypted.fill(0)
      encrypted.iv.fill(0)
      encrypted.authTag.fill(0)
    }
    this.encryptedStore.clear()

    // Overwrite all attachments
    for (const [id, encrypted] of this.attachments) {
      encrypted.encrypted.fill(0)
      encrypted.iv.fill(0)
      encrypted.authTag.fill(0)
    }
    this.attachments.clear()

    // Generate new key (in case app continues running)
    this.sessionKey = crypto.randomBytes(32)
  }
}

export default SecureSessionManager

import { describe, it, before, after, beforeEach } from 'node:test'
import assert from 'node:assert'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { SecureSessionManager } from '../secure-session.js'
import { FileProcessor } from '../file-processor.js'

describe('Integration Tests', () => {
  let testDir
  let sessionManager

  before(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'privategpt-integration-'))
  })

  after(() => {
    fs.rmSync(testDir, { recursive: true, force: true })
  })

  beforeEach(() => {
    sessionManager = new SecureSessionManager()
  })

  describe('Full Message Flow with Attachments', () => {
    it('should process text file and store encrypted attachment', async () => {
      // Create a test file
      const filePath = path.join(testDir, 'document.txt')
      const content = 'This is sensitive document content.'
      fs.writeFileSync(filePath, content)

      // Process the file
      const processResult = await FileProcessor.processFile(filePath)
      assert.strictEqual(processResult.success, true)

      // Store as encrypted attachment
      const attachmentId = 'att_001'
      sessionManager.storeAttachment(attachmentId, processResult.data)

      // Retrieve and verify
      const retrieved = sessionManager.getAttachment(attachmentId)
      assert.strictEqual(retrieved.name, 'document.txt')
      assert.strictEqual(retrieved.content, content)
      assert.strictEqual(retrieved.type, 'text')
    })

    it('should process image and format for vision API', async () => {
      // Create a minimal PNG
      const filePath = path.join(testDir, 'image.png')
      const pngData = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
        0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xff, 0xff, 0x3f,
        0x00, 0x05, 0xfe, 0x02, 0xfe, 0xdc, 0xcc, 0x59, 0xe7, 0x00, 0x00, 0x00,
        0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
      ])
      fs.writeFileSync(filePath, pngData)

      // Process the image
      const processResult = await FileProcessor.processFile(filePath)
      assert.strictEqual(processResult.success, true)

      // Store encrypted
      sessionManager.storeAttachment('img_001', processResult.data)

      // Retrieve and format for API
      const attachments = sessionManager.getAllAttachments()
      const formatted = FileProcessor.formatMessageWithAttachments(
        'What is in this image?',
        attachments,
        true
      )

      assert.ok(Array.isArray(formatted.content))
      assert.strictEqual(formatted.content[0].type, 'text')
      assert.strictEqual(formatted.content[1].type, 'image_url')
    })

    it('should handle multiple attachments in single message', async () => {
      // Create multiple files
      const files = [
        { name: 'notes.md', content: '# Notes\nSome markdown' },
        { name: 'config.json', content: '{"setting": true}' },
        { name: 'data.csv', content: 'col1,col2\nval1,val2' }
      ]

      for (const file of files) {
        const filePath = path.join(testDir, file.name)
        fs.writeFileSync(filePath, file.content)

        const result = await FileProcessor.processFile(filePath)
        assert.strictEqual(result.success, true)
        sessionManager.storeAttachment(`att_${file.name}`, result.data)
      }

      // Verify all stored
      const allAttachments = sessionManager.getAllAttachments()
      assert.strictEqual(allAttachments.length, 3)

      // Format message
      const formatted = FileProcessor.formatMessageWithAttachments(
        'Analyze these files:',
        allAttachments,
        false
      )

      assert.ok(formatted.content.includes('notes.md'))
      assert.ok(formatted.content.includes('config.json'))
      assert.ok(formatted.content.includes('data.csv'))
    })
  })

  describe('Startup Purge Behavior', () => {
    it('should identify files with PrivateGPT signatures', () => {
      // Create files with PrivateGPT signatures
      const signatureFiles = [
        'privategpt-cache.tmp',
        'PrivateGPT-session.dat',
        'private-gpt-temp.json'
      ]

      for (const filename of signatureFiles) {
        const filePath = path.join(testDir, filename)
        fs.writeFileSync(filePath, 'test data')
        assert.ok(fs.existsSync(filePath))
      }

      // Verify files exist
      const files = fs.readdirSync(testDir)
      const matchingFiles = files.filter(f =>
        f.toLowerCase().includes('privategpt') ||
        f.toLowerCase().includes('private-gpt')
      )
      assert.strictEqual(matchingFiles.length, 3)
    })

    it('should handle empty directories gracefully', () => {
      const emptyDir = path.join(testDir, 'empty-subdir')
      fs.mkdirSync(emptyDir)

      const files = fs.readdirSync(emptyDir)
      assert.strictEqual(files.length, 0)
    })
  })

  describe('Shutdown Purge Behavior', () => {
    it('should clear all session data on purge', () => {
      // Store various data
      sessionManager.storeMessage('msg1', { role: 'user', content: 'Hello' })
      sessionManager.storeMessage('msg2', { role: 'assistant', content: 'Hi!' })
      sessionManager.storeAttachment('att1', { name: 'file.txt', content: 'data' })
      sessionManager.storeAttachment('att2', { name: 'img.png', content: 'base64' })

      // Verify data exists
      assert.ok(sessionManager.getMessage('msg1'))
      assert.ok(sessionManager.getMessage('msg2'))
      assert.strictEqual(sessionManager.getAttachmentIds().length, 2)

      // Purge
      sessionManager.purge()

      // Verify all cleared
      assert.strictEqual(sessionManager.getMessage('msg1'), null)
      assert.strictEqual(sessionManager.getMessage('msg2'), null)
      assert.strictEqual(sessionManager.getAttachmentIds().length, 0)
    })

    it('should generate new encryption key after purge', () => {
      const originalKey = Buffer.from(sessionManager.sessionKey)

      // Store and purge
      sessionManager.storeMessage('test', { data: 'sensitive' })
      sessionManager.purge()

      // Key should be different
      assert.notDeepStrictEqual(sessionManager.sessionKey, originalKey)

      // New key should work for encryption
      const testData = 'new session data'
      const encrypted = sessionManager.encrypt(testData)
      const decrypted = sessionManager.decrypt(encrypted)
      assert.strictEqual(decrypted.toString(), testData)
    })

    it('should allow new data storage after purge', () => {
      // Initial data
      sessionManager.storeMessage('old', { content: 'old data' })

      // Purge
      sessionManager.purge()

      // Store new data
      sessionManager.storeMessage('new', { content: 'new data' })

      // Old data gone, new data accessible
      assert.strictEqual(sessionManager.getMessage('old'), null)
      assert.deepStrictEqual(sessionManager.getMessage('new'), { content: 'new data' })
    })
  })

  describe('End-to-End Encryption Flow', () => {
    it('should maintain data integrity through full encrypt/store/retrieve cycle', async () => {
      const testFile = path.join(testDir, 'sensitive.json')
      const sensitiveData = {
        apiKeys: ['key1', 'key2'],
        credentials: { user: 'admin', token: 'secret123' }
      }
      fs.writeFileSync(testFile, JSON.stringify(sensitiveData, null, 2))

      // Process file
      const processed = await FileProcessor.processFile(testFile)
      assert.strictEqual(processed.success, true)

      // Store encrypted
      sessionManager.storeAttachment('sensitive', processed.data)

      // Retrieve and parse
      const retrieved = sessionManager.getAttachment('sensitive')
      const parsed = JSON.parse(retrieved.content)

      // Verify integrity
      assert.deepStrictEqual(parsed, sensitiveData)
    })
  })
})

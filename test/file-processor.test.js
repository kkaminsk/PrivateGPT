import { describe, it, before, after } from 'node:test'
import assert from 'node:assert'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { FileProcessor } from '../file-processor.js'

describe('FileProcessor', () => {
  let testDir

  before(() => {
    // Create temp directory for test files
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'privategpt-test-'))
  })

  after(() => {
    // Cleanup test directory
    fs.rmSync(testDir, { recursive: true, force: true })
  })

  describe('validateExtension', () => {
    it('should allow text file extensions', () => {
      const textExtensions = ['.md', '.txt', '.json', '.xml', '.yaml', '.yml', '.csv']

      for (const ext of textExtensions) {
        const result = FileProcessor.validateExtension(`file${ext}`)
        assert.strictEqual(result.allowed, true, `${ext} should be allowed`)
        assert.strictEqual(result.type, 'text', `${ext} should be type text`)
      }
    })

    it('should allow image file extensions', () => {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

      for (const ext of imageExtensions) {
        const result = FileProcessor.validateExtension(`image${ext}`)
        assert.strictEqual(result.allowed, true, `${ext} should be allowed`)
        assert.strictEqual(result.type, 'image', `${ext} should be type image`)
      }
    })

    it('should reject unsupported extensions', () => {
      const unsupported = ['.exe', '.pdf', '.doc', '.zip', '.dll']

      for (const ext of unsupported) {
        const result = FileProcessor.validateExtension(`file${ext}`)
        assert.strictEqual(result.allowed, false, `${ext} should not be allowed`)
        assert.ok(result.error, `${ext} should have error message`)
      }
    })

    it('should be case-insensitive', () => {
      const result1 = FileProcessor.validateExtension('FILE.TXT')
      const result2 = FileProcessor.validateExtension('image.PNG')

      assert.strictEqual(result1.allowed, true)
      assert.strictEqual(result2.allowed, true)
    })
  })

  describe('getMimeType', () => {
    it('should return correct MIME types for images', () => {
      assert.strictEqual(FileProcessor.getMimeType('photo.jpg'), 'image/jpeg')
      assert.strictEqual(FileProcessor.getMimeType('photo.jpeg'), 'image/jpeg')
      assert.strictEqual(FileProcessor.getMimeType('icon.png'), 'image/png')
      assert.strictEqual(FileProcessor.getMimeType('anim.gif'), 'image/gif')
      assert.strictEqual(FileProcessor.getMimeType('modern.webp'), 'image/webp')
    })

    it('should return octet-stream for unknown types', () => {
      assert.strictEqual(FileProcessor.getMimeType('file.xyz'), 'application/octet-stream')
    })
  })

  describe('processFile - Text Files', () => {
    it('should read a text file correctly', async () => {
      const filePath = path.join(testDir, 'test.txt')
      const content = 'Hello, PrivateGPT!'
      fs.writeFileSync(filePath, content)

      const result = await FileProcessor.processFile(filePath)

      assert.strictEqual(result.success, true)
      assert.strictEqual(result.data.name, 'test.txt')
      assert.strictEqual(result.data.type, 'text')
      assert.strictEqual(result.data.content, content)
      assert.strictEqual(result.data.truncated, false)
    })

    it('should read markdown files', async () => {
      const filePath = path.join(testDir, 'readme.md')
      const content = '# Title\n\nSome **markdown** content.'
      fs.writeFileSync(filePath, content)

      const result = await FileProcessor.processFile(filePath)

      assert.strictEqual(result.success, true)
      assert.strictEqual(result.data.type, 'text')
      assert.strictEqual(result.data.content, content)
    })

    it('should read JSON files', async () => {
      const filePath = path.join(testDir, 'config.json')
      const content = '{"key": "value", "number": 42}'
      fs.writeFileSync(filePath, content)

      const result = await FileProcessor.processFile(filePath)

      assert.strictEqual(result.success, true)
      assert.strictEqual(result.data.content, content)
    })

    it('should truncate large text files and warn', async () => {
      const filePath = path.join(testDir, 'large.txt')
      const largeContent = 'x'.repeat(150 * 1024) // 150KB
      fs.writeFileSync(filePath, largeContent)

      const result = await FileProcessor.processFile(filePath)

      assert.strictEqual(result.success, true)
      assert.strictEqual(result.data.truncated, true)
      assert.strictEqual(result.data.content.length, 100 * 1024)
      assert.ok(result.warning)
      assert.ok(result.warning.includes('truncated'))
    })

    it('should return error for non-existent file', async () => {
      const result = await FileProcessor.processFile('/nonexistent/file.txt')

      assert.strictEqual(result.success, false)
      assert.ok(result.error)
    })

    it('should return error for unsupported extension', async () => {
      const filePath = path.join(testDir, 'program.exe')
      fs.writeFileSync(filePath, 'binary')

      const result = await FileProcessor.processFile(filePath)

      assert.strictEqual(result.success, false)
      assert.ok(result.error.includes('Unsupported'))
    })
  })

  describe('processFile - Image Files', () => {
    it('should read and base64 encode an image', async () => {
      const filePath = path.join(testDir, 'test.png')
      // Create a minimal PNG (1x1 pixel)
      const pngData = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
        0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xff, 0xff, 0x3f,
        0x00, 0x05, 0xfe, 0x02, 0xfe, 0xdc, 0xcc, 0x59, 0xe7, 0x00, 0x00, 0x00,
        0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
      ])
      fs.writeFileSync(filePath, pngData)

      const result = await FileProcessor.processFile(filePath)

      assert.strictEqual(result.success, true)
      assert.strictEqual(result.data.name, 'test.png')
      assert.strictEqual(result.data.type, 'image')
      assert.strictEqual(result.data.mimeType, 'image/png')
      assert.ok(result.data.content) // base64 string
      assert.ok(result.data.dataUrl.startsWith('data:image/png;base64,'))
    })

    it('should reject images over 10MB', async () => {
      const filePath = path.join(testDir, 'huge.jpg')
      // Create a file larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 0xff)
      fs.writeFileSync(filePath, largeBuffer)

      const result = await FileProcessor.processFile(filePath)

      assert.strictEqual(result.success, false)
      assert.ok(result.error.includes('too large'))
    })
  })

  describe('formatMessageWithAttachments', () => {
    it('should return plain text when no attachments', () => {
      const result = FileProcessor.formatMessageWithAttachments('Hello', [], true)

      assert.strictEqual(result.content, 'Hello')
      assert.strictEqual(result.warnings.length, 0)
    })

    it('should append text file content to message', () => {
      const attachments = [
        { name: 'notes.txt', type: 'text', content: 'File content here' }
      ]

      const result = FileProcessor.formatMessageWithAttachments('Analyze this:', attachments, true)

      assert.ok(result.content.includes('Analyze this:'))
      assert.ok(result.content.includes('[File: notes.txt]'))
      assert.ok(result.content.includes('File content here'))
    })

    it('should note truncated files', () => {
      const attachments = [
        { name: 'big.txt', type: 'text', content: 'content', truncated: true }
      ]

      const result = FileProcessor.formatMessageWithAttachments('Read:', attachments, true)

      assert.ok(result.content.includes('truncated'))
    })

    it('should format images for vision API', () => {
      const attachments = [
        { name: 'photo.jpg', type: 'image', dataUrl: 'data:image/jpeg;base64,abc123' }
      ]

      const result = FileProcessor.formatMessageWithAttachments('What is this?', attachments, true)

      assert.ok(Array.isArray(result.content))
      assert.strictEqual(result.content[0].type, 'text')
      assert.strictEqual(result.content[1].type, 'image_url')
      assert.ok(result.content[1].image_url.url.includes('base64'))
    })

    it('should warn when vision not supported', () => {
      const attachments = [
        { name: 'photo.jpg', type: 'image', dataUrl: 'data:image/jpeg;base64,abc123' }
      ]

      const result = FileProcessor.formatMessageWithAttachments('What is this?', attachments, false)

      assert.strictEqual(typeof result.content, 'string')
      assert.ok(result.warnings.length > 0)
      assert.ok(result.warnings[0].includes('vision'))
    })

    it('should handle mixed text and image attachments', () => {
      const attachments = [
        { name: 'notes.txt', type: 'text', content: 'Notes here' },
        { name: 'diagram.png', type: 'image', dataUrl: 'data:image/png;base64,xyz' }
      ]

      const result = FileProcessor.formatMessageWithAttachments('Explain:', attachments, true)

      assert.ok(Array.isArray(result.content))
      assert.ok(result.content[0].text.includes('Notes here'))
      assert.strictEqual(result.content[1].type, 'image_url')
    })
  })

  describe('getSupportedTypesDescription', () => {
    it('should return a description of supported types', () => {
      const desc = FileProcessor.getSupportedTypesDescription()

      assert.ok(desc.includes('.md'))
      assert.ok(desc.includes('.txt'))
      assert.ok(desc.includes('.jpg'))
      assert.ok(desc.includes('.png'))
    })
  })

  describe('estimateTokens', () => {
    it('should return 0 for empty string', () => {
      assert.strictEqual(FileProcessor.estimateTokens(''), 0)
      assert.strictEqual(FileProcessor.estimateTokens(null), 0)
      assert.strictEqual(FileProcessor.estimateTokens(undefined), 0)
    })

    it('should estimate tokens based on character count', () => {
      // ~4 chars per token
      const text = 'Hello world' // 11 chars = ~3 tokens
      const result = FileProcessor.estimateTokens(text)
      assert.strictEqual(result, 3) // ceil(11/4)
    })

    it('should handle long text correctly', () => {
      const text = 'a'.repeat(1000) // 1000 chars = 250 tokens
      const result = FileProcessor.estimateTokens(text)
      assert.strictEqual(result, 250)
    })
  })

  describe('getEffectiveContextLimit', () => {
    it('should return null for null context size', () => {
      assert.strictEqual(FileProcessor.getEffectiveContextLimit(null), null)
    })

    it('should subtract response reserve from context size', () => {
      // Default reserve is 2048 tokens
      const result = FileProcessor.getEffectiveContextLimit(4096)
      assert.strictEqual(result, 2048)
    })

    it('should not return negative values', () => {
      const result = FileProcessor.getEffectiveContextLimit(1000)
      assert.ok(result >= 0)
    })
  })

  describe('getMaxTextSizeForModel', () => {
    it('should return default limit for null context size', () => {
      const result = FileProcessor.getMaxTextSizeForModel(null)
      assert.strictEqual(result, 100 * 1024) // 100KB default
    })

    it('should calculate smaller limit for small context models', () => {
      // 4096 context - 4096 reserve = 0 available tokens
      const result = FileProcessor.getMaxTextSizeForModel(4096, 4096)
      assert.strictEqual(result, 0)
    })

    it('should cap at default limit for large context models', () => {
      // Large context should still cap at 100KB
      const result = FileProcessor.getMaxTextSizeForModel(131072)
      assert.strictEqual(result, 100 * 1024)
    })
  })

  describe('estimateMessageTokens', () => {
    it('should return zero for empty inputs', () => {
      const result = FileProcessor.estimateMessageTokens('', [], [])
      assert.strictEqual(result.totalTokens, 0)
    })

    it('should estimate user message tokens', () => {
      const result = FileProcessor.estimateMessageTokens('Hello world', [], [])
      assert.ok(result.totalTokens > 0)
      assert.ok(result.breakdown.message > 0)
    })

    it('should include attachment tokens', () => {
      const attachments = [{ name: 'test.txt', type: 'text', content: 'Some file content here' }]
      const result = FileProcessor.estimateMessageTokens('Analyze:', attachments, [])
      assert.ok(result.breakdown.attachments > 0)
    })

    it('should include conversation history tokens', () => {
      const history = [
        { role: 'user', content: 'Previous question' },
        { role: 'assistant', content: 'Previous answer' }
      ]
      const result = FileProcessor.estimateMessageTokens('New message', [], history)
      assert.ok(result.breakdown.history > 0)
    })
  })

  describe('validateTokenLimit', () => {
    it('should return valid for null context size', () => {
      const result = FileProcessor.validateTokenLimit('Hello', [], [], null)
      assert.strictEqual(result.valid, true)
    })

    it('should return valid for small messages within limit', () => {
      const result = FileProcessor.validateTokenLimit('Hello', [], [], 4096)
      assert.strictEqual(result.valid, true)
      assert.ok(result.percentUsed < 80)
    })

    it('should return warning when approaching limit', () => {
      // Create a message that uses ~85% of context
      const contextSize = 4096
      const effectiveLimit = contextSize - 2048 // 2048 tokens available
      const tokensNeeded = Math.ceil(effectiveLimit * 0.85) // ~1741 tokens
      const charCount = tokensNeeded * 4 // ~6964 chars
      const longMessage = 'a'.repeat(charCount)

      const result = FileProcessor.validateTokenLimit(longMessage, [], [], contextSize)
      assert.strictEqual(result.valid, true)
      assert.ok(result.warning, 'Should have warning for 80%+ usage')
    })

    it('should return invalid when exceeding limit', () => {
      // Create a message that exceeds context
      const contextSize = 4096
      const effectiveLimit = contextSize - 2048 // 2048 tokens available
      const tokensNeeded = effectiveLimit + 100 // Over limit
      const charCount = tokensNeeded * 4
      const longMessage = 'a'.repeat(charCount)

      const result = FileProcessor.validateTokenLimit(longMessage, [], [], contextSize)
      assert.strictEqual(result.valid, false)
      assert.ok(result.error, 'Should have error for exceeding limit')
    })
  })

  describe('processTextFile with maxBytes', () => {
    it('should respect custom maxBytes parameter', async () => {
      const filePath = path.join(testDir, 'custom-limit.txt')
      const content = 'x'.repeat(50 * 1024) // 50KB
      fs.writeFileSync(filePath, content)

      // Request only 10KB max
      const result = await FileProcessor.processFile(filePath, 10 * 1024)

      assert.strictEqual(result.success, true)
      assert.strictEqual(result.data.truncated, true)
      assert.strictEqual(result.data.content.length, 10 * 1024)
      assert.ok(result.warning.includes('10KB'))
    })

    it('should include estimatedTokens in result', async () => {
      const filePath = path.join(testDir, 'with-tokens.txt')
      const content = 'Hello world test content'
      fs.writeFileSync(filePath, content)

      const result = await FileProcessor.processFile(filePath)

      assert.strictEqual(result.success, true)
      assert.ok(result.data.estimatedTokens > 0)
    })
  })
})

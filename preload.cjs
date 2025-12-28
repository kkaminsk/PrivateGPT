const { contextBridge, ipcRenderer } = require('electron');

console.log('[PrivateGPT] Preload script starting...');

try {
    contextBridge.exposeInMainWorld('versions', {
        node: () => process.versions.node,
        chrome: () => process.versions.chrome,
        electron: () => process.versions.electron
    });

    contextBridge.exposeInMainWorld('mainAPI', {
        // Chat functions
        sendMessage: (messages) => ipcRenderer.invoke('send-message', messages),
        onChatChunk: (callback) => ipcRenderer.on('chat-chunk', (_, chunk) => callback(chunk)),
        onChatComplete: (callback) => ipcRenderer.on('chat-complete', () => callback()),
        removeAllChatListeners: () => {
            ipcRenderer.removeAllListeners('chat-chunk');
            ipcRenderer.removeAllListeners('chat-complete');
        },

        // Model functions
        getLocalModels: () => ipcRenderer.invoke('get-local-models'),
        switchModel: (modelId) => ipcRenderer.invoke('switch-model', modelId),
        getVisionSupport: () => ipcRenderer.invoke('get-vision-support'),

        // File attachment functions
        attachFile: (filePath) => ipcRenderer.invoke('attach-file', filePath),
        removeAttachment: (attachmentId) => ipcRenderer.invoke('remove-attachment', attachmentId),
        getAttachments: () => ipcRenderer.invoke('get-attachments'),
        clearAttachments: () => ipcRenderer.invoke('clear-attachments'),
        openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),

        // Attachment event listeners
        onAttachmentWarnings: (callback) => ipcRenderer.on('attachment-warnings', (_, warnings) => callback(warnings)),
        onAttachmentsCleared: (callback) => ipcRenderer.on('attachments-cleared', () => callback()),

        // Foundry lifecycle events
        onFoundryStarting: (callback) => ipcRenderer.on('foundry-starting', () => callback()),
        onFoundryReady: (callback) => ipcRenderer.on('foundry-ready', () => callback()),
        onFoundryNotInstalled: (callback) => ipcRenderer.on('foundry-not-installed', () => callback()),
        onFoundryFailed: (callback) => ipcRenderer.on('foundry-failed', (_, error) => callback(error)),
        retryFoundryStart: () => ipcRenderer.invoke('retry-foundry-start'),

        // Cleanup
        removeAllAttachmentListeners: () => {
            ipcRenderer.removeAllListeners('attachment-warnings');
            ipcRenderer.removeAllListeners('attachments-cleared');
        },
        removeAllFoundryListeners: () => {
            ipcRenderer.removeAllListeners('foundry-starting');
            ipcRenderer.removeAllListeners('foundry-ready');
            ipcRenderer.removeAllListeners('foundry-not-installed');
            ipcRenderer.removeAllListeners('foundry-failed');
        }
    });

    console.log('[PrivateGPT] Preload script completed successfully');
} catch (error) {
    console.error('[PrivateGPT] Error in preload script:', error);
}

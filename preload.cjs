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

        // Error event listeners
        onFoundryNotRunning: (callback) => ipcRenderer.on('foundry-not-running', () => callback()),

        // Cleanup
        removeAllAttachmentListeners: () => {
            ipcRenderer.removeAllListeners('attachment-warnings');
            ipcRenderer.removeAllListeners('attachments-cleared');
        }
    });

    console.log('[PrivateGPT] Preload script completed successfully');
} catch (error) {
    console.error('[PrivateGPT] Error in preload script:', error);
}

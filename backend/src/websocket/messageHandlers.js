// backend/src/websocket/messageHandlers.js
import PLCTagManager from '../plc/PLCTagManager.js';

const tagManager = new PLCTagManager();

export const handleIncomingMessage = async (message, plcBridge) => {
    try {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'write':
                await handleWriteRequest(data, plcBridge);
                break;
                
            case 'read':
                await handleReadRequest(data, plcBridge);
                break;
                
            case 'subscribe':
                await handleSubscribeRequest(data, plcBridge);
                break;
                
            default:
                console.warn('Unknown message type:', data.type);
        }
    } catch (error) {
        console.error('Error handling message:', error);
        return {
            type: 'error',
            error: error.message
        };
    }
};

const handleWriteRequest = async (data, plcBridge) => {
    const { tag, value } = data;
    
    if (!tagManager.validateTag(tag, 'toPLC')) {
        throw new Error(`Invalid tag: ${tag}`);
    }

    const tagAddress = tagManager.getTagAddress(tag, 'toPLC');
    await plcBridge.writeTag(tagAddress, value);
    
    return {
        type: 'writeResponse',
        success: true,
        tag,
        value
    };
};

const handleReadRequest = async (data, plcBridge) => {
    const { tag } = data;
    
    if (!tagManager.validateTag(tag, 'fromPLC')) {
        throw new Error(`Invalid tag: ${tag}`);
    }

    const tagAddress = tagManager.getTagAddress(tag, 'fromPLC');
    const value = await plcBridge.readTag(tagAddress);
    
    return {
        type: 'readResponse',
        tag,
        value
    };
};

const handleSubscribeRequest = async (data, plcBridge) => {
    const { tags } = data;
    
    // Validate all requested tags
    const invalidTags = tags.filter(tag => !tagManager.validateTag(tag, 'fromPLC'));
    if (invalidTags.length > 0) {
        throw new Error(`Invalid tags: ${invalidTags.join(', ')}`);
    }

    // Subscribe to tags (implementation depends on RSLinx capabilities)
    await plcBridge.subscribeTags(tags);
    
    return {
        type: 'subscribeResponse',
        success: true,
        tags
    };
};
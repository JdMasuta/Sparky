// backend/src/plc/PLCTagManager.js
import { PLCConfig } from './plc.config.js';

class PLCTagManager {
    constructor() {
        this.tags = PLCConfig.tags;
    }

    validateTag(tagName, direction = 'fromPLC') {
        const tagSet = direction === 'fromPLC' ? this.tags.fromPLC : this.tags.toPLC;
        return tagSet.hasOwnProperty(tagName);
    }

    getTagAddress(tagName, direction = 'fromPLC') {
        const tagSet = direction === 'fromPLC' ? this.tags.fromPLC : this.tags.toPLC;
        return tagSet[tagName];
    }

    getAllTags(direction = 'fromPLC') {
        return direction === 'fromPLC' ? this.tags.fromPLC : this.tags.toPLC;
    }
}

export default PLCTagManager;
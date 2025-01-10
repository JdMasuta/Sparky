// backend/src/plc/plc.config.js
export const PLCConfig = {
    topic: process.env.RSLINX_TOPIC || 'ExcelLink',
    pollInterval: parseInt(process.env.RSLINX_POLL_INTERVAL, 10) || 1000, // milliseconds
    tags: {
        fromPLC: {
            Quantity: 'Reel.RealData[0]',
            CompleteReq: '_200_GLB.BoolData[0].0'
        },
        toPLC: {
            UserName: '_200_GLB.StringData[0]',
            MONumber: '_200_GLB.StringData[1]',
            ItemNumber: '_200_GLB.StringData[2]',
            CompleteAck: '_200_GLB.BoolData[1]',
            StepNumber: '_200_GLB.DintData[2]'
        }
    }
};

export const connectionConfig = {
    maxReconnectAttempts: 5,
    reconnectInterval: 5000,
    timeout: 30000
};
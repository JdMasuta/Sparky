// app/src/components/PLCMonitor/index.jsx
import { useState, useEffect } from 'react';
import rslinxClient from '../../services/RSLinxClient';
import PLCControls from './PLCControls';

const PLCMonitor = () => {
    const [plcData, setPlcData] = useState({
        quantity: 0,
        completeReq: false
    });
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    useEffect(() => {
        // Subscribe to PLC updates
        const unsubscribe = rslinxClient.subscribe((data) => {
            if (data.type === 'connection') {
                setConnectionStatus(data.status);
            } else if (data.type === 'plcData') {
                setPlcData(data.data);
            }
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    const handleWriteTag = (tagName, value) => {
        rslinxClient.writeTag(tagName, value);
    };

    return (
        <div className="p-4">
            <div className="mb-4">
                <h2 className="text-xl font-bold">PLC Monitor</h2>
                <div className={`text-sm ${
                    connectionStatus === 'connected' ? 'text-green-500' : 'text-red-500'
                }`}>
                    Status: {connectionStatus}
                </div>
            </div>

            <div className="mb-4">
                <h3 className="font-bold">Current Values:</h3>
                <div>Quantity: {plcData.quantity}</div>
                <div>Complete Request: {plcData.completeReq ? 'Yes' : 'No'}</div>
            </div>

            <PLCControls onWriteTag={handleWriteTag} />
        </div>
    );
};

export default PLCMonitor;
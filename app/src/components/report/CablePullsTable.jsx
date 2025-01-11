import React, { useEffect, useState } from 'react';

const CablePullsTable = ({ initialData }) => {
    const [data, setData] = useState(initialData || []);

    useEffect(() => {
        console.log('Initial data:', initialData);
        console.log('State data:', data);
    }, [initialData, data]);

    const addEntry = (entry) => {
        setData([...data, entry]);
    };

    const removeEntry = (index) => {
        setData(data.filter((_, i) => i !== index));
    };

    return (
        <div className="table-container">
            <div className="table-header">
                <h2>Recent Cable Pulls</h2>
            </div>
            <table>
                <thead>
                    <tr>
                        <th className="p-2 text-left">Timestamp</th>
                        <th className="p-2 text-left">User</th>
                        <th className="p-2 text-left">MO Number</th>
                        <th className="p-2 text-left">Item</th>
                        <th className="p-2 text-left">Quantity</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((entry, index) => (
                        <tr key={index}>
                            <td>{entry.timestamp}</td>
                            <td>{entry.user}</td>
                            <td>{entry.moNumber}</td>
                            <td>{entry.item}</td>
                            <td>{entry.quantity}</td>
                            <td>
                                <span className={`status-badge status-${entry.status.toLowerCase()}`}>
                                    {entry.status}
                                </span>
                            </td>
                            <td>
                                <button onClick={() => removeEntry(index)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={() => addEntry({
                timestamp: '11/28/2024 10:00',
                user: 'NEW USER',
                moNumber: 'M123456',
                item: '123456',
                quantity: '10',
                status: 'Pending'
            })}>Add Entry</button>
        </div>
    );
};

export default CablePullsTable;
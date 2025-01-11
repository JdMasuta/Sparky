import React, { useEffect, useState } from 'react';
import '../../assets/css/style.css';

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

    const updateEntry = (index, entry) => {
        setData(data.map((item, i) => i === index ? entry : item));
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
                            <select onChange={(e) => {
                                if (e.target.value === 'Complete') {
                                    updateEntry(index, { ...entry, status: 'Complete' });
                                } else if (e.target.value === 'Remove') {
                                    removeEntry(index);
                                }
                            }}>
                                <option value="">Select Action</option>
                                <option value="Complete">Complete</option>
                                <option value="Remove">Remove</option>
                            </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CablePullsTable;
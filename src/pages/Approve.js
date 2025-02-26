import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

function Approve({ role }) {
    const [leaveData, setLeaveData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const leaveData = JSON.parse(localStorage.getItem('leaveData')) || [];
        console.log('leaveData from localStorage:', leaveData);
        setLeaveData(leaveData);
    }, []);

    const handleApprove = (index) => {
        const updatedLeaveData = [...leaveData];
        updatedLeaveData[index].leaveStatus = "Approved";
        setLeaveData(updatedLeaveData);
        localStorage.setItem('leaveData', JSON.stringify(updatedLeaveData));
        alert(`Request ${index + 1} approved!`);
    }

    const handleReject = (index) => {
        const updatedLeaveData = [...leaveData];
        updatedLeaveData[index].leaveStatus = "Rejected";
        setLeaveData(updatedLeaveData);
        localStorage.setItem('leaveData', JSON.stringify(updatedLeaveData));
        alert(`Request ${index + 1} rejected!`);
    }

    const handleHome = () => {
        navigate('/home2');
    }

    const [editIndex, setEditIndex] = useState(null);
    const [editedData, setEditedData] = useState({});
    
    const handleEdit = (index) => {
        setEditIndex(index);
        setEditedData( {...leaveData[index ]});
    }

    const handleSave = () => {
        const updatedData = [...leaveData];
        updatedData[editIndex] = editedData;
        setLeaveData(updatedData);
        localStorage.setItem('leaveData', JSON.stringify(updatedData));
        setEditIndex(null);
        setEditedData({});
    }

    const handleChange = (key, value) => {
        setEditedData((prevData) => ({ ...prevData, [key]: value }));
    }

    const handleCancel = () => {
        setEditIndex(null);
        setEditedData({});
    };

    if (role !== 'Supervisor' && role !== 'Admin' && role !== 'HR') {
        return (
            <div>
                <p>Access denied!</p>
                <button className="btn btn-primary" onClick={handleHome}>Home</button>
            </div>
        )
    }
    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>Approve/Deny Requests</h5>
            <div>
                <table className="table table-bordered table-striped">
                    <thead style={{display:'table-header-group'}}>
                        <tr>
                            <th style={{ padding: "10px" }}>Type</th>
                            <th style={{ padding: "10px" }}>Location</th>
                            <th style={{ padding: "10px" }}>Place</th>
                            <th style={{ padding: "10px" }}>Start Date</th>
                            <th style={{ padding: "10px" }}>Start Time</th>
                            <th style={{ padding: "10px" }}>End Date</th>
                            <th style={{ padding: "10px" }}>End Time</th>
                            <th style={{ padding: "10px" }}>Supervisor</th>
                            <th style={{ padding: "10px" }}>Description</th>
                            <th style={{ padding: "10px" }}>Status</th>
                            {/* {role === 'HR' && <th style={{ padding: "10px" }}>Edited by</th> } */}
                            <th style={{ padding: "10px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{display:'table-header-group'}}>
                        {leaveData.map((el, index) => (
                            <tr key={index}>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.leaveType}
                                            onChange={(e) => handleChange('leaveType', e.target.value)}
                                        />
                                    ) : (
                                        el.leaveType
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.leaveLocation}
                                            onChange={(e) => handleChange('leaveLocation', e.target.value)}
                                        />
                                    ) : (
                                        el.leaveLocation
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.OffsitePlace}
                                            onChange={(e) => handleChange('OffsitePlace', e.target.value)}
                                        />
                                    ) : (
                                        el.OffsitePlace // ค่าจะเป็น "none"
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.leaveStartDate}
                                            onChange={(e) => handleChange('leaveStartDate', e.target.value)}
                                        />
                                    ) : (
                                        el.leaveStartDate
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.leaveStartTime}
                                            onChange={(e) => handleChange('leaveStartTime', e.target.value)}
                                        />
                                    ) : (
                                        el.leaveStartTime
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.leaveEndDate}
                                            onChange={(e) => handleChange('leaveEndDate', e.target.value)}
                                        />
                                    ) : (
                                        el.leaveEndDate
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.leaveEndTime}
                                            onChange={(e) => handleChange('leaveEndTime', e.target.value)}
                                        />
                                    ) : (
                                        el.leaveEndTime
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.supervisor}
                                            onChange={(e) => handleChange('supervisor', e.target.value)}
                                        />
                                    ) : (
                                        el.supervisor
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.leaveDescription}
                                            onChange={(e) => handleChange('leaveDescription', e.target.value)}
                                        />
                                    ) : (
                                        el.leaveDescription
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.leaveStatus}
                                            onChange={(e) => handleChange('leaveStatus', e.target.value)}
                                        />
                                    ) : (
                                        el.leaveStatus
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    <button className="btn btn-success" onClick={() => handleApprove(index)}>Approve</button>
                                    <button className="btn btn-danger" onClick={() => handleReject(index)}>Reject</button>
                                    {role === 'HR' && (
                                        <>
                                            {editIndex === index ? (
                                                <>
                                                <button className="btn btn-success" onClick={handleSave}>Save</button>
                                                <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
                                                </>
                                            ) : (
                                                <button className="btn btn-primary" onClick={() => handleEdit(index)}>Edit</button>
                                            )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Approve;
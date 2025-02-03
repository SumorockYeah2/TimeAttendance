import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

function Approve({ role }) {
    const [leaveData, setLeaveData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const leaveType = localStorage.getItem('leaveType');
        const leaveLocation = localStorage.getItem('leaveLocation');
        const OffsitePlace = localStorage.getItem('OffsitePlace');
        const leaveStartDate = localStorage.getItem('leaveStartDate');
        const leaveStartTime = localStorage.getItem('leaveStartTime');
        const leaveEndDate = localStorage.getItem('leaveEndDate');
        const leaveEndTime = localStorage.getItem('leaveEndTime');
        const supervisor = localStorage.getItem('supervisor');
        const leaveDescription = localStorage.getItem('leaveDescription');
        const leaveStatus = localStorage.getItem('leaveStatus');

        if (leaveType) {
            setLeaveData([
                {
                    leaveType: leaveType, 
                    leaveLocation: leaveLocation,
                    OffsitePlace: OffsitePlace,
                    leaveStartDate: leaveStartDate, 
                    leaveStartTime: leaveStartTime,
                    leaveEndDate: leaveEndDate, 
                    leaveEndTime: leaveEndTime,
                    supervisor: supervisor,
                    leaveDescription: leaveDescription,
                    leaveStatus: leaveStatus
                }
            ]);
        }
    }, []);

    const handleApprove = (index) => {
        const updatedLeaveData = [...leaveData];
        updatedLeaveData[index].leaveStatus = "Approved";
        setLeaveData(updatedLeaveData);
        localStorage.setItem('leaveStatus', "Approved");
        alert(`Request ${index + 1} approved!`);
    }

    const handleReject = (index) => {
        const updatedLeaveData = [...leaveData];
        updatedLeaveData[index].leaveStatus = "Rejected";
        setLeaveData(updatedLeaveData);
        localStorage.setItem('leaveStatus', "Rejected");
        alert(`Request ${index + 1} rejected!`);
    }

    const handleHome = () => {
        navigate('/home2');
    }

    if (role !== 'Supervisor' && role !== 'Admin') {
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
            <p>Test table - Leave Requests</p>
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
                            <th style={{ padding: "10px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{display:'table-header-group'}}>
                        {leaveData.map((el, index) => (
                            <tr key={index}>
                                <td style={{ padding: "10px" }}>{el.leaveType}</td>
                                <td style={{ padding: "10px" }}>{el.leaveLocation}</td>
                                <td style={{ padding: "10px" }}>{el.OffsitePlace}</td>
                                <td style={{ padding: "10px" }}>{el.leaveStartDate}</td>
                                <td style={{ padding: "10px" }}>{el.leaveStartTime}</td>
                                <td style={{ padding: "10px" }}>{el.leaveEndDate}</td>
                                <td style={{ padding: "10px" }}>{el.leaveEndTime}</td>
                                <td style={{ padding: "10px" }}>{el.supervisor}</td>
                                <td style={{ padding: "10px" }}>{el.leaveDescription}</td>
                                <td style={{ padding: "10px" }}>{el.leaveStatus}</td>
                                <td style={{ padding: "10px" }}>
                                    <button className="btn btn-success" onClick={() => handleApprove(index)}>Approve</button>
                                    <button className="btn btn-danger" onClick={() => handleReject(index)}>Reject</button>
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
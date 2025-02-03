import React, { useState, useEffect } from 'react';
import {VictoryPie} from 'victory';

import './css/Dashboard.css';

function Dashboard() {
    const [metric] = useState(50);
    const arr = [
        { typeId: "L02", type: "Going for trip", date: "25-11-24", status: "Pending" },
        { typeId: "L01", type: "Sick", date: "19-11-24", status: "Approved" }
    ];
    const arr2 = [
        { workId: "J1", type: "Office", date: "25-11-24", time: "13:00" },
        { workId: "J1", type: "Office", date: "19-11-24", time: "9:45" }
    ];

    const [workData, setWorkData] = useState([]);
    const [leaveData, setLeaveData] = useState([]);
    
    useEffect(() => {
        const selectedOption = localStorage.getItem('selectedOption');
        const textInput = localStorage.getItem('textInput');
        const checkInDateTime = localStorage.getItem('checkInDateTime');
        const checkOutDateTime = localStorage.getItem('checkOutDateTime');
        const userLocation = localStorage.getItem('userLocation');
        const uploadedFilePath = localStorage.getItem('uploadedFilePath');

        if (checkInDateTime) {
            setWorkData([
                {
                    workId: selectedOption, 
                    type: "Office", 
                    textInput: textInput,
                    checkInDateTime: checkInDateTime, 
                    checkOutDateTime: checkOutDateTime,
                    location: userLocation,
                    uploadedFilePath: uploadedFilePath
                }
            ]);
        }
    }, []);

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

    return (
        <div className="dashboard-container" style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>Report</h5>
            <p>Work Performance</p>
            <div className="pie-chart-container">
                <div className="pie-chart-wrapper" style={{ display: "flex", overflowX: "auto", justifyContent: "left", alignItems: "center", gap: "20px" }}>
                    <div style={{ position: "relative", width: 200, height: 200 }}>
                        <VictoryPie 
                            padAngle={0}
                            labelComponent={<span />}
                            innerRadius={70}
                            width={200} height={200}
                            data={[{'key': "", 'y': metric}, {'key': "", 'y': (100-metric)} ]}
                            colorScale={["#19B3A6", "#EEEEEE" ]}
                        />
                        <svg width={200} height={200} style={{ position: "absolute", top: 0, left: 0 }}>
                            <text x="50%" y="53%" textAnchor="middle" >
                                {metric}%
                            </text>
                        </svg>
                        <div style={{ position: "absolute", marginTop: -20, width: "100%", textAlign: "center" }}>
                            work
                        </div>
                    </div>

                    <div style={{ position: "relative", width: 200, height: 200 }}>
                        <VictoryPie 
                            padAngle={0}
                            labelComponent={<span />}
                            innerRadius={70}
                            width={200} height={200}
                            data={[{'key': "", 'y': metric}, {'key': "", 'y': (100-metric)} ]}
                            colorScale={["blue", "#EEEEEE" ]}
                        />
                        <svg width={200} height={200} style={{ position: "absolute", top: 0, left: 0 }}>
                            <text x="50%" y="53%" textAnchor="middle" >
                                {metric}%
                            </text>
                        </svg>
                        <div style={{ position: "absolute", marginTop: -20, width: "100%", textAlign: "center" }}>
                            off-site
                        </div>
                    </div>

                    <div style={{ position: "relative", width: 200, height: 200 }}>
                        <VictoryPie 
                            padAngle={0}
                            labelComponent={<span />}
                            innerRadius={70}
                            width={200} height={200}
                            data={[{'key': "", 'y': metric}, {'key': "", 'y': (100-metric)} ]}
                            colorScale={["red", "#EEEEEE" ]}
                        />
                        <svg width={200} height={200} style={{ position: "absolute", top: 0, left: 0 }}>
                            <text x="50%" y="53%" textAnchor="middle" >
                                {metric}%
                            </text>
                        </svg>
                        <div style={{ position: "absolute", marginTop: -20, width: "100%", textAlign: "center" }}>
                            late
                        </div>
                    </div>
                </div>
            </div>
            <p></p>
        
            <p>Test table - My Work</p>
            <div className="table-container">
                <table className="table table-bordered table-striped">
                    <thead style={{display:'table-header-group'}}>
                        <tr>
                            <th style={{ padding: "10px" }}>Work ID</th>
                            <th style={{ padding: "10px" }}>Type</th>
                            <th style={{ padding: "10px" }}>Description</th>
                            <th style={{ padding: "10px" }}>In Time</th>
                            <th style={{ padding: "10px" }}>Out Time</th>
                            <th style={{ padding: "10px" }}>Location</th>
                            <th style={{ padding: "10px" }}>Image</th>
                        </tr>
                    </thead>
                    <tbody style={{display:'table-header-group'}}>
                        {workData.map((el) => (
                            <tr key={el.workId}>
                                <td style={{ padding: "10px" }}>{el.workId}</td>
                                <td style={{ padding: "10px" }}>{el.type}</td>
                                <td style={{ padding: "10px" }}>{el.textInput}</td>
                                <td style={{ padding: "10px" }}>{el.checkInDateTime}</td>
                                <td style={{ padding: "10px" }}>{el.checkOutDateTime}</td>
                                <td style={{ padding: "10px" }}>{el.location}</td>
                                <td style={{ padding: "10px" }}>{el.uploadedFilePath}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p>Test table - Leave Requests</p>
            <div className="table-container">
                <table className="table table-bordered table-striped">
                    <thead style={{display:'table-header-group'}}>
                        <tr>
                            <th style={{ padding: "10px" }}>Type</th>
                            <th style={{ padding: "10px" }}>Location</th>
                            <th style={{ padding: "10px" }}>Place Name</th>
                            <th style={{ padding: "10px" }}>Start Date</th>
                            <th style={{ padding: "10px" }}>Start Time</th>
                            <th style={{ padding: "10px" }}>End Date</th>
                            <th style={{ padding: "10px" }}>End Time</th>
                            <th style={{ padding: "10px" }}>Supervisor</th>
                            <th style={{ padding: "10px" }}>Description</th>
                            <th style={{ padding: "10px" }}>Status</th>
                        </tr>
                    </thead>
                    <tbody style={{display:'table-header-group'}}>
                        {leaveData.map((el) => (
                            <tr key={el.leaveType}>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Dashboard;
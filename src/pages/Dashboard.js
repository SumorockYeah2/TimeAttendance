import React, { useState, useEffect } from 'react';
import {VictoryPie} from 'victory';
import './css/Dashboard.css';

function Dashboard() {
    const [metric] = useState(50);
    const [workData, setWorkData] = useState([]);
    const [leaveData, setLeaveData] = useState([]);
    
    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const response = await fetch('http://localhost:3001/attendance', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched attendance data:', data);
                    setWorkData(data);
                } else {
                    console.error('Failed to fetch attendance data');
                }
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            }
        };

        fetchAttendanceData();
    }, []);
    // useEffect(() => {
    //     const selectedOption = localStorage.getItem('selectedOption');
    //     const textInput = localStorage.getItem('textInput');
    //     const checkInDateTime = localStorage.getItem('checkInDateTime');
    //     const checkOutDateTime = localStorage.getItem('checkOutDateTime');
    //     const userLocation = localStorage.getItem('userLocation');
    //     const uploadedFilePath = localStorage.getItem('uploadedFilePath');

    //     if (checkInDateTime) {
    //         setWorkData([
    //             {
    //                 workId: selectedOption, 
    //                 type: "Office", 
    //                 textInput: textInput,
    //                 checkInDateTime: checkInDateTime, 
    //                 checkOutDateTime: checkOutDateTime,
    //                 location: userLocation,
    //                 uploadedFilePath: uploadedFilePath
    //             }
    //         ]);
    //     }
    // }, []);

    useEffect(() => {
        const fetchLeaveData = async () => {
            try {
                const response = await fetch('http://localhost:3001/request-get', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched attendance data:', data);
                    setLeaveData(data);
                } else {
                    console.error('Failed to fetch attendance data');
                }
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            }
        };

        fetchLeaveData();
    }, []);

    return (
        <div className="dashboard-container" style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>รายงานผลการทำงาน</h5>
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
        
            <p>การลงเวลาเข้า-ออกงาน</p>
            <div className="table-container">
                <table className="table table-bordered table-striped">
                    <thead style={{display:'table-header-group'}}>
                        <tr>
                            <th style={{ padding: "10px" }}>รหัสงาน</th>
                            <th style={{ padding: "10px" }}>ประเภทงาน</th>
                            <th style={{ padding: "10px" }}>รายละเอียดงาน</th>
                            <th style={{ padding: "10px" }}>เวลาเข้า</th>
                            <th style={{ padding: "10px" }}>เวลาออก</th>
                            <th style={{ padding: "10px" }}>พิกัดสถานที่</th>
                            <th style={{ padding: "10px" }}>ไฟล์รูปภาพ</th>
                        </tr>
                    </thead>
                    <tbody style={{display:'table-header-group'}}>
                        {workData.map((el) => (
                            <tr key={el.idattendance}>
                                <td style={{ padding: "10px" }}>{el.jobID}</td>
                                <td style={{ padding: "10px" }}>{el.jobType}</td>
                                <td style={{ padding: "10px" }}>{el.description}</td>
                                <td style={{ padding: "10px" }}>{el.in_time}</td>
                                <td style={{ padding: "10px" }}>{el.out_time}</td>
                                <td style={{ padding: "10px" }}>{el.location}</td>
                                <td style={{ padding: "10px" }}>{el.image_url}</td>
                            </tr>
                        ))}
                        {/* {workData.map((el) => (
                            <tr key={el.workId}>
                                <td style={{ padding: "10px" }}>{el.workId}</td>
                                <td style={{ padding: "10px" }}>{el.type}</td>
                                <td style={{ padding: "10px" }}>{el.textInput}</td>
                                <td style={{ padding: "10px" }}>{el.checkInDateTime}</td>
                                <td style={{ padding: "10px" }}>{el.checkOutDateTime}</td>
                                <td style={{ padding: "10px" }}>{el.location}</td>
                                <td style={{ padding: "10px" }}>{el.uploadedFilePath}</td>
                            </tr>
                        ))} */}
                    </tbody>
                </table>
            </div>
            <p>รายการคำร้องลา</p>
            <div className="table-container">
                <table className="table table-bordered table-striped">
                    <thead style={{display:'table-header-group'}}>
                        <tr>
                            <th style={{ padding: "10px" }}>ประเภท</th>
                            <th style={{ padding: "10px" }}>พิกัดสถานที่</th>
                            <th style={{ padding: "10px" }}>ชื่อสถานที่</th>
                            <th style={{ padding: "10px" }}>วันที่เริ่มต้น</th>
                            <th style={{ padding: "10px" }}>เวลาเริ่มต้น</th>
                            <th style={{ padding: "10px" }}>วันที่สิ้นสุด</th>
                            <th style={{ padding: "10px" }}>เวลาสิ้นสุด</th>
                            {/* <th style={{ padding: "10px" }}>Supervisor</th> */}
                            <th style={{ padding: "10px" }}>รายละเอียด</th>
                            <th style={{ padding: "10px" }}>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody style={{display:'table-header-group'}}>
                        {leaveData.map((el) => (
                            <tr key={el.idrequests}>
                                <td style={{ padding: "10px" }}>{el.leaveType}</td>
                                <td style={{ padding: "10px" }}>{el.location}</td>
                                <td style={{ padding: "10px" }}>{el.place_name}</td>
                                <td style={{ padding: "10px" }}>{el.start_date}</td>
                                <td style={{ padding: "10px" }}>{el.start_time}</td>
                                <td style={{ padding: "10px" }}>{el.end_date}</td>
                                <td style={{ padding: "10px" }}>{el.end_time}</td>
                                {/* <td style={{ padding: "10px" }}>{el.supervisor}</td> */}
                                <td style={{ padding: "10px" }}>{el.reason}</td>
                                <td style={{ padding: "10px" }}>{el.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Dashboard;
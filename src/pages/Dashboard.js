import React, { useState, useEffect } from 'react';
import {VictoryPie} from 'victory';
import './css/Dashboard.css';

function Dashboard({ role }) {
    const [metric] = useState(50);
    const [workData, setWorkData] = useState([]);
    const [leaveData, setLeaveData] = useState([]);
    const [empId, setEmpId] = useState('');

    useEffect(() => {
        // ดึง Role และ User ID จาก localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        const empId = user?.idemployees;
        console.log('Role:', role);
        console.log('Employee ID:', empId);
        setEmpId(empId);
    }, []);
    
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

                    let filteredData = data;
                    if (role === 'Employee') {
                        filteredData = data.filter(item => item.idemployees === empId);
                    } else if (role === 'Supervisor') {
                        const user = JSON.parse(localStorage.getItem('user'));
                        const department = user?.department; // ดึง department ของ Supervisor
                        const division = user?.division; // ดึง division ของ Supervisor

                        if (department && !division) {
                            // หัวหน้าฝ่าย: ดูข้อมูลของพนักงานในฝ่ายเดียวกัน
                            filteredData = data.filter(item => item.department === department || item.idemployees === empId);
                        } else if (division) {
                            // หัวหน้าแผนก: ดูข้อมูลของพนักงานในแผนกเดียวกัน
                            filteredData = data.filter(item => item.division === division || item.idemployees === empId);
                        }
                        // const departmentId = localStorage.getItem('departmentId'); // สมมติว่ามี departmentId ใน localStorage
                        // filteredData = data.filter(item => item.departmentId === departmentId || item.idemployees === empId);
                    } else if (role === 'HR') {
                        // HR ดูข้อมูลทั้งหมด
                        filteredData = data;
                    }

                    filteredData.sort((a, b) => new Date(b.in_time) - new Date(a.in_time));
                    console.log('Filtered attendance data:',filteredData);
                    setWorkData(filteredData);
                } else {
                    console.error('Failed to fetch attendance data');
                }
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            }
        };

        if (role) fetchAttendanceData(); // เรียก API เมื่อ Role ถูกตั้งค่า
    }, [role, empId]);

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
                    console.log('Fetched leave data:', data);

                    // กรองข้อมูลตาม Role
                    let filteredData = data;
                    if (role === 'Employee') {
                        filteredData = data.filter(item => item.idemployees === empId);
                    } else if (role === 'Supervisor') {
                        const user = JSON.parse(localStorage.getItem('user'));
                        const department = user?.department; // ดึง department ของ Supervisor
                        const division = user?.division; // ดึง division ของ Supervisor

                        if (department && !division) {
                            // หัวหน้าฝ่าย: ดูข้อมูลของพนักงานในฝ่ายเดียวกัน
                            filteredData = data.filter(item => item.department === department || item.idemployees === empId);
                        } else if (division) {
                            // หัวหน้าแผนก: ดูข้อมูลของพนักงานในแผนกเดียวกัน
                            filteredData = data.filter(item => item.division === division || item.idemployees === empId);
                        }
                        // const departmentId = localStorage.getItem('departmentId'); // สมมติว่ามี departmentId ใน localStorage
                        // filteredData = data.filter(item => item.departmentId === departmentId || item.idemployees === empId);
                    } else if (role === 'HR') {
                        filteredData = data;
                    }    

                    console.log('Filtered leave data:',filteredData);
                    setLeaveData(filteredData);
                } else {
                    console.error('Failed to fetch leave data');
                }
            } catch (error) {
                console.error('Error fetching leave data:', error);
            }
        };

        if (role) fetchLeaveData(); // เรียก API เมื่อ Role ถูกตั้งค่า
    }, [role, empId]);

    return (
        <div className="dashboard-container" style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>รายงานผลการทำงาน</h5>
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
                            เข้างาน
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
                            นอกสถานที่
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
                            สาย-ออกก่อนเวลา
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
                            <th style={{ padding: "10px" }}>รหัสพนักงาน</th>
                            <th style={{ padding: "10px" }}>เวลาเข้า</th>
                            <th style={{ padding: "10px" }}>เวลาออก</th>
                            <th style={{ padding: "10px" }}>ชื่อสถานที่</th>
                            {/* <th style={{ padding: "10px" }}>ไฟล์รูปภาพ</th> */}
                        </tr>
                    </thead>
                    <tbody style={{display:'table-header-group'}}>
                        {workData.map((el) => (
                            <tr key={el.idattendance}>
                                <td style={{ padding: "10px" }}>{el.jobID}</td>
                                <td style={{ padding: "10px" }}>{el.jobType}</td>
                                <td style={{ padding: "10px" }}>{el.description}</td>
                                <td style={{ padding: "10px" }}>{el.idemployees}</td>
                                <td style={{ padding: "10px" }}>{el.in_time}</td>
                                <td style={{ padding: "10px" }}>{el.out_time}</td>
                                <td style={{ padding: "10px" }}>{el.place_name}</td>
                                {/* <td style={{ padding: "10px" }}>{el.image_url}</td> */}
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
                            <th style={{ padding: "10px" }}>รหัสพนักงาน</th>
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
                                <td style={{ padding: "10px" }}>{el.idemployees}</td>
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
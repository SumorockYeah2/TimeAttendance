import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

function Approve({ role }) {
    const API_URL = process.env.REACT_APP_API_URL;
    const [leaveData, setLeaveData] = useState([]);
    const [subordinates, setSubordinates] = useState([]);
    const navigate = useNavigate();

    // const fetchLeaveData = () => {
    //     fetch('https://localhost:3001/request-get')
    //         .then(response => response.json())
    //         .then(data => {
    //             console.log('Role:', role);
    //             console.log('Subordinates:', subordinates);
    //             console.log('leaveData from database:', data);
    //             if (role === 'Admin') {
    //                 setLeaveData(data);
    //             } else {
    //                 const filteredLeaveData = data.filter(request => subordinates.includes(request.idemployees));
    //                 console.log('Filtered Leave Data:', filteredLeaveData);
    //                 setLeaveData(filteredLeaveData);
    //             }
    //         })
    //         .catch(error => {
    //             console.error('Error fetching leave data:', error);
    //         });
    // };


    // const fetchSubordinates = () => {
    //     fetch(`https://localhost:3001/employee-data`)
    //         .then(response => response.json())
    //         .then(data => {
    //             const filteredEmployees = data.filter(emp => emp.supervisor === idemployees); // กรองพนักงานที่ supervisor ตรงกับ idemployees
    //             setSubordinates(filteredEmployees.map(emp => emp.idemployees)); // เก็บเฉพาะ idemployees ของพนักงาน
    //         })
    //         .catch(error => {
    //             console.error('Error fetching employee data:', error);
    //         });
    // };

    // useEffect(() => {
    //     if (subordinates.length > 0) {
    //         fetchLeaveData(); // ดึงข้อมูลคำร้องลาเมื่อได้ข้อมูลพนักงานที่ตัวเองเป็นหัวหน้า
    //     }
    // }, [subordinates]);

    // useEffect(() => {
    //     fetchSubordinates(); // ดึงข้อมูลพนักงานที่ตัวเองเป็นหัวหน้า
    // }, []);

    const [holidays, setHolidays] = useState([]);

    const user = JSON.parse(localStorage.getItem('user'));
    const idemployees = user?.idemployees;
    console.log('Logged-in User ID:', idemployees);
    console.log('Role:', role);

    useEffect(() => {
        const fetchHolidays = async () => {
            const API_KEY = 'YOUR_GOOGLE_API_KEY'; // ใส่ Google API Key ของคุณที่นี่
            const CALENDAR_ID = 'th.th#holiday@group.v.calendar.google.com';
            const BASE_URL = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`;
    
            try {
                const params = new URLSearchParams({
                    key: API_KEY,
                    singleEvents: true,
                    orderBy: 'startTime',
                });
    
                const response = await fetch(`${BASE_URL}?${params}`);
                if (response.ok) {
                    const data = await response.json();
                    const filteredHolidays = data.items.filter(
                        (holiday) => holiday.description === "วันหยุดนักขัตฤกษ์"
                    );
                    setHolidays(filteredHolidays || []);
                } else {
                    console.error('Failed to fetch holidays from Google Calendar');
                }
            } catch (error) {
                console.error('Error fetching holidays from Google Calendar:', error);
            }
        };
    
        fetchHolidays();
    }, []);

    const fetchSubordinatesAndLeaveData = async () => {
        try {
            const response = await fetch(`${API_URL}/employee-data`);
            const data = await response.json();
            console.log('Employee Data:', data);

            console.log('Logged-in User ID (idemployees):', idemployees, typeof idemployees);
            console.log('Employee Supervisors:', data.map(emp => emp.supervisor), typeof data[0]?.supervisor);

            const filteredEmployees = data.filter(emp => emp.supervisor === Number(idemployees));
            const subordinates = filteredEmployees.map(emp => emp.idemployees);

            console.log('Filtered Employees:', filteredEmployees);
            console.log('Subordinates:', subordinates);
            setSubordinates(subordinates);

            const leaveResponse = await fetch(`${API_URL}/request-get`);
            const leaveData = await leaveResponse.json();

            console.log('Leave Data from database:', leaveData);

            if (role === 'Admin' || role === 'HR') {
                setLeaveData(leaveData);
            } else {
                const filteredLeaveData = leaveData.filter(request => subordinates.includes(Number(request.idemployees)));
                console.log('Filtered Leave Data:', filteredLeaveData);
                setLeaveData(filteredLeaveData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchSubordinatesAndLeaveData();
    }, [role, idemployees]);


    const calculateWorkingHours = (start, end) => {
        console.log('Start:', start);
        console.log('End:', end);

        let totalHours = 0;

        while (start < end) {
            const workStart = new Date(start);
            workStart.setHours(8, 30, 0, 0);
            const workEnd = new Date(start);
            workEnd.setHours(17, 30, 0, 0);

            const isWeekend = start.getDay() === 0 || start.getDay() === 6;
            const isHoliday = holidays.some(
                (holiday) => new Date(holiday.start.date).toDateString() === start.toDateString()
            );

            if (isWeekend || isHoliday) {
                console.log('Skipping holiday or weekend:', start);
                start.setDate(start.getDate() + 1);
                start.setHours(8, 30, 0, 0);
                continue;
            }

            if (start < workStart) {
                console.log('Adjusting start time from', start, 'to', workStart);
                start = workStart;
            }

            if (start >= workStart && start < workEnd) {
                // คำนวณช่วงเช้า (08:30 - 12:00)
                if (start.getHours() >= 8 && start.getHours() < 12) {
                    const morningEnd = new Date(start);
                    morningEnd.setHours(12, 0, 0, 0);
                    const morningHours = Math.min((morningEnd - start) / (1000 * 60 * 60), (end - start) / (1000 * 60 * 60));
                    totalHours += morningHours;
                    console.log('Morning hours:', morningHours);
                    start = morningEnd; // เลื่อนไปยังช่วงบ่าย
                }
    
                if (start.getHours() === 12) {
                    start.setHours(13, 0, 0, 0); // ข้ามช่วงพักเที่ยงไป 13:00
                }

                if (start.getHours() >= 13 && start < workEnd && start < end) {
                    const afternoonEnd = new Date(start);
                    afternoonEnd.setHours(17, 30, 0, 0);
                    const afternoonHours = Math.min((afternoonEnd - start) / (1000 * 60 * 60), (end - start) / (1000 * 60 * 60));

                    if (afternoonHours > 0) {
                        totalHours += afternoonHours;
                        console.log('Afternoon hours:', afternoonHours);
                    } else {
                        console.log('Skipping afternoon calculation as hours are negative or zero');
                    }

                    start = afternoonEnd; // เลื่อนไปยังวันถัดไป
                }
            }

            // ข้ามไปวันถัดไป
            start.setDate(start.getDate() + 1);
            start.setHours(8, 30, 0, 0);
        }

        console.log('Calculated working hours:', totalHours);
        return totalHours;
    };

    const handleApprove = async (idrequests) => {
        const approvedRequest = leaveData.find(el => el.idrequests === idrequests);
        if (!approvedRequest) return;
    
        // const startDateTime = new Date(`${approvedRequest.start_date}T${approvedRequest.start_time}`);
        // const endDateTime = new Date(`${approvedRequest.end_date}T${approvedRequest.end_time}`);
        
        // const leaveHours = calculateWorkingHours(startDateTime, endDateTime, holidays);
        // const leaveDays = leaveHours / 8;
    
        // let leaveTypeColumn;
        // if (approvedRequest.leaveType === 'ลากิจ') {
        //     leaveTypeColumn = 'absence_hrs';
        // } else if (approvedRequest.leaveType === 'ลาป่วย') {
        //     leaveTypeColumn = 'sick_hrs';
        // } else if (approvedRequest.leaveType === 'ลาพักร้อน') {
        //     leaveTypeColumn = 'vacation_hrs';
        // }
    
        // if (leaveTypeColumn) {
        //     const updateLeaveBalanceResponse = await fetch(`${API_URL}/leave-balance-update/${approvedRequest.idemployees}`, {
        //         method: 'PUT',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify({
        //             [leaveTypeColumn]: -leaveHours
        //         })
        //     });
    
        //     if (!updateLeaveBalanceResponse.ok) {
        //         alert('ไม่สามารถอัปเดตวันลาได้');
        //         return;
        //     }
        // }

        fetch(`${API_URL}/request-update/${idrequests}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: "อนุมัติแล้ว" })
        })
        .then(response => {
            if (response.ok) {
                alert(`อนุมัติคำร้องสำเร็จ`);
                setLeaveData(prevData => prevData.filter(el => el.idrequests !== idrequests));

                const approvedRequest = leaveData.find(el => el.idrequests === idrequests);
                if (approvedRequest && approvedRequest.leaveType === "คำร้องย้อนหลัง") {
                    const attendanceData = {
                        idemployees: approvedRequest.idemployees,
                        userLocation: JSON.parse(approvedRequest.location),
                        place_name: approvedRequest.place_name || 'none',
                        textInput: approvedRequest.reason,
                        checkInDateTime: approvedRequest.start_date + 'T' + approvedRequest.start_time,
                        checkOutDateTime: approvedRequest.end_date + 'T' + approvedRequest.end_time,
                        uploadedFilePath: approvedRequest?.image_url || null
                    };

                    fetch(`${API_URL}/late-checkin`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(attendanceData)
                    })
                    .then(response => {
                        if (response.ok) {
                            console.log('Late-checkin data inserted successfully');
                        } else {
                            console.error('Failed to insert late-checkin data');
                        }
                    })
                    .catch(error => {
                        console.error('Error inserting late-checkin data:', error);
                    });
                }
            } else {
                return response.text().then(text => { throw new Error(text) });
            }
        })
        .catch(error => {
            console.error('Error updating leave status:', error);
            alert('อนุมัติคำร้องไม่สำเร็จ กรุณาลองอีกครั้ง');
        });
    }

    const handleReject = (idrequests) => {
        fetch(`${API_URL}/request-update/${idrequests}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: "ไม่อนุมัติ" })
        })
        .then(response => {
            if (response.ok) {
                alert(`ปฏิเสธคำร้องสำเร็จ`);
                setLeaveData(prevData => prevData.filter(el => el.idrequests !== idrequests)); // Remove the rejected request from the state
            } else {
                return response.text().then(text => { throw new Error(text) });
            }
        })
        .catch(error => {
            console.error('Error updating leave status:', error);
            alert('ไม่สามารถปฏิเสธคำร้องได้ กรุณาลองอีกครั้ง');
        });
    };

    const handleHome = () => {
        navigate('/checkin');
    }

    const [editIndex, setEditIndex] = useState(null);
    const [editedData, setEditedData] = useState({});
    
    const handleEdit = (idrequests) => {
        const originalIndex = leaveData.findIndex(el => el.idrequests === idrequests); // Find the original index
        if (originalIndex !== -1) {
            setEditIndex(originalIndex); // Set the original index for editing
            setEditedData({ ...leaveData[originalIndex] }); // Set the data for editing
        }
    };

    const handleSave = async () => {
        const updatedData = [...leaveData];
        const updatedEditedData = {
            ...editedData,
            idrequests: leaveData[editIndex].idrequests,
            idemployees: editedData.idemployees,
            leaveType: editedData.leaveType,
            leaveStartDate: editedData.start_date,
            leaveStartTime: editedData.start_time,
            leaveEndDate: editedData.end_date,
            leaveEndTime: editedData.end_time,
            leaveDescription: editedData.reason,
            leaveLocation: editedData.location,
            leaveStatus: editedData.status
        };
        updatedData[editIndex] = updatedEditedData;
        setLeaveData(updatedData);

        try {
            const response = await fetch(`${API_URL}/leave-update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedEditedData)
            });

            if (response.ok) {
                setEditIndex(null);
                setEditedData({});
            } else {
                console.error('Error:', await response.text());
                alert("บันทึกข้อมูลไม่สำเร็จ");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
        // localStorage.setItem('leaveData', JSON.stringify(updatedData));
        // setEditIndex(null);
        // setEditedData({});
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
                <p>ท่านไม่มีสิทธิ์เข้าถึงหน้านี้</p>
                <button className="btn btn-primary" onClick={handleHome}>กลับหน้าแรก</button>
            </div>
        )
    }
    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>อนุมัติ/ปฏิเสธคำร้อง</h5>
            <div>
                <table className="table table-bordered table-striped">
                    <thead style={{display:'table-header-group'}}>
                        <tr>
                            <th style={{ padding: "10px" }}>ประเภท</th>
                            <th style={{ padding: "10px" }}>รหัสพนักงาน</th>
                            <th style={{ padding: "10px" }}>พิกัดสถานที่</th>
                            <th style={{ padding: "10px" }}>ชื่อสถานที่</th>
                            <th style={{ padding: "10px" }}>วันที่เริ่มต้น</th>
                            <th style={{ padding: "10px" }}>เวลาเริ่มต้น</th>
                            <th style={{ padding: "10px" }}>วันที่สิ้นสุด</th>
                            <th style={{ padding: "10px" }}>เวลาสิ้นสุด</th>
                            {/* <th style={{ padding: "10px" }}>หัวหน้า</th> */}
                            <th style={{ padding: "10px" }}>รายละเอียด</th>
                            <th style={{ padding: "10px" }}>สถานะ</th>
                            {/* {role === 'HR' && <th style={{ padding: "10px" }}>Edited by</th> } */}
                            <th style={{ padding: "10px" }}>การทำงาน</th>
                        </tr>
                    </thead>
                    <tbody style={{display:'table-header-group'}}>
                        {leaveData
                            .filter(el => el.status !== "อนุมัติแล้ว" && el.status !== "ไม่อนุมัติ") // Filter out approved/rejected requests
                            .map((el, index) => (
                                <tr key={el.idrequests}>
                                    <td style={{ padding: "10px" }}>
                                        {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
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
                                        {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                            <input
                                                className="form-control"
                                                value={editedData.idemployees}
                                                onChange={(e) => handleChange('idemployees', e.target.value)}
                                            />
                                        ) : (
                                            el.idemployees
                                        )}
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                        {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                            <input
                                                className="form-control"
                                                value={editedData.location}
                                                onChange={(e) => handleChange('location', e.target.value)}
                                            />
                                        ) : (
                                            el.location
                                        )}
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                        {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                            <input
                                                className="form-control"
                                                value={editedData.place_name}
                                                onChange={(e) => handleChange('place_name', e.target.value)}
                                            />
                                        ) : (
                                            el.place_name // ค่าจะเป็น "none"
                                        )}
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                        {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                            <input
                                                className="form-control"
                                                value={editedData.start_date}
                                                onChange={(e) => handleChange('start_date', e.target.value)}
                                            />
                                        ) : (
                                            el.start_date
                                        )}
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                        {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                            <input
                                                className="form-control"
                                                value={editedData.start_time}
                                                onChange={(e) => handleChange('start_time', e.target.value)}
                                            />
                                        ) : (
                                            el.start_time
                                        )}
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                        {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                            <input
                                                className="form-control"
                                                value={editedData.end_date}
                                                onChange={(e) => handleChange('end_date', e.target.value)}
                                            />
                                        ) : (
                                            el.end_date
                                        )}
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                        {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                            <input
                                                className="form-control"
                                                value={editedData.end_time}
                                                onChange={(e) => handleChange('end_time', e.target.value)}
                                            />
                                        ) : (
                                            el.end_time
                                        )}
                                    </td>
                                    {/* <td style={{ padding: "10px" }}>
                                        {editIndex === index ? (
                                            <input
                                                className="form-control"
                                                value={editedData.supervisor}
                                                onChange={(e) => handleChange('supervisor', e.target.value)}
                                            />
                                        ) : (
                                            el.supervisor
                                        )}
                                    </td> */}
                                    <td style={{ padding: "10px" }}>
                                        {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                            <input
                                                className="form-control"
                                                value={editedData.reason}
                                                onChange={(e) => handleChange('reason', e.target.value)}
                                            />
                                        ) : (
                                            el.reason
                                        )}
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                        {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                            <input
                                                className="form-control"
                                                value={editedData.status}
                                                onChange={(e) => handleChange('status', e.target.value)}
                                            />
                                        ) : (
                                            el.status
                                        )}
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                        {(role === 'Supervisor' || role === 'Admin') && (
                                            <>
                                                <button className="btn btn-success" onClick={() => handleApprove(el.idrequests)}>อนุมัติ</button>
                                                <button className="btn btn-danger" onClick={() => handleReject(el.idrequests)}>ปฏิเสธ</button>
                                            </>
                                        )}
                                        {(role === 'HR' || role === 'Admin') && (
                                            <>
                                                {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                                    <>
                                                        <button className="btn btn-success" onClick={handleSave}>บันทึก</button>
                                                        <button className="btn btn-danger" onClick={handleCancel}>ยกเลิก</button>
                                                    </>
                                                ) : (
                                                    <button className="btn btn-primary" onClick={() => handleEdit(el.idrequests)}>แก้ไขข้อมูล</button>
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
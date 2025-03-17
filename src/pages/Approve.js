import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

function Approve({ role }) {
    const [leaveData, setLeaveData] = useState([]);
    const navigate = useNavigate();

    const fetchLeaveData = () => {
        fetch('http://localhost:3001/request-get')
            .then(response => response.json())
            .then(data => {
                console.log('leaveData from database:', data);
                setLeaveData(data);
            })
            .catch(error => {
                console.error('Error fetching leave data:', error);
            });
    };

    useEffect(() => {
        fetchLeaveData();
    }, []);
    
    // useEffect(() => {
    //     fetch('http://localhost:3001/request-get')
    //         .then(response => response.json())
    //         .then(data => {
    //             console.log('leaveData from database:', data);
    //             setLeaveData(data);
    //         })
    //         .catch(error => {
    //             console.error('Error fetching leave data:', error);
    //         });
    // }, []);
    
    // useEffect(() => {
    //     const leaveData = JSON.parse(localStorage.getItem('leaveData')) || [];
    //     console.log('leaveData from localStorage:', leaveData);
    //     setLeaveData(leaveData);
    // }, []);

    const handleApprove = (index) => {
        const updatedLeaveData = [...leaveData];
        updatedLeaveData[index].leaveStatus = "อนุมัติแล้ว";
        setLeaveData(updatedLeaveData);

        fetch(`http://localhost:3001/request-update/${updatedLeaveData[index].idrequests}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: "อนุมัติแล้ว" })
        })
        .then(response => {
            console.log('Response from server:', response);
            if (response.ok) {
                alert(`อนุมัติคำร้องที่ ${index + 1} เรียบร้อย`);
                fetchLeaveData();

                if (updatedLeaveData[index].leaveType === "คำร้องย้อนหลัง") {
                    const attendanceData = {
                        userLocation: JSON.parse(updatedLeaveData[index].location),
                        selectedOption: updatedLeaveData[index].jobID,
                        textInput: updatedLeaveData[index].reason,
                        checkInDateTime: updatedLeaveData[index].start_date + 'T' + updatedLeaveData[index].start_time,
                        checkOutDateTime: updatedLeaveData[index].end_date + 'T' + updatedLeaveData[index].end_time,
                        uploadedFilePath: updatedLeaveData[index].image_url || null
                    };

                    fetch('http://localhost:3001/checkin', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(attendanceData)
                    })
                    .then(response => {
                        if (response.ok) {
                            console.log('Attendance data inserted successfully');
                        } else {
                            console.error('Failed to insert attendance data');
                        }
                    })
                    .catch(error => {
                        console.error('Error inserting attendance data:', error);
                    });
                }
            } else {
                return response.text().then(text => { throw new Error(text) });
            }
        })
        .catch(error => {
            console.error('Error updating leave status:', error);
            alert('Failed to update leave status. Please try again.');
        });
        // localStorage.setItem('leaveData', JSON.stringify(updatedLeaveData));
        // alert(`อนุมัติคำร้องที่ ${index + 1} เรียบร้อย`);
    }

    const handleReject = (index) => {
        const updatedLeaveData = [...leaveData];
        updatedLeaveData[index].leaveStatus = "ไม่อนุมัติ";
        setLeaveData(updatedLeaveData);

        fetch(`http://localhost:3001/request-update/${updatedLeaveData[index].idrequests}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: "ไม่อนุมัติ" })
        })
        .then(response => {
            console.log('Response from server:', response);
            if (response.ok) {
                alert(`ปฏิเสธคำร้องที่ ${index + 1} เรียบร้อย`);
                fetchLeaveData();
            } else {
                return response.text().then(text => { throw new Error(text) });
            }
        })
        .catch(error => {
            console.error('Error updating leave status:', error);
            alert('Failed to update leave status. Please try again.');
        });
        // localStorage.setItem('leaveData', JSON.stringify(updatedLeaveData));
        // alert(`ปฏิเสธคำร้องที่ ${index + 1} เรียบร้อย`);
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

    const handleSave = async () => {
        const updatedData = [...leaveData];
        const updatedEditedData = {
            ...editedData,
            idrequests: leaveData[editIndex].idrequests,
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
            const response = await fetch('http://localhost:3001/leave-update', {
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
                                            value={editedData.location}
                                            onChange={(e) => handleChange('location', e.target.value)}
                                        />
                                    ) : (
                                        el.location
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
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
                                    {editIndex === index ? (
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
                                    {editIndex === index ? (
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
                                    {editIndex === index ? (
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
                                    {editIndex === index ? (
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
                                    {editIndex === index ? (
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
                                    {editIndex === index ? (
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
                                    {/* <button className="btn btn-success" onClick={() => handleApprove(index)}>อนุมัติ</button>
                                    <button className="btn btn-danger" onClick={() => handleReject(index)}>ปฏิเสธ</button> */}
                                    {role === 'HR' && (
                                        <>
                                            {editIndex === index ? (
                                                <>
                                                <button className="btn btn-success" onClick={handleSave}>บันทึก</button>
                                                <button className="btn btn-danger" onClick={handleCancel}>ยกเลิก</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="btn btn-success" onClick={() => handleApprove(index)}>อนุมัติ</button>
                                                    <button className="btn btn-danger" onClick={() => handleReject(index)}>ปฏิเสธ</button>
                                                    <button className="btn btn-primary" onClick={() => handleEdit(index)}>แก้ไขข้อมูล</button>
                                                </>
                                            )}
                                        </>
                                    )}
                                    {['Employee', 'Supervisor', 'Admin'].includes(role) && (
                                        <>
                                            <button className="btn btn-success" onClick={() => handleApprove(index)}>อนุมัติ</button>
                                            <button className="btn btn-danger" onClick={() => handleReject(index)}>ปฏิเสธ</button>
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
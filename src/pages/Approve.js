import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Approve({ role }) {
    const API_URL = process.env.REACT_APP_API_URL;
    const [leaveData, setLeaveData] = useState([]);
    const [subordinates, setSubordinates] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [holidays, setHolidays] = useState([]);

    const user = JSON.parse(localStorage.getItem('user'));
    const idemployees = user?.idemployees;
    console.log('Logged-in User ID:', idemployees);
    console.log('Role:', role);

    const [isModalOpen, setIsModalOpen] = useState(false);

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
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubordinatesAndLeaveData();
    }, [role, idemployees]);

    const handleApprove = async (idrequests) => {
        const approvedRequest = leaveData.find(el => el.idrequests === idrequests);
        if (!approvedRequest) return;
    
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
                setLeaveData(prevData => prevData.filter(el => el.idrequests !== idrequests));
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
            const requestData = { ...leaveData[originalIndex] };

            // Parse location if it's a JSON string
            if (typeof requestData.location === 'string') {
                try {
                    const parsedLocation = JSON.parse(requestData.location);
                    if (parsedLocation.latitude && parsedLocation.longitude) {
                        requestData.location = { lat: parsedLocation.latitude, lng: parsedLocation.longitude };
                    } else {
                        throw new Error('Invalid JSON location format');
                    }
                } catch (error) {
                    // Fallback to default location if parsing fails
                    console.error('Error parsing location:', error);
                    requestData.location = { lat: 13.76825599595529, lng: 100.49368727500557 };
                }
            } else if (!requestData.location || typeof requestData.location !== 'object') {
                // Fallback to default location if location is missing or invalid
                requestData.location = { lat: 13.76825599595529, lng: 100.49368727500557 };
            }

            setEditIndex(originalIndex);
            setEditedData(requestData);
            setIsModalOpen(true);
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
            leaveLocation: JSON.stringify({
                latitude: editedData.location.lat,
                longitude: editedData.location.lng,
            }),
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
                setIsModalOpen(false);
            } else {
                console.error('Error:', await response.text());
                alert("บันทึกข้อมูลไม่สำเร็จ");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
    }

    const handleChange = (key, value) => {
        setEditedData((prevData) => ({ ...prevData, [key]: value }));
    }

    const handleCancel = () => {
        setEditIndex(null);
        setEditedData({});
        setIsModalOpen(false);
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
                {loading ? (
                    <p>กำลังโหลดคำร้อง...</p>
                ) : (
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
                                            {/* {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                                <input
                                                    className="form-control"
                                                    value={editedData.leaveType}
                                                    onChange={(e) => handleChange('leaveType', e.target.value)}
                                                />
                                            ) : (
                                                el.leaveType
                                            )} */}
                                            {el.leaveType}
                                        </td>
                                        <td style={{ padding: "10px" }}>
                                            {/* {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                                <input
                                                    className="form-control"
                                                    value={editedData.idemployees}
                                                    onChange={(e) => handleChange('idemployees', e.target.value)}
                                                />
                                            ) : (
                                                el.idemployees
                                            )} */}
                                            {el.idemployees}
                                        </td>
                                        <td style={{ padding: "10px" }}>
                                            {/* {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                                <input
                                                    className="form-control"
                                                    value={editedData.location}
                                                    onChange={(e) => handleChange('location', e.target.value)}
                                                />
                                            ) : (
                                                el.location
                                            )} */}
                                            {el.location && typeof el.location === 'object'
                                                ? JSON.stringify({ latitude: el.location.lat, longitude: el.location.lng })
                                                : el.location || 'N/A'}
                                        </td>
                                        <td style={{ padding: "10px" }}>
                                            {/* {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                                <input
                                                    className="form-control"
                                                    value={editedData.place_name}
                                                    onChange={(e) => handleChange('place_name', e.target.value)}
                                                />
                                            ) : (
                                                el.place_name
                                            )} */}
                                            {el.place_name}
                                        </td>
                                        <td style={{ padding: "10px" }}>
                                            {/* {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                                <input
                                                    className="form-control"
                                                    value={editedData.start_date}
                                                    onChange={(e) => handleChange('start_date', e.target.value)}
                                                />
                                            ) : (
                                                el.start_date
                                            )} */}
                                            {el.start_date}
                                        </td>
                                        <td style={{ padding: "10px" }}>
                                            {/* {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                                <input
                                                    className="form-control"
                                                    value={editedData.start_time}
                                                    onChange={(e) => handleChange('start_time', e.target.value)}
                                                />
                                            ) : (
                                                el.start_time
                                            )} */}
                                            {el.start_time}
                                        </td>
                                        <td style={{ padding: "10px" }}>
                                            {/* {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                                <input
                                                    className="form-control"
                                                    value={editedData.end_date}
                                                    onChange={(e) => handleChange('end_date', e.target.value)}
                                                />
                                            ) : (
                                                el.end_date
                                            )} */}
                                            {el.end_date}
                                        </td>
                                        <td style={{ padding: "10px" }}>
                                            {/* {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                                <input
                                                    className="form-control"
                                                    value={editedData.end_time}
                                                    onChange={(e) => handleChange('end_time', e.target.value)}
                                                />
                                            ) : (
                                                el.end_time
                                            )} */}
                                            {el.end_time}
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
                                            {/* {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                                <input
                                                    className="form-control"
                                                    value={editedData.reason}
                                                    onChange={(e) => handleChange('reason', e.target.value)}
                                                />
                                            ) : (
                                                el.reason
                                            )} */}
                                            {el.reason}
                                        </td>
                                        <td style={{ padding: "10px" }}>
                                            {/* {editIndex === leaveData.findIndex(item => item.idrequests === el.idrequests) ? (
                                                <input
                                                    className="form-control"
                                                    value={editedData.status}
                                                    onChange={(e) => handleChange('status', e.target.value)}
                                                />
                                            ) : (
                                                el.status
                                            )} */}
                                            {el.status}
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
                )}

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h4>แก้ไขข้อมูลคำร้อง</h4>
                            <div>
                                <label>ประเภทคำร้อง:</label>
                                <input
                                    className="form-control"
                                    value={editedData.leaveType || ''}
                                    onChange={(e) => setEditedData({ ...editedData, leaveType: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>รหัสพนักงาน:</label>
                                <input
                                    className="form-control"
                                    value={editedData.idemployees || ''}
                                    onChange={(e) => setEditedData({ ...editedData, idemployees: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>พิกัดสถานที่ (ลากหมุดเพื่อเปลี่ยนตำแหน่ง):</label>
                                {/* <input
                                    className="form-control"
                                    value={
                                        editedData.location
                                            ? `${editedData.location.lat},${editedData.location.lng}`
                                            : ''
                                    }
                                    onChange={(e) => {
                                        const [lat, lng] = e.target.value.split(',').map(Number);
                                        setEditedData((prevData) => ({
                                            ...prevData,
                                            location: { lat, lng },
                                        }));
                                    }}
                                /> */}
                                <MapContainer
                                    center={[
                                        editedData.location?.lat || 13.76825599595529,
                                        editedData.location?.lng || 100.49368727500557,
                                    ]}
                                    zoom={13}
                                    style={{ height: '300px', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker
                                        position={[
                                            editedData.location?.lat || 13.76825599595529,
                                            editedData.location?.lng || 100.49368727500557,
                                        ]}
                                        draggable={true}
                                        eventHandlers={{
                                            dragend: (e) => {
                                                const latlng = e.target.getLatLng();
                                                setEditedData((prevData) => ({
                                                    ...prevData,
                                                    location: { lat: latlng.lat, lng: latlng.lng },
                                                }));
                                                console.log('Updated location: ', {lat: latlng.lat, lng: latlng.lng });
                                            },
                                        }}
                                    >
                                        <Popup>ลากหมุดเพื่อเลือกตำแหน่ง</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                            <div>
                                <label>ชื่อสถานที่:</label>
                                <input
                                    className="form-control"
                                    value={editedData.place_name || ''}
                                    onChange={(e) => setEditedData({ ...editedData, place_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>วันที่เริ่มต้น:</label>
                                <input
                                    className="form-control"
                                    value={editedData.start_date || ''}
                                    onChange={(e) => setEditedData({ ...editedData, start_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>เวลาเริ่มต้น:</label>
                                <input
                                    className="form-control"
                                    value={editedData.start_time || ''}
                                    onChange={(e) => setEditedData({ ...editedData, start_time: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>วันที่สิ้นสุด:</label>
                                <input
                                    className="form-control"
                                    value={editedData.end_date || ''}
                                    onChange={(e) => setEditedData({ ...editedData, end_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>เวลาสิ้นสุด:</label>
                                <input
                                    className="form-control"
                                    value={editedData.end_time || ''}
                                    onChange={(e) => setEditedData({ ...editedData, end_time: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>รายละเอียด:</label>
                                <input
                                    className="form-control"
                                    value={editedData.reason || ''}
                                    onChange={(e) => setEditedData({ ...editedData, reason: e.target.value })}
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-success" onClick={handleSave}>
                                    บันทึก
                                </button>
                                <button className="btn btn-danger" onClick={handleCancel}>
                                    ปิด
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Approve;
import React, {useState, useEffect} from 'react';
import * as XLSX from 'xlsx';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ManageReport() {
    const API_URL = process.env.REACT_APP_API_URL;
    const [workData, setWorkData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAttendanceData = () => {
        fetch(`${API_URL}/attendance`)
            .then(response => response.json())
            .then(data => {
                const parsedData = data.map(item => ({
                    ...item,
                    location: item.location ? JSON.parse(item.location) : null,
                }));
                console.log('attendance data from database:', parsedData);
                setWorkData(parsedData);
            })
            .catch(error => {
                console.error('Error fetching attendance data:', error);
            });
    };

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    const handleImport = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const expectedHeaders = [
                'idattendance', 'jobID', 'jobType', 'description', 'idemployees', 'in_time', 'out_time', 'location', 'image_url'
            ];

            const fileHeaders = jsonData[0];

            const isValid = expectedHeaders.every((header, index) => header === fileHeaders[index]);

            if (!isValid) {
                alert('ไฟล์ที่นำเข้ามีหัวตารางไม่ถูกต้อง');
                return;
            }
            
            const dataToImport = jsonData.slice(1).map(row => {
                let obj = {};
                expectedHeaders.forEach((header, index) => {
                    obj[header] = row[index];
                });
                return obj;
            });
    
            for (const attendance of dataToImport) {
                const response = await fetch(`${API_URL}/attendance-check`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ idattendance: attendance.idattendance })
                });
    
                const result = await response.json();
    
                if (!result.exists) {
                    await fetch(`${API_URL}/attendance-add`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(attendance)
                    });
                }
            }
    
            fetchAttendanceData();
        }

        reader.readAsArrayBuffer(file);
    }

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(workData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Data');

        XLSX.writeFile(workbook, 'ReportData.xlsx');
    }

    const [editIndex, setEditIndex] = useState(null);
    const [editedData, setEditedData] = useState({});
    
    const handleEdit = (index) => {
        setEditIndex(index);
        setEditedData( {...workData[index ]});
        setIsModalOpen(true);
    }

    // const handleSave = async () => {
    //     const updatedData = [...workData];
    //     const updatedEditedData = {
    //         ...editedData,
    //         idattendance: workData[editIndex].idattendance,
    //         jobID: editedData.jobID,
    //         jobType: editedData.jobType,
    //         description: editedData.description,
    //         in_time: editedData.in_time,
    //         out_time: editedData.out_time,
    //         location: editedData.location,
    //         image_url: editedData.image_url,
    //     };
    //     updatedData[editIndex] = updatedEditedData;
    //     setWorkData(updatedData);
    //     // updatedData[editIndex] = editedData;
    //     // setWorkData(updatedData);
    //     // setEditIndex(null);
    //     // setEditedData({});
    //     try {
    //         const response = await fetch(`${API_URL}/attendance-update`, {
    //             method: 'PUT',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify(updatedEditedData)
    //         });

    //         if (response.ok) {
    //             setEditIndex(null);
    //             setEditedData({});
    //         } else {
    //             const errorText = await response.text();
    //             console.error('Error:', errorText);
    //             alert("บันทึกข้อมูลไม่สำเร็จ");
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //         alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    //     }
    // }

    const handleSave = async () => {
        if (!editedData.jobID || !editedData.jobType || !editedData.description) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วนก่อน');
            return;
        }

        try {
            const formattedData = {
                ...editedData,
                location: JSON.stringify({
                    latitude: editedData.location?.lat,
                    longitude: editedData.location?.lng,
                }),
            };

            console.log('Data to save:', formattedData);

            if (editIndex !== null) {
                const response = await fetch(`${API_URL}/attendance-update`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formattedData),
                });

                if (response.ok) {
                    const updatedData = [...workData];
                    updatedData[editIndex] = formattedData;
                    setWorkData(updatedData);
                    alert('แก้ไขข้อมูลสำเร็จ');
                } else {
                    const errorText = await response.text();
                    console.error('Error updating data:', errorText);
                    alert('แก้ไขข้อมูลไม่สำเร็จ');
                }
            } else {
                const response = await fetch(`${API_URL}/attendance-add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formattedData),
                });

                if (response.ok) {
                    const newData = await response.json();
                    setWorkData((prevData) => [...prevData, newData]);
                    alert('เพิ่มข้อมูลสำเร็จ');
                } else {
                    const errorText = await response.text();
                    console.error('Error adding data:', errorText);
                    alert('เพิ่มข้อมูลไม่สำเร็จ');
                }
            }
        } catch (error) {
            console.error('Error saving data:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    
        setIsModalOpen(false);
        setEditedData({});
        setEditIndex(null);
    };

    const handleChange = (key, value) => {
        setEditedData((prevData) => ({ ...prevData, [key]: value }));
    }

    const handleCancel = () => {
        setEditedData({
            idattendance: '',
            jobID: '',
            jobType: '',
            description: '',
            idemployees: '',
            in_time: '',
            out_time: '',
            place_name: '',
        });
        setEditIndex(null);
        setEditedData({});
        setIsModalOpen(false);
    };

    const [addRemoveMode, setAddRemoveMode] = useState(false);
    const [newEntry, setNewEntry] = useState({});

    const handleAdd = () => {
        setEditIndex(null);
        setEditedData({
            idattendance: '',
            jobID: '',
            jobType: '',
            description: '',
            idemployees: '',
            in_time: '',
            out_time: '',
            place_name: '',
        });
        setIsModalOpen(true);
    }

    const toggleAddRemoveMode = () => {
        setAddRemoveMode((prev) => !prev);
    };

    const handleAddEntry = async () => {
        if (newEntry.idattendance) {
            try {
                const response = await fetch(`${API_URL}/attendance-add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newEntry)
                });

                if (response.ok) {
                    setWorkData((prevData) => [...prevData, newEntry]);
                    setNewEntry({});
                } else {
                    const errorText = await response.text();
                    console.error('Error:', errorText);
                    alert("เพิ่มข้อมูลไม่สำเร็จ");
                }
            } catch (error) {
                console.error('Error:', error);
                alert("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
            }
            // setWorkData((prevData) => [...prevData, newEntry]);
            // setNewEntry({});
        }
    };

    const handleRemoveEntry = async (index) => {
        const confirmed = window.confirm('ท่านต้องการลบรายการนี้ออกใช่หรือไม่');
        if (confirmed) {
            const idattendance = workData[index].idattendance;
            try {
                const response = await fetch(`${API_URL}/attendance-remove/${idattendance}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
    
                if (response.ok) {
                    setWorkData((prevData) => prevData.filter((_, i) => i !== index));
                } else {
                    const errorText = await response.text();
                    console.error('Error:', errorText);
                    alert("ลบข้อมูลไม่สำเร็จ");
                }
            } catch (error) {
                console.error('Error:', error);
                alert("เกิดข้อผิดพลาดในการลบข้อมูล");
            }
        }
    };
    
    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>จัดการรายงานผลการทำงาน</h5>
            <button className="btn btn-primary"  onClick={() => document.getElementById('file-upload').click()}>นำเข้าข้อมูล</button>
            <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                accept=".xlsx,.xls"
                onChange={handleImport}
            />
            <button className="btn btn-primary" onClick={handleExport}>ส่งออกข้อมูล</button>
            <button className="btn btn-primary" onClick={handleAdd}>เพิ่มข้อมูล</button>
            <div>
                <table className="table table-bordered table-striped">
                    <thead style={{display:'table-header-group'}}>
                        <tr>
                            <th style={{ padding: "10px" }}>ลำดับ</th>
                            <th style={{ padding: "10px" }}>รหัสงาน</th>
                            <th style={{ padding: "10px" }}>ประเภทงาน</th>
                            <th style={{ padding: "10px" }}>รายละเอียดงาน</th>
                            <th style={{ padding: "10px" }}>รหัสพนักงาน</th>
                            <th style={{ padding: "10px" }}>เวลาเข้า</th>
                            <th style={{ padding: "10px" }}>เวลาออก</th>
                            <th style={{ padding: "10px" }}>ชื่อสถานที่</th>
                            <th style={{ padding: "10px" }}>การทำงาน</th>
                        </tr>
                    </thead>
                    <tbody style={{display:'table-header-group'}}>
                        {workData.map((el, index) => (
                            <tr key={index}>
                                <td style={{ padding: "10px" }}>{el.idattendance}</td>
                                <td style={{ padding: "10px" }}>{el.jobID}</td>
                                <td style={{ padding: "10px" }}>{el.jobType}</td>
                                <td style={{ padding: "10px" }}>{el.description}</td>
                                <td style={{ padding: "10px" }}>{el.idemployees}</td>
                                <td style={{ padding: "10px" }}>{el.in_time}</td>
                                <td style={{ padding: "10px" }}>{el.out_time}</td>
                                <td style={{ padding: "10px" }}>{el.place_name}</td>
                                <td style={{ padding: "10px" }}>
                                    <button className="btn btn-danger" onClick={() => handleRemoveEntry(index)}>ลบ</button>
                                    <button className="btn btn-primary" onClick={() => handleEdit(index)}>แก้ไข</button>
                                </td>
                            </tr>
                        ))}
                        {addRemoveMode && (
                            <tr>
                                <td>
                                    <input
                                        className="form-control"
                                        value={newEntry.idattendance || ''}
                                        onChange={(e) =>
                                            setNewEntry({ ...newEntry, idattendance: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        value={newEntry.jobID || ''}
                                        onChange={(e) =>
                                            setNewEntry({ ...newEntry, jobID: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        value={newEntry.jobType || ''}
                                        onChange={(e) =>
                                            setNewEntry({ ...newEntry, jobType: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        value={newEntry.description || ''}
                                        onChange={(e) =>
                                            setNewEntry({ ...newEntry, description: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        value={newEntry.idemployees || ''}
                                        onChange={(e) =>
                                            setNewEntry({ ...newEntry, idemployees: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        value={newEntry.in_time || ''}
                                        onChange={(e) =>
                                            setNewEntry({ ...newEntry, in_time: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        value={newEntry.out_time || ''}
                                        onChange={(e) =>
                                            setNewEntry({ ...newEntry, out_time: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        value={newEntry.place_name || ''}
                                        onChange={(e) =>
                                            setNewEntry({ ...newEntry, place_name: e.target.value })
                                        }
                                    />
                                </td>
                                <td style={{ padding: "10px" }}>
                                    <button className="btn btn-success" onClick={handleAddEntry}>
                                        เพิ่ม
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h4>{editIndex !== null ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูล'}</h4>
                            <div>
                                <label>รหัสงาน:</label>
                                <input
                                    className="form-control"
                                    value={editedData.jobID || ''}
                                    onChange={(e) => setEditedData({ ...editedData, jobID: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>ประเภทงาน:</label>
                                <input
                                    className="form-control"
                                    value={editedData.jobType || ''}
                                    onChange={(e) => setEditedData({ ...editedData, jobType: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>รายละเอียดงาน:</label>
                                <input
                                    className="form-control"
                                    value={editedData.description || ''}
                                    onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
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
                                <label>เวลาเข้า:</label>
                                <input
                                    className="form-control"
                                    value={editedData.in_time || ''}
                                    onChange={(e) => setEditedData({ ...editedData, in_time: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>เวลาออก:</label>
                                <input
                                    className="form-control"
                                    value={editedData.out_time || ''}
                                    onChange={(e) => setEditedData({ ...editedData, out_time: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>พิกัดตำแหน่ง (ลากหมุดเพื่อเลือก):</label>
                                {/* <input
                                    className="form-control"
                                    value={editedData.location || ''}
                                    onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                                /> */}
                                <MapContainer
                                    center={[
                                        editedData.location?.latitude || 13.76825599595529,
                                        editedData.location?.longitude || 100.49368727500557,
                                    ]}
                                    zoom={13}
                                    style={{ height: '300px', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker
                                        position={[
                                            editedData.location?.latitude || 13.76825599595529,
                                            editedData.location?.longitude || 100.49368727500557,
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
                            <div className="modal-footer">
                                <button className="btn btn-success" onClick={handleSave}>
                                    {editIndex !== null ? 'บันทึก' : 'เพิ่ม'}
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

export default ManageReport;
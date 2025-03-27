import React, {useState, useEffect} from 'react';
import * as XLSX from 'xlsx';

function ManageReport() {
    const API_URL = process.env.REACT_APP_API_URL;
    const [workData, setWorkData] = useState([]);

    const fetchAttendanceData = () => {
        fetch(`${API_URL}/attendance`)
            .then(response => response.json())
            .then(data => {
                console.log('attendance data from database:', data);
                setWorkData(data);
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
    }

    const handleSave = async () => {
        const updatedData = [...workData];
        const updatedEditedData = {
            ...editedData,
            idattendance: workData[editIndex].idattendance,
            jobID: editedData.jobID,
            jobType: editedData.jobType,
            description: editedData.description,
            in_time: editedData.in_time,
            out_time: editedData.out_time,
            location: editedData.location,
            image_url: editedData.image_url,
        };
        updatedData[editIndex] = updatedEditedData;
        setWorkData(updatedData);
        // updatedData[editIndex] = editedData;
        // setWorkData(updatedData);
        // setEditIndex(null);
        // setEditedData({});
        try {
            const response = await fetch(`${API_URL}/attendance-update`, {
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
                const errorText = await response.text();
                console.error('Error:', errorText);
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
    };

    const [addRemoveMode, setAddRemoveMode] = useState(false);
    const [newEntry, setNewEntry] = useState({});

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
            <button className="btn btn-primary" onClick={toggleAddRemoveMode}>{addRemoveMode ? 'เสร็จสิ้น' : 'เพิ่ม/ลบ'}</button>
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
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.idattendance}
                                            onChange={(e) => handleChange('idattendance', e.target.value)}
                                        />
                                    ) : (
                                        el.idattendance
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.jobID}
                                            onChange={(e) => handleChange('jobID', e.target.value)}
                                        />
                                    ) : (
                                        el.jobID
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.jobType}
                                            onChange={(e) => handleChange('jobType', e.target.value)}
                                        />
                                    ) : (
                                        el.jobType
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                        />
                                    ) : (
                                        el.description
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
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
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.in_time}
                                            onChange={(e) => handleChange('in_time', e.target.value)}
                                        />
                                    ) : (
                                        el.in_time
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.out_time}
                                            onChange={(e) => handleChange('out_time', e.target.value)}
                                        />
                                    ) : (
                                        el.out_time
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
                                        el.place_name
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                            <>
                                                <button className="btn btn-success" onClick={handleSave}>บันทึก</button>
                                                <button className="btn btn-danger" onClick={handleCancel}>ยกเลิก</button>
                                            </>
                                        ) : addRemoveMode ? (
                                            <>
                                                <button className="btn btn-danger" onClick={() => handleRemoveEntry(index)}>ลบ</button>
                                            </>
                                        ) : (
                                            <button className="btn btn-primary" onClick={() => handleEdit(index)}>แก้ไข</button>
                                        )
                                    }
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
            </div>
        </div>
    )
}

export default ManageReport;
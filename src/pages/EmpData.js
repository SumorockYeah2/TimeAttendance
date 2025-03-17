import React, {useState, useEffect} from 'react';
import * as XLSX from 'xlsx';

function EmpData() {
    const [empData, setEmpData] = useState([]);

    const fetchEmployeeData = () => {
        fetch('http://localhost:3001/employee-data')
            .then(response => response.json())
            .then(data => {
                console.log('EmployeeData from database:', data);
                setEmpData(data);
            })
            .catch(error => {
                console.error('Error fetching employee data:', error);
            });
    };

    useEffect(() => {
        fetchEmployeeData();
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
                'idemployees', 'name', 'department', 'division', 
                'gender', 'role', 'phone', 'email', 'ipphone'
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
            // setEmpData((prevData) => [...prevData, ...dataToImport]);
            for (const employee of dataToImport) {
                const response = await fetch('http://localhost:3001/empdata-check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ idemployees: employee.idemployees })
                });

                const result = await response.json();

                if (!result.exists) {
                    await fetch('http://localhost:3001/empdata-add', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(employee)
                    });
                }
            }

            fetchEmployeeData();
        }

        reader.readAsArrayBuffer(file);
    }

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(empData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Data');

        XLSX.writeFile(workbook, 'EmployeeData.xlsx');
    }

    const [editIndex, setEditIndex] = useState(null);
    const [editedData, setEditedData] = useState({});
    
    const handleEdit = (index) => {
        setEditIndex(index);
        setEditedData( {...empData[index ]});
    }

    const handleSave = async () => {
        const updatedData = [...empData];
        const updatedEditedData = {
            ...editedData,
            idemployees: empData[editIndex].idemployees,
            name: editedData.name,
            department: editedData.department,
            division: editedData.division,
            gender: editedData.gender,
            role: editedData.role,
            phone: editedData.phone,
            email: editedData.email,
            ipphone: editedData.ipphone
        };
        updatedData[editIndex] = updatedEditedData;
        setEmpData(updatedData);

        try {
            const response = await fetch('http://localhost:3001/empdata-update', {
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
    const [newEmployee, setNewEmployee] = useState({});

    const toggleAddRemoveMode = () => {
        setAddRemoveMode((prev) => !prev);
    };

    // const handleAddEmployee = () => {
    //     if (newEmployee.employeeID) {
    //         setEmpData((prevData) => [...prevData, newEmployee]);
    //         setNewEmployee({});
    //     }
    // };


    // const handleRemoveEmployee = (index) => {
    //     const confirmed = window.confirm('ท่านต้องการลบพนักงานนี้ออกใช่หรือไม่');
    //     if (confirmed) {
    //         setEmpData((prevData) => prevData.filter((_, i) => i !== index));
    //     }
    // };
    
    const handleAddEmployee = async () => {
        if (newEmployee.idemployees) {
            try {
                const response = await fetch('http://localhost:3001/empdata-add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newEmployee)
                });

                if (response.ok) {
                    setEmpData((prevData) => [...prevData, newEmployee]);
                    setNewEmployee({});
                } else {
                    const errorText = await response.text();
                    console.error('Error:', errorText);
                    alert("เพิ่มข้อมูลไม่สำเร็จ");
                }
            } catch (error) {
                console.error('Error:', error);
                alert("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
            }
        }
    };

    const handleRemoveEmployee = async (index) => {
        const confirmed = window.confirm('ท่านต้องการลบพนักงานนี้ออกใช่หรือไม่');
        if (confirmed) {
            const idemployees = empData[index].idemployees;
            try {
                const response = await fetch(`http://localhost:3001/empdata-remove/${idemployees}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    setEmpData((prevData) => prevData.filter((_, i) => i !== index));
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
            <h5>จัดการข้อมูลพนักงาน</h5>
            <button className="btn btn-primary" onClick={() => document.getElementById('file-upload').click()}>นำเข้าข้อมูล</button>
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
                            <th style={{ padding: "10px" }}>รหัสพนักงาน</th>
                            <th style={{ padding: "10px" }}>ชื่อ</th>
                            <th style={{ padding: "10px" }}>ฝ่าย</th>
                            <th style={{ padding: "10px" }}>แผนก</th>
                            <th style={{ padding: "10px" }}>เพศ</th>
                            <th style={{ padding: "10px" }}>ตำแหน่ง</th>
                            <th style={{ padding: "10px" }}>เบอร์โทรศัพท์</th>
                            <th style={{ padding: "10px" }}>อีเมล</th>
                            <th style={{ padding: "10px" }}>ไอพีโฟน</th>
                            <th style={{ padding: "10px" }}>การทำงาน</th>
                        </tr>
                    </thead>
                    <tbody style={{display:'table-header-group'}}>
                        {empData.map((el, index) => (
                            <tr key={index}>
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
                                            value={editedData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                        />
                                    ) : (
                                        el.name
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.department}
                                            onChange={(e) => handleChange('department', e.target.value)}
                                        />
                                    ) : (
                                        el.department
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.division}
                                            onChange={(e) => handleChange('division', e.target.value)}
                                        />
                                    ) : (
                                        el.division
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.gender}
                                            onChange={(e) => handleChange('gender', e.target.value)}
                                        />
                                    ) : (
                                        el.gender
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.role}
                                            onChange={(e) => handleChange('role', e.target.value)}
                                        />
                                    ) : (
                                        el.role
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                        />
                                    ) : (
                                        el.phone
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                        />
                                    ) : (
                                        el.email
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.ipphone}
                                            onChange={(e) => handleChange('ipphone', e.target.value)}
                                        />
                                    ) : (
                                        el.ipphone
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
                                            <button className="btn btn-danger" onClick={() => handleRemoveEmployee(index)}>ลบ</button>
                                        </>
                                    ) : (
                                        <button className="btn btn-primary" onClick={() => handleEdit(index)}>แก้ไข</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    {addRemoveMode && (
                        <tr>
                            <td>
                                <input
                                    className="form-control"
                                    value={newEmployee.idemployees || ''}
                                    onChange={(e) =>
                                        setNewEmployee({ ...newEmployee, idemployees: e.target.value })
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    className="form-control"
                                    value={newEmployee.name || ''}
                                    onChange={(e) =>
                                        setNewEmployee({ ...newEmployee, name: e.target.value })
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    className="form-control"
                                    value={newEmployee.department || ''}
                                    onChange={(e) =>
                                        setNewEmployee({ ...newEmployee, department: e.target.value })
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    className="form-control"
                                    value={newEmployee.division || ''}
                                    onChange={(e) =>
                                        setNewEmployee({ ...newEmployee, division: e.target.value })
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    className="form-control"
                                    value={newEmployee.gender || ''}
                                    onChange={(e) =>
                                        setNewEmployee({ ...newEmployee, gender: e.target.value })
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    className="form-control"
                                    value={newEmployee.role || ''}
                                    onChange={(e) =>
                                        setNewEmployee({ ...newEmployee, role: e.target.value })
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    className="form-control"
                                    value={newEmployee.phone || ''}
                                    onChange={(e) =>
                                        setNewEmployee({ ...newEmployee, phone: e.target.value })
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    className="form-control"
                                    value={newEmployee.email || ''}
                                    onChange={(e) =>
                                        setNewEmployee({ ...newEmployee, email: e.target.value })
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    className="form-control"
                                    value={newEmployee.ipphone || ''}
                                    onChange={(e) =>
                                        setNewEmployee({ ...newEmployee, ipphone: e.target.value })
                                    }
                                />
                            </td>
                            <td style={{ padding: "10px" }}>
                                <button className="btn btn-success" onClick={handleAddEmployee}>
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

export default EmpData;
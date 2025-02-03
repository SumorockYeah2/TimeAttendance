import React, {useState} from 'react';
import * as XLSX from 'xlsx';

function EmpData() {
    const [leaveData, setLeaveData] = useState([
        {
            employeeID: 'E001',
            employeeName: 'Tinky Winky',
            department: 'Engineering',
            division: 'Software',
            gender: 'Male',
            role: 'Developer',
            phone: '123-456-7890',
            email: 'tinkywinky@teletubbies.com',
            ipPhone: '1001'
        },
        {
            employeeID: 'E002',
            employeeName: 'Laa-Laa',
            department: 'Marketing',
            division: 'Digital',
            gender: 'Female',
            role: 'Manager',
            phone: '987-654-3210',
            email: 'laalaalilaa@teletubbies.com',
            ipPhone: '1002'
        }
    ]);

    const handleImport = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            setLeaveData((prevData) => [...prevData, ...jsonData]);
        }

        reader.readAsArrayBuffer(file);
    }

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(leaveData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Data');

        XLSX.writeFile(workbook, 'EmployeeData.xlsx');
    }

    const [editIndex, setEditIndex] = useState(null);
    const [editedData, setEditedData] = useState({});
    
    const handleEdit = (index) => {
        setEditIndex(index);
        setEditedData( {...leaveData[index ]});
    }

    const handleSave = () => {
        const updatedData = [...leaveData];
        updatedData[editIndex] = editedData;
        setLeaveData(updatedData);
        setEditIndex(null);
        setEditedData({});
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

    const handleAddEmployee = () => {
        if (newEmployee.employeeID) {
            setLeaveData((prevData) => [...prevData, newEmployee]);
            setNewEmployee({});
        }
    };

    const handleRemoveEmployee = (index) => {
        const confirmed = window.confirm('Are you sure you want to delete this employee?');
        if (confirmed) {
            setLeaveData((prevData) => prevData.filter((_, i) => i !== index));
        }
    };
    
    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>Manage Employee Data</h5>
            <button className="btn btn-primary" onClick={() => document.getElementById('file-upload').click()}>Import Data...</button>
            <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                accept=".xlsx,.xls"
                onChange={handleImport}
            />
            <button className="btn btn-primary" onClick={handleExport}>Export Data...</button>
            <button className="btn btn-primary" onClick={toggleAddRemoveMode}>{addRemoveMode ? 'Done' : 'Add/Remove...'}</button>
            <div>
                <table className="table table-bordered table-striped">
                    <thead style={{display:'table-header-group'}}>
                        <tr>
                            <th style={{ padding: "10px" }}>Employee ID</th>
                            <th style={{ padding: "10px" }}>Name</th>
                            <th style={{ padding: "10px" }}>Department</th>
                            <th style={{ padding: "10px" }}>Division</th>
                            <th style={{ padding: "10px" }}>Gender</th>
                            <th style={{ padding: "10px" }}>Role</th>
                            <th style={{ padding: "10px" }}>Phone</th>
                            <th style={{ padding: "10px" }}>Email</th>
                            <th style={{ padding: "10px" }}>IP Phone</th>
                            <th style={{ padding: "10px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{display:'table-header-group'}}>
                        {leaveData.map((el, index) => (
                            <tr key={index}>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.employeeID}
                                            onChange={(e) => handleChange('employeeID', e.target.value)}
                                        />
                                    ) : (
                                        el.employeeID
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.employeeName}
                                            onChange={(e) => handleChange('employeeName', e.target.value)}
                                        />
                                    ) : (
                                        el.employeeName
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
                                            value={editedData.ipPhone}
                                            onChange={(e) => handleChange('ipPhone', e.target.value)}
                                        />
                                    ) : (
                                        el.ipPhone
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <>
                                            <button className="btn btn-success" onClick={handleSave}>Save</button>
                                            <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
                                        </>
                                    ) : addRemoveMode ? (
                                        <>
                                            <button className="btn btn-danger" onClick={() => handleRemoveEmployee(index)}>Delete</button>
                                        </>
                                    ) : (
                                        <button className="btn btn-primary" onClick={() => handleEdit(index)}>Edit</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    {addRemoveMode && (
                        <tr>
                            <td>
                                <input
                                    className="form-control"
                                    value={newEmployee.employeeID || ''}
                                    onChange={(e) =>
                                        setNewEmployee({ ...newEmployee, employeeID: e.target.value })
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    className="form-control"
                                    value={newEmployee.employeeName || ''}
                                    onChange={(e) =>
                                        setNewEmployee({ ...newEmployee, employeeName: e.target.value })
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
                                    value={newEmployee.ipPhone || ''}
                                    onChange={(e) =>
                                        setNewEmployee({ ...newEmployee, ipPhone: e.target.value })
                                    }
                                />
                            </td>
                            <td style={{ padding: "10px" }}>
                                <button className="btn btn-success" onClick={handleAddEmployee}>
                                    Add
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
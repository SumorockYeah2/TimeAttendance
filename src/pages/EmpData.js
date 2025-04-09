import React, {useState, useEffect} from 'react';
import * as XLSX from 'xlsx';
import './css/EmpData.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function EmpData() {
    const API_URL = process.env.REACT_APP_API_URL;
    const [empData, setEmpData] = useState([]);
    const [supervisors, setSupervisors] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEmployeeData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/employee-data`);
            const employeeData = await response.json();
    
            const credentialsResponse = await fetch(`${API_URL}/user-credentials`);
            const credentialsData = await credentialsResponse.json();

            console.log('Employee Data:', employeeData);
            console.log('Credentials Data:', credentialsData);

            const mergedData = employeeData.map((employee) => {
                const credential = credentialsData.find(
                    (cred) => String(cred.idemployees) === String(employee.idemployees)
                );
                return { ...employee, password: credential ? credential.password : '' };
            });
    
            console.log('Merged Employee Data:', mergedData);
            setEmpData(mergedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching employee data:', error);
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน');
        }
    };

    const fetchSupervisors = () => {
        fetch(`${API_URL}/supervisor-search`)
            .then(response => response.json())
            .then(data => {
                console.log('Supervisors:', data);
                setSupervisors(data); // เก็บข้อมูลหัวหน้าใน state
            })
            .catch(error => {
                console.error('Error fetching supervisors:', error);
            });
    };

    useEffect(() => {
        fetchEmployeeData();
        fetchSupervisors();
    }, []);

    useEffect(() => {
        const fetchOrgList = async () => {
            try {
                const response = await fetch(`${API_URL}/orglist`);
                const data = await response.json();
    
                // Extract unique departments and their divisions
                const uniqueDepartments = data.map(item => ({
                    depname: item.depname,
                    divisions: item.divisions,
                }));
    
                setDepartments(uniqueDepartments);
            } catch (error) {
                console.error('Error fetching orglist data:', error);
            }
        };
    
        fetchOrgList();
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
                'gender', 'role', 'phone', 'email', 'ipphone', 'supervisor', 'image', 'password'
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
                const response = await fetch(`${API_URL}/empdata-check`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ idemployees: employee.idemployees })
                });

                const result = await response.json();

                if (!result.exists) {
                    await fetch(`${API_URL}/empdata-add`, {
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

    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editedData, setEditedData] = useState({});
    
    const handleEdit = (index) => {
        setEditIndex(index);
        setNewEmployee({
            ...empData[index],
            supervisor: empData[index].supervisor || '', // ตรวจสอบค่า null หรือ undefined
        }); // กำหนดข้อมูลพนักงานที่ต้องการแก้ไข
        setIsEditing(true);
        setIsAddModalOpen(true); // เปิด popup modal
    };

    const handleSave = async () => {
        if (!newEmployee || editIndex === null || editIndex === undefined) {
            alert('ข้อมูลไม่ครบถ้วน');
            return;
        }
        
        const requiredFields = ['idemployees', 'name', 'department', 'division', 'gender', 'role', 'phone', 'email', 'ipphone', 'supervisor'];
        const isComplete = requiredFields.every((field) => {
            const value = newEmployee[field];
            return value && String(value).trim() !== '';
        });
    
        if (!isComplete) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        let uploadedImagePath = null;

        // อัปโหลดรูปภาพถ้ามีการเลือก
        if (selectedImage) {
            const formData = new FormData();
            formData.append('image', selectedImage);

            try {
                const uploadResponse = await fetch(`${API_URL}/upload-image`, {
                    method: 'POST',
                    body: formData,
                });

                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    uploadedImagePath = uploadResult.filePath; // เก็บพาธของรูปภาพที่อัปโหลด
                } else {
                    const errorText = await uploadResponse.text();
                    console.error('Error uploading image:', errorText);
                    alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
                    return;
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
                return;
            }
        }

        const updatedEmployee = { 
            ...newEmployee, 
            image: uploadedImagePath || newEmployee.image // ใช้พาธรูปภาพใหม่ถ้ามีการอัปโหลด
        };
        const updatedData = [...empData];
        updatedData[editIndex] = updatedEmployee; // อัปเดตข้อมูลใน empData
        setEmpData(updatedData);

        try {
            const response = await fetch(`${API_URL}/empdata-update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEmployee),
            });

            if (response.ok) {
                const credentialsResponse = await fetch(`${API_URL}/user-credentials-update`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        idemployees: newEmployee.idemployees,
                        role: newEmployee.role,
                        password: newEmployee.password,
                        email: newEmployee.email,
                    }),
                });
                
                console.log('Data sent to user-credentials-update:', {
                    idemployees: newEmployee.idemployees,
                    role: newEmployee.role,
                    password: newEmployee.password,
                    email: newEmployee.email,
                });

                if (credentialsResponse.ok) {
                    setEmpData(updatedData); // อัปเดต state empData
                    setIsAddModalOpen(false); // ปิด modal
                    setIsEditing(false); // ออกจากโหมดแก้ไข
                    setNewEmployee({}); // ล้างข้อมูลใน newEmployee
                    setEditIndex(null); // รีเซ็ต index
                    setSelectedImage(null); // ล้างรูปภาพที่เลือก
                    console.log('User credentials updated successfully');
                    alert('บันทึกข้อมูลสำเร็จ');
                } else {
                    const errorText = await credentialsResponse.text();
                    console.error('Error updating user_credentials:', errorText);
                    alert('บันทึกข้อมูลใน user_credentials ไม่สำเร็จ');
                }
            } else {
                const errorText = await response.text();
                console.error('Error:', errorText);
                alert('บันทึกข้อมูลไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    }

    const handleChange = (key, value) => {
        setEditedData((prevData) => ({ ...prevData, [key]: value }));
    }

    const handleCancel = () => {
        setNewEmployee({
            idemployees: '',
            name: '',
            department: '',
            division: '',
            gender: '',
            role: '',
            phone: '',
            email: '',
            ipphone: '',
            supervisor: '',
            password: '',
        }); // ล้างข้อมูลใน newEmployee
        setSelectedImage(null); // ล้างรูปภาพที่เลือก
        setIsAddModalOpen(false); // ปิด modal
        setIsEditing(false); // ออกจากโหมดแก้ไข
        setEditIndex(null); // รีเซ็ต index
    };
    
    const [addRemoveMode, setAddRemoveMode] = useState(false);

    const toggleAddRemoveMode = () => {
        setAddRemoveMode((prev) => !prev);
    };
    const handleAddEmployee = async () => {
        const requiredFields = ['idemployees', 'name', 'department', 'division', 'gender', 'role', 'phone', 'email', 'ipphone', 'supervisor'];
        const isComplete = requiredFields.every((field) => newEmployee[field] && newEmployee[field].trim() !== '');
    
        if (!isComplete) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
    
        if (newEmployee.ipphone.length > 4) {
            alert('ipphone ต้องไม่เกิน 4 ตัวอักษร');
            return;
        }

        console.log('New Employee Data:', {
            idemployees: newEmployee.idemployees,
            name: newEmployee.name,
            department: newEmployee.department,
            division: newEmployee.division,
            gender: newEmployee.gender,
            role: newEmployee.role,
            phone: newEmployee.phone,
            email: newEmployee.email,
            ipphone: newEmployee.ipphone,
            supervisor: newEmployee.supervisor,
            password: newEmployee.password, // ตรวจสอบค่า password
        });

        const formData = new FormData();
        formData.append('idemployees', newEmployee.idemployees);
        formData.append('name', newEmployee.name);
        formData.append('department', newEmployee.department);
        formData.append('division', newEmployee.division);
        formData.append('gender', newEmployee.gender);
        formData.append('role', newEmployee.role);
        formData.append('phone', newEmployee.phone);
        formData.append('email', newEmployee.email);
        formData.append('ipphone', newEmployee.ipphone);
        formData.append('supervisor', newEmployee.supervisor);
        formData.append('password', newEmployee.password || 'defaultpassword'); // เพิ่ม password เริ่มต้น
        if (selectedImage) {
            formData.append('image', selectedImage);
        }

        console.log('FormData being sent:', Object.fromEntries(formData.entries()));
        console.log('Data sent to user-credentials-add:', {
            idusers: newEmployee.idemployees,
            email: newEmployee.email,
            username: newEmployee.name,
            idemployees: newEmployee.idemployees,
            role: newEmployee.role,
        });
    
        try {
            const response = await fetch(`${API_URL}/empdata-add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idemployees: newEmployee.idemployees,
                    name: newEmployee.name,
                    department: newEmployee.department,
                    division: newEmployee.division,
                    gender: newEmployee.gender,
                    role: newEmployee.role,
                    phone: newEmployee.phone,
                    email: newEmployee.email,
                    ipphone: newEmployee.ipphone,
                    supervisor: newEmployee.supervisor,
                }),
            });
    
            if (response.ok) {
                const credentialsResponse = await fetch(`${API_URL}/user-credentials-add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        idusers: newEmployee.idemployees, // ใช้ idemployees เป็น idusers
                        email: newEmployee.email,
                        username: newEmployee.name,
                        idemployees: newEmployee.idemployees,
                        role: newEmployee.role,
                        password: newEmployee.password || 'defaultpassword',
                    }),
                });

                console.log('Data sent to user-credentials-add:', {
                    idusers: newEmployee.idemployees,
                    email: newEmployee.email,
                    username: newEmployee.name,
                    idemployees: newEmployee.idemployees,
                    role: newEmployee.role,
                    password: newEmployee.password || 'defaultpassword',
                });

                if (credentialsResponse.ok) {
                    fetchEmployeeData(); // โหลดข้อมูลใหม่
                    setNewEmployee({
                        idemployees: '',
                        name: '',
                        department: '',
                        division: '',
                        gender: '',
                        role: '',
                        phone: '',
                        email: '',
                        ipphone: '',
                        supervisor: '',
                        password: '',
                    }); // ล้างข้อมูลใน newEmployee
                    setSelectedImage(null); // ล้างรูปภาพที่เลือก
                    setIsAddModalOpen(false); // ปิด modal
                    alert('เพิ่มข้อมูลสำเร็จ');
                } else {
                    const errorText = await credentialsResponse.text();
                    console.error('Error adding user_credentials:', errorText);
                    alert('เพิ่มข้อมูลใน user_credentials ไม่สำเร็จ');
                }
            } else {
                const errorText = await response.text();
                console.error('Error from server:', errorText);
                alert(`เพิ่มข้อมูลไม่สำเร็จ: ${errorText}`);
                return;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
        }
    };

    const handleRemoveEmployee = async (index) => {
        const confirmed = window.confirm('ท่านต้องการลบพนักงานนี้ออกใช่หรือไม่');
        if (confirmed) {
            const idemployees = empData[index].idemployees;
            try {
                // ลบข้อมูลพนักงานในตาราง employees
                const response = await fetch(`${API_URL}/empdata-remove/${idemployees}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    console.log('Employee and user credentials deleted successfully');
                    setEmpData((prevData) => prevData.filter((_, i) => i !== index));
                    alert('ลบข้อมูลพนักงานและผู้ใช้สำเร็จ');
                } else {
                    const errorText = await response.text();
                    console.error('Error removing employee:', errorText);
                    alert('ลบข้อมูลพนักงานไม่สำเร็จ');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    const handleImageChange = (event) => {
        setSelectedImage(event.target.files[0]);
    };

    const handleOpenAddModal = () => {
        setNewEmployee({
            idemployees: '',
            name: '',
            department: '',
            division: '',
            gender: '',
            role: '',
            phone: '',
            email: '',
            ipphone: '',
            supervisor: '',
            password: '', // เพิ่ม password เริ่มต้น
        }); // ล้างข้อมูลใน newEmployee
        setSelectedImage(null); // ล้างรูปภาพที่เลือก
        setIsAddModalOpen(true); // เปิด modal
    };

    const handleUploadImageToBackend = async () => {
        if (!selectedImage) {
            alert('กรุณาเลือกรูปภาพก่อนอัปโหลด');
            return;
        }
    
        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('idemployees', newEmployee.idemployees);
    
        try {
            const response = await fetch(`${API_URL}/upload-face-descriptor`, {
                method: 'POST',
                body: formData,
            });
    
            if (response.ok) {
                const result = await response.json();
                console.log('Face descriptor saved successfully:', result);
                alert('อัปโหลดรูปภาพและบันทึกข้อมูลสำเร็จ');
            } else {
                const errorText = await response.text();
                console.error('Error uploading image:', errorText);
                alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    }

    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>จัดการข้อมูลพนักงาน</h5>
            <button className="btn btn-primary" onClick={() => document.getElementById('file-upload').click()} disabled={loading}>นำเข้าข้อมูล</button>
            <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                accept=".xlsx,.xls"
                onChange={handleImport}
            />
            <button className="btn btn-primary" onClick={handleExport} disabled={loading}>ส่งออกข้อมูล</button>
            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)} disabled={loading}>เพิ่ม</button>
            {/* <button className="btn btn-primary" onClick={toggleAddRemoveMode}>{addRemoveMode ? 'เสร็จสิ้น' : 'ลบ'}</button> */}
            <div>
                {loading ? (
                    <p>กำลังโหลด...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : (
                    <table className="table table-bordered table-striped">
                        <thead style={{display:'table-header-group'}}>
                            <tr>
                                <th style={{ padding: "10px" }}>รหัสพนักงาน</th>
                                <th style={{ padding: "10px" }}>ชื่อ</th>
                                <th style={{ padding: "10px" }}>ฝ่าย</th>
                                <th style={{ padding: "10px" }}>แผนก</th>
                                <th style={{ padding: "10px" }}>เพศ</th>
                                <th style={{ padding: "10px" }}>ระดับสิทธิ์ในระบบ</th>
                                <th style={{ padding: "10px" }}>เบอร์โทรศัพท์</th>
                                <th style={{ padding: "10px" }}>อีเมล</th>
                                <th style={{ padding: "10px" }}>ไอพีโฟน</th>
                                <th style={{ padding: "10px" }}>หัวหน้า</th>
                                <th style={{ padding: "10px" }}>การทำงาน</th>
                            </tr>
                        </thead>
                        <tbody style={{display:'table-header-group'}}>
                            {empData.map((el, index) => {
                                // ค้นหาชื่อหัวหน้าจาก supervisors
                                const supervisorName = supervisors.find(
                                    (supervisor) => String(supervisor.idemployees) === String(el.supervisor)
                                )?.name || 'ไม่มีหัวหน้า';

                                return (
                                    <tr key={index}>
                                        <td style={{ padding: '10px' }}>{el.idemployees}</td>
                                        <td style={{ padding: '10px' }}>{el.name}</td>
                                        <td style={{ padding: '10px' }}>{el.department}</td>
                                        <td style={{ padding: '10px' }}>{el.division}</td>
                                        <td style={{ padding: '10px' }}>{el.gender}</td>
                                        <td style={{ padding: '10px' }}>
                                            {el.role === 'HR' && 'แผนกบุคคล'}
                                            {el.role === 'Admin' && 'ผู้ดูแลระบบ'}
                                            {el.role === 'Supervisor' && 'หัวหน้า'}
                                            {el.role === 'Employee' && 'พนักงาน'}
                                        </td>
                                        <td style={{ padding: '10px' }}>{el.phone}</td>
                                        <td style={{ padding: '10px' }}>{el.email}</td>
                                        <td style={{ padding: '10px' }}>{el.ipphone}</td>
                                        <td style={{ padding: '10px' }}>{supervisorName}</td> {/* แสดงชื่อหัวหน้า */}
                                        <td style={{ padding: '10px' }}>
                                            <button className="btn btn-primary" onClick={() => handleEdit(index)}>แก้ไข</button>
                                            <button className="btn btn-danger" onClick={() => handleRemoveEmployee(index)}>ลบ</button>
                                        </td>
                                    </tr>
                                );
                            })}
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
                )}
            </div>

            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h4>{isEditing ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มข้อมูลพนักงาน'}</h4>
                        <div className="modal-body">
                            <div>
                                <label>รหัสพนักงาน:</label>
                                <input
                                    className="form-control"
                                    value={newEmployee.idemployees || ''}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, idemployees: e.target.value })}
                                                                    />
                            </div>
                            <div>
                                <label>ชื่อ:</label>
                                <input
                                    className="form-control"
                                    value={newEmployee.name || ''}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>ฝ่าย:</label>
                                <select
                                    className="form-control"
                                    value={newEmployee.department || ''}
                                    onChange={(e) => {
                                        const selectedDepartment = e.target.value;
                                        setNewEmployee({ ...newEmployee, department: selectedDepartment, division: '' });

                                        // กรองแผนกตามฝ่ายที่เลือก
                                        const selectedDep = departments.find(dep => dep.depname === selectedDepartment);
                                        setDivisions(selectedDep ? selectedDep.divisions : []);
                                    }}
                                >
                                    <option value="">เลือกฝ่าย</option>
                                    {departments.map((dep) => (
                                        <option key={dep.depname} value={dep.depname}>
                                            {dep.depname}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>แผนก:</label>
                                <select
                                    className="form-control"
                                    value={newEmployee.division || ''}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, division: e.target.value })}
                                    disabled={!newEmployee.department} // ปิดการใช้งานหากยังไม่ได้เลือกฝ่าย
                                >
                                    <option value="">เลือกแผนก</option>
                                    {divisions.map((div) => (
                                        <option key={div} value={div}>
                                            {div}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>เพศ:</label>
                                <select
                                    className="form-control"
                                    value={newEmployee.gender || ''}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, gender: e.target.value })}
                                >
                                    <option value="">เลือกเพศ</option>
                                    <option value="หญิง">หญิง</option>
                                    <option value="ชาย">ชาย</option>
                                </select>
                            </div>
                            <div>
                                <label>ระดับสิทธิ์ในระบบ:</label>
                                <select
                                    className="form-control"
                                    value={newEmployee.role || ''}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                                >
                                    <option value="">เลือกระดับ</option>
                                    <option value="Employee">พนักงาน</option>
                                    <option value="Supervisor">หัวหน้า</option>
                                    <option value="HR">แผนกบุคคล</option>
                                </select>
                            </div>
                            <div>
                                <label>เบอร์โทรศัพท์:</label>
                                <input
                                    className="form-control"
                                    value={newEmployee.phone || ''}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>อีเมล:</label>
                                <input
                                    className="form-control"
                                    value={newEmployee.email || ''}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>ไอพีโฟน:</label>
                                <input
                                    className="form-control"
                                    value={newEmployee.ipphone || ''}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, ipphone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>หัวหน้า:</label>
                                <select
                                    className="form-control"
                                    value={newEmployee.supervisor || ''}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, supervisor: e.target.value })}
                                >
                                    <option value="">เลือกหัวหน้า</option>
                                    {supervisors.map((supervisor) => (
                                        <option key={supervisor.idemployees} value={supervisor.idemployees}>
                                            {supervisor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ position: 'relative', width: '100%' }}>
                                <label>รหัสผ่าน:</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control"
                                    style={{ paddingRight: '40px' }}
                                    value={newEmployee.password || ''}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    transform: 'translateY(-125%)',
                                    background: 'none',
                                    border: 'none'
                                }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            <div>
                                <label>รูปภาพใบหน้า:</label>
                                <input type="file" className="form-control" onChange={handleImageChange} />
                                <button className="btn btn-primary mt-2" onClick={handleUploadImageToBackend}>
                                    ตั้งค่าใบหน้าสแกน
                                </button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-success" onClick={isEditing ? handleSave : handleAddEmployee}>
                                {isEditing ? 'บันทึก' : 'เพิ่ม'}
                            </button>
                            <button className="btn btn-danger" onClick={handleCancel}>ปิด</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EmpData;
import React, { useState, useEffect } from 'react';

function LeaveDays() {
    const API_URL = process.env.REACT_APP_API_URL;
    const [leaveData, setLeaveData] = useState([]);
    const [editedData, setEditedData] = useState({});

    // State สำหรับการค้นหาพนักงาน
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // ดึงข้อมูลวันลาจาก backend
    const fetchLeaveData = (idemployees) => {
        fetch(`${API_URL}/leave-balance/${idemployees}`)
            .then(response => response.json())
            .then(data => {
                console.log('Leave data from database:', data);
                setLeaveData(data);
                setEditedData(data);
            })
            .catch(error => {
                console.error('Error fetching leave data:', error);
            });
    };
    const handleSave = async () => {
        try {
            console.log('Data to be saved:', editedData);
            
            const idemployees = selectedEmployee?.idemployees || editedData.idemployees;
    
            if (!idemployees) {
                alert('ไม่พบรหัสพนักงาน');
                return;
            }
    
            const response = await fetch(`${API_URL}/leave-balance-update/${idemployees}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedData),
            });
    
            if (response.ok) {
                alert('บันทึกข้อมูลสำเร็จ');
                setLeaveData(editedData);
            } else {
                const errorText = await response.text();
                console.error('Error:', errorText);
                alert('บันทึกข้อมูลไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleChange = (key, value) => {
        setEditedData((prevData) => ({ ...prevData, [key]: value }));
    };

    // ฟังก์ชันสำหรับค้นหาพนักงาน
    const handleSearch = async (event) => {
        const query = event.target.value;
        setSearchQuery(query);

        if (query.trim() === "") {
            setFilteredEmployees([]);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/employee-search?query=${query}`);
            const data = await response.json();
            const filtered = data.filter(employee =>
                employee.name.toLowerCase().includes(query) || // กรองตามชื่อ
                employee.idemployees.toString().includes(query) // กรองตามรหัสพนักงาน
            );
            console.log('Filtered employees (frontend):', filtered);
            setFilteredEmployees(filtered);
        } catch (error) {
            console.error('Error fetching employee data:', error);
        }
    };

    const handleSelectEmployee = (employee) => {
        setSelectedEmployee(employee);
        setSearchQuery(""); // ล้างช่องค้นหา
        setFilteredEmployees([]); // ล้างผลการค้นหา
        fetchLeaveData(employee.idemployees); // ดึงข้อมูลวันลาของพนักงานที่เลือก
    };

    return (
        <div style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>จัดการวันลาพนักงาน</h5>

            {/* ส่วนค้นหาพนักงาน */}
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหาด้วยชื่อ/รหัส"
                    value={searchQuery}
                    onChange={handleSearch}
                />
                {filteredEmployees.length > 0 && (
                    <ul style={{ listStyleType: 'none', padding: 0, marginTop: '10px' }}>
                        {filteredEmployees.map((employee) => (
                            <li
                                key={employee.idemployees}
                                style={{ padding: '10px', borderBottom: '1px solid #ccc', cursor: 'pointer' }}
                                onClick={() => handleSelectEmployee(employee)}
                            >
                                {employee.name} ({employee.idemployees})
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {selectedEmployee && (
                <div style={{ marginBottom: '20px' }}>
                    <p>พนักงานที่เลือก: {selectedEmployee.name} ({selectedEmployee.idemployees})</p>
                </div>
            )}

            {selectedEmployee && (
                <div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>วันลาป่วย (วัน):</label>
                        <input
                            type="number"
                            className="form-control"
                            value={editedData.sick_hrs ? (editedData.sick_hrs / 8).toFixed(2) : ''}
                            onChange={(e) => handleChange('sick_hrs', e.target.value * 8)}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>วันลาพักร้อน (วัน):</label>
                        <input
                            type="number"
                            className="form-control"
                            value={editedData.vacation_hrs ? (editedData.vacation_hrs / 8).toFixed(2) : ''}
                            onChange={(e) => handleChange('vacation_hrs', e.target.value * 8)}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>วันลากิจ (วัน):</label>
                        <input
                            type="number"
                            className="form-control"
                            value={editedData.absence_hrs ? (editedData.absence_hrs / 8).toFixed(2) : ''}
                            onChange={(e) => handleChange('absence_hrs', e.target.value * 8)}
                        />
                    </div>
                    <button className="btn btn-success" onClick={handleSave}>บันทึก</button>
                </div>
            )}
        </div>
    );
}

export default LeaveDays;
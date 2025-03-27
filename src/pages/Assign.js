import React, { useState, useEffect } from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

function SearchControl() {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider();

        const searchControl = new GeoSearchControl({
            provider,
            style: 'bar',
            showMarker: true,
            showPopup: false,
            marker: {
                icon: new L.Icon.Default(),
                draggable: false,
            },
            maxMarkers: 1,
            retainZoomLevel: false,
            animateZoom: true,
            autoClose: true,
            searchLabel: 'ค้นหาสถานที่',
            keepResult: true,
        });

        map.addControl(searchControl);

        return () => map.removeControl(searchControl);
    }, [map]);

    return null;
}

function Assign({ role }) {
    const API_URL = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [jobName, setJobName] = useState("");
    const [jobDesc, setJobDesc] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [radius, setRadius] = useState("");
    const [jobLocation] = useState({
        latitude: 13.76825599595529,
        longitude: 100.49368727500557
    })

    const [options, setOptions] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedDivision, setSelectedDivision] = useState("");
    const [departments, setDepartments] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    const [jobType, setJobType] = useState("เวลาปกติ");
    const [specialJobs, setSpeicalJobs] = useState([]);

    const daysOfWeek = [
        { label: "จันทร์", value: "Monday" },
        { label: "อังคาร", value: "Tuesday" },
        { label: "พุธ", value: "Wednesday" },
        { label: "พฤหัสบดี", value: "Thursday" },
        { label: "ศุกร์", value: "Friday" },
        { label: "เสาร์", value: "Saturday" },
        { label: "อาทิตย์", value: "Sunday" }
    ];

    const combinedResults = [
        ...new Map(
            [...filteredEmployees, ...filteredOptions.map(opt => ({ idemployees: opt.value, name: opt.label }))]
            .map(emp => [emp.idemployees, emp])
        ).values()
    ];

    useEffect(() => {
        // Fetch employee data from the server
        const fetchEmployees = async () => {
            try {
                const response = await fetch(`${API_URL}/employee-data`);
                const data = await response.json();
                const employeeOptions = data.map(emp => ({ value: emp.idemployees, label: emp.name }));
                setOptions(employeeOptions);
            } catch (error) {
                console.error('Error fetching employee data:', error);
            }
        };

        fetchEmployees();
    }, []);

    const handleRadiusChange = (event) => {
        const newValue = event.target.value;
        if (/^\d*\.?\d*$/.test(newValue)) {
            setRadius(newValue);
        }
    };

    const _onSelect = (option) => {
        console.log("Selected option:", option);
        setEmployee(option);
    }

    const handleSave = async () => {
        if (!employee || selectedDays.length === 0 || !startTime || !endTime) {
            alert("โปรดกรอกข้อมูลให้ครบทั้งหมดทุกช่องก่อน");
            return;
        }

        const jobData = {
            employeeId: employee.value,
            jobName: jobName,
            jobDesc: jobDesc,
            weekdays: selectedDays.join(','),
            startTime: startTime,
            endTime: endTime,
            latitude: jobLocation.latitude,
            longitude: jobLocation.longitude,
            radius: radius
        };

        try {
            const checkResponse = await fetch(`${API_URL}/get-special-jobs/${employee.value}`);
            const specialJobs = await checkResponse.json();

            let response;
            if (specialJobs.length > 0) {
                response = await fetch(`${API_URL}/update-special-hours`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...jobData, jobID: specialJobs[0].jobID }) // ใช้ jobID ของเวลาพิเศษที่มีอยู่
                });
            } else {
                response = await fetch(`${API_URL}/add-special-hours`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(jobData)
                });
            }

            if (response.ok) {
                alert("บันทึกข้อมูลสำเร็จ");
                navigate('/checkin');
            } else {
                alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            }
        } catch (error) {
            console.error('Error saving job data:', error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
    }

    const handleCancel = () => {
        navigate('/checkin');
    }

    const handleHome = () => {
        navigate('/checkin');
    }
    
    const handleSearch = (event) => {
        const query = event.target.value;
        setSearchQuery(query);
        const filtered = options.filter(option => option.label.toLowerCase().includes(query.toLowerCase()));
        setFilteredOptions(filtered);
    }


    const handleDayChange = (day) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    useEffect(() => {
        // Fetch departments and divisions
        const fetchOrgList = async () => {
            try {
                const response = await fetch(`${API_URL}/orglist`);
            const data = await response.json();

            // Extract unique departments and their divisions
            const uniqueDepartments = data.map(item => ({
                depname: item.depname,
                divisions: item.divisions
            }));

            setDepartments(uniqueDepartments);
            } catch (error) {
                console.error('Error fetching orglist data:', error);
            }
        };

        fetchOrgList();
    }, []);

    const fetchFilteredEmployees = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (selectedDepartment) queryParams.append('department', selectedDepartment);
            if (selectedDivision) queryParams.append('division', selectedDivision);

            const response = await fetch(`${API_URL}/employee-search?${queryParams.toString()}`);
            const data = await response.json();

            console.log('Selected Department:', selectedDepartment);
            console.log('Selected Division:', selectedDivision);
            console.log('API Response:', data);

            const filtered = data.filter(emp => 
                emp.department_name === selectedDepartment && emp.division_name === selectedDivision
            );

            console.log('Fetched Employees:', filtered); // Debugging log

            setFilteredEmployees(filtered);
        } catch (error) {
            console.error('Error fetching filtered employees:', error);
        }
    };

    const handleDepartmentChange = (event) => {
        const department = event.target.value;
        setSelectedDepartment(department);

        // Filter divisions based on selected department
        const selectedDep = departments.find(dep => dep.depname === department);
        setDivisions(selectedDep ? selectedDep.divisions : []);
    };

    const handleDivisionChange = (event) => {
        setSelectedDivision(event.target.value);
    };

    useEffect(() => {
        fetchFilteredEmployees();
    }, [selectedDepartment, selectedDivision]);

    const fetchEmployeeJobData = async () => {
        if (employee) {
            try {
                const response = await fetch(`${API_URL}/get-office-job/${employee.value}`);
                const data = await response.json();

                if (data) {
                    setStartTime(data.start_time || '');
                    setEndTime(data.end_time || '');
                    setSelectedDays(data.weekdays ? data.weekdays.split(',') : []);
                    setRadius(data.gps_radius || '');
                } else {
                    setStartTime('');
                    setEndTime('');
                    setSelectedDays([]);
                    setRadius('');
                }
            } catch (error) {
                console.error('Error fetching employee job data:', error);
            }
        }
    };

    useEffect(() => {
        fetchSpecialJobData();
    }, [employee]);

    const fetchSpecialJobData = async () => {
        if (employee) {
            try {
                const response = await fetch(`${API_URL}/get-special-jobs/${employee.value}`);
                const data = await response.json();
    
                if (data.length > 0) {
                    const specialJob = data.find(job => job.jobID === 'OF02');
                    if (specialJob) {
                        setStartTime(specialJob.start_time || '');
                        setEndTime(specialJob.end_time || '');
                        setSelectedDays(specialJob.weekdays ? specialJob.weekdays.split(',') : []);
                        setRadius(specialJob.gps_radius || '');
                    } else {
                        clearForm();
                    }
                } else {
                    clearForm();
                }
            } catch (error) {
                console.error('Error fetching special job data:', error);
            }
        }
    };

    const clearForm = () => {
        setStartTime('');
        setEndTime('');
        setSelectedDays([]);
        setRadius('');
    };

    const handleDeleteSpecialJob = async () => {
        if (!employee) {
            alert("กรุณาเลือกพนักงานก่อนลบเวลาพิเศษ");
            return;
        }
    
        try {
            const response = await fetch(`${API_URL}/delete-special-job/${employee.value}`, {
                method: 'DELETE'
            });
    
            if (response.ok) {
                alert("ลบเวลาพิเศษสำเร็จ");
                clearForm(); // เคลียร์ค่าฟอร์มหลังจากลบสำเร็จ
            } else if (response.status === 404) {
                alert("ไม่พบเวลาพิเศษสำหรับพนักงานคนนี้");
            } else {
                alert("เกิดข้อผิดพลาดในการลบเวลาพิเศษ");
            }
        } catch (error) {
            console.error('Error deleting special job:', error);
            alert("เกิดข้อผิดพลาดในการลบเวลาพิเศษ");
        }
    };

    if (role !== 'Admin' && role !== 'HR') {
        return (
            <div>
                <p>ท่านไม่มีสิทธิ์เข้าถึงหน้านี้</p>
                <button className="btn btn-primary" onClick={handleHome}>กลับหน้าแรก</button>
            </div>
        )
    }

    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>จัดการเวลาพิเศษ</h5>

            <div>
                <p>พนักงาน</p>
                <div className="flex-container" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div>
                        <p>ฝ่าย</p>
                        <select
                            className="form-control"
                            value={selectedDepartment}
                            onChange={handleDepartmentChange}
                            style={{
                                position: 'relative',
                                display: 'inline-block',
                                width: '330px',
                                height: '40px',
                                fontSize: '16px',
                                padding: '5px 10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                backgroundColor: '#fff',
                                appearance: 'none', // ซ่อนลูกศรเริ่มต้นของเบราว์เซอร์
                                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                backgroundSize: '16px',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="">เลือกฝ่าย</option>
                            {departments.map(dep => (
                                <option key={dep.depname} value={dep.depname}>{dep.depname}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <p>แผนก</p>
                        <select
                            className="form-control"
                            value={selectedDivision}
                            onChange={handleDivisionChange}
                            disabled={!selectedDepartment}
                            style={{
                                position: 'relative',
                                display: 'inline-block',
                                width: '330px',
                                height: '40px',
                                fontSize: '16px',
                                padding: '5px 10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                backgroundColor: '#fff',
                                appearance: 'none', // ซ่อนลูกศรเริ่มต้นของเบราว์เซอร์
                                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                backgroundSize: '16px',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="">เลือกแผนก</option>
                            {divisions.map(div => (
                                <option key={div} value={div}>{div}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ position: 'relative', width: '330px' }}>
                        <input
                            type="text"
                            className="form-control"
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="ค้นหาด้วยชื่อ"
                            style={{ width: '330px' }}
                        />
                        {/* {searchQuery && (
                            <div style={{ marginTop: '20px' }}>
                                <h6>ผลการค้นหา</h6>
                                {filteredOptions.length > 0 ? (
                                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                                        {filteredOptions.map(option => (
                                            <li
                                                key={option.value}
                                                style={{ padding: '10px', borderBottom: '1px solid #ccc', cursor: 'pointer' }}
                                                onClick={() => {
                                                    setEmployee(option);
                                                    setSearchQuery(""); // Clear the search query after selection
                                                }}
                                            >
                                                <strong>{option.label}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>ไม่พบผลการค้นหา</p>
                                )}
                            </div>
                        )} */}
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <h6>ผลการค้นหา</h6>
                    {selectedDepartment || searchQuery ? (
                        combinedResults.length > 0 ? (
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                {combinedResults.map(emp => (
                                    <li
                                        key={emp.idemployees}
                                        style={{ padding: '10px', borderBottom: '1px solid #ccc', cursor: 'pointer' }}
                                        onClick={() => {
                                            setEmployee({ value: emp.idemployees, label: emp.name });
                                            console.log('Selected Employee:', emp);
                                        }}
                                    >
                                        <strong>{emp.name}</strong>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>ไม่พบพนักงาน</p>
                        )
                    ) : (
                        <p>กรุณาเลือกฝ่าย/แผนก หรือค้นหาด้วยชื่อ</p>
                    )}
                </div>

                {!employee && (
                    <div style={{ marginTop: '20px' }}>
                        <p>กรุณาเลือกพนักงานก่อน</p>
                    </div>
                )}
                {employee && (
                    <div style={{ marginTop: '10px' }}>
                        <p>พนักงานที่เลือก: {employee.label}</p>
                    </div>
                )}
            </div>
            {employee && (
                <>
                    <div>
                        <p>เลือกวันทำงาน</p>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            {daysOfWeek.map((day) => (
                                <label key={day.value} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedDays.includes(day.value)}
                                        onChange={() => handleDayChange(day.value)}
                                        disabled={jobName === 'เข้างานออฟฟิศ'}
                                    />
                                    {day.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p>เวลาเริ่มต้น</p>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="time"
                                className="form-control"
                                placeholder="Start time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                style={{ width: '120px' }}
                            />
                        </div>
                    </div>
                    <div>
                        <p>เวลาสิ้นสุด</p>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="time"
                                className="form-control"
                                placeholder="End time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                style={{ width: '120px' }}
                            />
                        </div>
                    </div>
                    <div>
                        {jobLocation && (
                            <div>
                                <MapContainer
                                    center={[jobLocation.latitude, jobLocation.longitude]}
                                    zoom={13}
                                    style={{ height: '400px', width: '75vw' }}
                                    key={jobLocation.latitude + jobLocation.longitude}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <Marker
                                        position={[jobLocation.latitude, jobLocation.longitude]}
                                        draggable={false}
                                    >
                                    </Marker>
                                    <Circle
                                        center={[jobLocation.latitude, jobLocation.longitude]}
                                        radius={radius * 1000} // Convert km to meters
                                        color="blue"
                                    />
                                </MapContainer>
                            </div>
                        )}
                    </div>
                    <div>
                        <p>รัศมีสำหรับระบบ GPS (หน่วย กม.)</p>
                        <input
                            className="form-control"
                            type="text"
                            value={radius}
                            onChange={handleRadiusChange}
                            style={{ width: '330px' }}
                        />
                    </div>
                    <div style={{ paddingTop: '10px' }}>
                        <button className="btn btn-success" onClick={handleSave}>บันทึก</button>
                        <button className="btn btn-danger" onClick={handleCancel}>ยกเลิก</button>
                    </div>
                    <div>
                    
                    {(startTime || endTime || selectedDays.length > 0 || radius) && (
                        <div style={{ paddingTop: '10px' }}>
                            <button className="btn btn-danger" onClick={handleDeleteSpecialJob}>
                                ลบเวลาพิเศษ
                            </button>
                        </div>
                    )}

                    </div>
                </>
            )}
        </div>
    )
}

export default Assign;
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
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [jobName, setJobName] = useState("");
    const [jobDesc, setJobDesc] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [radius, setRadius] = useState("");
    const [jobLocation, setJobLocation] = useState(null);

    const [options, setOptions] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedDivision, setSelectedDivision] = useState("");
    const [departments, setDepartments] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    const daysOfWeek = [
        { label: "จันทร์", value: "Monday" },
        { label: "อังคาร", value: "Tuesday" },
        { label: "พุธ", value: "Wednesday" },
        { label: "พฤหัสบดี", value: "Thursday" },
        { label: "ศุกร์", value: "Friday" },
        { label: "เสาร์", value: "Saturday" },
        { label: "อาทิตย์", value: "Sunday" }
    ];

    useEffect(() => {
        // Fetch employee data from the server
        const fetchEmployees = async () => {
            try {
                const response = await fetch('http://localhost:3001/employee-data');
                const data = await response.json();
                const employeeOptions = data.map(emp => ({ value: emp.idemployees, label: emp.name }));
                setOptions(employeeOptions);
            } catch (error) {
                console.error('Error fetching employee data:', error);
            }
        };

        fetchEmployees();
    }, []);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setJobLocation({ latitude, longitude });
                },
                (error) => {
                    console.error('Error getting user location: ', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser');
        }
    }

    useEffect(() => {
        getUserLocation();
    }, []);

    const handleRadiusChange = (event) => {
        const newValue = event.target.value;
        if (/^\d*$/.test(newValue)) {
            setRadius(newValue);
        }
    };

    const handleMarkerDrag = (event) => {
        const { lat, lng } = event.target.getLatLng();
        setJobLocation({ latitude: lat, longitude: lng });
    };

    const useCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setJobLocation({ latitude, longitude });
                },
                (error) => {
                    console.error("Error getting user location: ", error);
                    alert("Unable to fetch location. Please check location permissions.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const _onSelect = (option) => {
        console.log("Selected option:", option);
        setEmployee(option);
    }

    const handleSave = async () => {
        console.log("Employee:", employee);
        console.log("Selected Days:", selectedDays);
        console.log("Start Time:", startTime);
        console.log("End Time:", endTime);
        console.log("Job Location:", jobLocation);
        console.log("Radius:", radius);

        const jobName = "เข้างานออฟฟิศ";
        const jobDesc = "ลงเวลาเข้างานที่สถาบันอาหาร ในเวลาปกติ";
        if (!employee || selectedDays.length === 0) {
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
            const response = await fetch('http://localhost:3001/jobs-office', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jobData)
            });

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
                const response = await fetch('http://localhost:3001/orglist');
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

            const response = await fetch(`http://localhost:3001/employee-search?${queryParams.toString()}`);
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
            <h5>จัดการเวลาทำงาน</h5>

            <div>
                <p>พนักงาน</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div>
                        <p>ฝ่าย</p>
                        <select
                            className="form-control"
                            value={selectedDepartment}
                            onChange={handleDepartmentChange}
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
                        {searchQuery && filteredOptions.length > 0 && (
                            <div style={{ position: 'absolute', width: '330px', border: '1px solid #ccc', maxHeight: '150px', overflowY: 'auto', zIndex: 1000 }}>
                                {filteredOptions.map(option => (
                                    <div
                                        key={option.value}
                                        onClick={() => {
                                            setEmployee(option);
                                            setSearchQuery("");
                                            setFilteredOptions(options);
                                        }}
                                        style={{ padding: '10px', cursor: 'pointer' }}
                                    >
                                        {option.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <h6>ผลการค้นหา</h6>
                    {/* เงื่อนไข: แสดงผลเฉพาะเมื่อเลือกฝ่ายหรือแผนกแล้ว */}
                    {selectedDepartment && selectedDivision ? (
                        filteredEmployees.length > 0 ? (
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                {/* กรองข้อมูลซ้ำก่อนแสดงผล */}
                                {[...new Map(filteredEmployees.map(emp => [emp.idemployees, emp])).values()].map(emp => (
                                    <li
                                        key={emp.idemployees}
                                        style={{ padding: '10px', borderBottom: '1px solid #ccc', cursor: 'pointer' }}
                                        onClick={() => {
                                            setEmployee({ value: emp.idemployees, label: emp.name }); // อัปเดตสถานะ employee
                                            console.log('Selected Employee:', emp); // Debugging log
                                        }}
                                    >
                                        <strong>{emp.name}</strong> ({emp.department_name} - {emp.division_name})
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>ไม่พบพนักงาน</p>
                        )
                    ) : (
                        <p>โปรดเลือกฝ่ายและแผนกก่อน</p>
                    )}
                </div>

                {employee && (
                    <div style={{ marginTop: '10px' }}>
                        <p>พนักงานที่เลือก: {employee.label}</p>
                    </div>
                )}
            </div>
            <div>
                <p>เลือกวันทำงาน</p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {daysOfWeek.map((day) => (
                        <label key={day.value} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <input
                                type="checkbox"
                                checked={selectedDays.includes(day.value)}
                                onChange={() => handleDayChange(day.value)}
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
                <p>กำหนดพิกัดสำหรับลงเวลาเข้างาน (ลากหมุดบนแผนที่เพื่อเลือกพิกัดที่ต้องการ)</p>
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
                                draggable={true}
                                eventHandlers={{ dragend: handleMarkerDrag }}
                            >
                                <Popup>
                                    คลิกลากหมุดนี้ เพื่อเลือกพิกัดที่ต้องการ <br />
                                    ละติจูด: {jobLocation.latitude}, ลองจิจูด: {jobLocation.longitude}
                                </Popup>
                            </Marker>
                            <Circle
                                center={[jobLocation.latitude, jobLocation.longitude]}
                                radius={radius * 1000} // Convert km to meters
                                color="blue"
                            />
                            <SearchControl />
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
        </div>
    )
}

export default Assign;
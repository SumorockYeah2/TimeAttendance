import React, { useState, useEffect } from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
        console.log(employee, jobName, jobDesc)
        if (!employee || !jobName || !jobDesc ) {
            alert("โปรดกรอกข้อมูลให้ครบทั้งหมดทุกช่องก่อน");
            return;
        }

        const jobData = {
            employeeId: employee.value,
            jobName: jobName,
            jobDesc: jobDesc,
            startDate: startDate.toISOString().split('T')[0],
            startTime: startTime,
            endDate: endDate.toISOString().split('T')[0],
            endTime: endTime,
            latitude: jobLocation.latitude,
            longitude: jobLocation.longitude,
            radius: radius
        };

        try {
            const response = await fetch('http://localhost:3001/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jobData)
            });

            if (response.ok) {
                alert("บันทึกข้อมูลสำเร็จ");
                navigate('/home2');
            } else {
                alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            }
        } catch (error) {
            console.error('Error saving job data:', error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
    }

    const handleCancel = () => {
        navigate('/home2');
    }

    const handleHome = () => {
        navigate('/home2');
    }
    
    if (role !== 'Supervisor' && role !== 'Admin') {
        return (
            <div>
                <p>ท่านไม่มีสิทธิ์เข้าถึงหน้านี้</p>
                <button className="btn btn-primary" onClick={handleHome}>กลับหน้าแรก</button>
            </div>
        )
    }

    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>มอบหมายงาน</h5>

            <div>
                <p>พนักงาน</p>
                <Dropdown
                    options={options}
                    onChange={_onSelect}
                    value={employee}
                    placeholder="โปรดระบุ"
                    style={{ width: '330px' }}
                />
            </div>
            <div>
                <p>ชื่องาน</p>
                <input
                    type="text"
                    className="form-control"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    style={{ width: '330px' }}
                />
            </div>
            <div>
                <p>รายละเอียดงาน</p>
                <input
                    type="text"
                    className="form-control"
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    style={{ width: '330px' }}
                />
            </div>
            <div>
                <p>วันที่-เวลาเริ่มต้น</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <DatePicker
                        className="form-control"
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select a start date"
                    />
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
                <p>วันที่-เวลาสิ้นสุด</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <DatePicker
                        className="form-control"
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select an end date"
                    />
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
                            <SearchControl />
                        </MapContainer>
                    </div>
                )}
                <button className="btn btn-info" onClick={useCurrentLocation}>เลือกพิกัดปัจจุบัน</button>
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
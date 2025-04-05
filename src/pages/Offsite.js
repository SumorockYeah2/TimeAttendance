import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS
import L from 'leaflet';
import 'react-dropdown/style.css';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { useMap } from 'react-leaflet/hooks';
import 'leaflet-geosearch/dist/geosearch.css';

function SearchControl({ setUserLocation }) {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider();

        const searchControl = new GeoSearchControl({
            provider,
            style: 'bar',
            showMarker: false,
            showPopup: false,
            maxMarkers: 1,
            retainZoomLevel: false,
            animateZoom: true,
            autoClose: true,
            searchLabel: 'ค้นหาสถานที่',
            keepResult: true,
        });

        map.addControl(searchControl);

        map.on('geosearch/showlocation', (result) => {
            const { x: longitude, y: latitude } = result.location;
            setUserLocation({ latitude, longitude });
        });

        return () => map.removeControl(searchControl);
    }, [map, setUserLocation]);

    return null;
}

function Leave() {
    const API_URL = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

    const combineDateAndTime = (date, time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const combined = new Date(date);
        combined.setHours(hours, minutes, 0, 0); // ตั้งค่าเวลาเป็น Local Time
        return combined;
    };

    const checkAttendanceOverlap = async () => {
        const idemployees = localStorage.getItem('idemployees');
        if (!idemployees) {
            console.error('ไม่พบข้อมูลรหัสพนักงานในระบบ');
            return false;
        }

        try {
            const response = await fetch(`${API_URL}/attendance`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                console.error('Error fetching attendance data:', response.statusText);
                return false;
            }
    
            const attendanceRecords = await response.json();
            const startDateTime = combineDateAndTime(startDate, startTime);
            const endDateTime = combineDateAndTime(endDate, endTime);
    
            console.log('Checking attendance overlap with:');
            console.log('Start DateTime:', startDateTime);
            console.log('End DateTime:', endDateTime);
            console.log('Attendance Records:', attendanceRecords);
            // ตรวจสอบว่าช่วงเวลาชนกับการลงเวลาเข้างาน
            const hasOverlap = attendanceRecords.some((record) => {
                return (
                    record.idemployees === idemployees &&
                    (
                        (new Date(record.in_time) <= startDateTime && new Date(record.out_time) >= startDateTime) ||
                        (new Date(record.in_time) <= endDateTime && new Date(record.out_time) >= endDateTime) ||
                        (new Date(record.in_time) >= startDateTime && new Date(record.out_time) <= endDateTime)
                    )
                );
            });
    
            return hasOverlap;
        } catch (error) {
            console.error('Error checking attendance overlap:', error);
            return false;
        }
    };

    const checkLeaveOverlap = async () => {
        const idemployees = localStorage.getItem('idemployees');
        if (!idemployees) {
            alert('ไม่พบข้อมูลรหัสพนักงานในระบบ');
            return;
        }
        try {
            const response = await fetch(`${API_URL}/request-get`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                console.error('Error fetching leave requests:', response.statusText);
                return false;
            }
    
            const leaveRequests = await response.json();
            const startDateTime = combineDateAndTime(startDate, startTime);
            const endDateTime = combineDateAndTime(endDate, endTime);
    
            console.log('Checking leave overlap with:');
            console.log('Start DateTime:', startDateTime);
            console.log('End DateTime:', endDateTime);
            console.log('Leave Requests:', leaveRequests);

            // ตรวจสอบว่าช่วงเวลาชนกับคำร้องลาที่อนุมัติแล้ว
            const hasOverlap = leaveRequests.some((request) => {
                return (
                    request.idemployees === idemployees &&
                    ['ลากิจ', 'ลาป่วย', 'ลาพักร้อน'].includes(request.leaveType) &&
                    request.status === 'อนุมัติแล้ว' &&
                    (
                        (new Date(`${request.start_date}T${request.start_time}`) <= startDateTime &&
                         new Date(`${request.end_date}T${request.end_time}`) >= startDateTime) ||
                        (new Date(`${request.start_date}T${request.start_time}`) <= endDateTime &&
                         new Date(`${request.end_date}T${request.end_time}`) >= endDateTime) ||
                        (new Date(`${request.start_date}T${request.start_time}`) >= startDateTime &&
                         new Date(`${request.end_date}T${request.end_time}`) <= endDateTime)
                    )
                );
            });
    
            return hasOverlap;
        } catch (error) {
            console.error('Error checking leave overlap:', error);
            return false;
        }
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const handleCheckIn = async () => {
        if (!userLocation || !OffsitePlace || !startDate || !startTime || !endDate || !endTime || !description) {
            alert('โปรดกรอกข้อมูลให้ครบทั้งหมดทุกช่องก่อน');
            return;
        }

        const startDateTime = new Date(`${formatDate(startDate)}T${startTime}`);
        const endDateTime = new Date(`${formatDate(endDate)}T${endTime}`);
        const currentDateTime = new Date();

        if (isLate) {
            if (startDateTime > currentDateTime || endDateTime > currentDateTime) {
                alert('คำร้องย้อนหลังต้องเป็นวันที่และเวลาก่อนปัจจุบัน');
                return;
            }
        } else {
            // ตรวจสอบงานนอกสถานที่ (ไม่ต้องแจ้งเตือน)
            if (startDateTime >= endDateTime) {
                alert('วันที่และเวลาเริ่มต้น อยู่หลังจากวันที่และเวลาสิ้นสุด โปรดระบุใหม่ให้ถูกต้อง');
                return;
            }
        }

        const idemployees = localStorage.getItem('idemployees');
        if (!idemployees) {
            alert('ไม่พบข้อมูลรหัสพนักงานในระบบ');
            return;
        }

        const hasAttendanceOverlap = await checkAttendanceOverlap();
        if (hasAttendanceOverlap) {
            alert('ไม่สามารถส่งคำร้องได้ เนื่องจากชนกับช่วงเวลาที่ลงเวลาเข้างาน');
            return;
        }

        // ตรวจสอบการชนกับคำร้องลาที่อนุมัติแล้ว
        const hasLeaveOverlap = await checkLeaveOverlap();
        if (hasLeaveOverlap) {
            alert('ไม่สามารถส่งคำร้องได้ เนื่องจากชนกับช่วงเวลาที่ลางาน');
            return;
        }

        const leaveType = isLate ? "คำร้องย้อนหลัง" : "งานนอกสถานที่";

        const newLeaveRequest = {
            idemployees,
            leaveType,
            leaveLocation: JSON.stringify(userLocation),
            OffsitePlace,
            leaveStartDate: formatDate(startDate),
            leaveStartTime: startTime,
            leaveEndDate: formatDate(endDate),
            leaveEndTime: endTime,
            leaveDescription: description,
            leaveStatus: "รออนุมัติ"
        };

        console.log('Sending leave request:', newLeaveRequest);

        try {
            const response = await fetch(`${API_URL}/request-send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newLeaveRequest)
            });

            if (response.ok) {
                if (leaveType === "งานนอกสถานที่") {
                    const newJob = {
                        employeeId: idemployees,
                        jobID: "OUT01",
                        jobName: `งานนอกสถานที่ (${OffsitePlace})`,
                        jobDesc: description,
                        startDate: formatDate(startDate),
                        startTime,
                        endDate: formatDate(endDate),
                        endTime,
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        place_name: OffsitePlace
                    };

                    const jobResponse = await fetch(`${API_URL}/jobs`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newJob)
                    });

                    if (jobResponse.ok) {
                        alert("ส่งคำร้องและเพิ่มงานเรียบร้อย");
                        navigate('/checkin');
                    } else {
                        alert("ส่งคำร้องสำเร็จ แต่ไม่สามารถเพิ่มงานได้");
                    }
                } else {
                    // สำหรับคำร้องย้อนหลัง
                    alert("ส่งคำร้องเรียบร้อย");
                    navigate('/checkin');
                }
            } else {
                const errorData = await response.text();
                console.error('Error response:', errorData);
                alert("ไม่สามารถส่งคำร้องได้ โปรดลองอีกครั้ง");
            }
        } catch (error) {
            console.error('Error saving leave request:', error);
            alert("เกิดข้อผิดพลาดขณะส่งคำร้อง โปรดลองอีกครั้ง");
        }
    };

    const handleCancel = () => {
        navigate('/checkin');
    }

    const options = [
        { value: 'one', label: 'one' },
        { value: 'two', label: 'two' }
    ]

    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const [isLate, setIsLate] = useState(false);
    const [OffsitePlace, setOffsitePlace] = useState('');
    const [userLocation, setUserLocation] = useState(null);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const {latitude, longitude} = position.coords;
                    setUserLocation({latitude, longitude});
                },
                (error) => {
                    console.error('Error getting user location: ',error);
                }
            );
        }
        else {
            console.error('Geolocation is not supported by this browser');
        }
    }

    useEffect(() => {
        getUserLocation();
    }, []);
    /////

    const handleMarkerDrag = (event) => {
        const { lat, lng } = event.target.getLatLng();
        const newLocation = { latitude: lat, longitude: lng };

        setUserLocation(newLocation);
    };

    const isFormValid = OffsitePlace && startDate && startTime && endDate && endTime && description;

    return (
        <div　style={{ height: '100vh', paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>คำร้องปฏิบัติงานนอกสถานที่</h5>
            <div>                
                <p>เลือกพิกัด</p>
                {userLocation && (
                    <div>
                        <MapContainer
                            center={[userLocation.latitude, userLocation.longitude]}
                            zoom={13}
                            style={{ height: '400px', width: '75vw' }}
                        >
                            <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker 
                                position={[userLocation.latitude, userLocation.longitude]}
                                draggable={true}
                                eventHandlers={{ dragend: handleMarkerDrag }}
                            >
                                <Popup>
                                    คลิกลากหมุดนี้ เพื่อเลือกพิกัดที่ต้องการ <br />
                                    ละติจูด: {userLocation.latitude}, ลองจิจูด: {userLocation.longitude}
                                </Popup>
                            </Marker>
                            <SearchControl setUserLocation={setUserLocation} />
                        </MapContainer>
                    </div>
                )}
            </div>
            <div>
                <p>ชื่อสถานที่</p>
                <input
                    type="text"
                    className="form-control"
                    value={OffsitePlace}
                    onChange={(e) => setOffsitePlace(e.target.value)}
                    style={{ width: '330px' }}
                />
            </div>
            <div>
                <p>วันที่-เวลาเริ่มต้น</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <DatePicker
                        className="form-control"
                        selected={startDate}
                        onChange={(date) => setStartDate(date)} // Update the state on date selection
                        dateFormat="yyyy-MM-dd" // Optional: Customize the format
                        placeholderText="Select a start date" // Placeholder
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
                        onChange={(date) => setEndDate(date)} // Update the state on date selection
                        dateFormat="yyyy-MM-dd" // Optional: Customize the format
                        placeholderText="Select an end date" // Placeholder
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
                <p>ระบุสาเหตุ</p>
                <input
                    type="text"
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '330px' }}
                />
            </div>

            <label>
                    <input
                        type="checkbox"
                        name="late"
                        checked={isLate}
                        onChange={(e) => setIsLate(e.target.checked)}
                    />
                    คำร้องย้อนหลัง
                </label>

            <div style={{ paddingTop: '10px' }}>
                <button className="btn btn-success" onClick={handleCheckIn} disabled={!isFormValid}>ส่งคำร้อง</button>
                <button className="btn btn-danger" onClick={handleCancel}>ยกเลิก</button>
            </div>
        </div>
    );
}

export default Leave;
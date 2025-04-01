import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function UpdateMapCenter({ center }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

function Settings({ role }) {
    const API_URL = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();
    const [gpsRadius, setGpsRadius] = useState('');

    const manageEmployee = () => {
        navigate('/empdata');
    };

    const manageReport = () => {
        navigate('/managereport');
    };

    const manageLeaveDays = () => {
        navigate('/leavedays');
    };

    const handleHome = () => {
        navigate('/checkin');
    };

    const [jobLocation, setJobLocation] = useState({
        latitude: 13.76825599595529,
        longitude: 100.49368727500557
    })
    const [draggableLocation, setDraggableLocation] = useState(jobLocation);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGpsRadius = async () => {
            try {
                const response = await fetch(`${API_URL}/api/settings-fetch?jobID=OF01`);
                console.log('Response:', response);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Fetched GPS Radius:', data.gps_radius);
                console.log('Fetched Location:', data.location);

                setGpsRadius(data.gps_radius);

                console.log('Debugging data.location:', data.location);

                if (typeof data.location === 'string') {
                    try {
                        data.location = JSON.parse(data.location);
                        console.log('Parsed location:', data.location);
                    } catch (error) {
                        console.error('Error parsing location data:', error);
                        return;
                    }
                }

                if (data.location && typeof data.location === 'object') {
                    const { latitude, longitude } = data.location;

                    console.log('Latitude:', latitude);
                    console.log('Longitude:', longitude);

                    if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
                        setJobLocation({ latitude, longitude });
                        setDraggableLocation({ latitude, longitude });
                        console.log('Location set to:', latitude, longitude);
                    } else {
                        console.error('Invalid latitude or longitude:', { latitude, longitude });
                    }
                } else {
                    console.error('Invalid or missing location data:', data.location);
                }
            } catch (error) {
                console.error('Error fetching GPS radius:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGpsRadius();
    }, []);

    const handleSaveGpsRadius = async () => {
        if (!gpsRadius || gpsRadius <= 0) {
            alert('กรุณากรอกค่ารัศมี GPS ที่มากกว่า 0');
            return;
        }

        console.log('Saving GPS Radius and Location:', {
            gps_radius: gpsRadius,
            location: draggableLocation,
        });
    
        try {
            const response = await fetch(`${API_URL}/api/settings-update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ jobID: 'OF01', gps_radius: gpsRadius, location: draggableLocation }), // อัปเดตค่าใน database
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            alert('บันทึกค่ารัศมี GPS สำเร็จ');
        } catch (error) {
            console.error('Error saving GPS radius:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกค่ารัศมี GPS');
        }
    };

    const handleMarkerDragEnd = (event) => {
        const { lat, lng } = event.target.getLatLng();
        const newLocation = { latitude: lat, longitude: lng };
        console.log('New draggable location:', newLocation);
        setDraggableLocation(newLocation);
    };

    if (role !== 'HR' && role !== 'Admin') {
        return (
            <div>
                <p>ท่านไม่มีสิทธิ์เข้าถึงหน้านี้</p>
                <button className="btn btn-primary" onClick={handleHome}>กลับหน้าแรก</button>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>จัดการข้อมูล</h5>
            <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', gap: '157px' }}>
                <p>ข้อมูลพนักงาน</p>
                <button className="btn btn-primary" onClick={manageEmployee}>จัดการ</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', gap: '110px' }}>
                <p>รายงานผลการทำงาน</p>
                <button className="btn btn-primary" onClick={manageReport}>จัดการ</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', gap: '114px' }}>
                <p>จัดการวันลาพนักงาน</p>
                <button className="btn btn-primary" onClick={manageLeaveDays}>จัดการ</button>
            </div>
            <div style={{ marginTop: '20px' }}>
                <h6>ตั้งค่ารัศมี GPS</h6>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label htmlFor="gpsRadius">รัศมี (กม.):</label>
                    <input
                        id="gpsRadius"
                        type="number"
                        value={gpsRadius}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value >= 0) {
                                setGpsRadius(value);
                            } else {
                                alert('กรุณากรอกค่าที่มากกว่า 0');
                            }
                        }}
                        style={{ width: '100px' }}
                    />
                    <button className="btn btn-success" onClick={handleSaveGpsRadius}>บันทึก</button>
                </div>
                <div>
                    <MapContainer
                        center={[jobLocation.latitude, jobLocation.longitude]}
                        zoom={23}
                        style={{ height: '400px', width: '75vw' }}
                        key={jobLocation.latitude + jobLocation.longitude}
                    >
                        <UpdateMapCenter center={[jobLocation.latitude, jobLocation.longitude]} />
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker
                            position={[draggableLocation.latitude, draggableLocation.longitude]}
                            draggable={true}
                            eventHandlers={{
                                dragend: handleMarkerDragEnd,
                            }}
                        >
                            <Popup>ลากหมุดเพื่อเปลี่ยนตำแหน่ง</Popup>
                        </Marker>
                        <Circle
                            center={[draggableLocation.latitude, draggableLocation.longitude]}
                            radius={gpsRadius * 1000}
                            color="blue"
                        />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}

export default Settings;
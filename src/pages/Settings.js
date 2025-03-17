import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS
import L from 'leaflet';

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { useMap } from 'react-leaflet/hooks';
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

function Settings({ role }) {
    const [radius, setRadius] = useState("");
    const [userLocation, setUserLocation] = useState(null);
    const [idusers, setIdusers] = useState(null);

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

    // useEffect(() => {
    //     getUserLocation();
    // }, []);

    // useEffect(() => {
    //     const savedLocation = localStorage.getItem("requiredLocation");
    //     if (savedLocation) {
    //         setUserLocation(JSON.parse(savedLocation));
    //     } else {
    //         getUserLocation();
    //     }
    // }, []);

    // useEffect(() => {
    //     const savedRadius = localStorage.getItem("gpsRadius");
    //     if (savedRadius) {
    //         setRadius(savedRadius);
    //     }
    // }, []);

    // useEffect(() => {
    //     fetchSettings();
    // }, []);

    // useEffect(() => {
    //     const user = JSON.parse(localStorage.getItem('user')); // Retrieve user data from local storage
    //     console.log('Retrieved user from localStorage:', user);
    //     if (user && user.idusers) {
    //         console.log('User found:', user);
    //         setIdusers(user.idusers); // Set idusers from user data
    //     } else {
    //         console.error('No idusers found'); // Redirect to login page if user is not logged in
    //     }
    // }, []);

    useEffect(() => {
        const user = localStorage.getItem('user');
        console.log('Retrieved user from localStorage:', user);

        if (user) {
            try {
                const parsedUser = JSON.parse(user);
                console.log('Parsed user:', parsedUser);

                if (parsedUser && parsedUser.idusers) {
                    console.log('User found:', parsedUser);
                    setIdusers(parsedUser.idusers);
                } else {
                    console.error('No idusers found');
                }
            } catch (error) {
                console.error('Error parsing user JSON:', error);
            }
        } else {
            console.error('No user found in localStorage');
        }
    }, []);

    useEffect(() => {
        if (idusers) {
            console.log('Fetching settings for idusers:', idusers);
            fetchSettings(idusers); // Fetch settings with idusers
        }
    }, [idusers]);
    
    const fetchSettings = async (idusers) => {
        try {
            const response = await fetch(`http://localhost:3001/get-settings/${idusers}`);
            const data = await response.json();
            console.log('Settings fetched:', data);
            if (data) {
                setUserLocation({ latitude: data.latitude, longitude: data.longitude });
                setRadius(data.gps_radius);
            } else {
                console.error('Error fetching settings:', response.statusText);
                getUserLocation();
            }
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่า:', error);
            getUserLocation();
        }
    }
    const navigate = useNavigate();

    const handleSave = async () => {
        if (!userLocation || !radius) {
            alert("โปรดระบุค่ารัศมีสำหรับระบบ GPS");
            return;
        }

        const settings = {
            idusers: idusers,
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            radius: radius
        };

        try {
            const response = await fetch('http://localhost:3001/save-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                console.log('บันทึกการตั้งค่าเรียบร้อย');
                alert("บันทึกการตั้งค่าเรียบร้อย");
                navigate('/home2');
            } else {
                console.error('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
            }
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า:', error);
        }
        // localStorage.setItem('requiredLocation', JSON.stringify(userLocation));
        // console.log(localStorage.getItem('requiredLocation'));
        // alert("บันทึกค่าเรียบร้อย");
        // navigate('/home2');
    };

    const manageEmployee = () => {
        navigate('/empdata');
    }

    const manageReport = () => {
        navigate('/managereport');
    }
    
    const manageRoles = () => {
        navigate('/roles');
    }

    const handleHome = () => {
        navigate('/home2');
    }

    if (role !== 'HR' && role !== 'Admin') {
        return (
            <div>
                <p>ท่านไม่มีสิทธิ์เข้าถึงหน้านี้</p>
                <button className="btn btn-primary" onClick={handleHome}>กลับหน้าแรก</button>
            </div>
        )
    }

    const handleRadiusChange = (event) => {
        const newValue = event.target.value;
        if (/^\d*$/.test(newValue)) {
            setRadius(newValue);
            localStorage.setItem("gpsRadius", newValue);
        }
    };

    const handleMarkerDrag = (event) => {
        const { lat, lng } = event.target.getLatLng();
        const newLocation = { latitude: lat, longitude: lng };

        setUserLocation(newLocation);
        localStorage.setItem("requiredLocation", JSON.stringify(newLocation));
    };

    const useCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newLocation = { latitude, longitude };
    
                    setUserLocation(newLocation);
                    localStorage.setItem("requiredLocation", JSON.stringify(newLocation));
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
    //////

    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>ตั้งค่าระบบ</h5>
            <div style={{display: 'flex', alignItems: 'center', textAlign: 'center', gap: '157px'}}>
                <p>ข้อมูลพนักงาน</p>
                <button className="btn btn-primary" onClick={manageEmployee}>จัดการ</button>
            </div>
            <div style={{display: 'flex', alignItems: 'center', textAlign: 'center', gap: '110px'}}>
                <p>รายงานผลการทำงาน</p>
                <button className="btn btn-primary" onClick={manageReport}>จัดการ</button>
            </div>
            <div>
                <p>กำหนดพิกัดสำหรับลงเวลาเข้างาน (ลากหมุดบนแผนที่เพื่อเลือกพิกัดที่ต้องการ)</p>
                {userLocation && (
                    <div>
                        {/* <p>User Location</p>
                        <p>Latitude: {userLocation.latitude}</p>
                        <p>Longitude: {userLocation.longitude}</p> */}

                        <MapContainer
                            center={[userLocation.latitude, userLocation.longitude]}
                            zoom={13}
                            style={{ height: '400px', width: '75vw' }}
                            key={userLocation.latitude + userLocation.longitude}
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
                <button className="btn btn-danger" onClick={handleHome}>ยกเลิก</button>
            </div>
        </div>
    );
}

export default Settings;
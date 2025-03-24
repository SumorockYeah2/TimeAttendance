import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
});

function Home2() {
    const [userLocation, setUserLocation] = useState(null);
    const [isCheckedIn, setIsCheckedIn] = useState(false);

    const [isWithinRadius, setIsWithinRadius] = useState(false);
    
    const [showDropdown, setShowDropdown] = useState(false);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const {latitude, longitude} = position.coords;
                    setUserLocation({latitude, longitude});

                    const storedLocation = JSON.parse(localStorage.getItem('requiredLocation'));
                    const storedRadius = parseFloat(localStorage.getItem('gpsRadius')) || 0;
    
                    if (storedLocation && storedRadius) {
                        const distance = calculateDistance(latitude, longitude, storedLocation.latitude, storedLocation.longitude);
                        console.log(`User is ${distance.toFixed(2)} km away from the check-in location.`);
    
                        if (distance <= storedRadius) {
                            setIsWithinRadius(true);
                        } else {
                            setIsWithinRadius(false);
                        }
                    }
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

    const navigate = useNavigate();


    ////////
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const toRadians = (degree) => degree * (Math.PI / 180);
    
        const R = 6371; // Earth's radius in km
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    const handleCheckIn = () => {
        navigate('/checkin');
    };

    const handleRequest = () => {
        setShowDropdown(!showDropdown);
    }

    const handleCheckOut = () => {
        setIsCheckedIn(false);
        // localStorage.removeItem('isCheckedIn');
        navigate('/checkout');
    }

    useEffect(() => {
        getUserLocation();
        const checkInStatus = localStorage.getItem('isCheckedIn');
        if (checkInStatus === 'true') {
            setIsCheckedIn(true);
        }
    }, []);

    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            {/* <p>Here's the Location!</p>

            <button onClick={getUserLocation}>Get User Location</button> */}

            {userLocation && (
                <div>
                    {/* <p>User Location</p>
                    <p>Latitude: {userLocation.latitude}</p>
                    <p>Longitude: {userLocation.longitude}</p> */}

                    <MapContainer
                        center={[userLocation.latitude, userLocation.longitude]}
                        zoom={13}
                        style={{ height: '400px', width: '75vw' }}
                    >
                        <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={[userLocation.latitude, userLocation.longitude]}>
                            <Popup>
                                ท่านอยู่ที่นี่ <br />
                                ละติจูด: {userLocation.latitude}, ลองจิจูด: {userLocation.longitude}
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>
            )}

            <div style={{ paddingTop: '10px' }}>
                {isCheckedIn ? (
                    <button className="btn btn-success" onClick={handleCheckOut}>ลงเวลาออก</button>
                ) : (
                    <button className="btn btn-success" onClick={handleCheckIn}>ลงเวลาเข้า</button>
                )}
                <button className="btn btn-primary" onClick={handleRequest}>ทำคำร้อง</button>
                {showDropdown && (
                    <div className="dropdown-menu" style={{ display: 'block' }}>
                        <a className="dropdown-item" href="/leave">คำร้องลา</a>
                        <a className="dropdown-item" href="/offsite">คำร้องออกนอกสถานที่</a>
                    </div>
                )}
                {/* {!isCheckedIn && !isWithinRadius && <p style={{ color: 'red' }}>
                    ท่านไม่สามารถลงเวลาเข้างานได้ เนื่องจากไม่ได้อยู่ภายในรัศมีที่กำหนดไว้ในระบบ<br />กรุณาเดินทางเข้าใกล้สถานที่ตามพิกัดที่ได้รับมอบหมายแล้วลองอีกครั้ง
                </p>} */}
            </div>
        </div>
    );
}

export default Home2;
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
        navigate('/leave');
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
                        style={{ height: '400px', width: '100%' }}
                    >
                        <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={[userLocation.latitude, userLocation.longitude]}>
                            <Popup>
                                You are here! <br />
                                Latitude: {userLocation.latitude}, Longitude: {userLocation.longitude}
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>
            )}

            <div style={{ paddingTop: '10px' }}>
                {isCheckedIn ? (
                    <button className="btn btn-success" onClick={handleCheckOut}>Check-out</button>
                ) : (
                    <button className="btn btn-success" onClick={handleCheckIn} disabled={!isWithinRadius}>Check-in</button>
                )}
                <button className="btn btn-primary" onClick={handleRequest}>Request/Report</button>
                {!isWithinRadius && <p style={{ color: 'red' }}>
                    You are outside the allowed check-in area!<br />Please move closer to the required location.
                </p>}
            </div>
        </div>
    );
}

export default Home2;
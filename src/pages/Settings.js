import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS
import L from 'leaflet';

function Settings({ role }) {
    const [radius, setRadius] = useState("");
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

    // useEffect(() => {
    //     getUserLocation();
    // }, []);

    useEffect(() => {
        const savedLocation = localStorage.getItem("requiredLocation");
        if (savedLocation) {
            setUserLocation(JSON.parse(savedLocation));
        } else {
            getUserLocation();
        }
    }, []);

    useEffect(() => {
        const savedRadius = localStorage.getItem("gpsRadius");
        if (savedRadius) {
            setRadius(savedRadius);
        }
    }, []);

    const navigate = useNavigate();

    const handleSave = () => {
        localStorage.setItem('requiredLocation', JSON.stringify(userLocation));
        console.log(localStorage.getItem('requiredLocation'));
        alert("Settings saved!");
        navigate('/home2');
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
                <p>Access denied!</p>
                <button className="btn btn-primary" onClick={handleHome}>Home</button>
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
            <h5>Settings</h5>
            <div style={{display: 'flex', alignItems: 'center', textAlign: 'center', gap: '50px'}}>
                <p>Employee Data</p>
                <button className="btn btn-primary" onClick={manageEmployee}>Manage</button>
            </div>
            <div style={{display: 'flex', alignItems: 'center', textAlign: 'center', gap: '110px'}}>
                <p>Report</p>
                <button className="btn btn-primary" onClick={manageReport}>Manage</button>
            </div>
            <div>
                <p>Set Check-In Location (drag to choose location)</p>
                {userLocation && (
                    <div>
                        {/* <p>User Location</p>
                        <p>Latitude: {userLocation.latitude}</p>
                        <p>Longitude: {userLocation.longitude}</p> */}

                        <MapContainer
                            center={[userLocation.latitude, userLocation.longitude]}
                            zoom={13}
                            style={{ height: '400px', width: '100%' }}
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
                                Drag to set location <br />
                                Latitude: {userLocation.latitude}, Longitude: {userLocation.longitude}
                            </Popup>
                        </Marker>
                        </MapContainer>
                    </div>
                )}
                <button className="btn btn-info" onClick={useCurrentLocation}>Use Current Location</button>
            </div>

            <div>
                <p>GPS Radius (km)</p>
                <input
                    className="form-control"
                    type="text"
                    value={radius}
                    onChange={handleRadiusChange}
                />
            </div>

            <div style={{ paddingTop: '10px' }}>
                <button className="btn btn-success" onClick={handleSave}>Save</button>
                <button className="btn btn-danger" onClick={handleHome}>Cancel</button>
            </div>
        </div>
    );
}

export default Settings;
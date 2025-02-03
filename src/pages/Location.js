import React, {useState} from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
});

function Location() {
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
    return (
        <div>
            <p>Here's the Location!</p>

            <button onClick={getUserLocation}>Get User Location</button>

            {userLocation && (
                <div>
                    <p>User Location</p>
                    <p>Latitude: {userLocation.latitude}</p>
                    <p>Longitude: {userLocation.longitude}</p>

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
        </div>
    );
}

export default Location;
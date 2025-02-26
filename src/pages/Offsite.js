import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS
import L from 'leaflet';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
// });

function Leave() {
    const navigate = useNavigate();

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const handleCheckIn = () => {
        // console.log(userLocation, OffsitePlace, formatDate(startDate), startTime, formatDate(endDate), endTime, supervisor, description);

        if (!userLocation || !OffsitePlace || !startDate || !startTime || !endDate || !endTime || !supervisor || !description ) {
            alert('Please fill in all the fields!');
            return;
        }

        // localStorage.setItem('leaveLocation', JSON.stringify(userLocation));
        // localStorage.setItem('OffsitePlace', OffsitePlace);
        // localStorage.setItem('leaveStartDate', formatDate(startDate));
        // localStorage.setItem('leaveStartTime', startTime);
        // localStorage.setItem('leaveEndDate', formatDate(endDate));
        // localStorage.setItem('leaveEndTime', endTime);
        // localStorage.setItem('supervisor', supervisor);
        // localStorage.setItem('leaveDescription', description);
        // console.log(localStorage.getItem('leaveLocation'));
        // console.log(localStorage.getItem('OffsitePlace'));
        // console.log(localStorage.getItem('leaveStartDate'));
        // console.log(localStorage.getItem('leaveStartTime'));
        // console.log(localStorage.getItem('leaveEndDate'));
        // console.log(localStorage.getItem('leaveEndTime'));
        // console.log(localStorage.getItem('supervisor'));
        // console.log(localStorage.getItem('leaveDescription'));

        // const leaveType = "Off-site Work";
        // console.log(leaveType);

        // localStorage.setItem('leaveType', leaveType);
        // console.log(localStorage.getItem('leaveType'));
        // const leaveStatus = "Pending";
        // localStorage.setItem('leaveStatus', leaveStatus);
        
        const newLeaveRequest = {
            leaveType: "Off-site Work",
            leaveLocation: JSON.stringify(userLocation),
            OffsitePlace,
            leaveStartDate: formatDate(startDate),
            leaveStartTime: startTime,
            leaveEndDate: formatDate(endDate),
            leaveEndTime: endTime,
            supervisor,
            leaveDescription: description,
            leaveStatus: "Pending"
        };

        const existingRequests = JSON.parse(localStorage.getItem('leaveData')) || [];

        existingRequests.push(newLeaveRequest);

        localStorage.setItem('leaveData', JSON.stringify(existingRequests));

        alert("Check-in complete!");
        navigate('/home2'); // Navigate to /checkin
    };

    const handleCancel = () => {
        navigate('/home2');
    }

    const options = [
        { value: 'one', label: 'one' },
        { value: 'two', label: 'two' }
    ]
    const DefaultOption = options[0].value;
    const _onSelect = (selectedOption) => {
        console.log(selectedOption);
    };

    const [description, setDescription] = useState('');
    const [supervisor, setSupervisor] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const [OffsitePlace, setOffsitePlace] = useState('');

    //////location///
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

    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>Off-site Work Request</h5>
            <div>
                <p>Location</p>
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
            </div>
            <div>
                <p>Place</p>
                <input
                    type="text"
                    className="form-control"
                    value={OffsitePlace}
                    onChange={(e) => setOffsitePlace(e.target.value)}
                />
            </div>
            <div>
                <p>Start</p>
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
                />
            </div>
            
            <div>
                <p>End</p>
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
                />
            </div>
            <div>
                <p>Supervisor</p>
                <input
                    type="text"
                    className="form-control"
                    value={supervisor}
                    onChange={(e) => setSupervisor(e.target.value)}
                />
            </div>
            <div>
                <p>Description</p>
                <input
                    type="text"
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div style={{ paddingTop: '10px' }}>
                <button className="btn btn-success" onClick={handleCheckIn}>Send</button>
                <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
            </div>
        </div>
    );
}

export default Leave;
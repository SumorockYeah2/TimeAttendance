import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS
import L from 'leaflet';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import './css/Checkin.css'

import { FaImage } from 'react-icons/fa';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
});

function Checkin() {
    const [userLocation, setUserLocation] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [isFormCompleted, setIsFormCompleted] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [textInput, setTextInput] = useState("");

    const [isCheckedIn, setIsCheckedIn] = useState(false);

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

    const navigate = useNavigate();

    const handleCheckIn = () => {
        navigate('/checkin'); // Navigate to /checkin
    };

    useEffect(() => {
        getUserLocation();
        const checkInStatus = localStorage.getItem('isCheckedIn');
        if (checkInStatus === 'true') {
            setIsCheckedIn(true); // User is already checked in
        }
    }, []);

    ////////

    const options = [
        { value: 'one', label: 'one' },
        { value: 'two', label: 'two' }
    ]
    const DefaultOption = options[0].value;
    const _onSelect = (selectedOption) => {
        console.log(selectedOption);
        setSelectedOption(selectedOption.value);
    };
    
    ////////
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('Selected file:', file);
            const fileURL = URL.createObjectURL(file); 

            localStorage.setItem('uploadedFilePath', fileURL);
            setSelectedFile(file);
            setFileName(file.name);
        } else {
            localStorage.setItem('uploadedFilePath');
            setSelectedFile(null); 
            setFileName("");
        }
    };

    ////////
    const handleSave = () => {
        console.log(selectedOption, textInput, userLocation);
        if (selectedOption && textInput.trim() !== "") {
            setIsFormCompleted(true);
            localStorage.setItem('isCheckedIn', 'true');

            const currentDateTime = new Date().toISOString(); 
            console.log(currentDateTime);

            localStorage.setItem('userLocation', JSON.stringify(userLocation));
            localStorage.setItem('selectedOption', selectedOption);
            localStorage.setItem('textInput', textInput);
            localStorage.setItem('checkInDateTime', currentDateTime);
            console.log(localStorage.getItem('userLocation'));
            console.log(localStorage.getItem('selectedOption'));
            console.log(localStorage.getItem('textInput'));
            console.log(localStorage.getItem('checkInDateTime'));


            const checkOutDateTime = "Pending"; 
            console.log(checkOutDateTime);

            localStorage.setItem('checkOutDateTime', checkOutDateTime);

            const uploadedFilePath = selectedFile ? URL.createObjectURL(selectedFile) : null; // Use state value
            localStorage.setItem('uploadedFilePath', uploadedFilePath); // Update localStorage here
            console.log(localStorage.getItem('uploadedFilePath'));
            
            const checkInData = {
                userLocation,
                selectedOption,
                textInput,
                checkInDateTime: currentDateTime,
                checkOutDateTime: "Pending",
                uploadedFilePath: uploadedFilePath
            }
            console.log(checkInData);

            const event = new Event('checkInStatusChanged');
            window.dispatchEvent(event);

            alert("Check-in complete!");
            navigate('/home2');
        } else {
            alert("Please fill in all the fields!");
        }
    }

    const handleCancel = () => {
        navigate('/home2');
    }

    const handleCheckOut = () => {
        navigate('/checkout');
    }

    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>Check-in</h5>

            {isCheckedIn ? (
                <div>
                    <p>You have already checked in. Please check out first before you check in again.</p>
                    <button className="btn btn-success" onClick={handleCheckOut}>Check-out</button>
                    <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
                </div>
            ) : (
                <div>
                    <Dropdown 
                        className="dropdown"
                        options={options}
                        onChange={_onSelect}
                        value={selectedOption || ""}
                        placeholder="Select a job"
                    />

                    {userLocation && (
                        <div style={{ paddingTop: '10px' }}>
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

                    <input
                        type="text"
                        className="form-control"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Enter details"
                    />
                    <div>
                        <button className="btn btn-outline-primary" onClick={() => document.getElementById('file-upload').click()}>
                            <FaImage />
                        </button>
                        <span className="file-name">
                            {fileName ? fileName : "No file selected"}
                        </span>
                        <input
                            type="file"
                            id="file-upload"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>
                    <div>
                        <button className="btn btn-success" onClick={handleSave}>Check-in</button>
                        <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
                    </div>
                </div>
            )}

            <style>
                {`
                    .file-name {
                        margin-left: 10px;
                        max-width: 150px;
                        text-overflow: ellipsis;
                    }
                `}
            </style>
        </div>
    );
}

export default Checkin;
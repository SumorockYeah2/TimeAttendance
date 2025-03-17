import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS
import L from 'leaflet';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import './css/Checkin.css';
import { FaImage } from 'react-icons/fa';
import moment from 'moment-timezone';

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
    const [isWithinRadius, setIsWithinRadius] = useState(false);
    const [jobOptions, setJobOptions] = useState([]);
    const [jobDetails, setJobDetails] = useState({});

    const navigate = useNavigate();
    const idemployees = localStorage.getItem('idemployees');

    useEffect(() => {
        getUserLocation();
        const checkInStatus = localStorage.getItem('isCheckedIn');
        if (checkInStatus === 'true') {
            setIsCheckedIn(true); // User is already checked in
        }
    }, []);

    useEffect(() => {
        fetch(`http://localhost:3001/get-assigned-jobs/${idemployees}`)
        //   .then(response => response.json())
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
          .then(data => {
            console.log('Fetched jobs:', data);
            const formattedOptions = data.map(job => ({
                value: job.jobname,
                label: job.jobname
            }));
            setJobOptions(formattedOptions);
        })
        .catch(error => console.error('Error fetching jobs:', error));
    }, [idemployees]);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ latitude, longitude });

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
                    console.error('Error getting user location: ', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser');
        }
    };

    const _onSelect = (selectedOption) => {
        console.log(selectedOption);
        setSelectedOption(selectedOption.value);
        setJobDetails({
            latitude: selectedOption.latitude,
            longitude: selectedOption.longitude,
            radius: selectedOption.radius
        });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('Selected file:', file);
            const fileURL = URL.createObjectURL(file);

            localStorage.setItem('uploadedFilePath', fileURL);
            setSelectedFile(file);
            setFileName(file.name);
        } else {
            localStorage.removeItem('uploadedFilePath');
            setSelectedFile(null);
            setFileName("");
        }
    };

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

    const handleSave = async () => {
        console.log(selectedOption, textInput, userLocation);
        if (selectedOption && textInput.trim() !== "") {
            setIsFormCompleted(true);
            localStorage.setItem('isCheckedIn', 'true');

            // const currentDateTime = new Date().toISOString();
            const currentDateTime = moment().tz('Asia/Bangkok').format();
            console.log(currentDateTime)

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
            };
            console.log(checkInData);

            try {
                const response = await fetch('http://localhost:3001/checkin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(checkInData)
                });

                console.log(response);
                
                if (response.ok) {
                    const event = new Event('checkInStatusChanged');
                    window.dispatchEvent(event);

                    alert("ลงเวลาเข้างานเรียบร้อย");
                    navigate('/home2');
                } else {
                    alert("Failed to save check-in data. Please try again.");
                }
            }
            catch (error) {
                console.error('Error saving check-in data:', error);
                alert("Failed to save check-in data. Please try again.");
            }
        } else {
            alert("โปรดระบุงานและรายละเอียดการปฏิบัติงาน");
        }
    };

    const handleCancel = () => {
        navigate('/home2');
    };

    const handleCheckOut = () => {
        navigate('/checkout');
    };

    return (
        <div style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>ลงเวลาเข้างาน</h5>

            {isCheckedIn ? (
                <div>
                    <p>ท่านได้ทำการลงเวลาเข้างานไปแล้ว กรุณาลงเวลาออกก่อนหากต้องการลงเวลาเข้างานใหม่อีกครั้ง.</p>
                    <button className="btn btn-success" onClick={handleCheckOut}>ลงเวลาออก</button>
                    <button className="btn btn-danger" onClick={handleCancel}>ยกเลิก</button>
                </div>
            ) : (
                <div>
                    <Dropdown
                        className="dropdown"
                        options={jobOptions}
                        onChange={_onSelect}
                        value={selectedOption || ""}
                        placeholder="โปรดระบุงาน"
                        style={{ width: '330px' }}
                    />

                    {userLocation && (
                        <div style={{ paddingTop: '10px' }}>
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

                    <input
                        type="text"
                        className="form-control"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="ระบุรายละเอียด"
                    />
                    <div>
                        <button className="btn btn-outline-primary" onClick={() => document.getElementById('file-upload').click()}>
                            <FaImage />
                        </button>
                        <span className="file-name">
                            {fileName ? fileName : "แนบไฟล์รูปภาพ"}
                        </span>
                        <input
                            type="file"
                            id="file-upload"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>
                    <div>
                        <button className="btn btn-success" onClick={handleSave} disabled={!isWithinRadius}>ลงเวลาเข้า</button>
                        <button className="btn btn-danger" onClick={handleCancel}>ยกเลิก</button>
                        {!isWithinRadius && <p style={{ color: 'red' }}>
                        ท่านไม่สามารถลงเวลาเข้างานได้ เนื่องจากไม่ได้อยู่ภายในรัศมีที่กำหนดไว้ในระบบ<br />กรุณาเดินทางเข้าใกล้สถานที่ตามพิกัดที่ได้รับมอบหมายแล้วลองอีกครั้ง
                        </p>}
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
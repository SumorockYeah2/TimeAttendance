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
    const API_URL = process.env.REACT_APP_API_URL;
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
    const [place_name, setPlaceName] = useState("");

    const navigate = useNavigate();
    const idemployees = localStorage.getItem('idemployees');

    useEffect(() => {
        getUserLocation();
        const checkInStatus = localStorage.getItem('isCheckedIn');
        if (checkInStatus === 'true') {
            setIsCheckedIn(true); // User is already checked in
        }
    }, []);

    const checkLeaveOverlap = async () => {
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
        } catch (error) {
            console.error('Error checking leave overlap:', error);
            return false;
        }
    };

    const fetchGpsRadius = async () => {
        try {
            const response = await fetch(`${API_URL}/api/settings-fetch?jobID=OF01`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.gps_radius; // Return the GPS radius
        } catch (error) {
            console.error('Error fetching GPS radius:', error);
            return 0.3; // Default value in case of error
        }
    };
    
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const gpsRadius = await fetchGpsRadius(); // ดึงค่ารัศมี GPS จาก settings
    
                const response = await fetch(`${API_URL}/get-assigned-jobs/${idemployees}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('Filtered jobs from backend:', data);
    
                const filteredJobs = data.filter(job => job.isCheckedOut !== 1);
    
                const formattedOptions = filteredJobs.map(job => ({
                    value: job.jobname,
                    label: job.jobname,
                    latitude: job.latitude,
                    longitude: job.longitude,
                    radius: job.gps_radius,
                    place_name: job.place_name
                }));
    
                const officeOption = {
                    value: "เข้างานออฟฟิศ",
                    label: "เข้างานออฟฟิศ",
                    latitude: 13.76825599595529,
                    longitude: 100.49368727500557,
                    radius: gpsRadius, // ใช้ค่าที่ดึงมาจาก settings
                    place_name: "สถาบันอาหาร",
                    start_time: "08:30",
                    end_time: "17:30"
                };
    
                setJobOptions([officeOption, ...formattedOptions]);
            } catch (error) {
                console.error('Error fetching jobs:', error);
            }
        };
    
        fetchJobs();
    }, [idemployees]);

    const getUserLocation = () => {
        console.log("Wee!");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ latitude, longitude });
                    const distance = calculateDistance(latitude, longitude, jobDetails.latitude, jobDetails.longitude);
                    console.log("latitude: ", latitude);
                    console.log("longitude: ", longitude);
                    console.log("jobDetails.latitude: ", jobDetails.latitude);
                    console.log("jobDetails.longitude: ", jobDetails.longitude);
                    console.log(`User is ${distance.toFixed(2)} km away from the check-in location.`);

                    if (distance <= jobDetails.radius) {
                        setIsWithinRadius(true);
                    } else {
                        setIsWithinRadius(false);
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

    useEffect(() => {
        if (userLocation && jobDetails.latitude && jobDetails.longitude && jobDetails.radius) {
            const distance = calculateDistance(userLocation.latitude, userLocation.longitude, jobDetails.latitude, jobDetails.longitude);
            console.log("latitude: ", userLocation.latitude);
            console.log("longitude: ", userLocation.longitude);
            console.log("jobDetails.latitude: ", jobDetails.latitude);
            console.log("jobDetails.longitude: ", jobDetails.longitude);
            console.log(`User is ${distance.toFixed(2)} km away from the check-in location.`);
    
            if (distance <= jobDetails.radius) {
                setIsWithinRadius(true);
            } else {
                setIsWithinRadius(false);
            }
        }
    }, [userLocation, jobDetails]);

    const _onSelect = (selectedOption) => {
        console.log(selectedOption);
        setSelectedOption(selectedOption.value);
        const selectedJob = jobOptions.find(job => job.value === selectedOption.value);
        console.log("selectedJob:", selectedJob);
        setJobDetails({
            latitude: selectedJob.latitude,
            longitude: selectedJob.longitude,
            radius: selectedJob.radius,
            place_name: selectedJob.place_name
        });
        setPlaceName(selectedJob.place_name);
        console.log(jobDetails);
    };

    useEffect(() => {
        console.log("Updated jobDetails:", jobDetails);
    }, [jobDetails]);

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
        const hasLeaveOverlap = await checkLeaveOverlap();
        if (hasLeaveOverlap) {
            alert("ไม่สามารถลงเวลาเข้างานได้ เนื่องจากเวลาชนกับช่วงเวลาที่ลางาน");
            return;
        }
    
        if (selectedOption) {
            const skipRadiusCheck = selectedOption.startsWith("งานนอกสถานที่");

            if (!skipRadiusCheck && !isWithinRadius) {
                alert("ท่านไม่สามารถลงเวลาเข้างานได้ เนื่องจากไม่ได้อยู่ภายในรัศมีที่กำหนดไว้ในระบบ");
                return;
            }

            setIsFormCompleted(true);
            localStorage.setItem('isCheckedIn', 'true');

            const currentDateTime = moment().tz('Asia/Bangkok').format();
            console.log(currentDateTime)

            localStorage.setItem('userLocation', JSON.stringify(userLocation));
            localStorage.setItem('selectedOption', selectedOption);
            localStorage.setItem('textInput', textInput);
            localStorage.setItem('checkInDateTime', currentDateTime);

            const checkOutDateTime = "Pending";
            localStorage.setItem('checkOutDateTime', checkOutDateTime);

            let uploadedFilePath = null;

            // อัปโหลดไฟล์ภาพ
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                try {
                    const uploadResponse = await fetch(`${API_URL}/upload`, {
                        method: 'POST',
                        body: formData,
                        mode: 'cors',
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (uploadResponse.ok) {
                        const uploadData = await uploadResponse.json();
                        uploadedFilePath = uploadData.filePath; // Path ของไฟล์ที่อัปโหลด
                    } else {
                        alert("ไม่สามารถอัปโหลดไฟล์ได้ กรุณาลองอีกครั้ง");
                        return;
                    }
                } catch (error) {
                    console.error('Error uploading file:', error);
                    alert("ไม่สามารถอัปโหลดไฟล์ได้ กรุณาลองอีกครั้ง");
                    return;
                }
            }

            let place_name = "";
            if (selectedOption === "เข้างานออฟฟิศ") {
                place_name = "สถาบันอาหาร";
            } else if (selectedOption === "เวลาพิเศษ") {
                place_name = jobDetails.place_name || "สถาบันอาหาร"; // ใช้ค่า place_name จาก jobDetails หรือกำหนดค่าเริ่มต้น
            } else if (selectedOption.startsWith("งานนอกสถานที่")) {
                place_name = jobDetails.place_name || "";
            }

            if (!place_name) {
                alert("ไม่สามารถระบุสถานที่ได้ กรุณาลองใหม่อีกครั้ง");
                return;
            }

            const checkInData = {
                idemployees,
                userLocation,
                place_name,
                selectedOption,
                textInput,
                checkInDateTime: currentDateTime,
                checkOutDateTime: "Pending",
                uploadedFilePath: uploadedFilePath
            };
            console.log(checkInData);

            try {
                const response = await fetch(`${API_URL}/checkin`, {
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
                } else {
                    alert("ไม่สามารถบันทึกเวลาเข้างานได้ กรุณาลองอีกครั้ง");
                }
            }
            catch (error) {
                console.error('Error saving check-in data:', error);
                alert("ไม่สามารถบันทึกเวลาเข้างานได้ กรุณาลองอีกครั้ง");
            }
        } else {
            alert("โปรดระบุงานก่อน");
        }
    };

    return (
        <div style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>ลงเวลาเข้างาน</h5>
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
                        <button className="btn btn-success" onClick={handleSave} disabled={!selectedOption || (!selectedOption.startsWith("งานนอกสถานที่") && !isWithinRadius)}>ลงเวลาเข้า</button>
                        {!isWithinRadius && selectedOption && !selectedOption.startsWith("งานนอกสถานที่") && (<p style={{ color: 'red' }}>
                            ท่านไม่สามารถลงเวลาเข้างานได้ เนื่องจากไม่ได้อยู่ภายในรัศมีที่กำหนดไว้ในระบบ<br />กรุณาเดินทางเข้าใกล้สถานที่ตามพิกัดที่ได้รับมอบหมายแล้วลองอีกครั้ง
                        </p>)}
                    </div>
                </div>
             {/* )} */}

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
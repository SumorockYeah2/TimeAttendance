import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS
import L from 'leaflet';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { useMap } from 'react-leaflet/hooks';
import 'leaflet-geosearch/dist/geosearch.css';
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
// });
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

function Leave() {
    const navigate = useNavigate();

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const handleCheckIn = async () => {
        // console.log(userLocation, OffsitePlace, formatDate(startDate), startTime, formatDate(endDate), endTime, supervisor, description);

        if (!userLocation || !OffsitePlace || !startDate || !startTime || !endDate || !endTime || !description ) {
            alert('โปรดกรอกข้อมูลให้ครบทั้งหมดทุกช่องก่อน');
            return;
        }

        const startDateTime = new Date(`${formatDate(startDate)}T${startTime}`);
        const endDateTime = new Date(`${formatDate(endDate)}T${endTime}`);

        if (startDateTime >= endDateTime) {
            alert('วันที่-เวลาเริ่มต้นเป็นวันที่-เวลาซึ่งอยู่หลังจากวันที่-เวลาสิ้นสุด โปรดระบุใหม่ให้ถูกต้อง');
            return;
        }

        const newLeaveRequest = {
            leaveType: "งานนอกสถานที่",
            leaveLocation: JSON.stringify(userLocation),
            OffsitePlace,
            leaveStartDate: formatDate(startDate),
            leaveStartTime: startTime,
            leaveEndDate: formatDate(endDate),
            leaveEndTime: endTime,
            // supervisor,
            leaveDescription: description,
            leaveStatus: "รออนุมัติ"
        };

        console.log('Sending leave request:', newLeaveRequest);

        try {
            const response = await fetch('http://localhost:3001/request-send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newLeaveRequest)
            });
    
            console.log('Response status:', response.status);
            console.log('Response status text:', response.statusText);

            if (response.ok) {
                alert("ทำคำร้องเรียบร้อย");
                navigate('/home2');
            } else {
                const errorData = await response.text();
                console.error('Error response:', errorData);
                alert("Failed to save leave request. Please try again.");
            }
        } catch (error) {
            console.error('Error saving leave request:', error);
            alert("Failed to save leave request. Please try again.");
        }
        // const existingRequests = JSON.parse(localStorage.getItem('leaveData')) || [];

        // existingRequests.push(newLeaveRequest);

        // localStorage.setItem('leaveData', JSON.stringify(existingRequests));

        // alert("ทำคำร้องเรียบร้อย");
        // navigate('/home2'); // Navigate to /checkin
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

    const handleMarkerDrag = (event) => {
        const { lat, lng } = event.target.getLatLng();
        const newLocation = { latitude: lat, longitude: lng };

        setUserLocation(newLocation);
    };

    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>ทำคำร้องออกนอกสถานที่</h5>
            <div>
                <p>เลือกพิกัด</p>
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
            </div>
            <div>
                <p>ชื่อสถานที่</p>
                <input
                    type="text"
                    className="form-control"
                    value={OffsitePlace}
                    onChange={(e) => setOffsitePlace(e.target.value)}
                    style={{ width: '330px' }}
                />
            </div>
            <div>
                <p>วันที่-เวลาเริ่มต้น</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                        style={{ width: '120px' }}
                    />
                </div>
            </div>
            
            <div>
                <p>วันที่-เวลาสิ้นสุด</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                        style={{ width: '120px' }}
                    />
                </div>
            </div>
            {/* <div>
                <p>หัวหน้า</p>
                <input
                    type="text"
                    className="form-control"
                    value={supervisor}
                    onChange={(e) => setSupervisor(e.target.value)}
                    style={{ width: '330px' }}
                />
            </div> */}
            <div>
                <p>ระบุสาเหตุ</p>
                <input
                    type="text"
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '330px' }}
                />
            </div>

            <div style={{ paddingTop: '10px' }}>
                <button className="btn btn-success" onClick={handleCheckIn}>ส่งคำร้อง</button>
                <button className="btn btn-danger" onClick={handleCancel}>ยกเลิก</button>
            </div>
        </div>
    );
}

export default Leave;
import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
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

function Leave() {
    const [type, setType] = useState(null);
    // const [supervisor, setSupervisor] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [description, setDescription] = useState('');

    const [selectedOption, setSelectedOption] = useState(null);
    const [offsitePlace, setOffsitePlace] = useState('');
    const [userLocation, setUserLocation] = useState(null);

    const navigate = useNavigate();

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const handleSend = async () => {
        console.log(type, formatDate(startDate), startTime, formatDate(endDate), endTime, description);

        if (!type || !startDate || !startTime || !endDate || !endTime) {
            alert('โปรดกรอกข้อมูลให้ครบทั้งหมดทุกช่องก่อน');
            return;
        }

        const startDateTime = new Date(`${formatDate(startDate)}T${startTime}`);
        const endDateTime = new Date(`${formatDate(endDate)}T${endTime}`);

        if (startDateTime >= endDateTime) {
            alert('วันที่-เวลาเริ่มต้นเป็นวันที่-เวลาซึ่งอยู่หลังจากวันที่-เวลาสิ้นสุด โปรดระบุใหม่ให้ถูกต้อง');
            return;
        }
        
        let leaveTypeText = '';
        switch (type) {
            case 'absence':
                leaveTypeText = 'ลากิจ';
                break;
            case 'sick':
                leaveTypeText = 'ลาป่วย';
                break;
            case 'vacation':
                leaveTypeText = 'ลาพักร้อน';
                break;
            case 'emergency':
                leaveTypeText = 'คำร้องย้อนหลัง';
                break;
        }
        
        const idemployees = localStorage.getItem('idemployees');
        if (!idemployees) {
            alert('ไม่พบข้อมูลรหัสพนักงานในระบบ');
            return;
        }

        const leaveRequest = {
            idemployees,
            leaveType: leaveTypeText,
            leaveStartDate: formatDate(startDate),
            leaveStartTime: startTime,
            leaveEndDate: formatDate(endDate),
            leaveEndTime: endTime,
            leaveDescription: description,
            // supervisor,
            leaveLocation: type === 'emergency' ? JSON.stringify(userLocation) : '-',
            OffsitePlace: type === 'emergency' ? offsitePlace : '-',
            leaveStatus: "รออนุมัติ"
        }

        const leaveData = JSON.parse(localStorage.getItem('leaveData')) || [];
        leaveData.push(leaveRequest);
        localStorage.setItem('leaveData', JSON.stringify(leaveData));

        try {
            const response = await fetch('http://localhost:3001/request-send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(leaveRequest)
            });

            console.log(response);

            if (response.ok) {
                alert("ทำคำร้องเรียบร้อย");
                navigate('/checkin');
            } else {
                const errorData = await response.text();
                console.error('Error response:', errorData);
                alert("Failed to save leave request. Please try again.");
            }
        }
        catch (error) {
            console.error('Error saving leave request:', error);
            alert("Failed to save leave request. Please try again.");
        }

        // console.log('leaveData after saving:', localStorage.getItem('leaveData'));

        // alert("ทำคำร้องเรียบร้อย");
        // navigate('/home2');
    }

    const handleCancel = () => {
        navigate('/checkin');
    }

    const options = [
        { value: 'absence', label: 'ลากิจ' },
        { value: 'sick', label: 'ลาป่วย' },
        { value: 'vacation', label: 'ลาพักร้อน' },
        { value: 'emergency', label: 'คำร้องย้อนหลัง' }
    ]
    const DefaultOption = options[0].value;
    const _onSelect = (selectedOption) => {
        console.log(selectedOption);
        setSelectedOption(selectedOption.value);
        setType(selectedOption.value);
    };

    const leaveBalance = 5;

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ latitude, longitude });
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
        if (type === 'emergency') {
            getUserLocation();
        }
    }, [type]);

    const handleMarkerDrag = (event) => {
        const { lat, lng } = event.target.getLatLng();
        const newLocation = { latitude: lat, longitude: lng };

        setUserLocation(newLocation);
    };

    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>ทำคำร้องลา</h5>
            <div>
                <p>ประเภทการลา</p>
                <Dropdown 
                    options={options}
                    onChange={_onSelect}
                    value={type || ""}
                    placeholder="โปรดเลือก"
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

            <div>
                <p>ยอดการลาคงเหลือ</p>
                <input
                    type="text"
                    className="form-control"
                    value={leaveBalance}
                    disabled
                    style={{ width: '330px' }}
                />
            </div>

            {type === 'emergency' && (
                <>
                    <div>
                        <p>เลือกพิกัด</p>
                        {userLocation && (
                            <div>
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
                            value={offsitePlace}
                            onChange={(e) => setOffsitePlace(e.target.value)}
                            style={{ width: '330px' }}
                        />
                    </div>
                </>
            )}

            <div style={{ paddingTop: '10px' }}>
                <button className="btn btn-success" onClick={handleSend}>ส่งคำร้อง</button>
                <button className="btn btn-danger" onClick={handleCancel}>ยกเลิก</button>
            </div>
        </div>
    );
}

export default Leave;
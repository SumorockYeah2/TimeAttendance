import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

function Leave() {
    const API_URL = process.env.REACT_APP_API_URL;
    const [type, setType] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [description, setDescription] = useState('');
    const [leaveBalance, setLeaveBalance] = useState({ absence: 0, sick: 0, vacation: 0 });
    const [holidays, setHolidays] = useState([]);

    useEffect(() => {
        const fetchLeaveBalance = async () => {
            const idemployees = localStorage.getItem('idemployees');
            if (!idemployees) {
                alert('ไม่พบข้อมูลรหัสพนักงานในระบบ');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/leave-balance/${idemployees}`);
                if (response.ok) {
                    const data = await response.json(); // ดึงข้อมูล JSON จาก response
                    setLeaveBalance({
                        absence: data.absence_hrs / 8,
                        sick: data.sick_hrs / 8,
                        vacation: data.vacation_hrs / 8
                    });
                } else {
                    console.error('Failed to fetch leave balance');
                }
            } catch (error) {
                console.error('Error fetching leave balance', error);
            }
        };

        fetchLeaveBalance();
    }, []);


    useEffect(() => {
        const fetchHolidays = async () => {
            const API_KEY = 'AIzaSyDox1fRNODZVo8U3Pv9LU41l-0nzmK-E2c'; // ใส่ Google API Key ของคุณที่นี่
            const CALENDAR_ID = 'th.th#holiday@group.v.calendar.google.com';
            const BASE_URL = `https://www.googleapis.com/calendar/v3/calendars/th.th%23holiday@group.v.calendar.google.com/events`;
    
            try {
                const params = new URLSearchParams({
                    key: API_KEY,
                    singleEvents: true,
                    orderBy: 'startTime',
                });
    
                const response = await fetch(`${BASE_URL}?${params}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched holidays from Google Calendar:', data.items); // Log ข้อมูลวันหยุด
                    
                    const filteredHolidays = data.items.filter(
                        (holiday) => holiday.description === "วันหยุดนักขัตฤกษ์"
                    );
    
                    console.log('Filtered holidays (วันหยุดนักขัตฤกษ์ only):', filteredHolidays);
                    setHolidays(filteredHolidays || []);
                } else {
                    console.error('Failed to fetch holidays from Google Calendar');
                }
            } catch (error) {
                console.error('Error fetching holidays from Google Calendar:', error);
            }
        };
    
        fetchHolidays();
    }, []);

    const navigate = useNavigate();

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const formatToGMT7 = (date) => {
        return date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
    };

    const combineDateAndTime = (date, time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const combined = new Date(date);
        combined.setHours(hours, minutes, 0, 0); // ตั้งค่าเวลาเป็น Local Time

        // ชดเชย Timezone สำหรับ GMT+7
        const timezoneOffset = 7 * 60; // GMT+7 ในหน่วยนาที
        combined.setMinutes(combined.getMinutes() + timezoneOffset);

        return combined;
    };

    const handleSend = async () => {
        console.log(type, formatDate(startDate), startTime, formatDate(endDate), endTime, description);

        if (!type || !startDate || !startTime || !endDate || !endTime) {
            alert('โปรดกรอกข้อมูลให้ครบทั้งหมดทุกช่องก่อน');
            return;
        }

        const startDateTime = combineDateAndTime(startDate, startTime);
        const endDateTime = combineDateAndTime(endDate, endTime);

        console.log('Start DateTime (Local):', startDateTime);
        console.log('End DateTime (Local):', endDateTime);

        if (startDateTime >= endDateTime) {
            alert('วันที่-เวลาเริ่มต้นเป็นวันที่-เวลาซึ่งอยู่หลังจากวันที่-เวลาสิ้นสุด โปรดระบุใหม่ให้ถูกต้อง');
            return;
        }

        const leaveDurationInMs = endDateTime - startDateTime;
        const leaveDurationInDays = leaveDurationInMs / (1000 * 60 * 60 * 24);

        if (
            (type === 'absence' && leaveDurationInDays > leaveBalance.absence) ||
            (type === 'sick' && leaveDurationInDays > leaveBalance.sick) ||
            (type === 'vacation' && leaveDurationInDays > leaveBalance.vacation)
        ) {
            alert('จำนวนวันลาที่ขอเกินจำนวนวันลาคงเหลือ');
            return;
        }    

        const idemployees = localStorage.getItem('idemployees');
        if (!idemployees) {
            alert('ไม่พบข้อมูลรหัสพนักงานในระบบ');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/check-leave-overlap`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idemployees,
                    startDateTime: startDateTime.toISOString(),
                    endDateTime: endDateTime.toISOString(),
                }),
            });
    
            console.log('Checking overlap with:', {
                idemployees,
                startDateTime: startDateTime.toISOString(),
                endDateTime: endDateTime.toISOString(),
            });
            const result = await response.json();
            if (!response.ok) {
                alert(result.message || 'เกิดข้อผิดพลาดในการตรวจสอบช่วงเวลา');
                return;
            }
    
            // if (result.overlap) {
            //     alert('ช่วงเวลาที่คุณต้องการลาชนกับช่วงเวลาที่มีการลงเวลาเข้างานแล้ว');
            //     return;
            // }
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการตรวจสอบช่วงเวลา');
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
        }

        const leaveRequest = {
            idemployees,
            leaveType: leaveTypeText,
            leaveStartDate: formatDate(startDate),
            leaveStartTime: startTime,
            leaveEndDate: formatDate(endDate),
            leaveEndTime: endTime,
            leaveDescription: description,
            leaveStatus: "รออนุมัติ"
        }

        try {
            const response = await fetch(`${API_URL}/request-send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(leaveRequest)
            });

            if (response.ok) {
                alert("ทำคำร้องเรียบร้อย");
                navigate('/checkin');
            } else {
                const errorData = await response.text();
                console.error('Error response:', errorData);
                alert("ไม่สามารถส่งคำร้องลาได้ กรุณาลองอีกครั้ง");
            }
        }
        catch (error) {
            console.error('Error saving leave request:', error);
            alert("ไม่สามารถส่งคำร้องลาได้ กรุณาลองอีกครั้ง");
        }
    }

    const handleCancel = () => {
        navigate('/checkin');
    }

    const options = [
        { value: 'absence', label: 'ลากิจ' },
        { value: 'sick', label: 'ลาป่วย' },
        { value: 'vacation', label: 'ลาพักร้อน' },
    ]

    const _onSelect = (selectedOption) => {
        console.log('Selected type:', selectedOption.value); // ตรวจสอบค่า type
        setType(selectedOption.value);
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
                <p>ยอดวันลาคงเหลือ</p>
                <input
                    type="text"
                    className="form-control"
                    value={
                        type === 'absence'
                            ? leaveBalance.absence.toFixed(2) + 'วัน'
                            : type === 'sick'
                            ? leaveBalance.sick.toFixed(2) + 'วัน'
                            : type === 'vacation'
                            ? leaveBalance.vacation.toFixed(2) + 'วัน'
                            : ''
                    }
                    disabled
                    style={{ width: '330px' }}
                />
            </div>

            <div style={{ paddingTop: '10px' }}>
                <button className="btn btn-success" onClick={handleSend}>ส่งคำร้อง</button>
                <button className="btn btn-danger" onClick={handleCancel}>ยกเลิก</button>
            </div>
        </div>
    );
}

export default Leave;
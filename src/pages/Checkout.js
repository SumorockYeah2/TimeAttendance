import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import moment from 'moment-timezone';
import haversine from 'haversine-distance';

function Checkout() {
    const API_URL = process.env.REACT_APP_API_URL;
    const [selectedFile, setSelectedFile] = useState(null);
    const [isFormCompleted, setIsFormCompleted] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [textInput, setTextInput] = useState("");
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [jobOptions, setJobOptions] = useState([]);
    const [jobDetails, setJobDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [isWithinRadius, setIsWithinRadius] = useState(true);
    const [locationError, setLocationError] = useState("");

    const navigate = useNavigate();
    const idemployees = localStorage.getItem('idemployees');

    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/get-checked-in-jobs/${idemployees}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched checked-in jobs:', data);

                const uniqueJobs = data.reduce((acc, job) => {
                    if (!acc.some(existingJob => existingJob.jobname === job.jobname)) {
                        acc.push(job);
                    }
                    return acc;
                }, []);

                const formattedOptions = uniqueJobs.map(job => ({
                    value: job.jobname,
                    label: job.jobname,
                    jobID: job.jobID,
                    latitude: job.latitude,
                    longitude: job.longitude,
                    radius: job.gps_radius,
                    in_time: job.in_time,
                    out_time: job.out_time
                }));
                setJobOptions(formattedOptions);
                console.log('Formatted options:', formattedOptions);
            })
            .catch(error => console.error('Error fetching checked-in jobs:', error))
            .finally(() => setLoading(false));
    }, [idemployees]);

    const CheckUserLocation = () => {
        if (selectedOption === "เข้างานออฟฟิศ") {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };

                    const officeLocation = {
                        latitude: jobDetails.latitude,
                        longitude: jobDetails.longitude
                    };

                    const distance = haversine(userLocation, officeLocation);
                    console.log("Distance to office:", distance);

                    if (distance <= jobDetails.radius) {
                        setIsWithinRadius(true);
                        setLocationError("");
                    } else {
                        setIsWithinRadius(false);
                        setLocationError("ท่านต้องอยู่ในตำแหน่งที่ตั้งและรัศมีที่กำหนดไว้ในระบบ จึงจะลงเวลาออกได้");
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setIsWithinRadius(false);
                    setLocationError("ไม่สามารถตรวจสอบตำแหน่งที่ตั้งของท่านได้ กรุณาเปิดการใช้งานตำแหน่งที่ตั้ง");
                }
            );
        } else {
            setIsWithinRadius(true);
            setLocationError("");
        }
    };

    const _onSelect = (selectedOption) => {
        console.log(selectedOption);
        setSelectedOption(selectedOption.value);

        const selectedJob = jobOptions.find(job => job.value === selectedOption.value);
        console.log("selectedJob:", selectedJob);
        setJobDetails({
            jobID: selectedJob.jobID,
            latitude: selectedJob.latitude,
            longitude: selectedJob.longitude,
            radius: selectedJob.radius
        });
        console.log(jobDetails);

        CheckUserLocation();
    };

    const handleCheckout = async () => {
        localStorage.setItem('isCheckedIn', 'false');
        localStorage.removeItem('isCheckedIn');

        const checkOutDateTime = moment().tz('Asia/Bangkok').format();
        console.log(checkOutDateTime);

        localStorage.setItem('checkOutDateTime', checkOutDateTime);

        const checkOutData = {
            jobID: jobDetails.jobID,
            jobname: selectedOption,
            checkOutDateTime
        };

        try {
            const response = await fetch(`${API_URL}/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(checkOutData)
            });

            console.log("Response:", response);

            if (response.ok) {
                const event = new Event('checkInStatusChanged');
                window.dispatchEvent(event);

                alert("ลงเวลาออกงานเรียบร้อย");
                navigate('/checkin');
            } else {
                alert("ไม่สามารถลงเวลาออกงานได้ กรุณาลองใหม่อีกครั้ง");
            }
        } catch (error) {
            console.error('Error saving check-out data:', error);
            alert("ไม่สามารถบันทึกข้อมูลการลงเวลาออกงานได้ กรุณาลองใหม่อีกครั้ง");
        }
    };

    const handleCancel = () => {
        navigate('/checkin');
    };

    // const handleCheckIn = () => {
    //     navigate('/checkin');
    // };

    useEffect(() => {
        const checkInStatus = localStorage.getItem('isCheckedIn');
        if (checkInStatus === 'true') {
            setIsCheckedIn(true); // User is already checked in
        }
    }, []);

    return (
        <div style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>ลงเวลาออกงาน</h5>
            {/* {isCheckedIn ? ( */}
                <div>
                    <p>งานที่จะลงเวลาออก</p>
                    <Dropdown
                        className="dropdown"
                        options={jobOptions}
                        onChange={_onSelect}
                        value={selectedOption || ""}
                        placeholder="โปรดระบุ"
                        getOptionLabel={(option) => `${option.label} (${option.in_time || 'N/A'})`}
                    />
                    <div>
                        <button className="btn btn-success" onClick={handleCheckout} disabled={loading || !selectedOption || !isWithinRadius}>ลงเวลาออก</button>
                        <button className="btn btn-danger" onClick={handleCancel}>ยกเลิก</button>
                        {!isWithinRadius && (
                            <p style={{ color: 'red' }}>
                                {locationError}
                            </p>
                        )}
                    </div>
                </div>
            {/* // ) : (
            //     <div>
            //         <p>ไม่สามารถลงเวลาออกงานได้ เนื่องจากท่านยังไม่ได้ลงเวลาเข้างาน กรุณาลงเวลาเข้างานก่อน</p>
            //         <button className="btn btn-success" onClick={handleCheckIn}>ลงเวลาเข้า</button>
            //         <button className="btn btn-danger" onClick={handleCancel}>ยกเลิก</button>
            //     </div>
            // )} */}
        </div>
    );
}

export default Checkout;
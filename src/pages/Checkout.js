import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import moment from 'moment-timezone';

function Checkout() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isFormCompleted, setIsFormCompleted] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [textInput, setTextInput] = useState("");
    const [isCheckedIn, setIsCheckedIn] = useState(false);

    const navigate = useNavigate();

    const options = [
        { value: 'one', label: 'one' },
        { value: 'two', label: 'two' },
        { value: 'Typical Office Job', label: 'office' }
    ];
    const DefaultOption = options[0].value;
    const _onSelect = (selectedOption) => {
        console.log(selectedOption);
        setSelectedOption(selectedOption.value);
    };

    const handleCheckout = async () => {
        localStorage.setItem('isCheckedIn', 'false');
        localStorage.removeItem('isCheckedIn');

        // const checkOutDateTime = new Date().toISOString();
        const checkOutDateTime = moment().tz('Asia/Bangkok').format();
        console.log(checkOutDateTime);

        localStorage.setItem('checkOutDateTime', checkOutDateTime);

        const checkOutData = {
            selectedOption,
            checkOutDateTime
        };

        try {
            const response = await fetch('http://localhost:3001/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(checkOutData)
            });

            console.log(response);

            if (response.ok) {
                const event = new Event('checkInStatusChanged');
                window.dispatchEvent(event);

                alert("ลงเวลาออกงานเรียบร้อย");
                navigate('/home2');
            } else {
                alert("Failed to save check-out data. Please try again.");
            }
        } catch (error) {
            console.error('Error saving check-out data:', error);
            alert("Failed to save check-out data. Please try again.");
        }
        // const event = new Event('checkInStatusChanged');
        // window.dispatchEvent(event);

        // alert("Check-out complete!");
        // navigate('/home2');
    };

    const handleCancel = () => {
        navigate('/home2');
    };

    const handleCheckIn = () => {
        navigate('/checkin');
    };

    useEffect(() => {
        const checkInStatus = localStorage.getItem('isCheckedIn');
        if (checkInStatus === 'true') {
            setIsCheckedIn(true); // User is already checked in
        }
    }, []);

    return (
        <div style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>ลงเวลาออกงาน</h5>
            {isCheckedIn ? (
                <div>
                    <p>งานที่จะลงเวลาออก</p>
                    <Dropdown
                        className="dropdown"
                        options={options}
                        onChange={_onSelect}
                        value={selectedOption || ""}
                        placeholder="โปรดระบุ"
                    />
                    <div>
                        <button className="btn btn-success" onClick={handleCheckout}>ลงเวลาออก</button>
                        <button className="btn btn-danger" onClick={handleCancel}>ยกเลิก</button>
                    </div>
                </div>
            ) : (
                <div>
                    <p>ไม่สามารถลงเวลาออกงานได้ เนื่องจากท่านยังไม่ได้ลงเวลาเข้างาน กรุณาลงเวลาเข้างานก่อน</p>
                    <button className="btn btn-success" onClick={handleCheckIn}>ลงเวลาเข้า</button>
                    <button className="btn btn-danger" onClick={handleCancel}>ยกเลิก</button>
                </div>
            )}
        </div>
    );
}

export default Checkout;
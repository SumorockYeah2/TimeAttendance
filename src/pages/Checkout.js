import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

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

    const handleCheckout = () => {
        localStorage.setItem('isCheckedIn', 'false');
        localStorage.removeItem('isCheckedIn');

        const checkOutDateTime = new Date().toISOString();
        console.log(checkOutDateTime);

        localStorage.setItem('checkOutDateTime', checkOutDateTime);

        const event = new Event('checkInStatusChanged');
        window.dispatchEvent(event);

        alert("Check-out complete!");
        navigate('/home2');
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
            <h5>Check-out</h5>
            {isCheckedIn ? (
                <div>
                    <p>Choose job to check-out:</p>
                    <Dropdown
                        className="dropdown"
                        options={options}
                        onChange={_onSelect}
                        value={selectedOption || ""}
                        placeholder="Select a job"
                    />
                    <div>
                        <button className="btn btn-success" onClick={handleCheckout}>Check-out!</button>
                        <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div>
                    <p>You haven't checked-in yet! Please check-in first.</p>
                    <button className="btn btn-success" onClick={handleCheckIn}>Check-in</button>
                    <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
                </div>
            )}
        </div>
    );
}

export default Checkout;
import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';

import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function Leave() {
    const [type, setType] = useState(null);
    const [supervisor, setSupervisor] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [description, setDescription] = useState('');

    const [selectedOption, setSelectedOption] = useState(null);

    const navigate = useNavigate();

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const handleSend = () => {
        console.log(type, formatDate(startDate), startTime, formatDate(endDate), endTime, description, supervisor);

        if (!type || !startDate || !startTime || !endDate || !endTime || !supervisor) {
            alert('Please fill in all the fields!');
            return;
        }
        
        localStorage.setItem('leaveType', type);
        localStorage.setItem('leaveStartDate', formatDate(startDate));
        localStorage.setItem('leaveStartTime', startTime);
        localStorage.setItem('leaveEndDate', formatDate(endDate));
        localStorage.setItem('leaveEndTime', endTime);
        localStorage.setItem('leaveDescription', description);
        localStorage.setItem('supervisor', supervisor);
        console.log(localStorage.getItem('leaveType'));
        console.log(localStorage.getItem('leaveStartDate'));
        console.log(localStorage.getItem('leaveStartTime'));
        console.log(localStorage.getItem('leaveEndDate'));
        console.log(localStorage.getItem('leaveEndTime'));
        console.log(localStorage.getItem('leaveDescription'));
        console.log(localStorage.getItem('supervisor'));

        const leaveLocation = "none";
        console.log(leaveLocation);
        const OffsitePlace = "none";
        console.log(OffsitePlace);
        localStorage.setItem('leaveLocation', leaveLocation);
        localStorage.setItem('OffsitePlace', OffsitePlace);

        const leaveStatus = "Pending";
        localStorage.setItem('leaveStatus', leaveStatus);
                
        alert("Request sent!");
        navigate('/home2');
    }

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
        setSelectedOption(selectedOption.value);
        setType(selectedOption.value);
    };

    const leaveBalance = 5;

    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>Leave Request</h5>
            <div>
                <p>Type</p>
                <Dropdown 
                    options={options}
                    onChange={_onSelect}
                    value={type || ""}
                    placeholder="Select a job"
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
                <p>Description</p>
                <input
                    type="text"
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div>
                <p>Leave Balance</p>
                <input
                    type="text"
                    className="form-control"
                    value={leaveBalance}
                    disabled
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

            <div style={{ paddingTop: '10px' }}>
                <button className="btn btn-success" onClick={handleSend}>Send</button>
                <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
            </div>
        </div>
    );
}

export default Leave;
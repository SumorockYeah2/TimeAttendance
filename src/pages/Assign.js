import React, { useState } from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { useNavigate } from 'react-router-dom';

function Assign({ role }) {
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [jobName, setJobName] = useState("");
    const [jobDesc, setJobDesc] = useState("");

    const options = [
        { value: 'one', label: 'one' },
        { value: 'two', label: 'two' }
    ]

    const _onSelect = (option) => {
        console.log("Selected option:", option);
        setEmployee(option.value);
    }

    const handleSave = () => {
        console.log(employee, jobName, jobDesc)
        if (!employee || !jobName || !jobDesc ) {
            alert("Please fill in all the fields!");
            return;
        }
    }

    const handleCancel = () => {
        navigate('/home2');
    }

    const handleHome = () => {
        navigate('/home2');
    }
    
    if (role !== 'Supervisor' && role !== 'Admin') {
        return (
            <div>
                <p>Access denied!</p>
                <button className="btn btn-primary" onClick={handleHome}>Home</button>
            </div>
        )
    }

    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>Assign Job</h5>

            <div>
                <p>Employee</p>
                <Dropdown
                    options={options}
                    onChange={_onSelect}
                    value={employee || ""}
                    placeholder="Select an employee"
                />
            </div>
            <div>
                <p>Job Name</p>
                <input
                    type="text"
                    className="form-control"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                />
            </div>
            <div>
                <p>Job Description</p>
                <input
                    type="text"
                    className="form-control"
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                />
            </div>
            <div style={{ paddingTop: '10px' }}>
                <button className="btn btn-success" onClick={handleSave}>Save</button>
                <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
            </div>
        </div>
    )
}

export default Assign;
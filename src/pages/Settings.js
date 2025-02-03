import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

function Settings({ role }) {
    const [radius, setRadius] = useState("");

    useEffect(() => {
        const savedRadius = localStorage.getItem("gpsRadius");
        if (savedRadius) {
            setRadius(savedRadius);
        }
    }, []);

    const navigate = useNavigate();

    const handleSave = () => {
        alert("Settings saved!");
        navigate('/home2');
    };

    const manageEmployee = () => {
        navigate('/empdata');
    }

    const manageReport = () => {
        navigate('/managereport');
    }
    
    const manageRoles = () => {
        navigate('/roles');
    }

    const handleHome = () => {
        navigate('/home2');
    }

    if (role !== 'HR' && role !== 'Admin') {
        return (
            <div>
                <p>Access denied!</p>
                <button className="btn btn-primary" onClick={handleHome}>Home</button>
            </div>
        )
    }

    const handleRadiusChange = (event) => {
        const newValue = event.target.value;
        if (/^\d*$/.test(newValue)) {
            setRadius(newValue);
            localStorage.setItem("gpsRadius", newValue);
        }
    };

    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>Settings</h5>
            <div style={{display: 'flex', alignItems: 'center', textAlign: 'center', gap: '50px'}}>
                <p>Employee Data</p>
                <button className="btn btn-primary" onClick={manageEmployee}>Manage</button>
            </div>
            <div style={{display: 'flex', alignItems: 'center', textAlign: 'center', gap: '110px'}}>
                <p>Report</p>
                <button className="btn btn-primary" onClick={manageReport}>Manage</button>
            </div>
            <div>
                <p>GPS Radius (km)</p>
                <input
                    className="form-control"
                    type="text"
                    value={radius}
                    onChange={handleRadiusChange}
                />
            </div>

            <div style={{ paddingTop: '10px' }}>
                <button className="btn btn-success" onClick={handleSave}>Save</button>
                <button className="btn btn-danger" onClick={handleSave}>Cancel</button>
            </div>
        </div>
    );
}

export default Settings;
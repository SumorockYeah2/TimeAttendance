import React from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.setItem('isLoggedIn', 'false');
        const isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn'))
        console.log(isLoggedIn);
        window.dispatchEvent(new Event('storage'));
        alert("You're now logged out");
        navigate('/login');
    }

    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>Logout</h5>
            <p>Are you sure?</p>
            <div>
                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                <button className="btn btn-primary" onClick={() => navigate(-1)}>Cancel</button>
            </div>
        </div>
    )
}

export default Logout;
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.setItem('isLoggedIn', 'false');
        const isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn'))
        console.log(isLoggedIn);
        window.dispatchEvent(new Event('storage'));
        alert("ออกจากระบบเรียบร้อยแล้ว");
        navigate('/login');
    }

    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>ออกจากระบบ</h5>
            <p>ท่านต้องการออกจากระบบหรือไม่</p>
            <div>
                <button className="btn btn-danger" onClick={handleLogout}>ออกจากระบบ</button>
                <button className="btn btn-primary" onClick={() => navigate(-1)}>ยกเลิก</button>
            </div>
        </div>
    )
}

export default Logout;
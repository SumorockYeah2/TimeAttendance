import React, { useEffect, useState } from 'react';

function Profile() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [employee, setEmployee] = useState(null);
  const [supervisorName, setSupervisorName] = useState('N/A');
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/100');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')); // พาร์ส JSON object
    const loggedInEmployeeId = user?.idemployees;
  
    console.log('Logged in employee ID:', loggedInEmployeeId);
  
    if (loggedInEmployeeId) {
      fetch(`${API_URL}/get-employee/${loggedInEmployeeId}`)
        .then((response) => {
          console.log('API Response:', response);
          return response.json();
        })
        .then((data) => {
          console.log('Employee Data:', data);
          if (data) {
            setEmployee(data);
  
            // ดึงภาพโปรไฟล์
            if (data.image) {
              const imageUrl = `${API_URL}${data.image}`;
              console.log('Generated Profile Image URL:', imageUrl);
              setProfileImage(imageUrl);
            }
          }
        })
        .catch((error) => console.error('Error fetching employee data:', error));
    }
  }, []);

  useEffect(() => {
    // ดึงชื่อหัวหน้าจาก API
    if (employee && employee.supervisor) {
      fetch(`${API_URL}/get-employee-name/${employee.supervisor}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.name) {
            setSupervisorName(data.name);
          }
        })
        .catch((error) => console.error('Error fetching supervisor name:', error));
    }
  }, [employee]);

  if (!employee) {
    return <p style={{ textAlign: 'center', marginTop: '20px' }}>Loading...</p>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img
          src={profileImage} // รูปโปรไฟล์ (เปลี่ยนเป็น URL จริง)
          alt="Profile"
          style={styles.profileImage}
        />
        <div>
          <h1 style={styles.name}>{employee.name}</h1>
          <p style={styles.position}>
            {employee.role === "HR" && "แผนกบุคคล"}
            {employee.role === "Admin" && "ผู้ดูแลระบบ"}
            {employee.role === "Supervisor" && "หัวหน้า"}
            {employee.role === "Employee" && "พนักงาน"}
          </p>
        </div>
      </div>
      <div style={styles.content}>
      <div style={styles.infoSection}>
        <h2 style={styles.sectionTitle}>ข้อมูลติดต่อ</h2>
        <p><strong>อีเมล:</strong> {employee.email}</p>
        <p><strong>เบอร์โทรศัพท์:</strong> {employee.phone}</p>
        <p><strong>ไอพีโฟน:</strong> {employee.ipphone || 'N/A'}</p>
        <p><strong>ฝ่าย:</strong> {employee.department}</p>
        <p><strong>แผนก:</strong> {employee.division}</p>
      </div>
      <div style={styles.infoSection}>
        <h2 style={styles.sectionTitle}>ข้อมููลเพิ่มเติม</h2>
        <p><strong>หัวหน้า:</strong> {supervisorName}</p>
      </div>
    </div>
    </div>
  );
}
const styles = {
    container: {
      width: '100%',
      margin: '0 auto',
      padding: '20px',
      maxWidth: '1200px', // จำกัดความกว้างสูงสุด
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
    },
    profileImage: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
    },
    name: {
      fontSize: '24px',
      margin: '0',
      color: '#333',
    },
    position: {
      fontSize: '18px',
      color: '#666',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    infoSection: {
      flex: 1,
      padding: '20px',
      backgroundColor: '#fff',
    //   borderRadius: '8px',
    //   boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    sectionTitle: {
      fontSize: '20px',
      marginBottom: '10px',
      color: '#333',
    },
    '@media (min-width: 768px)': {
      content: {
        flexDirection: 'row', // จัดเรียงเป็นแถวสำหรับหน้าจอใหญ่
        gap: '20px',
      },
    },
  };
export default Profile;
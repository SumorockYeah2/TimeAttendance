const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;

const crypto = require('crypto');

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'SumorockYeah2!',
  database: 'leave_time'
});

const secretKey = crypto.randomBytes(32).toString('hex');
console.log('Secret Key:', secretKey);

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  } else {
    console.log('Connected to MySQL database');
  }
});

app.post('/checkin', (req, res) => {
    console.log('Request body:', req.body);

    const { userLocation, selectedOption, textInput, checkInDateTime, checkOutDateTime, uploadedFilePath } = req.body;

    const query = `INSERT INTO attendance (location, jobID, description, in_time, out_time, image_url) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [JSON.stringify(userLocation), selectedOption, textInput, checkInDateTime, checkOutDateTime, uploadedFilePath];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting check-in data:', err.stack);
            res.status(500).send('Error inserting check-in data');
            return;
        } else {
            res.status(200).send('Check-in data inserted successfully');
        }
    });
});

app.post('/checkout', (req, res) => {
    console.log('Request body:', req.body);

    const { selectedOption, checkOutDateTime } = req.body;

    const query = `UPDATE attendance SET out_time = ? WHERE jobID = ? AND out_time = 'Pending'`;
    const values = [checkOutDateTime, selectedOption];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating check-out data:', err.stack);
            res.status(500).send('Error updating check-out data');
            return;
        } else {
            console.log('Check-out data updated successfully:', result);
            res.status(200).send('Check-out data updated successfully');
        }
    });
});

app.post('/request-send', (req, res) => {
    console.log('Request body:', req.body);

    const { leaveType, leaveStartDate, leaveStartTime, leaveEndDate, leaveEndTime, leaveDescription, leaveLocation, OffsitePlace, leaveStatus } = req.body;

    if (!leaveType || !leaveStartDate || !leaveStartTime || !leaveEndDate || !leaveEndTime || !leaveDescription || !leaveLocation || !OffsitePlace || !leaveStatus) {
        console.error('Missing required fields');
        return res.status(400).send('Missing required fields');
    }

    const query = `INSERT INTO requests (leaveType, start_date, start_time, end_date, end_time, reason, location, place_name, status ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    const values = [leaveType, leaveStartDate, leaveStartTime, leaveEndDate, leaveEndTime, leaveDescription, leaveLocation, OffsitePlace, leaveStatus];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting request data:', err.stack);
            res.status(500).send('Error inserting request data');
            return;
        } else {
            res.status(200).send('Request data inserted successfully');
        }
    });
});

app.post('/empdata-add', (req, res) => {
    console.log('Received data:', req.body);
    const { idemployees, name, department, division, gender, role, phone, email, ipphone } = req.body;

    if (!idemployees || !name || !department || !division || !gender || !role || !phone || !email || !ipphone) {
        return res.status(400).send('All fields are required');
    }

    const query = `
        INSERT INTO employees (idemployees, name, department, division, gender, role, phone, email, ipphone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [idemployees, name, department, division, gender, role, phone, email, ipphone];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error adding employee:', err.stack);
            res.status(500).send('Error adding employee');
        } else {
            res.status(200).send('Employee added successfully');
        }
    });
});

app.post('/empdata-check', (req, res) => {
    const { idemployees } = req.body;

    const query = `SELECT COUNT(*) AS count FROM employees WHERE idemployees = ?`;

    db.query(query, [idemployees], (err, result) => {
        if (err) {
            console.error('Error checking employee:', err.stack);
            res.status(500).send('Error checking employee');
        } else {
            res.status(200).json({ exists: result[0].count > 0 });
        }
    });
});

app.post('/attendance-add', (req, res) => {
    console.log('Received data:', req.body);
    const { idattendance, jobID, jobType, description, in_time, out_time, location, image_url } = req.body;

    if (!idattendance || !jobID || !description || !in_time || !out_time) {
        return res.status(400).send('All fields are required');
    }

    const query = `
        INSERT INTO attendance (idattendance, jobID, jobType, description, in_time, out_time, location, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [idattendance, jobID, jobType, description, in_time, out_time, location, image_url];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error adding employee:', err.stack);
            res.status(500).send('Error adding employee');
        } else {
            res.status(200).send('Employee added successfully');
        }
    });
});

app.get('/attendance', (req, res) => {
    const query = `SELECT * FROM attendance`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching attendance data:', err.stack);
            res.status(500).send('Error fetching attendance data');
            return;
        } else {
            res.status(200).send(results);
        }
    });
});

app.post('/attendance-check', (req, res) => {
    const { idattendance } = req.body;

    const query = `SELECT COUNT(*) AS count FROM attendance WHERE idattendance = ?`;

    db.query(query, [idattendance], (err, result) => {
        if (err) {
            console.error('Error checking attendance:', err.stack);
            res.status(500).send('Error checking attendance');
        } else {
            res.status(200).json({ exists: result[0].count > 0 });
        }
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    console.log('Login request received with:', { username, password });

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    const values = [username, password];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error checking user credentials:', err.stack);
            res.status(500).send('Error checking user credentials');
        } else {
            console.log('Query results:', results);
            if (results.length > 0) {
                const user = results[0];
                const token = jwt.sign({ id: user.idemployees }, secretKey, { expiresIn: '1h' });
                res.status(200).json({ success: true, user, token });
            } else {
                res.status(200).json({ success: false });
            }
        }
    });
});

app.get('/request-get', (req, res) => {
    const query = `SELECT * FROM requests`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching request data:', err.stack);
            res.status(500).send('Error fetching request data');
            return;
        } else {
            res.status(200).send(results);
        }
    });
});

app.get('/employee-data', (req, res) => {
    const query = `SELECT * FROM employees`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching employee data:', err.stack);
            res.status(500).send('Error fetching employee data');
            return;
        } else {
            res.status(200).send(results);
        }
    });
});

app.put('/request-update/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const query = `UPDATE requests SET status = ? WHERE idrequests = ?`;
    const values = [status, id];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating request data:', err.stack);
            res.status(500).send('Error updating request data');
            return;
        } else {
            console.log('Request data updated successfully:', result);
            res.status(200).send('Request data updated successfully');
        }
    });
});

app.put('/leave-update', (req, res) => {
    console.log('Received data:', req.body);
    const { idrequests, leaveType, leaveStartDate, leaveStartTime, leaveEndDate, leaveEndTime, leaveDescription, leaveLocation, leaveStatus } = req.body;

    if (!idrequests) {
        return res.status(400).send('idrequests is required');
    }

    const query = `
        UPDATE requests
        SET leaveType = ?, start_date = ?, start_time = ?, end_date = ?, end_time = ?, reason = ?, location = ?, status = ?
        WHERE idrequests = ?
    `;

    const values = [leaveType, leaveStartDate, leaveStartTime, leaveEndDate, leaveEndTime, leaveDescription, leaveLocation, leaveStatus, idrequests];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating request:', err.stack);
            res.status(500).send('Error updating request');
        } else {
            res.status(200).send('Request updated successfully');
        }
    });
});

app.put('/empdata-update', (req, res) => {
    console.log('Received data:', req.body);
    const { idemployees, name, department, division, gender, role, phone, email, ipphone } = req.body;

    if (!idemployees) {
        return res.status(400).send('idemployees is required');
    }

    const query = `
        UPDATE employees
        SET name = ?, department = ?, division = ?, gender = ?, role = ?, phone = ?, email = ?, ipphone = ?
        WHERE idemployees = ?
    `;

    const values = [name, department, division, gender, role, phone, email, ipphone, idemployees];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating request:', err.stack);
            res.status(500).send('Error updating request');
        } else {
            res.status(200).send('Request updated successfully');
        }
    });
});

app.put('/attendance-update', (req, res) => {
    console.log('Received data:', req.body);
    const { idattendance, jobID, jobType, description, in_time, out_time, location, image_url } = req.body;

    if (!idattendance) {
        return res.status(400).send('idemployees is required');
    }

    const query = `
        UPDATE attendance
        SET jobID = ?, jobType = ?, description = ?, in_time = ?, out_time = ?, location = ?, image_url = ?
        WHERE idattendance = ?
    `;

    const values = [jobID, jobType, description, in_time, out_time, location, image_url, idattendance];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating attendance:', err.stack);
            res.status(500).send('Error updating attendance');
        } else {
            res.status(200).send('attendance updated successfully');
        }
    });
});

app.delete('/empdata-remove/:idemployees', (req, res) => {
    const { idemployees } = req.params;

    const query = `
        DELETE FROM employees WHERE idemployees = ?
    `;

    db.query(query, [idemployees], (err, result) => {
        if (err) {
            console.error('Error removing employee:', err.stack);
            res.status(500).send('Error removing employee');
        } else {
            res.status(200).send('Employee removed successfully');
        }
    });
});

app.delete('/attendance-remove/:idattendance', (req, res) => {
    const { idattendance } = req.params;

    const query = `
        DELETE FROM attendance WHERE idattendance = ?
    `;

    db.query(query, [idattendance], (err, result) => {
        if (err) {
            console.error('Error removing attendance:', err.stack);
            res.status(500).send('Error removing attendance');
        } else {
            res.status(200).send('Attendance removed successfully');
        }
    });
});


// API สำหรับบันทึกข้อมูลการตั้งค่าของผู้ใช้
app.post('/save-settings', (req, res) => {
    const { idusers, latitude, longitude, radius } = req.body;
    const query = `INSERT INTO user_settings (idusers, latitude, longitude, gps_radius)
                   VALUES (?, ?, ?, ?)
                   ON DUPLICATE KEY UPDATE
                   latitude = VALUES(latitude),
                   longitude = VALUES(longitude),
                   gps_radius = VALUES(gps_radius)`;

    db.query(query, [idusers, latitude, longitude, radius], (err, result) => {
        if (err) {
            console.error('Error saving settings:', err.stack);
            res.status(500).send('Error saving settings');
        } else {
            res.status(200).send('Settings saved successfully');
        }
    });
});

// API สำหรับดึงข้อมูลการตั้งค่าที่บันทึกไว้ของผู้ใช้
app.get('/get-settings/:idusers', (req, res) => {
    const { idusers } = req.params;
    const query = `SELECT latitude, longitude, gps_radius FROM user_settings WHERE idusers = ?`;
    db.query(query, [idusers], (err, results) => {
        if (err) {
            console.error('Error fetching settings:', err.stack);
            res.status(500).send('Error fetching settings');
        } else {
            if (results.length > 0) {
                res.status(200).json(results[0]); // Send the first result as JSON
            } else {
                res.status(404).send('Settings not found');
            }
        }
    });
});

app.post('/jobs', (req, res) => {
    console.log('Request body:', req.body);

    const { employeeId, jobName, jobDesc, startDate, startTime, endDate, endTime, latitude, longitude, radius } = req.body;

    if (!employeeId || !jobName || !jobDesc) {
        return res.status(400).send('All fields are required');
    }

    const query = `INSERT INTO job_assignments (idemployees, jobname, jobdesc, start_date, start_time, end_date, end_time, latitude, longitude, gps_radius ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [employeeId, jobName, jobDesc, startDate, startTime, endDate, endTime, latitude, longitude, radius];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting job data:', err.stack);
            res.status(500).send('Error inserting job data');
        } else {
            res.status(200).send('Job data inserted successfully');
        }
    });
});

app.get('/get-assigned-jobs/:employeeID', (req, res) => {
    const employeeID = req.params.employeeID;

    const query = `SELECT jobname, latitude, longitude, gps_radius FROM job_assignments WHERE idemployees = ?`;
    db.query(query, [employeeID], (err, results) => {
        if (err) {
            console.error('Error fetching job assignments:', err.stack);
            res.status(500).send('Error fetching job assignments');
        } else {
            res.status(200).json(results);
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
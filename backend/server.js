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

    const { idemployees, userLocation, place_name, selectedOption, textInput, checkInDateTime, checkOutDateTime, uploadedFilePath } = req.body;

    // Query to fetch jobID based on the selected job name
    const jobQuery = `SELECT jobID FROM job_assignments WHERE jobname = ?`;

    db.query(jobQuery, [selectedOption], (err, jobResult) => {
        if (err) {
            console.error('Error fetching jobID:', err.stack);
            res.status(500).send('Error fetching jobID');
            return;
        }

        if (jobResult.length === 0) {
            res.status(404).send('Job not found');
            return;
        }

        const jobID = jobResult[0].jobID;

        // Insert check-in data into the attendance table
        const query = `INSERT INTO attendance (idemployees, jobID, location, place_name, jobType, description, in_time, out_time, image_url, isCheckedIn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [idemployees, jobID, JSON.stringify(userLocation), place_name, selectedOption, textInput, checkInDateTime, checkOutDateTime, uploadedFilePath, 1];

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
});

app.post('/checkout', (req, res) => {
    console.log('Request body:', req.body);

    const { selectedOption, checkOutDateTime } = req.body;

    const query = `
        UPDATE attendance 
        SET out_time = ?, isCheckedIn = 0
        WHERE jobID = (
            SELECT jobID 
            FROM job_assignments 
            WHERE jobname = ? 
            LIMIT 1
        ) 
        AND isCheckedIn = 1
    `;
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

    const { idemployees, leaveType, leaveStartDate, leaveStartTime, leaveEndDate, leaveEndTime, leaveDescription, leaveLocation, OffsitePlace, leaveStatus } = req.body;

    if (!leaveType || !leaveStartDate || !leaveStartTime || !leaveEndDate || !leaveEndTime || !leaveDescription || !leaveLocation || !OffsitePlace || !leaveStatus) {
        console.error('Missing required fields');
        return res.status(400).send('Missing required fields');
    }

    const query = `INSERT INTO requests (idemployees, leaveType, start_date, start_time, end_date, end_time, reason, location, place_name, status ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    const values = [idemployees, leaveType, leaveStartDate, leaveStartTime, leaveEndDate, leaveEndTime, leaveDescription, leaveLocation, OffsitePlace, leaveStatus];

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

    const query = `
        SELECT uc.idemployees, uc.username, e.name, uc.role
        FROM user_credentials uc
        JOIN employees e ON uc.idemployees = e.idemployees
        WHERE uc.username = ? AND uc.password = ?
    `;
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

    const currentDate = new Date();
    const currentDay = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const currentTime = currentDate.toTimeString().split(' ')[0]; // Format: HH:MM:SS
    const currentWeekday = currentDate.toLocaleString('en-US', { weekday: 'long' }); // e.g., "Monday"

    const query = `
        SELECT jobID, jobname, latitude, longitude, gps_radius, weekdays, start_date, start_time, end_date, end_time
        FROM job_assignments
        WHERE idemployees = ?
        AND (
            (start_date IS NOT NULL AND end_date IS NOT NULL AND start_date <= ? AND end_date >= ?  AND start_time <= ? AND end_time >= ?)
            OR
            (weekdays IS NOT NULL AND FIND_IN_SET(?, weekdays) > 0 AND start_time <= ? AND end_time >= ?)
        )
        
    `;

    const values = [employeeID, currentDay, currentDay, currentTime, currentTime, currentWeekday, currentTime, currentTime];

    console.log('Query:', query);
    console.log('Values:', values);

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error fetching job assignments:', err.stack);
            res.status(500).send('Error fetching job assignments');
        } else {
            console.log('All jobs:', results);
            res.status(200).json(results); // ส่งข้อมูลทั้งหมดกลับไปยัง frontend
        }
    });
});

app.get('/get-checked-in-jobs/:employeeID', (req, res) => {
    const employeeID = req.params.employeeID;

    const query = `
        SELECT ja.*
        FROM job_assignments ja
        INNER JOIN attendance a ON ja.jobID = a.jobID
        WHERE a.idemployees = ? AND a.isCheckedIn = '1'
    `;

    db.query(query, [employeeID], (err, results) => {
        if (err) {
            console.error('Error fetching checked-in jobs:', err.stack);
            res.status(500).send('Error fetching checked-in jobs');
        } else {
            console.log('Fetched checked-in jobs:', results);
            res.status(200).json(results);
        }
    });
});

app.post('/jobs-office', (req, res) => {
    console.log('Request body:', req.body);

    const { employeeId, jobName, jobDesc, weekdays, startTime, endTime, latitude, longitude, radius } = req.body;

    if (!employeeId || !jobName || !jobDesc || !weekdays) {
        return res.status(400).send('All fields are required');
    }

    // Query to find the next available jobID
    const getNextJobIDQuery = `
        SELECT jobID 
        FROM job_assignments 
        WHERE jobID LIKE 'OF%' 
        ORDER BY jobID DESC 
        LIMIT 1
    `;

    db.query(getNextJobIDQuery, (err, results) => {
        if (err) {
            console.error('Error fetching job IDs:', err.stack);
            res.status(500).send('Error fetching job IDs');
            return;
        }

        let nextJobID = 'OF01'; // Default jobID if no existing IDs are found
        if (results.length > 0) {
            const lastJobID = results[0].jobID;
            const lastNumber = parseInt(lastJobID.substring(2), 10); // Extract the numeric part
            nextJobID = `OF${String(lastNumber + 1).padStart(2, '0')}`; // Increment and pad with leading zeros
        }

        // Insert the new job with the generated jobID
        const insertJobQuery = `
            INSERT INTO job_assignments (jobID, idemployees, jobname, jobdesc, weekdays, start_time, end_time, latitude, longitude, gps_radius)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [nextJobID, employeeId, jobName, jobDesc, weekdays, startTime, endTime, latitude, longitude, radius];

        db.query(insertJobQuery, values, (err, result) => {
            if (err) {
                console.error('Error inserting office job data:', err.stack);
                res.status(500).send('Error inserting office job data');
            } else {
                res.status(200).send('Office job data inserted successfully');
            }
        });
    });
    // const query = `
    //     INSERT INTO job_assignments (idemployees, jobname, jobdesc, weekdays, start_time, end_time, latitude, longitude, gps_radius)
    //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    // `;
    // const values = [employeeId, jobName, jobDesc, weekdays, startTime, endTime, latitude, longitude, radius];

    // db.query(query, values, (err, result) => {
    //     if (err) {
    //         console.error('Error inserting office job data:', err.stack);
    //         res.status(500).send('Error inserting office job data');
    //     } else {
    //         res.status(200).send('Office job data inserted successfully');
    //     }
    // });
});

app.post('/add-job', (req, res) => {
    console.log('Request body:', req.body);
    const { jobID, idemployees, jobname, jobdesc, latitude, longitude, radius, start_date, start_time, end_date, end_time } = req.body;

    if (!idemployees || !jobname || !jobdesc || !latitude || !longitude || !radius) {
        return res.status(400).send('All fields are required');
    }

    const query = `
        INSERT INTO job_assignments (jobID, idemployees, jobname, jobdesc, latitude, longitude, gps_radius, start_date, start_time, end_date, end_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [jobID, idemployees, jobname, jobdesc, latitude, longitude, radius, start_date, start_time, end_date, end_time];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting job:', err.stack);
            res.status(500).send('Error inserting job');
        } else {
            res.status(200).send('Job added successfully');
        }
    });
});

app.get('/get-next-job-id', (req, res) => {
    const getLastJobIDQuery = `
        SELECT jobID 
        FROM job_assignments 
        WHERE jobID LIKE 'OUT%' 
        ORDER BY jobID DESC 
        LIMIT 1
    `;

    db.query(getLastJobIDQuery, (err, results) => {
        if (err) {
            console.error('Error fetching job IDs:', err.stack);
            res.status(500).send('Error fetching job IDs');
            return;
        }

        let nextJobID = 'OUT01'; // Default jobID if no existing IDs are found
        if (results.length > 0) {
            const lastJobID = results[0].jobID;
            const lastNumber = parseInt(lastJobID.substring(3), 10); // Extract the numeric part
            nextJobID = `OUT${String(lastNumber + 1).padStart(2, '0')}`; // Increment and pad with leading zeros
        }

        res.status(200).json({ nextJobID });
    });
});

app.post('/late-checkin', (req, res) => {
    console.log('Request body:', req.body);

    const { idemployees, jobID, jobType, userLocation, place_name, textInput, checkInDateTime, checkOutDateTime, uploadedFilePath } = req.body;

    // Insert leave data into the attendance table
    const query = `
        INSERT INTO attendance (idemployees, jobID, jobType, location, place_name, description, in_time, out_time, image_url, isCheckedIn)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        idemployees,
        'LATE', // Fixed jobID for late check-ins
        'คำร้องย้อนหลัง',
        JSON.stringify(userLocation),
        place_name || 'none',
        textInput,
        checkInDateTime,
        checkOutDateTime,
        uploadedFilePath,
        0 // Mark as checked-in
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting leave-checkin data:', err.stack);
            res.status(500).send('Error inserting leave-checkin data');
            return;
        } else {
            res.status(200).send('Leave-checkin data inserted successfully');
        }
    });
});

app.get('/orglist', (req, res) => {
    const query = `
        SELECT DISTINCT iddep, depname, divname
        FROM orglist
        WHERE depname IS NOT NULL AND depname != ''
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching orglist data:', err.stack);
            res.status(500).send('Error fetching orglist data');
        } else {
            // Group divisions under their respective departments
            const groupedData = results.reduce((acc, row) => {
                const { iddep, depname, divname } = row;
                if (!acc[depname]) {
                    acc[depname] = { iddep, divisions: [] };
                }
                if (divname) {
                    acc[depname].divisions.push(divname);
                }
                return acc;
            }, {});

            // Convert grouped data to an array
            const response = Object.keys(groupedData).map(depname => ({
                iddep: groupedData[depname].iddep,
                depname,
                divisions: groupedData[depname].divisions
            }));

            res.status(200).json(response);
        }
    });
});

app.get('/employee-search', (req, res) => {
    const { department, division } = req.query;

    console.log('Query Parameters:', { department, division });

    let query = `
        SELECT e.idemployees, e.name, e.department, e.division, o.depname AS department_name, o.divname AS division_name
        FROM employees e
        INNER JOIN orglist o ON e.department = o.depname AND e.division = o.divname
        WHERE 1=1
    `;

    const params = [];

    if (department) {
        query += ` AND o.depname = ?`;
        params.push(department);
    }

    if (division) {
        query += ` AND o.divname = ?`;
        params.push(division);
    }

    console.log('SQL Query:', query);
    console.log('Parameters:', params);

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error fetching filtered employee data:', err.stack);
            res.status(500).send('Error fetching filtered employee data');
        } else {
            res.status(200).json(results);
        }
    });
});



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
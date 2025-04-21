import React, { useState, useEffect, useMemo } from 'react';
import {VictoryPie} from 'victory';
import './css/Dashboard.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Dashboard({ role }) {
    const API_URL = process.env.REACT_APP_API_URL;
    const [workData, setWorkData] = useState([]);
    const [leaveData, setLeaveData] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [empId, setEmpId] = useState('');
    const [selectedWork, setSelectedWork] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [timeRange, setTimeRange] = useState('monthly');
    const [metric, setMetric] = useState({
        onTime: 0,
        offsite: 0,
        late: 0,
    });
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedQuarter, setSelectedQuarter] = useState(1);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');

    const [onTimePercentage, setOnTimePercentage] = useState(0);
    const [offsitePercentage, setOffsitePercentage] = useState(0);
    const [latePercentage, setLatePercentage] = useState(0);

    const [lateEmployeesCount, setLateEmployeesCount] = useState(0);

    const handleMonthChange = (event) => {
        setSelectedMonth(parseInt(event.target.value));
    };

    const handleYearChange = (event) => {
        setSelectedYear(parseInt(event.target.value));
    }

    const handleQuarterChange = (event) => {
        setSelectedQuarter(parseInt(event.target.value));
    };

    const handleTimeRangeChange = (event) => {
        setTimeRange(event.target.value);
    };

    const handleEmployeeChange = (event) => {
        setSelectedEmployee(event.target.value);
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch(`${API_URL}/employee-data`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched employees:', data);

                    let filteredEmployees = data;
                    if (role === 'Supervisor') {
                        filteredEmployees = data.filter(
                            (employee) => employee.supervisor == empId || employee.idemployees == empId
                        );
                    }

                    setEmployees(filteredEmployees); 
                } else {
                    console.error('Failed to fetch employees');
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        if (empId) {
            fetchEmployees();
        }
    }, [empId, role]);

    const calculateWorkingDays = (startDate, endDate, holidays) => {
        console.log('Start Date:', startDate);
        console.log('End Date:', endDate);
        let workingDays = 0;
    
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const isWeekend = date.getDay() === 0 || date.getDay() === 6; // วันอาทิตย์ (0) และวันเสาร์ (6)
            const isHoliday = holidays.some(holiday => {
                const holidayDate = new Date(holiday.start.date || holiday.start.dateTime);
                return holidayDate.toDateString() === date.toDateString();
            });
    
            if (!isWeekend && !isHoliday) {
                workingDays++;
            }
        }
    
        console.log('Working Days:', workingDays);
        return workingDays;
    };

    const calculateOffsiteMinutes = (startDate, startTime, endDate, endTime) => {
        console.log('Input data for calculateOffsiteMinutes:', { startDate, startTime, endDate, endTime });

        const cleanStartTime = startTime.split('+')[0];
        const cleanEndTime = endTime.split('+')[0];

        const start = new Date(`${startDate}T${cleanStartTime}`);
        const end = new Date(`${endDate}T${cleanEndTime}`);

        if (isNaN(start) || isNaN(end)) {
            console.log('Invalid date format:', { startDate, startTime, endDate, endTime });
            return 0;
        }

        if (start >= end) {
            console.log('Start time is greater than or equal to end time. Skipping calculation.');
            return 0;
        }

        start.setSeconds(0, 0);
        end.setSeconds(0, 0);

        let totalMinutes = 0;
        
        while (start < end) {
            const currentDayStart = new Date(start);
            currentDayStart.setHours(8, 30, 0, 0);
    
            const currentDayEnd = new Date(start);
            currentDayEnd.setHours(17, 30, 0, 0);
    
            if (start < currentDayStart) {
                start.setHours(8, 30, 0, 0);
            }
    
            if (start >= currentDayStart && start < currentDayEnd) {
                const lunchStart = new Date(start);
                lunchStart.setHours(12, 0, 0, 0);
    
                const lunchEnd = new Date(start);
                lunchEnd.setHours(13, 0, 0, 0);
    
                if (start < lunchStart && end > lunchEnd) {
                    totalMinutes += (lunchStart - start) / (1000 * 60);
                    totalMinutes += (end - lunchEnd) / (1000 * 60);
                } else if (end <= lunchStart || start >= lunchEnd) {
                    totalMinutes += (end - start) / (1000 * 60);
                } else if (start < lunchStart && end <= lunchEnd) {
                    totalMinutes += (lunchStart - start) / (1000 * 60);
                } else if (start >= lunchStart && end > lunchEnd) {
                    totalMinutes += (end - lunchEnd) / (1000 * 60);
                }
            }
    
            start.setDate(start.getDate() + 1);
            start.setHours(8, 30, 0, 0);
        }
    
        console.log('Total offsite minutes calculated:', totalMinutes);
        return totalMinutes;
    };

    useEffect(() => {
        const fetchJobAssignments = async () => {
            try {
                const response = await fetch(`${API_URL}/get-all-offsite-jobs`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
    
                if (response.ok) {
                    const jobAssignments = await response.json();
                    console.log('Fetched job assignments:', jobAssignments);
    
                    const updatedWorkData = workData.map(item => {
                        const jobAssignment = jobAssignments.find(job => job.jobID === item.jobID && job.idemployees === item.idemployees);
                        if (jobAssignment) {
                            const { idemployees, ...restJobAssignment } = jobAssignment;
                            return { ...item, ...restJobAssignment }; 
                        }
                        return item;
                    });
                    
                    console.log('Updated work data:', updatedWorkData);

                    setWorkData(prevWorkData => {
                        if (JSON.stringify(prevWorkData) !== JSON.stringify(updatedWorkData)) {
                            return updatedWorkData;
                        }
                        return prevWorkData;
                    });

                } else {
                    console.error('Response is not OK. Failed to fetch job assignments');
                }
            } catch (error) {
                console.error('Error fetching job assignments:', error);
            }
        };
    
        if (workData.length > 0) fetchJobAssignments();
    }, [API_URL]);

    const filteredWorkData = useMemo(() => {
        return workData
            .filter((item) => {
                const inTime = new Date(item.in_time);

                if (timeRange === 'monthly') {
                    return (
                        inTime.getFullYear() === selectedYear &&
                        inTime.getMonth() + 1 === selectedMonth &&
                        (!selectedEmployee || item.idemployees === selectedEmployee)
                    );
                } else if (timeRange === 'quarterly') {
                    const quarterStartMonth = (selectedQuarter - 1) * 3;
                    const quarterEndMonth = quarterStartMonth + 2;
                    return (
                        inTime.getFullYear() === selectedYear &&
                        inTime.getMonth() >= quarterStartMonth &&
                        inTime.getMonth() <= quarterEndMonth &&
                        (!selectedEmployee || item.idemployees === selectedEmployee)
                    );
                } else if (timeRange === 'yearly') {
                    return (
                        inTime.getFullYear() === selectedYear &&
                        (!selectedEmployee || item.idemployees === selectedEmployee)
                    );
                }

                return false;
            })
            .sort((a, b) => new Date(b.in_time) - new Date(a.in_time));
    }, [workData, timeRange, selectedMonth, selectedYear, selectedQuarter, selectedEmployee]);

    useEffect(() => {
        console.log('Filtered Work Data:', filteredWorkData);
    }, [filteredWorkData]);

    const filteredLeaveData = leaveData.filter((item) => {
        const startDate = new Date(item.start_date);
    
        if (timeRange === 'monthly') {
            return (
                startDate.getFullYear() === selectedYear &&
                startDate.getMonth() + 1 === selectedMonth &&
                (!selectedEmployee || item.idemployees === selectedEmployee)
            );
        } else if (timeRange === 'quarterly') {
            const quarterStartMonth = (selectedQuarter - 1) * 3;
            const quarterEndMonth = quarterStartMonth + 2;
            return (
                startDate.getFullYear() === selectedYear &&
                startDate.getMonth() >= quarterStartMonth &&
                startDate.getMonth() <= quarterEndMonth &&
                (!selectedEmployee || item.idemployees === selectedEmployee)
            );
        } else if (timeRange === 'yearly') {
            return (
                startDate.getFullYear() === selectedYear &&
                (!selectedEmployee || item.idemployees === selectedEmployee)
            );
        }
    
        return false;
    })
    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

    useEffect(() => {
        const calculateMetrics = () => {
            let startDate = new Date();
            let endDate = new Date();

            if (timeRange === 'monthly') {
                startDate = new Date(selectedYear, selectedMonth - 1, 1);
                endDate = new Date(selectedYear, selectedMonth, 0);
            } else if (timeRange === 'quarterly') {
                const quarterStartMonth = (selectedQuarter - 1) * 3;
                startDate = new Date(selectedYear, quarterStartMonth, 1);
                endDate = new Date(selectedYear, quarterStartMonth + 3, 0);
            } else if (timeRange === 'yearly') {
                startDate = new Date(selectedYear, 0, 1);
                endDate = new Date(selectedYear, 11, 31);
            }

            const totalWorkingDays = calculateWorkingDays(startDate, endDate, holidays);

            if (filteredWorkData.length === 0) {
                console.log('No work data available for calculation.');
                setMetric((prevMetric) => ({
                    ...prevMetric,
                    onTime: 0,
                    offsite: 0,
                    late: 0,
                    totalActualMinutes: 0,
                    totalRequiredMinutes: totalWorkingDays * 480 * (selectedEmployee === "" ? employees.length : 1),
                    totalOffsiteMinutes: 0,
                    totalRequiredOffsiteMinutes: totalWorkingDays * 480 * (selectedEmployee === "" ? employees.length : 1),
                    totalLateDays: 0,
                    totalWorkingDays
                }));
                setOnTimePercentage(0);
                setOffsitePercentage(0);
                return;
            }
    
            let totalActualMinutes = 0;
            let totalLateDays = 0;
            let totalOffsiteMinutes = 0;
            let totalRequiredOffsiteMinutes = totalWorkingDays * 480 * (selectedEmployee === "" ? employees.length : 1);

            const lateDaysSet = new Set();
            const workByDate = new Map();

            filteredWorkData.forEach((item) => {
                const dateKey = new Date(item.in_time).toDateString();
                if (!workByDate.has(dateKey)) {
                    workByDate.set(dateKey, []);
                }
                workByDate.get(dateKey).push(item);
            });

            workByDate.forEach((records, dateKey) => {
                let isLateOrEarlyLeave = false;

                records.forEach((record) => {
                    if (!record.jobType.startsWith("งานนอกสถานที่")) {
                        const inTime = new Date(record.in_time);
                        const outTime = record.out_time ? new Date(record.out_time) : null;
            
                        const startWork = new Date(inTime);
                        startWork.setHours(8, 30, 0, 0);  
            
                        const endWork = new Date(inTime);
                        endWork.setHours(17, 30, 0, 0);  
            
                        if (inTime > startWork || (outTime && outTime < endWork)) {
                            isLateOrEarlyLeave = true;
                        }
                    }
                });

                if (isLateOrEarlyLeave) {
                    lateDaysSet.add(dateKey);
                }
            });

            totalLateDays = lateDaysSet.size;
            console.log('Total Late Days:', totalLateDays);

            let totalRequiredMinutes = totalWorkingDays * 480;
            if (selectedEmployee === "") {
                totalRequiredMinutes *= employees.length;
                totalRequiredOffsiteMinutes = employees.length * totalWorkingDays * 480;
            } else {
                totalRequiredOffsiteMinutes = totalWorkingDays * 480;
            }
    
            filteredWorkData.forEach((item) => {
                const inTime = new Date(item.in_time);
                const outTime = new Date(item.out_time);
    
                inTime.setSeconds(0, 0);
                outTime.setSeconds(0, 0);
    
                while (inTime < outTime) {
                    const startWork = new Date(inTime);
                    startWork.setHours(8, 30, 0, 0);
    
                    const endWork = new Date(inTime);
                    endWork.setHours(17, 30, 0, 0);
    
                    const lunchStart = new Date(inTime);
                    lunchStart.setHours(12, 0, 0, 0);
    
                    const lunchEnd = new Date(inTime);
                    lunchEnd.setHours(13, 0, 0, 0);
    
                    const dayStart = Math.max(inTime, startWork);
                    const dayEnd = Math.min(outTime, endWork);
    
                    if (dayStart < lunchStart && dayEnd > lunchEnd) {
                        const beforeLunch = (lunchStart - dayStart) / (1000 * 60);
                        const afterLunch = (dayEnd - lunchEnd) / (1000 * 60);
                        totalActualMinutes += Math.max(0, beforeLunch + afterLunch);
                    } else if (dayEnd <= lunchStart || dayStart >= lunchEnd) {
                        totalActualMinutes += Math.max(0, (dayEnd - dayStart) / (1000 * 60));
                    } else if (dayStart < lunchStart && dayEnd <= lunchEnd) {
                        totalActualMinutes += Math.max(0, (lunchStart - dayStart) / (1000 * 60));
                    } else if (dayStart >= lunchEnd) {
                        totalActualMinutes += Math.max(0, (dayEnd - dayStart) / (1000 * 60));
                    }
    
                    inTime.setDate(inTime.getDate() + 1);
                    inTime.setHours(8, 30, 0, 0);
                }
    
                if (item.jobType.startsWith("งานนอกสถานที่") || item.jobType === "คำร้องย้อนหลัง") {
                    const offsiteMinutes = calculateOffsiteMinutes(
                        item.in_time.split('T')[0],
                        item.in_time.split('T')[1],
                        item.out_time.split('T')[0],
                        item.out_time.split('T')[1]
                    );

                    if (offsiteMinutes < 0) {
                        console.error('Negative offsite minutes detected:', offsiteMinutes, item);
                    }

                    if (offsiteMinutes >= 0) {
                        totalOffsiteMinutes += offsiteMinutes;
                    } else {
                        console.error('Skipping negative offsite minutes:', offsiteMinutes, item);
                    }
                    console.log('Total offsite minutes after calculation:', totalOffsiteMinutes);
                }
            });
    
            console.log('Total actual minutes:', totalActualMinutes);
            console.log('Total offsite minutes:', totalOffsiteMinutes);
    
            const onTimePercentage = totalRequiredMinutes > 0
                ? (totalActualMinutes / totalRequiredMinutes) * 100
                : 0;
    
            const offsitePercentage = totalRequiredMinutes > 0
                ? (totalOffsiteMinutes / totalRequiredMinutes) * 100
                : 0;
    
            const latePercentage = totalWorkingDays > 0
                ? (totalLateDays / totalWorkingDays) * 100
                : 0;
    
            setMetric((prevMetric) => ({
                ...prevMetric,
                onTime: isNaN(onTimePercentage) ? "-" : onTimePercentage.toFixed(2),
                offsite: isNaN(offsitePercentage) ? "-" : offsitePercentage.toFixed(2),
                late: isNaN(latePercentage) ? "-" : latePercentage.toFixed(2),
                totalActualMinutes,
                totalRequiredMinutes: totalWorkingDays * 480 * (selectedEmployee === "" ? employees.length : 1),
                totalOffsiteMinutes,
                totalRequiredOffsiteMinutes,
                totalLateDays,
                totalWorkingDays
            }));
    
            setOnTimePercentage(onTimePercentage);
            setOffsitePercentage(offsitePercentage);
            setLatePercentage(latePercentage);
        };
    
        calculateMetrics();
    }, [filteredWorkData, holidays, selectedMonth, selectedQuarter, selectedYear, selectedEmployee]);

    const isWorkingDay = (date, holidays) => {
        const day = date.getDay();
        const isWeekend = day === 0 || day === 6;
        const isHoliday = holidays.some(holiday => {
            const holidayDate = new Date(holiday.start.date || holiday.start.dateTime);
            return holidayDate.toDateString() === date.toDateString();
        });
        return !isWeekend && !isHoliday;
    };
    
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        const empId = user?.idemployees;
        console.log('Role:', role);
        console.log('Employee ID:', empId);
        setEmpId(empId);
    }, []);
    
    useEffect(() => {
        const fetchHolidays = async () => {
            const API_KEY = 'AIzaSyDox1fRNODZVo8U3Pv9LU41l-0nzmK-E2c';
            const CALENDAR_ID = 'th.th#holiday@group.v.calendar.google.com';
            const BASE_URL = `https://www.googleapis.com/calendar/v3/calendars/th.th%23holiday@group.v.calendar.google.com/events`;
    
            try {
                const params = new URLSearchParams({
                    key: API_KEY,
                    singleEvents: true,
                    orderBy: 'startTime',
                });
    
                const response = await fetch(`${BASE_URL}?${params}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched holidays from Google Calendar:', data.items);
                    
                    const filteredHolidays = data.items.filter(
                        (holiday) => holiday.description === "วันหยุดนักขัตฤกษ์"
                    );
    
                    console.log('Filtered holidays (วันหยุดนักขัตฤกษ์ only):', filteredHolidays);
                    setHolidays(filteredHolidays || []);
                } else {
                    console.error('Failed to fetch holidays from Google Calendar');
                }
            } catch (error) {
                console.error('Error fetching holidays from Google Calendar:', error);
            }
        };
    
        fetchHolidays();
    }, []);

    let totalOffsiteMinutes = 0;

    useEffect(() => {
        const fetchAssignedJobs = async () => {
            try {
                const response = await fetch(`${API_URL}/get-all-assigned-jobs/${empId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
    
                if (response.ok) {
                    const assignedJobs = await response.json();
                    console.log('Fetched assigned jobs:', assignedJobs);
    
                    const offsiteJobs = assignedJobs.filter(job => job.jobname.startsWith("งานนอกสถานที่"));
                    console.log('Filtered offsite jobs:', offsiteJobs);
    
                    let totalRequiredOffsiteMinutes = 0;
    
                    offsiteJobs.forEach(job => {
                        const jobStartDate = new Date(job.start_date);
                        const jobEndDate = new Date(job.end_date);
    
                        let startDate, endDate;
                        if (timeRange === 'monthly') {
                            startDate = new Date(selectedYear, selectedMonth - 1, 1);
                            endDate = new Date(selectedYear, selectedMonth, 0);
                        } else if (timeRange === 'quarterly') {
                            const quarterStartMonth = (selectedQuarter - 1) * 3;
                            startDate = new Date(selectedYear, quarterStartMonth, 1);
                            endDate = new Date(selectedYear, quarterStartMonth + 3, 0);
                        } else if (timeRange === 'yearly') {
                            startDate = new Date(selectedYear, 0, 1);
                            endDate = new Date(selectedYear, 11, 31);
                        }
    
                        if (jobStartDate <= endDate && jobEndDate >= startDate) {
                            const requiredMinutes = calculateOffsiteMinutes(
                                job.start_date,
                                job.start_time,
                                job.end_date,
                                job.end_time
                            );
                            totalRequiredOffsiteMinutes += requiredMinutes;
                        }
                    });
    
                    console.log('Total required offsite minutes:', totalRequiredOffsiteMinutes);
    
                    setMetric(prevMetric => ({
                        ...prevMetric,
                        totalOffsiteMinutes,
                        totalRequiredOffsiteMinutes
                    }));
                } else {
                    console.error('Failed to fetch assigned jobs');
                }
            } catch (error) {
                console.error('Error fetching assigned jobs:', error);
            }
        };
    
        if (empId) fetchAssignedJobs();
    }, [empId, holidays, timeRange, selectedMonth, selectedQuarter, selectedYear]);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const response = await fetch(`${API_URL}/attendance`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched attendance data:', data);

                    setWorkData(data);
                } else {
                    console.error('Failed to fetch attendance data');
                }
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            }
        };

        fetchAttendanceData();
    }, []);

    useEffect(() => {
        const fetchLeaveData = async () => {
            try {
                const response = await fetch(`${API_URL}/request-get`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched leave data:', data);

                    let filteredData = data;
                    if (role === 'Employee') {
                        filteredData = data.filter(item => item.idemployees === empId);
                    } else if (role === 'Supervisor') {
                        const user = JSON.parse(localStorage.getItem('user'));
                        const department = user?.department;
                        const division = user?.division;

                        if (department && !division) {
                            filteredData = data.filter(item => item.department === department || item.idemployees === empId);
                        } else if (division) {
                            filteredData = data.filter(item => item.division === division || item.idemployees === empId);
                        }
                    } else if (role === 'HR') {
                        filteredData = data;
                    }    

                    console.log('Filtered leave data:',filteredData);
                    setLeaveData(filteredData);
                } else {
                    console.error('Failed to fetch leave data');
                }
            } catch (error) {
                console.error('Error fetching leave data:', error);
            }
        };

        if (role && empId) {
            fetchLeaveData();
        }
    }, [role, empId]);

    const handleDetailsClick = (work) => {
        console.log('Selected work:', work);
        setSelectedWork(work);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedWork(null);
    }

    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleString('th-TH', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const formatDateTime2 = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleString('th-TH', {
            dateStyle: 'medium'
        });
    };

    useEffect(() => {
        if (empId) {
            setSelectedEmployee(empId);
        }
    }, [empId]);

    useEffect(() => {
        const lateEmployees = new Set();

        filteredWorkData.forEach((item) => {
            const inTime = new Date(item.in_time);
            const jobType = item.jobType;

            console.log('Processing Entry:', {
                jobID: item.jobID,
                jobType,
                inTime,
                employeeID: item.idemployees,
            });

            if (jobType === "เข้างานออฟฟิศ") {
                const startWork = new Date(inTime);
                startWork.setHours(8, 30, 0, 0);

                if (inTime > startWork) {
                    lateEmployees.add(item.idemployees);
                }
            } else {
                const jobAssignment = workData.find(job => job.jobID === item.jobID);
                if (jobAssignment) {
                    const jobStartTime = new Date(`${jobAssignment.start_date}T${jobAssignment.start_time}`);
                    if (inTime > jobStartTime) {
                        lateEmployees.add(item.idemployees);
                    }
                }
            }
        });

        console.log('Unique Late Employees:', lateEmployees);
        setLateEmployeesCount(lateEmployees.size);
    }, [filteredWorkData, workData]);

    return (
        <div className="dashboard-container" style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>รายงานผลการทำงาน</h5>

            {/* Dropdown สำหรับเลือกพนักงาน */}
            {(role === "HR" || role === "Supervisor" || role === "Admin") && (
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="employeeSelect">เลือกพนักงาน: </label>
                        <select
                            id="employeeSelect"
                            value={selectedEmployee}
                            onChange={handleEmployeeChange}
                        >
                        {role !== "Supervisor" && (
                            <option value="">พนักงานทั้งหมด</option>
                        )}
                        {employees.length > 0 ? (
                            employees.map((employee) => (
                                <option key={employee.idemployees} value={employee.idemployees}>
                                    {employee.name || "ไม่มีชื่อ"} {/* แสดงข้อความหากไม่มีชื่อ */}
                                </option>
                            ))
                        ) : (
                            <option value="">ไม่มีข้อมูลพนักงาน</option>
                        )}
                    </select>
                </div>
            )}
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="timeRange">เลือกช่วงเวลา: </label>
                <select id="timeRange" value={timeRange} onChange={handleTimeRangeChange}>
                    <option value="monthly">รายเดือน</option>
                    <option value="quarterly">รายไตรมาส</option>
                    <option value="yearly">รายปี</option>
                </select>
            </div>
            {timeRange === 'monthly' && (
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="month">เลือกเดือน: </label>
                    <select id="month" value={selectedMonth} onChange={handleMonthChange}>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {timeRange === 'quarterly' && (
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="quarter">เลือกไตรมาส: </label>
                    <select id="quarter" value={selectedQuarter} onChange={handleQuarterChange}>
                        <option value={1}>ไตรมาสที่ 1</option>
                        <option value={2}>ไตรมาสที่ 2</option>
                        <option value={3}>ไตรมาสที่ 3</option>
                        <option value={4}>ไตรมาสที่ 4</option>
                    </select>
                </div>
            )}

            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="year">เลือกปี: </label>
                <select id="year" value={selectedYear} onChange={handleYearChange}>
                {Array.from({ length: 5 }, (_, i) => {
                    const yearCE = new Date().getFullYear() - i; // ปี ค.ศ.
                    const yearBE = yearCE + 543; // ปี พ.ศ.
                    return (
                        <option key={i} value={yearCE}>
                            {yearBE} {/* แสดงปี พ.ศ. */}
                        </option>
                    );
                })}
                </select>
            </div>

            <div className="metrics-container" style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '10px' }}>
                    <strong>เวลาเข้างานทั้งหมด:</strong> {`${metric.totalActualMinutes || 0} / ${metric.totalRequiredMinutes || 0} นาที`}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>นอกสถานที่:</strong> {`${metric.totalOffsiteMinutes || 0} / ${metric.totalRequiredMinutes || 0} นาที`}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>สาย-ออกก่อนเวลา:</strong> {`${metric.totalLateDays || 0} / ${metric.totalWorkingDays || 0} วัน`}
                    {selectedEmployee === "" && (
                        <p>พนักงานที่มาสายในเดือนนี้: {lateEmployeesCount} คน</p>
                    )}
                </div>
            </div>

            {/* Commented out VictoryPie components */}
            
            <div className="pie-chart-container">
                <div className="pie-chart-wrapper" style={{ display: "flex", gap: "20px" }}>
                    <div style={{ position: "relative", width: 200, height: 200 }}>
                        <VictoryPie 
                            padAngle={0}
                            labelComponent={<span />}
                            innerRadius={70}
                            width={200} height={200}
                            data={[
                                { x: "On Time", y: onTimePercentage },
                                { x: "Remaining", y: 100 - onTimePercentage }
                            ]}
                            colorScale={["#19B3A6", "#EEEEEE"]}
                        />
                        <svg width={200} height={200} style={{ position: "absolute", top: 0, left: 0 }}>
                            <text x="50%" y="53%" textAnchor="middle">
                                {onTimePercentage.toFixed(2)}%
                            </text>
                        </svg>
                        <div style={{ position: "absolute", marginTop: -20, width: "100%", textAlign: "center" }}>
                            เวลาเข้างานทั้งหมด
                        </div>
                    </div>

                    <div style={{ position: "relative", width: 200, height: 200 }}>
                        <VictoryPie 
                            padAngle={0}
                            labelComponent={<span />}
                            innerRadius={70}
                            width={200} height={200}
                            data={[
                                { x: "Offsite", y: offsitePercentage },
                                { x: "Remaining", y: 100 - offsitePercentage }
                            ]}
                            colorScale={["blue", "#EEEEEE"]}
                        />
                        <svg width={200} height={200} style={{ position: "absolute", top: 0, left: 0 }}>
                            <text x="50%" y="53%" textAnchor="middle">
                                {offsitePercentage.toFixed(2)}%
                            </text>
                        </svg>
                        <div style={{ position: "absolute", marginTop: -20, width: "100%", textAlign: "center" }}>
                            นอกสถานที่
                        </div>
                    </div>

                    <div style={{ position: "relative", width: 200, height: 200 }}>
                        <VictoryPie 
                            padAngle={metric.totalWorkingDays > 0 ? 0 : 1}
                            labelComponent={<span />}
                            innerRadius={70}
                            width={200} height={200}
                            data={[
                                { x: "Late Days", y: metric.totalLateDays },
                                { x: "Remaining Days", y: metric.totalWorkingDays - metric.totalLateDays }
                            ]}
                            colorScale={["red", "#EEEEEE"]}
                        />
                        <svg width={200} height={200} style={{ position: "absolute", top: 0, left: 0 }}>
                            <text x="50%" y="53%" textAnchor="middle">
                            {`${metric.totalLateDays} / ${metric.totalWorkingDays}`}
                            </text>
                        </svg>
                        <div style={{ position: "absolute", marginTop: -20, width: "100%", textAlign: "center" }}>
                            สาย-ออกก่อนเวลา
                        </div>
                    </div>
                </div>
            </div>
           

            <p></p>
        
            <p>การลงเวลาเข้า-ออกงาน</p>
            <div className="table-container">
                <table className="table table-bordered table-striped">
                    <thead style={{display:'table-header-group'}}>
                        <tr>
                            <th style={{ padding: "10px" }}>รหัสงาน</th>
                            <th style={{ padding: "10px" }}>ประเภทงาน</th>
                            <th style={{ padding: "10px" }}>รายละเอียดงาน</th>
                            <th style={{ padding: "10px" }}>รหัสพนักงาน</th>
                            <th style={{ padding: "10px" }}>เวลาเข้า</th>
                            <th style={{ padding: "10px" }}>เวลาออก</th>
                            <th style={{ padding: "10px" }}>ชื่อสถานที่</th>
                            <th style={{ padding: "10px" }}>รายละเอียด</th>
                            {/* <th style={{ padding: "10px" }}>ไฟล์รูปภาพ</th> */}
                        </tr>
                    </thead>
                    <tbody style={{display:'table-header-group'}}>
                        {filteredWorkData.map((el) => (
                            <tr key={el.idattendance}>
                                <td style={{ padding: "10px" }}>{el.jobID}</td>
                                <td style={{ padding: "10px" }}>{el.jobType}</td>
                                <td style={{ padding: "10px" }}>{el.description}</td>
                                <td style={{ padding: "10px" }}>{el.idemployees}</td>
                                <td style={{ padding: "10px" }}>{formatDateTime(el.in_time)}</td>
                                <td style={{ padding: "10px" }}>
                                {el.out_time && !isNaN(Date.parse(el.out_time))
                                    ? formatDateTime(el.out_time)
                                    : "ยังไม่ลงเวลาออก"}
                                </td>
                                <td style={{ padding: "10px" }}>{el.place_name}</td>
                                <td style={{ padding: "10px" }}>
                                    <button className="btn btn-primary" onClick={() => handleDetailsClick(el)}>รายละเอียด</button>
                                </td>
                                {/* <td style={{ padding: "10px" }}>{el.image_url}</td> */}
                            </tr>
                        ))}
                        {/* {workData.map((el) => (
                            <tr key={el.workId}>
                                <td style={{ padding: "10px" }}>{el.workId}</td>
                                <td style={{ padding: "10px" }}>{el.type}</td>
                                <td style={{ padding: "10px" }}>{el.textInput}</td>
                                <td style={{ padding: "10px" }}>{el.checkInDateTime}</td>
                                <td style={{ padding: "10px" }}>{el.checkOutDateTime}</td>
                                <td style={{ padding: "10px" }}>{el.location}</td>
                                <td style={{ padding: "10px" }}>{el.uploadedFilePath}</td>
                            </tr>
                        ))} */}
                    </tbody>
                </table>
            </div>
            <p>รายการคำร้องลา</p>
            <div className="table-container">
                <table className="table table-bordered table-striped">
                    <thead style={{display:'table-header-group'}}>
                        <tr>
                            <th style={{ padding: "10px" }}>รหัสพนักงาน</th>
                            <th style={{ padding: "10px" }}>ประเภท</th>
                            {/* <th style={{ padding: "10px" }}>พิกัดสถานที่</th> */}
                            <th style={{ padding: "10px" }}>ชื่อสถานที่</th>
                            <th style={{ padding: "10px" }}>วันที่เริ่มต้น</th>
                            <th style={{ padding: "10px" }}>เวลาเริ่มต้น</th>
                            <th style={{ padding: "10px" }}>วันที่สิ้นสุด</th>
                            <th style={{ padding: "10px" }}>เวลาสิ้นสุด</th>
                            {/* <th style={{ padding: "10px" }}>Supervisor</th> */}
                            <th style={{ padding: "10px" }}>รายละเอียด</th>
                            <th style={{ padding: "10px" }}>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody style={{display:'table-header-group'}}>
                        {filteredLeaveData.map((el) => (
                            <tr key={el.idrequests}>
                                <td style={{ padding: "10px" }}>{el.idemployees}</td>
                                <td style={{ padding: "10px" }}>{el.leaveType}</td>
                                {/* <td style={{ padding: "10px" }}>{el.location}</td> */}
                                <td style={{ padding: "10px" }}>{el.place_name}</td>
                                <td style={{ padding: "10px" }}>{formatDateTime2(el.start_date)}</td>
                                <td style={{ padding: "10px" }}>{el.start_time}</td>
                                <td style={{ padding: "10px" }}>{formatDateTime2(el.end_date)}</td>
                                <td style={{ padding: "10px" }}>{el.end_time}</td>
                                <td style={{ padding: "10px" }}>{el.reason}</td>
                                <td style={{ padding: "10px" }}>{el.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && selectedWork && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h4>รายละเอียดการลงเวลาเข้างาน</h4>
                        <p><strong>รหัสงาน:</strong> {selectedWork.jobID}</p>
                        <p><strong>ประเภทงาน:</strong> {selectedWork.jobType}</p>
                        <p><strong>รายละเอียดงาน:</strong> {selectedWork.description}</p>
                        <p><strong>รหัสพนักงาน:</strong> {selectedWork.idemployees}</p>
                        <p><strong>เวลาเข้า:</strong> {selectedWork.in_time}</p>
                        <p><strong>เวลาออก:</strong> {selectedWork.out_time}</p>
                        <p><strong>ชื่อสถานที่:</strong> {selectedWork.place_name}</p>
                        <p><strong>ตำแหน่งที่ตั้ง:</strong></p>
                        <div>
                            {selectedWork.location ? (
                                <>
                                    {console.log('Selected Work Location:', selectedWork.location)}
                                    {(() => {
                                        const location =
                                            typeof selectedWork.location === 'string'
                                                ? JSON.parse(selectedWork.location)
                                                : selectedWork.location;

                                        console.log('Parsed location:', location);
                                    
                                        return (
                                            <MapContainer
                                                key={`${location.latitude}-${location.longitude}`}
                                                center={[location.latitude, location.longitude]}
                                                zoom={13}
                                                style={{ height: '300px', width: '100%' }}
                                            >
                                                <TileLayer
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                <Marker
                                                    position={[
                                                        location.latitude,
                                                        location.longitude,
                                                    ]}
                                                >
                                                    <Popup>ตำแหน่งที่ตั้ง</Popup>
                                                </Marker>
                                            </MapContainer>
                                        );
                                    })()}
                                </>
                            ) : (
                                <p>ไม่มีข้อมูลตำแหน่งที่ตั้ง</p>
                            )}
                        </div>
                        <p><strong>ภาพประกอบการปฏิบัติงาน:</strong></p>
                        {selectedWork && selectedWork.image_url ? (
                            <img 
                                src={selectedWork.image_url.startsWith('http') ? selectedWork.image_url : `${API_URL}${selectedWork.image_url}`} 
                                alt="ภาพประกอบการปฏิบัติงาน" 
                                style={{ maxWidth: '100%', maxHeight: '300px' }} 
                            />
                        ) : (
                            <p>ไม่มีภาพประกอบ</p>
                        )}
                        <button className="btn btn-danger" onClick={closeModal}>ปิด</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
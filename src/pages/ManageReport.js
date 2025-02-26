import React, {useState} from 'react';
import * as XLSX from 'xlsx';

function ManageReport() {
    const [leaveData, setLeaveData] = useState([
        {
            workId: '001',
            type: 'Job A',
            textInput: 'Engineering',
            checkInDateTime: '2025-01-21 9:00',
            checkOutDateTime: '2025-01-21 15:00',
            location: 'XXX',
            uploadedFilePath: 'xxxxxxx'
        },
        {
            workId: '002',
            type: 'Job B',
            textInput: 'Development',
            checkInDateTime: '2025-01-21 9:00',
            checkOutDateTime: '2025-01-21 15:00',
            location: 'YYY',
            uploadedFilePath: 'yyyyyyy'
        }
    ]);

    const handleImport = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            setLeaveData((prevData) => [...prevData, ...jsonData]);
        }

        reader.readAsArrayBuffer(file);
    }

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(leaveData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Data');

        XLSX.writeFile(workbook, 'ReportData.xlsx');
    }

    const [editIndex, setEditIndex] = useState(null);
    const [editedData, setEditedData] = useState({});
    
    const handleEdit = (index) => {
        setEditIndex(index);
        setEditedData( {...leaveData[index ]});
    }

    const handleSave = () => {
        const updatedData = [...leaveData];
        updatedData[editIndex] = editedData;
        setLeaveData(updatedData);
        setEditIndex(null);
        setEditedData({});
    }

    const handleChange = (key, value) => {
        setEditedData((prevData) => ({ ...prevData, [key]: value }));
    }

    const handleCancel = () => {
        setEditIndex(null);
        setEditedData({});
    };

    const [addRemoveMode, setAddRemoveMode] = useState(false);
    const [newEntry, setNewEntry] = useState({});

    const toggleAddRemoveMode = () => {
        setAddRemoveMode((prev) => !prev);
    };

    const handleAddEntry = () => {
        if (newEntry.workId) {
            setLeaveData((prevData) => [...prevData, newEntry]);
            setNewEntry({});
        }
    };

    const handleRemoveEntry = (index) => {
        const confirmed = window.confirm('Are you sure you want to delete this entry?');
        if (confirmed) {
            setLeaveData((prevData) => prevData.filter((_, i) => i !== index));
        }
    };
    
    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>Manage Report</h5>
            <button className="btn btn-primary"  onClick={() => document.getElementById('file-upload').click()}>Import Data...</button>
            <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                accept=".xlsx,.xls"
                onChange={handleImport}
            />
            <button className="btn btn-primary" onClick={handleExport}>Export Data...</button>
            <button className="btn btn-primary" onClick={toggleAddRemoveMode}>{addRemoveMode ? 'Done' : 'Add/Remove...'}</button>
            <div>
                <table className="table table-bordered table-striped">
                    <thead style={{display:'table-header-group'}}>
                        <tr>
                            <th style={{ padding: "10px" }}>Work ID</th>
                            <th style={{ padding: "10px" }}>Type</th>
                            <th style={{ padding: "10px" }}>Description</th>
                            <th style={{ padding: "10px" }}>In Time</th>
                            <th style={{ padding: "10px" }}>Out Time</th>
                            <th style={{ padding: "10px" }}>Location</th>
                            <th style={{ padding: "10px" }}>Image</th>
                            <th style={{ padding: "10px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{display:'table-header-group'}}>
                        {leaveData.map((el, index) => (
                            <tr key={index}>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.workId}
                                            onChange={(e) => handleChange('workId', e.target.value)}
                                        />
                                    ) : (
                                        el.workId
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.type}
                                            onChange={(e) => handleChange('type', e.target.value)}
                                        />
                                    ) : (
                                        el.type
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.textInput}
                                            onChange={(e) => handleChange('textInput', e.target.value)}
                                        />
                                    ) : (
                                        el.textInput
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.checkInDateTime}
                                            onChange={(e) => handleChange('checkInDateTime', e.target.value)}
                                        />
                                    ) : (
                                        el.checkInDateTime
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.checkOutDateTime}
                                            onChange={(e) => handleChange('checkOutDateTime', e.target.value)}
                                        />
                                    ) : (
                                        el.checkOutDateTime
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.location}
                                            onChange={(e) => handleChange('location', e.target.value)}
                                        />
                                    ) : (
                                        el.location
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.uploadedFilePath}
                                            onChange={(e) => handleChange('uploadedFilePath', e.target.value)}
                                        />
                                    ) : (
                                        el.uploadedFilePath
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                            <>
                                                <button className="btn btn-success" onClick={handleSave}>Save</button>
                                                <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
                                            </>
                                        ) : addRemoveMode ? (
                                            <>
                                                <button className="btn btn-danger" onClick={() => handleRemoveEntry(index)}>Delete</button>
                                            </>
                                        ) : (
                                            <button className="btn btn-primary" onClick={() => handleEdit(index)}>Edit</button>
                                        )
                                    }
                                </td>
                            </tr>
                        ))}
                        {addRemoveMode && (
                            <tr>
                                <td>
                                    <input
                                        className="form-control"
                                        value={newEntry.workId || ''}
                                        onChange={(e) =>
                                            setNewEntry({ ...newEntry, workId: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        value={newEntry.type || ''}
                                        onChange={(e) =>
                                            setNewEntry({ ...newEntry, type: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        value={newEntry.textInput || ''}
                                        onChange={(e) =>
                                            setNewEntry({ ...newEntry, textInput: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        value={newEntry.checkInDateTime || ''}
                                        onChange={(e) =>
                                            setNewEntry({ ...newEntry, checkInDateTime: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        value={newEntry.checkOutDateTime || ''}
                                        onChange={(e) =>
                                            setNewEntry({ ...newEntry, checkOutDateTime: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        value={newEntry.location || ''}
                                        onChange={(e) =>
                                            setNewEntry({ ...newEntry, location: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        value={newEntry.uploadedFilePath || ''}
                                        onChange={(e) =>
                                            setNewEntry({ ...newEntry, uploadedFilePath: e.target.value })
                                        }
                                    />
                                </td>
                                <td style={{ padding: "10px" }}>
                                    <button className="btn btn-success" onClick={handleAddEntry}>
                                        Add
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ManageReport;
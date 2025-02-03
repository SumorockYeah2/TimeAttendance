import React, {useState} from 'react';
// import * as XLSX from 'xlsx';

function RoleData() {
    const [leaveData, setLeaveData] = useState([
        {
            roleID: 'E001',
            roleName: 'Admin',
            description: 'Engineering',
            permissions: 'All',
        },
        {
            roleID: 'E002',
            roleName: 'HR',
            description: 'Marketing',
            permissions: 'XXX',
        }
    ]);

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

    return (
        <div>
            <p>Manage Roles</p>
            <div style={{ overflowX: 'auto', width: '100%' }}>
                <table className="table table-bordered table-striped">
                    <thead style={{display:'table-header-group'}}>
                        <tr>
                            <th style={{ padding: "10px" }}>Role ID</th>
                            <th style={{ padding: "10px" }}>Name</th>
                            <th style={{ padding: "10px" }}>Description</th>
                            <th style={{ padding: "10px" }}>Permissions</th>
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
                                            value={editedData.roleID}
                                            onChange={(e) => handleChange('roleID', e.target.value)}
                                        />
                                    ) : (
                                        el.roleID
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.roleName}
                                            onChange={(e) => handleChange('roleName', e.target.value)}
                                        />
                                    ) : (
                                        el.roleName
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                        />
                                    ) : (
                                        el.description
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <input
                                            className="form-control"
                                            value={editedData.permissions}
                                            onChange={(e) => handleChange('permissions', e.target.value)}
                                        />
                                    ) : (
                                        el.permissions
                                    )}
                                </td>
                                <td style={{ padding: "10px" }}>
                                    {editIndex === index ? (
                                        <>
                                            <button className="btn btn-success" onClick={handleSave}>Save</button>
                                            <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
                                        </>
                                    ) : (
                                        <button className="btn btn-primary" onClick={() => handleEdit(index)}>Edit</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RoleData;
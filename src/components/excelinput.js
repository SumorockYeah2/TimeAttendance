import React, {useState} from 'react';
import * as XLSX from 'xlsx';

function ExcelInput() {
    const [data, setData] = React.useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, {type: 'binary'});
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet);
    
            setData(sheetData);

            const arrayBuffer = e.target.result;
            const binaryString = new TextDecoder('utf-8').decode(arrayBuffer);
        };

        reader.readAsArrayBuffer(file);
    }

    return (
        <div>
            <input type="file" onChange={handleFileUpload} />
            {data && (
                <div>
                    <h2>Imported Data:</h2>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    )
}

export default ExcelInput;
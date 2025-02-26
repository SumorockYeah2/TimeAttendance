import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS
import L from 'leaflet';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
});

function Checkout() {
    const [userLocation, setUserLocation] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isFormCompleted, setIsFormCompleted] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [textInput, setTextInput] = useState("");

    const [isCheckedIn, setIsCheckedIn] = useState(false);

    // const getUserLocation = () => {
    //     if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition(
    //             (position) => {
    //                 const {latitude, longitude} = position.coords;
    //                 setUserLocation({latitude, longitude});
    //             },
    //             (error) => {
    //                 console.error('Error getting user location: ',error);
    //             }
    //         );
    //     }
    //     else {
    //         console.error('Geolocation is not supported by this browser');
    //     }
    // }

    const navigate = useNavigate();

    // const handleCheckIn = () => {
    //     navigate('/checkin'); // Navigate to /checkin
    // };

    // useEffect(() => {
    //     getUserLocation();
    // }, []);

    // ////////

    const options = [
        { value: 'one', label: 'one' },
        { value: 'two', label: 'two' },
        { value: 'Typical Office Job', label: 'office'}
    ]
    const DefaultOption = options[0].value;
    const _onSelect = (selectedOption) => {
        console.log(selectedOption);
        setSelectedOption(selectedOption.value);
    };
    
    // ////////
    // const handleFileChange = (event) => {
    //     const file = event.target.files[0]; // Get the first selected file
    //     if (file) {
    //         console.log('Selected file:', file);
    //         setSelectedFile(file); // Save the selected file to state
    //     }
    // };

    ////////
    const handleCheckout = () => {
        localStorage.setItem('isCheckedIn', 'false');
        localStorage.removeItem('isCheckedIn');

        const checkOutDateTime = new Date().toISOString(); 
        console.log(checkOutDateTime);

        localStorage.setItem('checkOutDateTime', checkOutDateTime);
        
        const event = new Event('checkInStatusChanged');
        window.dispatchEvent(event);

        alert("Check-out complete!");
        navigate('/home2');
        // console.log(selectedOption, textInput);
        // if (selectedOption && textInput.trim() !== "") {
        //     setIsFormCompleted(true);
        //     localStorage.setItem('isCheckedIn', 'true');
        //     alert("Check-in complete!");
        //     navigate('/home2');
        // } else {
        //     alert("Please complete all fields!");
        // }
    }

    const handleCancel = () => {
        navigate('/home2');
    }

    ////////
    const handleCheckIn = () => {
        navigate('/checkin');
    }

    ////////
    useEffect(() => {
        const checkInStatus = localStorage.getItem('isCheckedIn');
        if (checkInStatus === 'true') {
            setIsCheckedIn(true); // User is already checked in
        }
    }, []);
    
    return (
        <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
            <h5>Check-out</h5>
            {isCheckedIn ? (
                <div>
                    <p>Choose job to check-out:</p>
                    <Dropdown 
                        className="dropdown"
                        options={options}
                        onChange={_onSelect}
                        value={selectedOption || ""}
                        placeholder="Select a job"
                    />
                    <div>
                        <button className="btn btn-success" onClick={handleCheckout}>Check-out!</button>
                        <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div>
                    <p>You haven't checked-in yet! Please check-in first.</p>
                    <button className="btn btn-success" onClick={handleCheckIn}>Check-in</button>
                    <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
                </div>
            )}
        </div>
    );
}

export default Checkout;
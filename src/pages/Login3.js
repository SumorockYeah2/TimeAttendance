import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Login2.css'; // นำเข้าไฟล์ CSS
import UserIcon from '../assets/person_180dp_E3E3E3.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const Login3 = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [livenessVerified, setLivenessVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userName, setUserName] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const depthHistoryRef = useRef([]);
  const faceMeshRef = useRef(null);
  const navigate = useNavigate();
  // const [cameraOpenedAt, setCameraOpenedAt] = useState(null);
  const cameraOpenedAtRef = useRef(null);

  useEffect(() => {
    // ดึงข้อมูลผู้ใช้จาก localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) {
      setUserName(user.name); // ตั้งค่าชื่อผู้ใช้
    } else if (user && user.username) {
      setUserName(user.username); // ใช้ username หากไม่มี name
    }
  }, []);
  
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleEmailClick = () => {
    if (isEmailLogin) {
      setIsEmailLogin(false);
    } else {
      handleCloseCamera();
      setIsEmailLogin(true);
      setIsCameraOpen(false);
    }
  };

  const handleCameraClick = async () => {
    setIsCameraOpen(true);
    setIsEmailLogin(false);
    setLivenessVerified(false);

    // const cameraOpenedAt = Date.now();
    cameraOpenedAtRef.current = Date.now();

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;

            // รอให้ srcObject ถูกตั้งค่าเรียบร้อยก่อนเรียก play()
            videoRef.current.onloadedmetadata = () => {
                videoRef.current.play().catch((error) => {
                    console.error('Error playing video:', error);
                });
            };

    
        // สร้าง FaceMesh instance
            faceMeshRef.current = new FaceMesh({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
            });
            faceMeshRef.current.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });
    
            let detectionTimeout = null; 

            faceMeshRef.current.onResults((results) => {
                if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                    if (!detectionTimeout) {
                        detectionTimeout = setTimeout(() => {
                            processLivenessDetection(results.multiFaceLandmarks[0]);
                            detectionTimeout = null; // รีเซ็ตตัวแปรหลังจากดีเลย์
                        }, 2000); // ตั้งดีเลย์ 1 วินาที
                    }
                }
            });
  
            const camera = new Camera(videoRef.current, {
                onFrame: async () => {
                  if (faceMeshRef.current) {
                    await faceMeshRef.current.send({ image: videoRef.current });
                  }
                },
            width: 640,
            height: 480,
          });
          camera.start();
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('ไม่สามารถเข้าถึงกล้องได้');
        handleCloseCamera();
      }
  };

  const handleCloseCamera = () => {
    setIsCameraOpen(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (faceMeshRef.current) {
      faceMeshRef.current.close(); // ปิด FaceMesh instance
    }
  };

  const detectBlink = (lm) => {
    const leftEAR = calcEAR(lm, [33, 160, 158, 133, 153, 144]);
    const rightEAR = calcEAR(lm, [362, 385, 387, 263, 373, 380]);
    console.log(leftEAR, rightEAR);
    return leftEAR < 0.25 || rightEAR < 0.25;
  };

  const calcEAR = (lm, idx) => {
    const [p1, p2, p3, p4, p5, p6] = idx.map((i) => lm[i]);
    const v1 = Math.hypot(p2.x - p6.x, p2.y - p6.y);
    const v2 = Math.hypot(p3.x - p5.x, p3.y - p5.y);
    const h = Math.hypot(p1.x - p4.x, p1.y - p4.y);
    return (v1 + v2) / (2.0 * h);
  };

  const checkDepthLiveness = (lm, depthHistoryRef) => {
    const leftEye = lm[130], rightEye = lm[359], nose = lm[1], forehead = lm[168], chin = lm[152];
    const eyeWidth = Math.hypot(leftEye.x - rightEye.x, leftEye.y - rightEye.y);
    const noseY = Math.abs(nose.y - ((leftEye.y + rightEye.y) / 2));
    const faceH = Math.abs(forehead.y - chin.y);
    const depth = (eyeWidth / noseY) + (noseY / faceH) * 10;

    depthHistoryRef.current.push(depth);
    if (depthHistoryRef.current.length > 30) depthHistoryRef.current.shift();

    const avg = depthHistoryRef.current.reduce((a, b) => a + b, 0) / depthHistoryRef.current.length;
    console.log(avg);
    return avg >= 3.0;
  };

  const processLivenessDetection = (landmarks) => {
    const blinkDetected = detectBlink(landmarks);
    const depthVerified = checkDepthLiveness(landmarks, depthHistoryRef);

    console.log('Blink Detected:', blinkDetected, 'Depth Verified:', depthVerified);

    const elapsedTime = Date.now() - cameraOpenedAtRef.current; // Calculate elapsed time

    if (blinkDetected && depthVerified  && elapsedTime >= 2000) {
      setLivenessVerified(true);
      captureAndSendImage(); // แคปเจอร์ภาพและส่งไปยัง Backend
      handleCloseCamera();
    } else if (blinkDetected && depthVerified) {
      console.log('Liveness verified, but waiting for 2 seconds to pass.');
    }
  };


const captureAndSendImage = async () => {
    if (!videoRef.current) return;
  
    // สร้าง canvas เพื่อแคปเจอร์ภาพจากกล้อง
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
  
    // แปลงภาพเป็น Blob
    const imageBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg'));

    // สร้าง FormData เพื่อส่งภาพ
    const formData = new FormData();
    formData.append('image', imageBlob, 'face.jpg');
  
    try {
        // ส่งภาพไปยัง Backend
        const response = await fetch(`${API_URL}/auth/facial-recognition`, {
            method: 'POST',
            body: formData, // ส่ง FormData
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Login response:', result);
            if (result.success) {
                const { token, user } = result;
                const idemployees = user.idemployees;
  
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('idemployees', idemployees);
                console.log('User stored in localStorage:', user);
                console.log('idemployees:', idemployees);
                window.dispatchEvent(new Event('storage'));
                navigate('/checkin');
            } else {
                alert(result.message || 'Face not recognized. Please try again.');
            }
        } else {
            console.error('Login failed:', response.statusText);
            alert('Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Error sending image to backend:', error);
        alert('Error sending image to backend.');
    }
};

  const handleLogin = async () => {
    if (!email || !password) {
      alert('โปรดกรอกชื่อผู้ใช้และรหัสผ่านให้ครบทั้งสองช่อง');
      return;
    }

    try {
      console.log('Sending login request with:', { email, password });
      const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
      });

      console.log('Response status:', response.status);
      if (response.ok) {
          const result = await response.json();
          console.log('Login response:', result);
          if (result.success) {
              const { token, user } = result;
              const idemployees = user.idemployees;

              localStorage.setItem('isLoggedIn', 'true');
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify(user));
              localStorage.setItem('idemployees', idemployees);
              console.log('User stored in localStorage:', user);
              console.log('idemployees:', idemployees);
              window.dispatchEvent(new Event('storage'));
              navigate('/checkin');
          } else {
              alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
          }
      } else {
          const errorText = await response.text();
          console.error('Error:', errorText);
          alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }

    handleCloseCamera();
  };

  return (
    <div className="container">
      {/* Left Panel (สีเขียว) */}
      <div className={`panel left ${isEmailLogin ? 'collapsed' : 'expanded'}`}>
        <div className="camera-box">
            {!isCameraOpen ? (
                <img
                src={UserIcon}
                alt="User Icon"
                className="face-icon"
                onClick={handleCameraClick}
                />
            ) : (
                <video ref={videoRef} className="camera-video" autoPlay />
            )}
      </div>
        </div>
        {isCameraOpen && (
            <button className="close-camera-btn" onClick={handleCloseCamera}>
            Close Camera
            </button>
        )}

      {/* Right Panel (สีขาว) */}
      <div className={`panel right ${isEmailLogin ? 'expanded' : 'collapsed'}`}>
        {isEmailLogin ? (
          <div className="login-form">
            <h3>Enter your email and password</h3>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div style={{ display: 'flex', position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '40px', flex: 1 }}
              />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              style={{
                position: 'absolute',
                right: '10px',
                transform: 'translateY(0%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            </div>
            <button onClick={handleLogin}>Login</button>
            <p className="forgot">หากลืม Password กรุณาติดต่อ HR</p>
          </div>
        ) : null}
      </div>

      {/* Email Button */}
      {/* {!isEmailLogin && ( */}
        <button className="email-link" onClick={handleEmailClick}>
          Email
        </button>
      {/* )} */}
    </div>
  );
};

export default Login3;
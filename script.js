
const firebaseConfig = {
  apiKey: "AIzaSyDTZCXUgdEFSJGKErpd-uFQ0gCFNtwCIAY",
  authDomain: "smart-attendance-system-bf3d1.firebaseapp.com",
  databaseURL: "https://smart-attendance-system-bf3d1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-attendance-system-bf3d1",
  storageBucket: "smart-attendance-system-bf3d1.firebasestorage.app",
  messagingSenderId: "1071536615963",
  appId: "1:1071536615963:web:75ec0f532453027fa13ebe"
};
firebase.initializeApp(firebaseConfig);

const db = firebase.database();
let html5QrCode;

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(id === "facultyDash"){
loadAttendance();
}
}

function handleLogin() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    const role = document.getElementById('role').value;

    if(email.includes('@') && pass.length >= 6) {
        if(role === 'student') showPage('studentDash');
        else showPage('facultyDash');
    } else {
        alert("Enter valid email and 6-char password.");
    }
}
function loadAttendance(){

const attendanceRef = db.ref("attendance");

attendanceRef.on("child_added", function(snapshot){

const data = snapshot.val();

const row = document.createElement("tr");

row.innerHTML = `
<td>${data.student}</td>
<td>${data.subject}</td>
<td>${new Date(data.time).toLocaleTimeString()}</td>
`;

document.getElementById("attendanceBody").appendChild(row);

});

}
// --- FACULTY LOGIC ---
function generateSessionQR() {
    const qrArea = document.getElementById('qrArea');
    const container = document.getElementById('qrContainer');
    qrArea.innerHTML = ""; // Clear old QR
    container.style.display = "block";

    // In a real app, this text would be a secure token
    const sessionData = "SESSION_" + Math.random().toString(36).substring(7);
    
    // Mocking QR Generation (Using a placeholder image service for simplicity)
    const qrImg = document.createElement('img');
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${sessionData}`;
    qrArea.appendChild(qrImg);

    let timeLeft = 30;
    const timerText = document.getElementById('timer');
    const interval = setInterval(() => {
        timeLeft--;
        timerText.innerText = `Code expires in: ${timeLeft}s`;
        if(timeLeft <= 0) {
            clearInterval(interval);
            container.style.display = "none";
            alert("QR Code expired. Generate a new one.");
        }
    }, 1000);
}

// --- STUDENT LOGIC ---
async function startVerification() {
    showPage('verifyPage');
    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: 250 },
        () => { // On Success
html5QrCode.stop().then(() => checkLocation());        }
    ).catch(() => alert("Camera permission denied."));
}

async function startFaceCheck() {
    document.getElementById('scannerArea').style.display = "none";
    document.getElementById('faceArea').style.display = "block";
    document.getElementById('stepText').innerText = "Step 2: Face Verification";

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    document.getElementById('video').srcObject = stream;

    setTimeout(() => {

stream.getTracks().forEach(t => t.stop());

const studentEmail = document.getElementById("email").value;

const subject = document.getElementById("subjectSelect")?.value || "Unknown";

saveAttendance(studentEmail, subject);

alert("Attendance Marked Successfully!");

showPage('studentDash');

}, 4000);
}
// Classroom Coordinates (example coordinates)
const CLASS_LAT = 21.182749;   // Replace with actual classroom latitude
const CLASS_LON = 72.8089;   // Replace with actual classroom longitude
const MAX_DISTANCE = 10;     // meters allowed

function checkLocation() {

    if (!navigator.geolocation) {
        alert("Geolocation not supported.");
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {

        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        const distance = calculateDistance(
            userLat,
            userLon,
            CLASS_LAT,
            CLASS_LON
        );

        console.log("Distance from class:", distance, "meters");

        if(distance <= MAX_DISTANCE) {

            alert("Location Verified ✔");

            startFaceCheck();

        } else {

            alert("You are not in the classroom. Distance: " + Math.round(distance) + "m");
            showPage('studentDash');

        }

    }, () => {

        alert("Location access denied.");

    });

}
function checkLocation() {

    if (!navigator.geolocation) {
        alert("Geolocation not supported.");
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {

        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        const distance = calculateDistance(
            userLat,
            userLon,
            CLASS_LAT,
            CLASS_LON
        );

        console.log("Distance from class:", distance, "meters");

        if(distance <= MAX_DISTANCE) {

            alert("Location Verified ✔");

            startFaceCheck();

        } else {

            alert("You are not in the classroom. Distance: " + Math.round(distance) + "m");
            showPage('studentDash');

        }

    }, () => {

        alert("Location access denied.");

    });

}
function calculateDistance(lat1, lon1, lat2, lon2) {

    const R = 6371000; // Earth radius in meters

    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;

    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1*Math.PI/180) *
        Math.cos(lat2*Math.PI/180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;

}
function saveAttendance(studentEmail, subject){

const today = new Date().toISOString().split("T")[0];

const ref = db.ref("attendance/" + subject + "/" + today + "/" + studentEmail);

ref.once("value", function(snapshot){

if(snapshot.exists()){

alert("Attendance already marked!");

}else{

ref.set({
status: "present",
time: new Date().toISOString()
});

console.log("Attendance saved");

}

});

}

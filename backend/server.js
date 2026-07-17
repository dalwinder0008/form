const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS so frontend can communicate with backend
app.use(cors({
    origin: "http://127.0.0.1:5500" // Agar aap VS Code Live Server use kar rahe hain
}));

// Middleware to parse incoming JSON data
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
    res.send('Server is running perfectly!');
});

// Updated POST Route to handle current HTML Form Data
app.post('/payment', (req, res) => {
    const data = req.body;

    // Terminal/Console par aapka naya data print hoga
    console.log("\n====== New Payment Request ======");
    console.log("First Name:    ", data.firstName);
    console.log("Last Name:     ", data.lastName);
    console.log("Email:         ", data.email);
    console.log("Phone Number:  ", data.phone);   // Naya field
    console.log("Address:       ", data.address); // Naya field
    console.log("=================================\n");

    // Response send to frontend
    res.json({
        success: true,
        message: "Customer data received successfully on local server"
    });
});

// Start the Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

// Route to serve resume.pdf explicitly if needed (though static handles it)
app.get('/download-resume', (req, res) => {
    const file = path.join(__dirname, 'assets', 'resume.pdf');
    res.download(file, 'Nagesh_Rudraram_Resume.pdf', (err) => {
        if (err) {
            console.error("Resume download error:", err);
            res.status(404).send("Resume file not found.");
        }
    });
});

// POST route for sending messages
app.post('/send-message', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "Please fill in all required fields." });
    }

    try {
        // Send Email via Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: email,
            to: process.env.EMAIL_USER,
            subject: `Portfolio Contact: ${subject || 'New Message'}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            replyTo: email
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully");

        res.status(200).json({ success: true, message: "Message Sent Successfully (Email)" });

    } catch (error) {
        console.error("❌ Email Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to send message. Please check your App Password or try again later." });
    }
});

// Root route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Only start the server if not running in a serverless environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;

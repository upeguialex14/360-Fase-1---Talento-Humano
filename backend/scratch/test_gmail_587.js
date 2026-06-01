const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    console.log('Testing with port 587 and secure: false');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection verified!');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testEmail();

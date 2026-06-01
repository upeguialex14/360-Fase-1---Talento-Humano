const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    const rawPass = process.env.EMAIL_PASS;
    const cleanPass = rawPass ? rawPass.replace(/\s+/g, '') : '';
    console.log('Testing with clean password (no spaces)');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS (raw length):', rawPass ? rawPass.length : 0);
    console.log('EMAIL_PASS (clean length):', cleanPass.length);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: cleanPass
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

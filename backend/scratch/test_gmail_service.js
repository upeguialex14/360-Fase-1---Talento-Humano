const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    console.log('Testing with service: gmail');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
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

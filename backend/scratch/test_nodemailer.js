const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_SECURE:', process.env.EMAIL_SECURE);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 465,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log('Verifying connection to SMTP server...');
        await transporter.verify();
        console.log('✅ Connection verified successfully!');

        console.log('Sending test mail...');
        const info = await transporter.sendMail({
            from: `"Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // send to self
            subject: 'Test Email from Talento Humano Backend',
            text: 'This is a test email.'
        });
        console.log('✅ Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
}

testEmail();

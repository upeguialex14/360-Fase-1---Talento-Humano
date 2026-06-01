const emailService = require('../services/email.service');

async function testCentralized() {
    console.log('Testing centralized EmailService...');
    
    console.log('Verifying connection...');
    const connResult = await emailService.verifyConnection();
    if (connResult.success) {
        console.log('✅ SMTP connection is verified and valid!');
        
        console.log('Sending a test email using centralized service...');
        const mailResult = await emailService.sendMail({
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Centralized Email - Talentum360',
            html: '<h1>Centralized Service Works!</h1><p>This is a successful test from the centralized email service.</p>'
        });
        
        if (mailResult.success) {
            console.log('✅ Test email sent successfully! Message ID:', mailResult.messageId);
        } else {
            console.error('❌ Failed to send test email:', mailResult.error);
        }
    } else {
        console.error('❌ SMTP connection failed verification:', connResult.error);
    }
}

testCentralized();

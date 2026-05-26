require('dotenv').config();
const PendingAccess = require('./models/pendingAccess.model');
const User = require('./models/user.model');

(async () => {
    try {
        console.log('Fetching pending requests...');
        const requests = await PendingAccess.getAllPending();
        if (requests.length === 0) {
            console.log('No pending requests to approve');
            process.exit(0);
        }

        const pendingRequest = requests[0];
        console.log('Attempting to approve:', pendingRequest.email);

        const names = pendingRequest.name ? pendingRequest.name.split(' ') : ['Usuario'];
        const name = names[0] || 'Usuario';
        const last_name = names.length > 1 ? names.slice(1).join(' ') : '';
        const email = pendingRequest.email;
        const document_number = email; 
        const role_id = 2; // Test role

        console.log('Creating user...');
        await User.create({
            document_number,
            password_hash: '',
            email,
            name,
            last_name,
            role_id
        });
        
        console.log('User created!');
        process.exit(0);
    } catch (error) {
        console.error('ERROR ENCOUNTERED:', error);
        process.exit(1);
    }
})();

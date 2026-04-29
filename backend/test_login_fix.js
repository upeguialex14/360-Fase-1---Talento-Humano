const axios = require('axios');

async function testLogin() {
    // Datos de prueba - usa un documento que existe en la BD
    const loginData = {
        login: '0000000060', // documento_number del usuario con user_id 60
        password: 'test123' // Cambia esto si sabes la contraseña correcta
    };

    try {
        console.log('\n📝 Enviando solicitud de login...');
        console.log(`URL: http://localhost:3000/api/auth/login`);
        console.log(`Datos enviados:`);
        console.log(`  - login (document_number): ${loginData.login}`);
        console.log(`  - password: ****\n`);

        const response = await axios.post('http://localhost:3000/api/auth/login', loginData);

        console.log('✅ Login EXITOSO!');
        console.log('Status:', response.status);
        console.log('\nDatos del usuario:');
        console.log(JSON.stringify(response.data.user, null, 2));
        console.log('\nToken generado:', response.data.token?.substring(0, 20) + '...');
        
    } catch (error) {
        console.log('❌ Error en login:');
        console.log('Status:', error.response?.status);
        console.log('Mensaje:', error.response?.data?.message);
        if (error.response?.data?.message === 'Usuario o contraseña incorrecta') {
            console.log('\n💡 El documento fue encontrado pero la contraseña es incorrecta.');
            console.log('   Esto significa que la búsqueda por document_number está funcionando ✅');
        }
    }
}

testLogin();

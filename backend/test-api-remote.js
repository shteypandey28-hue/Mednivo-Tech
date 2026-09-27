const axios = require('axios');
async function test() {
  try {
    // 1. Register a test user
    const email = 'test' + Date.now() + '@example.com';
    const regRes = await axios.post('https://mednivo-backend.onrender.com/api/auth/register', {
      name: 'Test User',
      email: email,
      password: 'password123',
      role: 'DOCTOR'
    });
    const token = regRes.data.accessToken;
    console.log('Registered, token:', token.substring(0, 15) + '...');

    // 2. Try to update profile with isOnboarded
    const patchRes = await axios.patch('https://mednivo-backend.onrender.com/api/auth/profile', {
      name: 'Dr. Test User',
      role: 'DOCTOR',
      isOnboarded: true
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Patch success:', patchRes.data.isOnboarded);
  } catch (err) {
    console.error('ERROR:', err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
  }
}
test();

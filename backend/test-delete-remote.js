const axios = require('axios');
async function test() {
  try {
    const email = 'test' + Date.now() + '@example.com';
    const regRes = await axios.post('https://mednivo-backend.onrender.com/api/auth/register', {
      name: 'Test Delete User',
      email: email,
      password: 'password123',
      role: 'DOCTOR'
    });
    
    // Login to create an AuditLog
    const loginRes = await axios.post('https://mednivo-backend.onrender.com/api/auth/login', {
      email: email,
      password: 'password123',
    });
    const token = loginRes.data.accessToken;

    const delRes = await axios.delete('https://mednivo-backend.onrender.com/api/auth/account', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Delete success:', delRes.data);
  } catch (err) {
    console.error('ERROR:', err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
  }
}
test();

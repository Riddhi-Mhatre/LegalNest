async function testFull() {
  const email = `testuser_${Date.now()}@test.com`;
  const password = 'Password123!';
  const name = 'Test User';
  
  try {
    console.log(`1. Registering ${email}...`);
    const regRes = await fetch('http://localhost:3000/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role: 'buyer' })
    });
    console.log('Register success:', await regRes.json());
    
    console.log('2. Logging in...');
    const loginRes = await fetch('http://localhost:3000/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    console.log('Login Status:', loginRes.status);
    console.log('Login Response:', await loginRes.text());
  } catch (err) {
    console.error('API Error:', err);
  }
}

testFull();

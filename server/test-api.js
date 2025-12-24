const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ statusCode: res.statusCode, response });
        } catch (e) {
          resolve({ statusCode: res.statusCode, response: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testAPI() {
  try {
    // First, login to get token
    console.log('Logging in...');
    const loginData = JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    });

    const loginOptions = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const loginResult = await makeRequest(loginOptions, loginData);

    if (loginResult.statusCode !== 200) {
      console.log('Login failed, trying to register first...');

      // Try to register first
      const registerData = JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'traveller'
      });

      const registerOptions = {
        hostname: 'localhost',
        port: 4000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': registerData.length
        }
      };

      const registerResult = await makeRequest(registerOptions, registerData);
      console.log('Register result:', registerResult);

      if (registerResult.statusCode === 201) {
        // Now login
        const loginResult2 = await makeRequest(loginOptions, loginData);
        if (loginResult2.statusCode !== 200) {
          console.error('Login failed after register');
          return;
        }
        token = loginResult2.response.token;
      } else {
        console.error('Registration failed');
        return;
      }
    } else {
      token = loginResult.response.token;
    }

    console.log('Got token, testing AI generate...');

    // Test with existing city
    const testData1 = JSON.stringify({ city: 'Jaipur', days: 2 });
    const testOptions1 = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/ai/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': testData1.length
      }
    };

    const result1 = await makeRequest(testOptions1, testData1);
    console.log('Testing Jaipur: Status', result1.statusCode);
    console.log('Response:', JSON.stringify(result1.response, null, 2));

    // Test with non-existent city
    const testData2 = JSON.stringify({ city: 'NonExistentCity', days: 2 });
    const testOptions2 = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/ai/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': testData2.length
      }
    };

    const result2 = await makeRequest(testOptions2, testData2);
    console.log('Testing NonExistentCity: Status', result2.statusCode);
    console.log('Response:', JSON.stringify(result2.response, null, 2));

  } catch (error) {
    console.error('Test error:', error);
  }
}

testAPI();
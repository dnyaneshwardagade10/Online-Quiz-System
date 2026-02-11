const http = require('http');

// Helper to make requests
function makeRequest(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (body) {
            const data = JSON.stringify(body);
            options.headers['Content-Length'] = data.length;
        }

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: JSON.parse(responseBody || '{}')
                });
            });
        });

        req.on('error', (err) => reject(err));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function testAuthFlow() {
    const username = 'test_user_' + Date.now();
    const email = 'test' + Date.now() + '@example.com';
    const password = 'password123';

    console.log('1. Registering user...');
    try {
        const regRes = await makeRequest('POST', '/api/auth/register', { username, email, password });
        console.log('Registration Status:', regRes.statusCode);

        if (regRes.statusCode !== 201) {
            console.error('Registration failed:', regRes.body);
            return;
        }

        const token = regRes.body.token;
        console.log('Token received:', token ? 'Yes' : 'No');

        console.log('\n2. Accessing Protected Route (Profile)...');
        const profileRes = await makeRequest('GET', '/api/auth/profile', null, token);
        console.log('Profile Status:', profileRes.statusCode);
        console.log('Profile Body:', profileRes.body);

        if (profileRes.statusCode === 200) {
            console.log('\nSUCCESS: Auth flow works correctly.');
        } else {
            console.log('\nFAILURE: Could not access protected route.');
        }

    } catch (error) {
        console.error('Test failed with error:', error);
    }
}

testAuthFlow();

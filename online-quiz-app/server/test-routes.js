const http = require('http');

function makeRequest(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;
        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, contentType: res.headers['content-type'], body: responseBody });
            });
        });
        req.on('error', (err) => reject(err));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function test() {
    // 1. Register
    const reg = await makeRequest('POST', '/api/auth/register', {
        username: 'route_test_' + Date.now(),
        email: 'route' + Date.now() + '@test.com',
        password: 'password123'
    });
    console.log('Register:', reg.statusCode, reg.contentType);
    const token = JSON.parse(reg.body).token;

    // 2. Get quizzes
    const quizzes = await makeRequest('GET', '/api/quiz', null, token);
    console.log('Get Quizzes:', quizzes.statusCode, quizzes.contentType);

    // 3. Get history (the problematic route)
    const history = await makeRequest('GET', '/api/attempt/user/history', null, token);
    console.log('Get History:', history.statusCode, history.contentType);
    console.log('History Body:', history.body);

    // 4. Health check
    const health = await makeRequest('GET', '/api/health');
    console.log('Health:', health.statusCode, health.contentType);
}

test().catch(console.error);

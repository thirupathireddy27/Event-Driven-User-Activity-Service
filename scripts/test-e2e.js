const http = require('http');

/**
 * Helper to send POST requests
 */
const postData = (data, options) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body }));
        });
        req.on('error', (e) => reject(e));
        req.write(JSON.stringify(data));
        req.end();
    });
};

async function runTests() {
    const commonOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/v1/activities',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    console.log('--- Step 1: Testing 400 Bad Request (Missing eventType) ---');
    try {
        const res400 = await postData({
            userId: 'user123',
            timestamp: new Date().toISOString(),
            payload: { reason: 'testing validation' }
        }, commonOptions);
        console.log('Status:', res400.statusCode);
        console.log('Body:', res400.body);
    } catch (e) { console.error('Error in Step 1:', e.message); }

    console.log('\n--- Step 2: Testing 202 Accepted (Valid Payload) ---');
    try {
        const res202 = await postData({
            userId: 'user123',
            eventType: 'verification_event',
            timestamp: new Date().toISOString(),
            payload: { info: 'End-to-End Success' }
        }, commonOptions);
        console.log('Status:', res202.statusCode);
        console.log('Body:', res202.body);
    } catch (e) { console.error('Error in Step 2:', e.message); }

    console.log('\n--- Step 3: Testing 429 Too Many Requests (Rate Limiting) ---');
    console.log('Sending requests until rate limit is hit (Max 50)...');
    for (let i = 0; i < 55; i++) {
        try {
            const res = await postData({
                userId: 'rate_limit_user',
                eventType: 'rate_limit_test',
                timestamp: new Date().toISOString(),
                payload: {}
            }, commonOptions);
            
            // Log first, every 10th, and 429 responses
            if (i === 0 || (i + 1) % 10 === 0 || res.statusCode === 429) {
                console.log(`Request ${i + 1}: Status ${res.statusCode}`);
            }
            
            if (res.statusCode === 429) {
                console.log('Rate limit successfully triggered!');
                break;
            }
        } catch (e) { 
            console.error('Error in Step 3:', e.message); 
            break; 
        }
    }
}

console.log('Starting E2E Verification Script...');
runTests();

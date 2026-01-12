
const http = require('http');

const uniquePhone = "09" + Date.now().toString().slice(-8);

const data = JSON.stringify({
    fullName: "Test Customer 1",
    phone: uniquePhone,
    email: "customer1_" + Date.now() + "@gmail.com",
    address: " 123 Street"
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/customers',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

function makeRequest(label) {
    const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log(`[${label}] Status:`, res.statusCode);
            console.log(`[${label}] Body:`, body);
        });
    });
    req.on('error', (e) => console.error(e));
    req.write(data);
    req.end();
}

console.log('Creating Customer 1...');
makeRequest('Request 1');

setTimeout(() => {
    console.log('Creating Customer 2 (Duplicate)...');
    makeRequest('Request 2');
}, 2000);

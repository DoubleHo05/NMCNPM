const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/books',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';

    console.log(`StatusCode: ${res.statusCode}`);

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            if (res.statusCode !== 200) {
                console.log('Error Body:', data);
                return;
            }
            const parsed = JSON.parse(data);
            console.log('--- API RESPONSE STRUCTURE ---');
            console.log(JSON.stringify(parsed, null, 2));
            console.log('------------------------------');

            if (parsed.success && Array.isArray(parsed.data)) {
                console.log(`Found ${parsed.data.length} books.`);
                if (parsed.data.length > 0) {
                    console.log('Sample Book:', parsed.data[0]);
                }
            } else {
                console.log('Invalid response structure!');
            }
        } catch (e) {
            console.error(e.message);
            console.log('Raw Data:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.end();


const http = require('http');

const data = JSON.stringify({
    tenDangNhap: "testnode_" + Date.now(),
    matKhau: "123456",
    hoTen: "Test Node Native",
    email: "native_" + Date.now() + "@gmail.com",
    vaiTro: "THU_NGAN",
    trangThai: true
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', body);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();

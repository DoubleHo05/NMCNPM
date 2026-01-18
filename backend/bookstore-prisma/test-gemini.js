require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('API Key preview:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        console.log('\nSending test request...');
        const result = await model.generateContent('Say hello in Vietnamese');
        const response = await result.response;
        const text = response.text();

        console.log('\n✅ SUCCESS!');
        console.log('Response:', text);
    } catch (error) {
        console.error('\n❌ ERROR:');
        console.error('Message:', error.message);
        console.error('Status:', error.status);
        console.error('Full error:', error);
    }
}

testGemini();

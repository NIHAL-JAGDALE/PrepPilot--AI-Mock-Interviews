import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const JUDGE0_BASE_URL = 'https://judge0-ce.p.rapidapi.com';

async function test() {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
      'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com',
    };
    
    console.log("Using Key:", process.env.JUDGE0_API_KEY ? "EXISTS" : "MISSING");
    
    const submitResponse = await axios.post(
      `${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`,
      {
        source_code: 'print("Hello")',
        language_id: 71,
        stdin: '',
        cpu_time_limit: 5,
        memory_limit: 128000,
      },
      { headers, timeout: 10000 }
    );
    console.log("Token:", submitResponse.data);
  } catch (err) {
    if (err.response) {
       console.error("Error from API:", err.response.data);
    } else {
       console.error(err.message);
    }
  }
}

test();

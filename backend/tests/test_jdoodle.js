import dotenv from 'dotenv';
dotenv.config();

import jdoodle from './services/jdoodle.js';

async function testJdoodle() {
  console.log("Testing JDoodle API...");
  try {
    const res = await jdoodle.executeCode("print('Hello from JDoodle Python!')", "python");
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
testJdoodle();

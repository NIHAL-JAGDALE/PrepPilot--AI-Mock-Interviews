import axios from 'axios';

async function testWandbox() {
  console.log("Testing Wandbox API...");
  try {
    const res = await axios.post("https://wandbox.org/api/compile.json", {
      compiler: "python-head",
      code: "print('Hello from Wandbox')",
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
testWandbox();

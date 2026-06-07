import axios from 'axios';

async function testCodex() {
  console.log("Testing CodeX API...");
  try {
    const res = await axios.post("https://api.codex.jaagrav.in", {
      code: "print('Hello from CodeX')",
      language: "py",
      input: ""
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
testCodex();

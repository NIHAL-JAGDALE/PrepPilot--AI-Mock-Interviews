import axios from 'axios';

async function testPaiza() {
  console.log("Testing Paiza API...");
  try {
    const res = await axios.post("http://api.paiza.io:80/runners/create", {
      source_code: "print('Hello from Paiza')",
      language: "python3",
      api_key: "guest"
    });
    
    const id = res.data.id;
    console.log("Runner ID:", id);
    
    await new Promise(r => setTimeout(r, 2000));
    
    const statusRes = await axios.get(`http://api.paiza.io:80/runners/get_details?id=${id}&api_key=guest`);
    console.log("Result:", statusRes.data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
testPaiza();

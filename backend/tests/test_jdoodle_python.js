import dotenv from 'dotenv';
dotenv.config();
import jdoodle from './services/jdoodle.js';

async function testPythonTypos() {
  const code = `
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        return []
  `;
  try {
    const res = await jdoodle.executeCode(code, 'python');
    console.log(res);
  } catch(e) {
    console.error(e);
  }
}
testPythonTypos();

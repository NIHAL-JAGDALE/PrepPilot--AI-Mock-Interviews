import dotenv from 'dotenv';
dotenv.config();
import jdoodle from './services/jdoodle.js';

async function testOthers() {
  const pyCode = `
class Solution:
    def trap(self, height: list[int]) -> int:
        return 0
`;
  const jsCode = `
var trap = function(height) {
    return 0;
};
`;

  try {
    console.log(await jdoodle.executeCode(pyCode, 'python'));
    console.log(await jdoodle.executeCode(jsCode, 'javascript'));
  } catch(e) {
    console.error(e);
  }
}
testOthers();

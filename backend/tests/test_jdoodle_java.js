import dotenv from 'dotenv';
dotenv.config();
import jdoodle from './services/jdoodle.js';

async function testJava() {
  const code = `
class Solution {
    public int trap(int[] height) {
        return 0;
    }
}
public class Main {
    public static void main(String[] args) {
        System.out.println("Compile Successful (Test).");
    }
}
  `;
  try {
    const res = await jdoodle.executeCode(code, 'java');
    console.log(res);
  } catch(e) {
    console.error(e);
  }
}
testJava();

import dotenv from 'dotenv';
dotenv.config();

import jdoodle from './services/jdoodle.js';

async function testJdoodle() {
  console.log("Testing JDoodle API with compile error...");
  try {
    const code = `
      class Solution {
        public:
          ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
             return nullptr;
          }
      };
    `;
    const res = await jdoodle.executeCode(code, "cpp");
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
testJdoodle();

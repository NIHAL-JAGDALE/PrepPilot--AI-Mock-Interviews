import dotenv from 'dotenv';
dotenv.config();
import jdoodle from './services/jdoodle.js';

async function verify() {
  const code = `
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
       return nullptr;
    }
};
  `;
  const res = await jdoodle.executeCode(code, 'cpp');
  console.log(res);
}
verify();

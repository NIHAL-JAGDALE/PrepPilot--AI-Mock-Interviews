import dotenv from 'dotenv';
dotenv.config();
import jdoodle from './services/jdoodle.js';

async function testJava3Sum() {
  const code = `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        java.util.Arrays.sort(nums);
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i-1]) continue;
            int j = i + 1, k = nums.length - 1;
            while (j < k) {
                int total = nums[i] + nums[j] + nums[k];
                if (total > 0) { k--; }
                else if (total < 0) { j++; }
                else {
                    res.add(Arrays.asList(nums[i], nums[j], nums[k]));
                    j++;
                    while (nums[j] == nums[j-1] && j < k) j++;
                }
            }
        }
        return res;
    }
}`;
  try {
    const res = await jdoodle.executeCode(code, 'java');
    console.log(res);
  } catch(e) {
    console.error(e.message);
  }
}
testJava3Sum();

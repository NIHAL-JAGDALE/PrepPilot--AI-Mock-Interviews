import dotenv from 'dotenv';
dotenv.config();
import jdoodle from './services/jdoodle.js';

const tests = [
  {
    name: 'Two Sum (HashMap)',
    code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) return new int[]{map.get(complement), i};
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`
  },
  {
    name: 'Binary Tree Level Order (Queue)',
    code: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(level);
        }
        return result;
    }
}`
  },
  {
    name: 'Merge K Lists (PriorityQueue)',
    code: `class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
        for (ListNode node : lists) if (node != null) pq.offer(node);
        ListNode dummy = new ListNode(0);
        ListNode cur = dummy;
        while (!pq.isEmpty()) {
            cur.next = pq.poll();
            cur = cur.next;
            if (cur.next != null) pq.offer(cur.next);
        }
        return dummy.next;
    }
}`
  },
  {
    name: 'Valid Parentheses (Stack)',
    code: `class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') { stack.push(c); }
            else if (stack.isEmpty()) return false;
            else if (c == ')' && stack.pop() != '(') return false;
            else if (c == ']' && stack.pop() != '[') return false;
            else if (c == '}' && stack.pop() != '{') return false;
        }
        return stack.isEmpty();
    }
}`
  },
];

async function runAll() {
  for (const t of tests) {
    process.stdout.write(`\nTesting: ${t.name}... `);
    try {
      const res = await jdoodle.executeCode(t.code, 'java');
      console.log(res.status === 'Accepted' ? '✅ Accepted' : `❌ ${res.status} - ${res.stderr}`);
    } catch(e) {
      console.log(`❌ Error: ${e.message}`);
    }
  }
  console.log('\nAll tests done.');
}
runAll();

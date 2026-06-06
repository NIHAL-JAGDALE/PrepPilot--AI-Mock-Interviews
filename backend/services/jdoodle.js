import axios from 'axios';

// ─── JDOODLE CODE EXECUTION SERVICE ────────────────────────
//
// Runs code via the JDoodle REST API.
// Docs: https://docs.jdoodle.com/compiler-api/
//
// Supported languages and default version indices for JDoodle:
//   python3    → python3
//   javascript → nodejs
//   cpp        → cpp
//   java       → java
// ──────────────────────────────────────────────────────────

const JDOODLE_BASE_URL = 'https://api.jdoodle.com/v1/execute';

// Language map: our key → JDoodle configuration
export const LANGUAGE_MAP = {
  python:     { language: 'python3', versionIndex: '4', aliases: ['python3', 'py'] },
  javascript: { language: 'nodejs',  versionIndex: '4', aliases: ['js', 'node'] },
  cpp:        { language: 'cpp',     versionIndex: '5', aliases: ['c++', 'cplusplus'] },
  java:       { language: 'java',    versionIndex: '4', aliases: ['java'] },
};

/**
 * Resolve a language string to its JDoodle { language, versionIndex } pair.
 *
 * @param {string} lang - e.g. 'python', 'cpp', 'java', 'javascript'
 * @returns {{ language: string, versionIndex: string }}
 */
export function resolveLanguage(lang) {
  const normalized = lang.toLowerCase().trim();

  if (LANGUAGE_MAP[normalized]) {
    const { language, versionIndex } = LANGUAGE_MAP[normalized];
    return { language, versionIndex };
  }

  for (const [, entry] of Object.entries(LANGUAGE_MAP)) {
    if (entry.aliases.includes(normalized)) {
      return { language: entry.language, versionIndex: entry.versionIndex };
    }
  }

  throw new Error(
    `Unsupported language: "${lang}". Supported: ${Object.keys(LANGUAGE_MAP).join(', ')}`
  );
}

/**
 * Execute code using the JDoodle API.
 *
 * @param {string} sourceCode - Source code to run
 * @param {string} languageKey - Language key (e.g. 'python', 'javascript', 'cpp', 'java')
 * @param {string} [stdin] - Optional stdin
 * @returns {{ stdout, stderr, compileOutput, time, memory, status, passed }}
 */
export async function executeCode(sourceCode, languageKey, stdin = '') {
  const { language, versionIndex } = resolveLanguage(languageKey);
  
  let finalSourceCode = sourceCode;

  // 1. Auto-inject definitions for ListNode
  if (finalSourceCode.includes('ListNode') && !finalSourceCode.includes('struct ListNode {') && !finalSourceCode.includes('class ListNode {') && !finalSourceCode.includes('class ListNode:')) {
    if (language === 'cpp') {
      finalSourceCode = `struct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n    ListNode(int x, ListNode *next) : val(x), next(next) {}\n};\n\n` + finalSourceCode;
    } else if (language === 'java') {
      finalSourceCode = `class ListNode {\n    int val;\n    ListNode next;\n    ListNode() {}\n    ListNode(int val) { this.val = val; }\n    ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n}\n\n` + finalSourceCode;
    } else if (language === 'python3') {
      finalSourceCode = `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n` + finalSourceCode;
    }
  }

  // 2. Auto-inject definitions for TreeNode
  if (finalSourceCode.includes('TreeNode') && !finalSourceCode.includes('struct TreeNode {') && !finalSourceCode.includes('class TreeNode {') && !finalSourceCode.includes('class TreeNode:')) {
    if (language === 'cpp') {
      finalSourceCode = `struct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n};\n\n` + finalSourceCode;
    } else if (language === 'java') {
      finalSourceCode = `class TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode() {}\n    TreeNode(int val) { this.val = val; }\n    TreeNode(int val, TreeNode left, TreeNode right) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\n` + finalSourceCode;
    } else if (language === 'python3') {
      finalSourceCode = `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\n` + finalSourceCode;
    }
  }

  // 3. Prepend headers
  if (language === 'cpp' && !finalSourceCode.includes('#include')) {
    finalSourceCode = `#include <bits/stdc++.h>\nusing namespace std;\n\n` + finalSourceCode;
  } else if (language === 'python3' && !finalSourceCode.includes('from typing import')) {
    // Full LeetCode Python environment: types + common stdlib modules
    const pythonHeader = [
      'from typing import *',
      'from collections import *',
      'from heapq import *',
      'from functools import *',
      'from itertools import *',
      'from math import *',
      'import bisect',
      'import sys',
      'sys.setrecursionlimit(100000)',
    ].join('\n');
    finalSourceCode = pythonHeader + '\n\n' + finalSourceCode;
  } else if (language === 'java' && !finalSourceCode.includes('import java.util')) {
    // Inject comprehensive Java imports needed for any LeetCode problem
    const javaImports = [
      'import java.util.*;',
      'import java.util.stream.*;',
      'import java.util.function.*;',
      'import java.util.concurrent.*;',
      'import java.math.*;',
      'import java.io.*;',
    ].join('\n');
    finalSourceCode = javaImports + '\n\n' + finalSourceCode;
  }

  // 4. Append dummy main
  if (language === 'cpp' && !finalSourceCode.includes('int main(')) {
    finalSourceCode += `\nint main() {\n    cout << "Compile Successful! (No explicit driver code to run)." << endl;\n    return 0;\n}\n`;
  } else if (language === 'java' && !finalSourceCode.includes('public static void main')) {
    // Java: JDoodle needs exactly one public class named Main.
    // We wrap the entire raw LeetCode snippet (which is package-private classes)
    // inside a public class Main so JDoodle can find the entry point.
    finalSourceCode = finalSourceCode + `\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Compile Successful! (No explicit driver code to run).");\n    }\n}\n`;
  }

  console.log(`\n⚙️  JDoodle: Executing code (language=${language})...`);

  const clientId = process.env.JDOODLE_CLIENT_ID;
  const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('JDoodle API credentials are missing in your environment variables.');
  }

  try {
    const response = await axios.post(
      JDOODLE_BASE_URL,
      {
        clientId: clientId,
        clientSecret: clientSecret,
        script: finalSourceCode,
        stdin: stdin || '',
        language: language,
        versionIndex: versionIndex,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000,
      }
    );

    const data = response.data;
    
    // JDoodle returns { output, statusCode, memory, cpuTime }
    // If statusCode is 200, compilation was successful. 
    // It embeds both stdout and stderr in `output`.
    // We try to infer if it was an error format.
    
    let stdout = data.output || '';
    let stderr = '';
    let status = 'Accepted';

    // Heuristic for compilation/runtime errors or timeouts over JDoodle
    if (data.statusCode && data.statusCode !== 200) {
      status = 'Internal Error';
    } else if (
      stdout.toLowerCase().includes('error') || 
      stdout.toLowerCase().includes('exception') || 
      stdout.includes('Traceback') ||
      stdout.includes('Command exited with non-zero status') ||
      stdout.includes('does not name a type')
    ) {
      status = 'Runtime/Compilation Error';
      stderr = stdout;
      stdout = '';
    } else if (stdout.toLowerCase().includes('timeout') || stdout.toLowerCase().includes('time limit exceeded')) {
      status = 'Time Limit Exceeded';
      stderr = stdout;
      stdout = '';
    }

    const time = parseFloat(data.cpuTime) || null;
    const memory = parseFloat(data.memory) || null; // memory is usually returned in KB

    console.log(`   Result: ${status} | CPU=${time}s | Mem=${memory}KB`);

    return {
      stdout,
      stderr,
      compileOutput: '', // JDoodle bundles compilation errors in output
      time,
      memory,
      status,
      passed: status === 'Accepted',
    };
  } catch (error) {
    // Axios errors (e.g., 401 Unauthorized, 429 Limit Exceeded)
    if (error.response) {
      const errData = error.response.data;
      throw new Error(`JDoodle API Error: ${errData.error || error.response.statusText}`);
    }
    throw error;
  }
}

export default { executeCode, resolveLanguage, LANGUAGE_MAP };

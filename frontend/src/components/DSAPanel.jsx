import { useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { compilerAPI } from '../api/client';

// ─── LANGUAGE CONFIG ──────────────────────────────────────
const LANGUAGES = [
  { id: 71, name: 'Python 3', monaco: 'python', stub: 'def solution():\n    # Write your solution here\n    pass\n\n# Test your solution\nprint(solution())\n' },
  { id: 63, name: 'JavaScript', monaco: 'javascript', stub: '/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction solution(nums) {\n    // Write your solution here\n}\n\nconsole.log(solution([]));\n' },
  { id: 54, name: 'C++', monaco: 'cpp', stub: '#include <bits/stdc++.h>\nusing namespace std;\n\nint solution() {\n    // Write your solution here\n    return 0;\n}\n\nint main() {\n    cout << solution() << endl;\n    return 0;\n}\n' },
  { id: 62, name: 'Java', monaco: 'java', stub: 'public class Solution {\n    public static int solution() {\n        // Write your solution here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(solution());\n    }\n}\n' },
];

// ─── COMPILER OUTPUT ─────────────────────────────────────
function CompilerOutput({ result, running }) {
  if (running) {
    return (
      <div className="flex items-center gap-3 p-4 text-sm text-surface-300">
        <span className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin flex-shrink-0" />
        Running against Judge0...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-4 text-xs text-surface-500">
        Press <kbd className="px-1.5 py-0.5 bg-surface-800 rounded font-mono text-surface-300">Run Code</kbd> to execute your solution.
      </div>
    );
  }

  const passed = result.passed;
  const statusColor = passed ? '#34d399' : '#f87171';

  return (
    <div className="p-4 space-y-3 text-xs font-mono overflow-auto max-h-48">
      {/* Status line */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold" style={{ color: statusColor }}>
          {passed ? '✅' : '❌'} {result.status}
        </span>
        {result.time != null && (
          <span className="text-surface-500">{(result.time * 1000).toFixed(0)} ms</span>
        )}
        {result.memory != null && (
          <span className="text-surface-500">{(result.memory / 1024).toFixed(1)} MB</span>
        )}
      </div>

      {/* stdout */}
      {result.stdout && (
        <div>
          <div className="text-surface-500 mb-1 font-sans">Output:</div>
          <pre className="text-surface-200 bg-surface-900 rounded p-2 overflow-auto whitespace-pre-wrap">
            {result.stdout}
          </pre>
        </div>
      )}

      {/* stderr */}
      {result.stderr && (
        <div>
          <div className="text-danger-400 mb-1 font-sans">Stderr:</div>
          <pre className="text-danger-300 bg-danger-500/5 rounded p-2 overflow-auto whitespace-pre-wrap">
            {result.stderr}
          </pre>
        </div>
      )}

      {/* compile output */}
      {result.compileOutput && (
        <div>
          <div className="text-warning-400 mb-1 font-sans">Compile Output:</div>
          <pre className="text-warning-300 bg-warning-500/5 rounded p-2 overflow-auto whitespace-pre-wrap">
            {result.compileOutput}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── PROBLEM DISPLAY ─────────────────────────────────────
function ProblemDisplay({ problem }) {
  if (!problem) return null;

  const diffColor =
    problem.difficulty === 'Easy' ? '#34d399' :
    problem.difficulty === 'Hard' ? '#f87171' : '#fbbf24';

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-surface-800">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ color: diffColor, background: `${diffColor}20` }}
          >
            {problem.difficulty}
          </span>
          {(problem.slug || problem.leetcode_slug) && (
            <a
              href={`https://leetcode.com/problems/${problem.slug || problem.leetcode_slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-400 hover:text-primary-300 transition-colors ml-auto"
            >
              LeetCode ↗
            </a>
          )}
        </div>
        <h2 className="text-base font-bold text-surface-100">{problem.title}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {problem.content ? (
          <div
            className="text-sm text-surface-200 leading-relaxed prose-invert"
            dangerouslySetInnerHTML={{ __html: problem.content }}
          />
        ) : (
          <p className="text-sm text-surface-300 leading-relaxed">
            Open on LeetCode to read the full problem statement. Describe your approach in the chat.
          </p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DSA PANEL — split-screen problem + Monaco editor
// ═══════════════════════════════════════════════════════════
export default function DSAPanel({ problem, sessionId, onSubmitCode }) {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].stub);
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [runError, setRunError] = useState('');

  const editorRef = useRef(null);

  const handleLangChange = useCallback((lang) => {
    setSelectedLang(lang);
    setCode(lang.stub);
    setResult(null);
  }, []);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  const handleRunCode = async () => {
    const currentCode = editorRef.current?.getValue() || code;
    if (!currentCode.trim()) return;

    setRunning(true);
    setResult(null);
    setRunError('');

    try {
      const { data } = await compilerAPI.run({
        code: currentCode,
        language_id: selectedLang.id,
        stdin: stdin || '',
      });
      setResult(data);

      // Notify parent so it can include result in the next chat message
      if (onSubmitCode) {
        onSubmitCode({
          code: currentCode,
          language: selectedLang.name,
          result: data,
        });
      }
    } catch (err) {
      setRunError(err.response?.data?.error || 'Compiler error. Check that JUDGE0_API_KEY is configured.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden rounded-xl border border-surface-700 bg-surface-950">

      {/* ── LEFT: Problem ── */}
      <div className="w-2/5 flex-shrink-0 border-r border-surface-800 overflow-hidden flex flex-col">
        <ProblemDisplay problem={problem} />
      </div>

      {/* ── RIGHT: Editor + Output ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Editor toolbar */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-surface-800 bg-surface-900/50">
          {/* Language selector */}
          <div className="flex gap-1">
            {LANGUAGES.map(lang => (
              <button
                key={lang.id}
                onClick={() => handleLangChange(lang)}
                className={`text-xs px-3 py-1 rounded-lg font-medium transition-all
                  ${selectedLang.id === lang.id
                    ? 'bg-primary-600 text-white'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                  }`}
              >
                {lang.name}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowStdin(!showStdin)}
              className="text-xs text-surface-400 hover:text-surface-200 transition-colors"
            >
              {showStdin ? 'Hide stdin' : 'Custom input'}
            </button>
            <button
              onClick={handleRunCode}
              disabled={running}
              id="run-code-btn"
              className="btn-primary text-xs py-1.5 px-4 flex items-center gap-2 disabled:opacity-50"
            >
              {running ? (
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : '▶'}
              {running ? 'Running...' : 'Run Code'}
            </button>
          </div>
        </div>

        {/* Custom stdin (optional) */}
        {showStdin && (
          <div className="flex-shrink-0 px-4 py-2 border-b border-surface-800 bg-surface-900/30">
            <textarea
              value={stdin}
              onChange={e => setStdin(e.target.value)}
              placeholder="Custom stdin (optional)..."
              rows={2}
              className="w-full bg-surface-900 text-surface-200 text-xs font-mono rounded-lg p-2 border border-surface-700 outline-none resize-none placeholder:text-surface-600"
            />
          </div>
        )}

        {/* Monaco Editor */}
        <div className="flex-1 monaco-container overflow-hidden" style={{ minHeight: 0 }}>
          <Editor
            height="100%"
            language={selectedLang.monaco}
            value={code}
            onChange={v => setCode(v || '')}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              renderLineHighlight: 'line',
              automaticLayout: true,
              tabSize: 4,
              insertSpaces: true,
              wordWrap: 'on',
              padding: { top: 12, bottom: 12 },
              scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
            }}
          />
        </div>

        {/* Compiler Output */}
        <div className="flex-shrink-0 border-t border-surface-800 bg-surface-900/50" style={{ minHeight: '80px', maxHeight: '200px' }}>
          <div className="flex items-center gap-2 px-4 py-2 border-b border-surface-800">
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wide">Output</span>
            {result && (
              <span className={`text-xs font-bold ${result.passed ? 'text-accent-400' : 'text-danger-400'}`}>
                — {result.status}
              </span>
            )}
          </div>
          {runError ? (
            <div className="p-4 text-xs text-danger-400">{runError}</div>
          ) : (
            <CompilerOutput result={result} running={running} />
          )}
        </div>
      </div>
    </div>
  );
}

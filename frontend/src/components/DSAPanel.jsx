<<<<<<< HEAD
import { useState, useRef, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { compilerAPI, problemAPI } from '../api/client';
=======
import { useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { compilerAPI } from '../api/client';
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1

// ─── LANGUAGE CONFIG ──────────────────────────────────────
const LANGUAGES = [
  { id: 71, name: 'Python 3', monaco: 'python', stub: 'def solution():\n    # Write your solution here\n    pass\n\n# Test your solution\nprint(solution())\n' },
  { id: 63, name: 'JavaScript', monaco: 'javascript', stub: '/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction solution(nums) {\n    // Write your solution here\n}\n\nconsole.log(solution([]));\n' },
  { id: 54, name: 'C++', monaco: 'cpp', stub: '#include <bits/stdc++.h>\nusing namespace std;\n\nint solution() {\n    // Write your solution here\n    return 0;\n}\n\nint main() {\n    cout << solution() << endl;\n    return 0;\n}\n' },
  { id: 62, name: 'Java', monaco: 'java', stub: 'public class Solution {\n    public static int solution() {\n        // Write your solution here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(solution());\n    }\n}\n' },
];

<<<<<<< HEAD
const LIGHT_COLORS = {
  bgBase: '#FFFFFF',
  bgPanel: '#F8FAFC',
  bgEditor: '#FFFFFF',
  bgHover: '#F1F5F9',
  bgTag: '#F0FDF4',
  border: '#E8ECF2',
  borderMid: '#E2E8F0',
  accent: '#1DB954',
  accentDim: 'rgba(29, 185, 84, 0.15)',
  green: '#16A34A',
  greenDim: '#F0FDF4',
  blue: '#2563EB',
  blueDim: '#EFF6FF',
  red: '#EF4444',
  redDim: '#FEF2F2',
  textPrim: '#1A2B4A',
  textSec: '#6B7A99',
  textDim: '#9CA3AF',
  medium: '#F59E0B',
};

const DARK_COLORS = {
  bgBase: '#0d0e10',
  bgPanel: '#161718',
  bgEditor: '#111213',
  bgHover: '#1e1f21',
  bgTag: '#1e2a1a',
  border: '#2a2b2d',
  borderMid: '#3a3b3e',
  accent: '#ffa116',
  accentDim: 'rgba(255,161,22,.15)',
  green: '#2cbb5d',
  greenDim: 'rgba(44,187,93,.15)',
  blue: '#4d9ef6',
  blueDim: 'rgba(77,158,246,.15)',
  red: '#ef4743',
  redDim: 'rgba(239,71,67,.15)',
  textPrim: '#eff1f6',
  textSec: '#8d9099',
  textDim: '#565960',
  medium: '#ffa116',
};

// ─── COMPILER OUTPUT (LeetCode Style) ────────────────────
function CompilerOutput({ result, running, colors }) {
  if (running) {
    return (
      <div className="flex items-center gap-3 p-4 text-[13px] font-['Sora'] font-medium" style={{ color: colors.textSec }}>
        <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0" style={{ borderColor: `${colors.accent}40`, borderTopColor: colors.accent }} />
        Judging...
=======
// ─── COMPILER OUTPUT ─────────────────────────────────────
function CompilerOutput({ result, running }) {
  if (running) {
    return (
      <div className="flex items-center gap-3 p-4 text-sm text-surface-300">
        <span className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin flex-shrink-0" />
        Running against Judge0...
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
      </div>
    );
  }

  if (!result) {
    return (
<<<<<<< HEAD
      <div className="p-4 text-[13px] font-['Sora']" style={{ color: colors.textSec }}>
        Run your code first to see results here.
=======
      <div className="p-4 text-xs text-surface-500">
        Press <kbd className="px-1.5 py-0.5 bg-surface-800 rounded font-mono text-surface-300">Run Code</kbd> to execute your solution.
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
      </div>
    );
  }

  const passed = result.passed;
<<<<<<< HEAD
  const statusColor = passed ? colors.green : colors.red;

  return (
    <div className="p-4 space-y-4 text-[13px] font-['Sora'] overflow-auto h-full" style={{ color: colors.textSec }}>
      <div style={{ color: statusColor, fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>
        {passed ? '✓ Accepted' : '✗ Wrong Answer'}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {result.time != null && (
          <div style={{ background: colors.bgEditor, border: `1px solid ${colors.border}`, borderRadius: '6px', padding: '10px 12px' }}>
            <div style={{ fontSize: '10px', color: colors.textDim, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Runtime</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: colors.textPrim, fontWeight: 500 }}>{(result.time * 1000).toFixed(0)} ms</div>
          </div>
        )}
        {result.memory != null && (
          <div style={{ background: colors.bgEditor, border: `1px solid ${colors.border}`, borderRadius: '6px', padding: '10px 12px' }}>
            <div style={{ fontSize: '10px', color: colors.textDim, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Memory</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: colors.textPrim, fontWeight: 500 }}>{(result.memory / 1024).toFixed(1)} MB</div>
          </div>
        )}
      </div>

      {result.stdout && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '10px', color: colors.textDim, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px', fontWeight: 600 }}>Stdout</div>
          <div style={{ background: colors.bgEditor, border: `1px solid ${colors.border}`, borderRadius: '6px', padding: '12px' }}>
            <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: colors.textPrim, whiteSpace: 'pre-wrap', margin: 0 }}>{result.stdout}</pre>
          </div>
        </div>
      )}

      {result.stderr && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '10px', color: colors.red, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px', fontWeight: 600 }}>Runtime Error</div>
          <div style={{ background: colors.bgEditor, border: `1px solid ${colors.border}`, borderRadius: '6px', padding: '12px' }}>
            <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: colors.red, whiteSpace: 'pre-wrap', margin: 0 }}>{result.stderr}</pre>
          </div>
        </div>
      )}

      {result.compileOutput && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '10px', color: colors.accent, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px', fontWeight: 600 }}>Compile Error</div>
          <div style={{ background: colors.bgEditor, border: `1px solid ${colors.border}`, borderRadius: '6px', padding: '12px' }}>
            <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: colors.accent, whiteSpace: 'pre-wrap', margin: 0 }}>{result.compileOutput}</pre>
          </div>
=======
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
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
        </div>
      )}
    </div>
  );
}

<<<<<<< HEAD
// ─── PROBLEM DISPLAY (LeetCode Style) ────────────────────
function ProblemDisplay({ problem, loading, colors }) {
  if (!problem) return null;

  const diffColor =
    problem.difficulty === 'Easy' ? '#00b8a3' :
    problem.difficulty === 'Hard' ? '#ff375f' : '#ffa116';
  
  const diffBg = 
    problem.difficulty === 'Easy' ? 'rgba(0,184,163,.15)' :
    problem.difficulty === 'Hard' ? 'rgba(255,55,95,.15)' : 'rgba(255,161,22,.15)';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Panel Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}`, background: colors.bgPanel }}>
        <div style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 500, color: colors.textPrim, borderBottom: `2px solid ${colors.accent}`, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
          Description
        </div>
      </div>

      <div className="dsa-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: colors.textSec, fontFamily: "'Sora', sans-serif", fontSize: '13px' }}>
            <span style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTopColor: colors.blue, borderRadius: '50%', animation: 'spin .8s linear infinite', marginRight: '8px' }} />
            Fetching description from LeetCode...
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-.4px', marginBottom: '12px', color: colors.textPrim, fontFamily: "'Sora', sans-serif" }}>
              {problem.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, background: diffBg, color: diffColor, fontFamily: "'Sora', sans-serif" }}>
                {problem.difficulty}
              </span>
              {(problem.slug || problem.leetcode_slug) && (
                <a
                  href={`https://leetcode.com/problems/${problem.slug || problem.leetcode_slug}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '12px', color: colors.blue, textDecoration: 'none', fontWeight: 500, fontFamily: "'Sora', sans-serif" }}
                >
                  LeetCode ↗
                </a>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: `1px solid ${colors.border}`, margin: '18px 0' }} />

            {problem.content ? (
              <div
                style={{ fontSize: '14px', lineHeight: 1.75, color: colors.textSec, fontFamily: "'Sora', sans-serif" }}
                dangerouslySetInnerHTML={{ __html: problem.content }}
              />
            ) : (
              <p style={{ fontSize: '14px', color: colors.textSec, lineHeight: 1.75, fontFamily: "'Sora', sans-serif" }}>
                Open on LeetCode to read the full problem statement.
              </p>
            )}
          </>
=======
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
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DSA PANEL — split-screen problem + Monaco editor
// ═══════════════════════════════════════════════════════════
<<<<<<< HEAD
export default function DSAPanel({ problem: initialProblem, sessionId, onSubmitCode }) {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [problem, setProblem] = useState(initialProblem);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  // Map our language IDs to LeetCode langSlug values
  const LANG_SLUG_MAP = {
    71: 'python3',
    63: 'javascript',
    54: 'cpp',
    62: 'java',
  };

  // Helper: get code snippet for a language from the problem's codeSnippets
  const getSnippetForLang = useCallback((lang, prob) => {
    if (!prob?.codeSnippets || !Array.isArray(prob.codeSnippets)) return lang.stub;
    const slug = LANG_SLUG_MAP[lang.id];
    const match = prob.codeSnippets.find(s => s.langSlug === slug);
    return match ? match.code : lang.stub;
  }, []);

  useEffect(() => {
    // If the problem object already has content, use it.
    if (initialProblem?.content) {
      setProblem(initialProblem);
      // Load snippet for selected language
      const snippet = getSnippetForLang(selectedLang, initialProblem);
      setCode(snippet);
      return;
    }

    // Otherwise fetch by slug
    const slug = initialProblem?.leetcode_slug || initialProblem?.slug;
    if (slug) {
      setLoadingProblem(true);
      problemAPI.getBySlug(slug).then(res => {
         setProblem(res.data);
         // Set code to the real LeetCode snippet for current language
         const snippet = getSnippetForLang(selectedLang, res.data);
         setCode(snippet);
      }).catch(err => {
         console.error("Failed to fetch full problem schema", err);
         setProblem(initialProblem);
      }).finally(() => setLoadingProblem(false));
    }
  }, [initialProblem]);
  
  const [code, setCode] = useState(LANGUAGES[0].stub);
=======
export default function DSAPanel({ problem, sessionId, onSubmitCode }) {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].stub);
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [runError, setRunError] = useState('');

  const editorRef = useRef(null);
<<<<<<< HEAD
  const containerRef = useRef(null);
  const rightColRef = useRef(null);

  // Split state tracking
  const [probWidth, setProbWidth] = useState(45); // 45% width for problem side
  const [editorHeight, setEditorHeight] = useState(70); // 70% height for editor

  const handleLangChange = useCallback((lang) => {
    setSelectedLang(lang);
    // Use real snippet if available, otherwise fallback to stub
    const snippet = getSnippetForLang(lang, problem);
    setCode(snippet);
    setResult(null);
  }, [problem, getSnippetForLang]);
=======

  const handleLangChange = useCallback((lang) => {
    setSelectedLang(lang);
    setCode(lang.stub);
    setResult(null);
  }, []);
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1

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
<<<<<<< HEAD
        stdin: '',
      });
      setResult(data);

=======
        stdin: stdin || '',
      });
      setResult(data);

      // Notify parent so it can include result in the next chat message
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
      if (onSubmitCode) {
        onSubmitCode({
          code: currentCode,
          language: selectedLang.name,
          result: data,
        });
      }
    } catch (err) {
<<<<<<< HEAD
      setRunError(err.response?.data?.error || 'Compiler error.');
=======
      setRunError(err.response?.data?.error || 'Compiler error. Check that JUDGE0_API_KEY is configured.');
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
    } finally {
      setRunning(false);
    }
  };

<<<<<<< HEAD
  const startProbResize = useCallback((e) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const onMouseMove = (moveEvent) => {
      let newWidth = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      if (newWidth < 15) newWidth = 15;
      if (newWidth > 85) newWidth = 85;
      setProbWidth(newWidth);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  const startEditorResize = useCallback((e) => {
    e.preventDefault();
    const container = rightColRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const onMouseMove = (moveEvent) => {
      let newHeight = ((moveEvent.clientY - rect.top) / rect.height) * 100;
      if (newHeight < 15) newHeight = 15;
      if (newHeight > 90) newHeight = 90;
      setEditorHeight(newHeight);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <div ref={containerRef} style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', background: colors.bgBase, colorScheme: isDarkMode ? 'dark' : 'light' }}>
      <style>{`
        .dsa-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .dsa-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .dsa-scrollbar::-webkit-scrollbar-thumb { background: ${colors.borderMid}; border-radius: 4px; }
        .dsa-scrollbar::-webkit-scrollbar-thumb:hover { background: ${colors.textDim}; }
      `}</style>

      {/* ── LEFT: Problem ── */}
      <div style={{ width: `${probWidth}%`, borderRight: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ProblemDisplay problem={problem} loading={loadingProblem} colors={colors} />
      </div>

      {/* Vertical Resizer */}
      <div 
        onMouseDown={startProbResize} 
        style={{ width: '4px', cursor: 'col-resize', position: 'relative', zIndex: 10, marginLeft: '-2px', marginRight: '-2px' }}
        onMouseEnter={e => e.currentTarget.style.background = colors.accent}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      />

      {/* ── RIGHT: Editor + Output ── */}
      <div ref={rightColRef} style={{ width: `${100 - probWidth}%`, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {/* Top: Editor Container */}
        <div style={{ height: `${editorHeight}%`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Editor toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '40px', padding: '0 12px', background: colors.bgPanel, borderBottom: `1px solid ${colors.border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '4px', background: colors.bgHover, border: `1px solid ${colors.borderMid}`, cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: "'Sora', sans-serif" }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.blue }}></div>
              <select
                value={selectedLang.id}
                onChange={e => {
                  const lang = LANGUAGES.find(l => l.id === Number(e.target.value));
                  if (lang) handleLangChange(lang);
                }}
                style={{ background: 'transparent', color: colors.blue, border: 'none', outline: 'none', cursor: 'pointer', paddingRight: '12px', WebkitAppearance: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2210%22%20height%3D%2210%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23${colors.blue.replace('#', '')}%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right center' }}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id} style={{ background: colors.bgHover, color: colors.textPrim }}>{lang.name}</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                 onClick={() => setIsDarkMode(!isDarkMode)}
                 style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: colors.textSec, fontSize: '15px' }}
                 title="Toggle Theme"
              >
                 {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button
                 onClick={handleRunCode}
                 disabled={running}
                 style={{ padding: '5px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: 600, fontFamily: "'Sora', sans-serif", background: colors.greenDim, color: colors.green, border: `1px solid rgba(44,187,93,.3)`, cursor: running ? 'not-allowed' : 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: '6px', opacity: running ? 0.7 : 1 }}
              >
                {running ? (
                  <span style={{ width: '12px', height: '12px', border: '2px solid rgba(44,187,93,.3)', borderTopColor: colors.green, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : '▶'}
                {running ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', background: colors.bgEditor, paddingTop: '12px', minHeight: 0, overflow: 'hidden' }}>
            <Editor
              height="100%"
              language={selectedLang.monaco}
              value={code}
              onChange={v => setCode(v || '')}
              onMount={handleEditorMount}
              theme={isDarkMode ? 'vs-dark' : 'vs'}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                formatOnPaste: true,
                renderLineHighlight: 'line',
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                wordWrap: 'on',
                padding: { top: 0, bottom: 8 },
                scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
              }}
            />
          </div>
        </div>

        {/* Horizontal Resizer */}
        <div 
          onMouseDown={startEditorResize} 
          style={{ height: '4px', cursor: 'row-resize', position: 'relative', zIndex: 10, marginTop: '-2px', marginBottom: '-2px' }}
          onMouseEnter={e => e.currentTarget.style.background = colors.accent}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        />

        {/* Bottom Panel */}
        <div style={{ height: `${100 - editorHeight}%`, display: 'flex', flexDirection: 'column', background: colors.bgPanel, borderTop: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', height: '38px', borderBottom: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              <div style={{ padding: '5px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', background: colors.bgHover, color: colors.textPrim, fontFamily: "'Sora', sans-serif" }}>
                Test Result
              </div>
            </div>
            {result && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: result.passed ? colors.green : colors.red, fontFamily: "'Sora', sans-serif" }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: result.passed ? colors.green : colors.red }}></div>
                {result.passed ? 'Accepted' : 'Failed'}
              </div>
            )}
          </div>
          
          <div className="dsa-scrollbar" style={{ flex: 1, overflow: 'auto' }}>
            {runError ? (
              <div style={{ padding: '16px', fontSize: '13px', color: colors.red, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>{runError}</div>
            ) : (
              <CompilerOutput result={result} running={running} colors={colors} />
            )}
          </div>
=======
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
>>>>>>> e8ac259e83537cb5da4f881a7ccdc095ce6275b1
        </div>
      </div>
    </div>
  );
}

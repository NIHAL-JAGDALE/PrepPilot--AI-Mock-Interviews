// ─── useSpeech.js ───────────────────────────────────────────
// Custom hooks for Text-to-Speech (TTS) and Speech-to-Text (STT)
// using the free Web Speech API (Chrome/Edge).
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════
// TTS HOOK — speaks interview questions aloud
// ═══════════════════════════════════════════════════════════

/**
 * Extracts ONLY the question text from an AI response.
 * Strips out scores, feedback, hints, transition announcements
 * (unless they contain the actual question), and markdown artifacts.
 *
 * @param {string} content - Raw AI response text
 * @returns {string|null} - The question text to speak, or null if nothing to speak
 */
export function extractQuestionText(content) {
  if (!content) return null;

  // Strip INTERVIEW_COMPLETE block and everything after
  let text = content.replace(/INTERVIEW_COMPLETE[\s\S]*/i, '').trim();
  if (!text) return null;

  // If the response has a NEXT QUESTION section, speak only that part
  const nextQIndex = text.indexOf('NEXT QUESTION:');
  if (nextQIndex !== -1) {
    let questionPart = text.substring(nextQIndex).replace('NEXT QUESTION:', '').trim();
    // Remove markdown formatting artifacts
    questionPart = stripMarkdown(questionPart);
    return questionPart || null;
  }

  // If there's no NEXT QUESTION, this is likely a pure question message
  // (e.g., the first welcome message, or a clarification prompt).
  // Check if it contains evaluation markers — if so, don't speak it
  const hasEvaluation = /SCORE:\s*\d+/i.test(text) ||
                        /FEEDBACK:/i.test(text) ||
                        /WHAT A STRONG ANSWER/i.test(text) ||
                        /WEAK AREAS/i.test(text);

  if (hasEvaluation) {
    // Has evaluation but no NEXT QUESTION — this is feedback-only, don't speak
    return null;
  }

  // Check if this is a hint response — don't speak hints
  const isHint = /\bhint\b/i.test(text) && /\b(here'?s?\s+(a|your)\s+hint|hint:)/i.test(text);
  if (isHint) return null;

  // Strip system/metadata lines
  text = text
    .replace(/^-*\s*ROUND:\s*\d+\s*[—–-]\s*.+$/gm, '')
    .replace(/^QUESTION:\s*\d+\s*(of|\/)\s*\d+\s*$/gm, '')
    .replace(/^-{3,}\s*$/gm, '')
    .trim();

  text = stripMarkdown(text);
  return text || null;
}

/**
 * Strips markdown formatting from text for cleaner speech synthesis.
 */
function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`[^`]+`/g, '')        // inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1')     // italic
    .replace(/#{1,6}\s*/g, '')         // headers
    .replace(/!\[.*?\]\(.*?\)/g, '')   // images
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // links → keep link text
    .replace(/^\s*[-*]\s/gm, '')       // list markers
    .replace(/\n{3,}/g, '\n\n')        // collapse whitespace
    .trim();
}

/**
 * useTTS — manages browser-native Text-to-Speech
 *
 * Features:
 * - Auto-plays question text when it changes
 * - Mute/unmute toggle persisted in localStorage
 * - Cancel ongoing speech on new question
 * - Speaker replay button control
 */
export function useTTS() {
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('preppilot_tts_muted') === 'true';
    } catch {
      return false;
    }
  });
  const [voices, setVoices] = useState([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState(() => {
    try {
      return localStorage.getItem('preppilot_tts_voice_uri') || '';
    } catch {
      return '';
    }
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const lastSpokenRef = useRef('');

  // Helper to load and filter voices
  const loadVoices = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    const allVoices = window.speechSynthesis.getVoices();
    // Filter to English voices for technical mock interviews
    const englishVoices = allVoices.filter(v => v.lang.startsWith('en'));
    const list = englishVoices.length > 0 ? englishVoices : allVoices;
    setVoices(list);

    // If no voice is selected yet, choose a sensible default
    setSelectedVoiceUri(prev => {
      if (prev && list.some(v => v.voiceURI === prev)) return prev;
      const defaultVoice = list.find(v =>
        v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural'))
      ) || list.find(v => v.lang.startsWith('en')) || list[0];
      return defaultVoice ? defaultVoice.voiceURI : '';
    });
  }, []);

  useEffect(() => {
    const supported = 'speechSynthesis' in window;
    setIsSupported(supported);

    if (supported) {
      loadVoices();
      // Chrome/Edge load voices asynchronously
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [loadVoices]);

  useEffect(() => {
    try {
      localStorage.setItem('preppilot_tts_muted', String(isMuted));
    } catch { /* localStorage not available */ }
  }, [isMuted]);

  useEffect(() => {
    try {
      if (selectedVoiceUri) {
        localStorage.setItem('preppilot_tts_voice_uri', selectedVoiceUri);
      }
    } catch { /* localStorage not available */ }
  }, [selectedVoiceUri]);

  // Cancel any ongoing speech
  const cancel = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  /**
   * Speaks the given text using SpeechSynthesis.
   * Cancels any ongoing speech first.
   */
  const speak = useCallback((text) => {
    if (!isSupported || !text || isMuted) return;

    // Cancel previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const allVoices = window.speechSynthesis.getVoices();
    const voice = allVoices.find(v => v.voiceURI === selectedVoiceUri);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, isMuted, selectedVoiceUri]);

  /**
   * Speaks a new question if it's different from the last one spoken.
   * Called when a new assistant message is added.
   */
  const speakNewQuestion = useCallback((questionText) => {
    if (!questionText || questionText === lastSpokenRef.current) return;
    lastSpokenRef.current = questionText;
    speak(questionText);
  }, [speak]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (next) {
        // Muting — cancel current speech
        cancel();
      }
      return next;
    });
  }, [cancel]);

  const changeVoice = useCallback((uri) => {
    setSelectedVoiceUri(uri);
    // Cancel ongoing speech to apply voice change on replay
    cancel();
  }, [cancel]);

  return {
    isMuted,
    isSpeaking,
    isSupported,
    voices,
    selectedVoiceUri,
    speak,
    speakNewQuestion,
    cancel,
    toggleMute,
    changeVoice,
  };
}

// ═══════════════════════════════════════════════════════════
// STT HOOK — Cross-browser Speech-to-Text via Groq Whisper
// ═══════════════════════════════════════════════════════════
//
// Uses MediaRecorder API (supported in ALL browsers: Chrome, Edge,
// Firefox, Safari, Brave) to capture audio, then sends it to the
// backend which transcribes via Groq's free Whisper API.
//
// For real-time text display:
// - Records audio continuously
// - Every ~3 seconds, sends accumulated audio to Whisper
// - Appends transcribed text to the input field progressively
// - Shows interim "processing" state for visual feedback
//
// This replaces the old Web Speech API approach which was blocked
// by Brave and unsupported in Firefox/Safari.
// ═══════════════════════════════════════════════════════════

import { transcribeAPI } from '../api/client';

/**
 * useSTT — Cross-browser Speech-to-Text using MediaRecorder + Groq Whisper
 *
 * @param {function} onTranscript - Called with transcribed text to append to input
 * @param {function} onInterim - Called with interim status text (e.g. "Processing...")
 */
export function useSTT(onTranscript, onInterim) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);           // All audio chunks for current session
  const intervalRef = useRef(null);       // Timer for periodic transcription
  const lastTranscriptLenRef = useRef(0); // Track how much text we've already appended
  const isListeningRef = useRef(false);   // Avoids stale closure issues

  // Check if MediaRecorder is available (it is in all modern browsers)
  useEffect(() => {
    const supported = typeof MediaRecorder !== 'undefined' &&
                      typeof navigator.mediaDevices?.getUserMedia === 'function';
    setIsSupported(supported);
  }, []);

  /**
   * Sends accumulated audio to the backend for Whisper transcription.
   * Returns the NEW text that should be appended (delta from last call).
   */
  const transcribeAccumulated = useCallback(async () => {
    if (chunksRef.current.length === 0) return;

    // Build a single blob from all chunks so far
    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });

    // Skip very small recordings (< 1KB is likely silence/noise)
    if (audioBlob.size < 1000) return;

    setIsProcessing(true);
    if (onInterim) onInterim('Transcribing...');

    try {
      const { data } = await transcribeAPI.transcribe(audioBlob);
      const fullText = (data.text || '').trim();

      if (fullText) {
        // Calculate the delta: what's new since our last transcription
        // Because we send ALL accumulated audio each time, Whisper returns
        // the full transcription. We extract only the new portion.
        const previousLen = lastTranscriptLenRef.current;

        if (fullText.length > previousLen) {
          const newText = fullText.substring(previousLen).trim();
          if (newText && onTranscript) {
            onTranscript(newText);
          }
          lastTranscriptLenRef.current = fullText.length;
        }
      }

      if (onInterim) onInterim(null);
    } catch (err) {
      console.error('Transcription failed:', err);
      // Don't show error for every chunk — just log it
      if (onInterim) onInterim(null);
    } finally {
      setIsProcessing(false);
    }
  }, [onTranscript, onInterim]);

  /**
   * Start recording audio from the microphone.
   * Sets up MediaRecorder and periodic transcription.
   */
  const startListening = useCallback(async () => {
    if (isListeningRef.current) return;
    setError(null);

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,       // Mono — sufficient for speech
          sampleRate: 16000,     // 16kHz — optimal for Whisper
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      streamRef.current = stream;

      // Determine supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
            ? 'audio/ogg;codecs=opus'
            : MediaRecorder.isTypeSupported('audio/mp4')
              ? 'audio/mp4'
              : ''; // Let browser pick default

      const options = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      // Reset state
      chunksRef.current = [];
      lastTranscriptLenRef.current = 0;

      // Collect audio data
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setError('Recording failed. Please try again.');
        stopListening();
      };

      recorder.onstop = () => {
        // Final transcription when recording stops
        transcribeAccumulated();
      };

      // Start recording — collect data every 1 second for smooth accumulation
      recorder.start(1000);
      setIsListening(true);
      isListeningRef.current = true;

      // Set up periodic transcription every 3 seconds for real-time feel.
      // This sends ALL accumulated audio to Whisper each time, so the
      // transcription quality improves as more context is available.
      intervalRef.current = setInterval(() => {
        if (isListeningRef.current && chunksRef.current.length > 0) {
          transcribeAccumulated();
        }
      }, 3000);

    } catch (err) {
      console.error('Microphone access error:', err);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please allow microphone permissions in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError(`Microphone error: ${err.message}`);
      }
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [transcribeAccumulated]);

  /**
   * Stop recording and trigger final transcription.
   */
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);

    // Clear the periodic transcription timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Stop the MediaRecorder (triggers onstop → final transcription)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch { /* ignore */ }
    }

    // Stop all audio tracks to release the microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  /**
   * Toggle listening on/off
   */
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    isListening,
    isProcessing,   // True while a transcription request is in-flight
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
}


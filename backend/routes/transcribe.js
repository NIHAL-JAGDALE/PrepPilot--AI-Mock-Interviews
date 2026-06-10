import express from 'express';
import auth from '../middleware/auth.js';
import Groq from 'groq-sdk';
import multer from 'multer';

// ─── TRANSCRIPTION ROUTE ──────────────────────────────────
// POST /api/transcribe
// Accepts an audio blob (webm/ogg/wav) from the browser's MediaRecorder,
// sends it to Groq's free Whisper API for transcription, and returns text.
//
// This enables cross-browser Speech-to-Text (STT) since the native
// Web Speech API (SpeechRecognition) only works in Chrome/Edge and is
// blocked by Brave for privacy reasons.
//
// Groq Whisper API is FREE and only requires the same GROQ_API_KEY
// already used for the interview chat. No additional signup needed.
// ──────────────────────────────────────────────────────────

const router = express.Router();

// Accept audio blobs up to 25MB (Whisper limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// Require authentication for all transcription routes
router.use(auth);

let groqClient = null;
function getGroqClient() {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set');
    }
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

/**
 * POST /api/transcribe
 * Body: multipart/form-data with field "audio" (Blob)
 * Optional query param: ?lang=en (ISO 639-1 language code)
 * Returns: { text: "transcribed text" }
 */
router.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided.' });
    }

    const groq = getGroqClient();

    // Determine the mimetype and file extension for the audio
    const mimeType = req.file.mimetype || 'audio/webm';
    const extMap = {
      'audio/webm': 'webm',
      'audio/ogg': 'ogg',
      'audio/wav': 'wav',
      'audio/mp4': 'mp4',
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
    };
    const ext = extMap[mimeType] || 'webm';

    // Create a File-like object for the Groq SDK
    // The Groq SDK accepts a File object or a Buffer with a name
    const audioFile = new File([req.file.buffer], `audio.${ext}`, {
      type: mimeType,
    });

    // Call Groq Whisper API (whisper-large-v3-turbo is free)
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3-turbo',
      language: req.query.lang || 'en',
      response_format: 'json',
    });

    const text = transcription.text || '';

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🎤 Transcription: "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`);
    }

    res.json({ text });
  } catch (error) {
    console.error('Transcription error:', error.message);

    // Handle specific Groq API errors
    if (error.status === 413) {
      return res.status(413).json({ error: 'Audio file too large. Keep recordings under 25MB.' });
    }
    if (error.status === 400) {
      return res.status(400).json({ error: 'Invalid audio format. Please try again.' });
    }

    res.status(500).json({ error: 'Transcription failed. Please try again.' });
  }
});

export default router;

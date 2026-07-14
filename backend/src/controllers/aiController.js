const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const { getModel, isConfigured } = require('../config/gemini');

const MAX_HISTORY_MESSAGES = 20; // keep prompts small and cheap
const MAX_MESSAGE_LENGTH = 2000;

/**
 * Converts the frontend's flat message list into the shape the Gemini SDK
 * expects for multi turn chat, and caps how much history gets sent.
 */
const buildHistory = (history = []) => {
  const formatted = history
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [
        {
          text: String(m.content || '').slice(0, MAX_MESSAGE_LENGTH),
        },
      ],
    }));

  // Gemini requires the first history message to be from the user.
  while (formatted.length && formatted[0].role !== 'user') {
    formatted.shift();
  }

  return formatted;
};
// @route   POST /api/ai/chat
// @desc    Public — available to guests and logged-in users alike.
//          Body: { message: string, history?: [{role: 'user'|'assistant', content: string}] }
const chat = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new ApiError(400, 'Message is required');
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new ApiError(400, `Message is too long (max ${MAX_MESSAGE_LENGTH} characters)`);
  }

  if (!isConfigured()) {
    // Fails soft so the widget can show a friendly "not configured yet"
    // state instead of a hard error, once GEMINI_API_KEY is added this
    // branch simply stops being hit.
    return res.status(200).json({
      success: true,
      data: {
        reply:
          "The AI assistant isn't configured yet. Once the site owner adds a GEMINI_API_KEY, I'll be ready to help with health questions, medicine info, and first-aid guidance.",
        configured: false,
      },
    });
  }

  const model = getModel();
  const chatSession = model.startChat({ history: buildHistory(history) });

  let result;
  try {
    result = await chatSession.sendMessage(message.trim());
  } catch (err) {
    throw new ApiError(502, 'The AI assistant is temporarily unavailable. Please try again shortly.');
  }

  const reply = result.response.text();

  res.status(200).json({ success: true, data: { reply, configured: true } });
});

module.exports = { chat };

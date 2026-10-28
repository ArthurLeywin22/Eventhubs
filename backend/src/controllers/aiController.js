import { supabaseAdmin } from '../config/supabase.js';
import { aiAssistantSchema } from '../schemas/aiSchema.js';
import { askGeminiAssistant, configureGeminiKey, getGeminiStatus } from '../services/geminiService.js';

/**
 * POST /api/ai/assistant
 * Handles conversational queries with full conversation history and live grounding
 */
export const handleAIAssistant = async (req, res, next) => {
  try {
    const validationResult = aiAssistantSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: validationResult.error.errors[0]?.message || 'Invalid question format',
      });
    }

    const { message, history } = validationResult.data;

    // Fetch live event catalog with registration counts from database
    const today = new Date().toISOString().split('T')[0];
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('*, event_registrations(count)')
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .limit(25);

    if (error) {
      console.error('[AI Assistant Event Fetch Error]:', error);
    }

    const eventsContext = (events || []).map(e => ({
      ...e,
      registration_count: e.event_registrations?.[0]?.count || 0,
    }));

    const aiResult = await askGeminiAssistant(message, eventsContext, history || []);

    res.json({
      success: true,
      answer: aiResult.answer,
      isLiveGemini: aiResult.isLiveGemini,
      events_grounded_count: eventsContext.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/ai/configure-key
 * Validates and configures a Google Gemini API Key live
 */
export const handleConfigureKey = async (req, res, next) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API key is required.',
      });
    }

    await configureGeminiKey(apiKey);

    res.json({
      success: true,
      message: 'Google Gemini 2.5 Flash connected successfully! Open-ended AI is now active.',
      model: 'gemini-3.8-flash',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to authenticate Gemini API Key. Please verify the key from Google AI Studio.',
    });
  }
};

/**
 * GET /api/ai/status
 * Returns current Gemini connection status
 */
export const handleGetStatus = (req, res) => {
  const status = getGeminiStatus();
  res.json({
    success: true,
    ...status,
  });
};



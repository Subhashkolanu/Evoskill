import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

/**
 * Strict Rate Limiter for Roadmap Generation
 * Limits to 10 requests per 15 minutes per IP to protect Gemini API quota.
 */
export const roadmapRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Rate limit exceeded: You have reached the maximum number of roadmap generations (10 per 15 minutes). Please wait before generating another path.'
  }
});

/**
 * General Rate Limiter for Conversational AI Endpoints
 * Limits to 60 requests per 15 minutes per IP.
 */
export const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Rate limit exceeded: Too many queries. Please slow down your requests.'
  }
});

/**
 * Middleware to enforce request timeouts on long-running AI calls.
 */
export function requestTimeout(timeoutMs: number = 45000) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        res.status(504).json({
          error: 'Gateway Timeout: The AI model took too long to respond. Please try again in a few moments.'
        });
      }
    });
    next();
  };
}

/**
 * Validates chat history payloads for Next Question & Roadmap routes.
 */
export function validateChatHistory(req: Request, res: Response, next: NextFunction) {
  const { chatHistory } = req.body;
  if (!chatHistory) {
    return res.status(400).json({ error: 'Validation Error: "chatHistory" field is required.' });
  }

  if (!Array.isArray(chatHistory)) {
    return res.status(400).json({ error: 'Validation Error: "chatHistory" must be an array of messages.' });
  }

  if (chatHistory.length === 0) {
    return res.status(400).json({ error: 'Validation Error: "chatHistory" cannot be empty.' });
  }

  if (chatHistory.length > 60) {
    return res.status(400).json({ error: 'Validation Error: "chatHistory" exceeds maximum allowable length of 60 messages.' });
  }

  for (const item of chatHistory) {
    if (!item || typeof item !== 'object') {
      return res.status(400).json({ error: 'Validation Error: Every item in chatHistory must be an object with sender and text.' });
    }
    if (!item.text || typeof item.text !== 'string' || item.text.trim().length === 0) {
      return res.status(400).json({ error: 'Validation Error: Chat messages must contain non-empty "text".' });
    }
  }

  next();
}

/**
 * Validates Study Buddy request parameters.
 */
export function validateStudyBuddy(req: Request, res: Response, next: NextFunction) {
  const { stepTitle, chatHistory } = req.body;

  if (!stepTitle || typeof stepTitle !== 'string' || stepTitle.trim().length === 0) {
    return res.status(400).json({ error: 'Validation Error: "stepTitle" is required and must be a non-empty string.' });
  }

  if (stepTitle.length > 250) {
    return res.status(400).json({ error: 'Validation Error: "stepTitle" exceeds maximum length of 250 characters.' });
  }

  if (!chatHistory || !Array.isArray(chatHistory)) {
    return res.status(400).json({ error: 'Validation Error: "chatHistory" must be an array of messages.' });
  }

  next();
}

/**
 * Validates Daily Insight request parameters.
 */
export function validateDailyInsight(req: Request, res: Response, next: NextFunction) {
  const { careerPath, currentPhase } = req.body;

  if (!careerPath || typeof careerPath !== 'string' || careerPath.trim().length === 0) {
    return res.status(400).json({ error: 'Validation Error: "careerPath" is required.' });
  }

  if (!currentPhase || typeof currentPhase !== 'string' || currentPhase.trim().length === 0) {
    return res.status(400).json({ error: 'Validation Error: "currentPhase" is required.' });
  }

  next();
}

/**
 * Global safe error handler middleware for Express.
 * Prevents leakage of stack traces, internal paths, or API keys.
 */
export function safeErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[API Error Intercepted]:', err?.message || err);

  if (res.headersSent) {
    return next(err);
  }

  // Handle payload too large
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload Too Large: Request body exceeds the 1MB limit.' });
  }

  // Handle malformed JSON
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Bad Request: Malformed JSON payload.' });
  }

  const statusCode = typeof err?.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
  
  res.status(statusCode).json({
    error: err?.userMessage || 'An unexpected internal server error occurred. Please try again later.'
  });
}

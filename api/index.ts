import express from "express";


import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import "dotenv/config";
import { requireAuth, AuthenticatedRequest } from "./auth.js";
import { 
  roadmapRateLimiter, 
  chatRateLimiter, 
  requestTimeout, 
  validateChatHistory, 
  validateStudyBuddy, 
  validateDailyInsight, 
  safeErrorHandler 
} from "./security.js";

// Circuit breaker state for Gemini API
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

const geminiCircuit: CircuitBreakerState = { failures: 0, lastFailureTime: 0, isOpen: false };
const CIRCUIT_BREAKER_THRESHOLD = 3;
const CIRCUIT_BREAKER_RESET_TIMEOUT_MS = 60000; // 1 minute

function checkCircuitBreaker(circuit: CircuitBreakerState): boolean {
  if (circuit.isOpen) {
    if (Date.now() - circuit.lastFailureTime > CIRCUIT_BREAKER_RESET_TIMEOUT_MS) {
      // Half-open: let one request through to test
      return true;
    }
    return false; // Circuit is still open
  }
  return true; // Circuit is closed
}

function recordSuccess(circuit: CircuitBreakerState) {
  circuit.failures = 0;
  circuit.isOpen = false;
}

function recordFailure(circuit: CircuitBreakerState) {
  circuit.failures++;
  circuit.lastFailureTime = Date.now();
  if (circuit.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuit.isOpen = true;
    console.warn("Circuit breaker OPENED for Gemini API.");
  }
}

// Helper for exponential backoff retry and smart fallbacks
async function executeWithSmartFallbacks(ai: GoogleGenAI, prompt: string, isJson: boolean = false, useSearch: boolean = false, requireThinking: boolean = true) {
  let errorLog: string[] = [];
  const modelsToTry = requireThinking ? [
    { model: "gemini-3.1-pro-preview", useThinking: true },
    { model: "gemini-3.1-pro-preview", useThinking: false },
    { model: "gemini-3.6-flash", useThinking: true },
    { model: "gemini-3.5-flash", useThinking: false }
  ] : [
    { model: "gemini-3.1-pro-preview", useThinking: false },
    { model: "gemini-3.6-flash", useThinking: false },
    { model: "gemini-3.5-flash", useThinking: false }
  ];

  let geminiSuccess = false;

  if (checkCircuitBreaker(geminiCircuit)) {
    for (const config of modelsToTry) {
      let delayMs = 1500;
      for (let i = 0; i < 3; i++) { // 3 retries per model
        try {
          console.log(`Trying ${config.model} (Thinking: ${config.useThinking}), attempt ${i + 1}`);
          const response = await ai.models.generateContent({
            model: config.model,
            contents: prompt,
            config: {
              ...(isJson ? { responseMimeType: "application/json" } : {}),
              ...(config.useThinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } } : {}),
              ...(useSearch ? { tools: [{ googleSearch: {} }] } : {})
            },
          });
          
          recordSuccess(geminiCircuit);
          geminiSuccess = true;
          return response;
        } catch (error: any) {
          errorLog.push(`${config.model}: ${error?.status || error?.code} - ${error?.message || ""}`);
          const status = error?.status || error?.code;
          const message = error?.message || "";
              
          // If it's a quota issue specifically for this model, we should break this retry loop and try the NEXT model.
          if (message.includes("exceeded your current quota") || message.includes("GenerateContentInputTokensPerModelPerMinute-FreeTier") || (status === 429 && message.includes("limit: 0"))) {
             console.warn(`[${config.model}] Quota exceeded or free tier unsupported. Trying next model...`);
             break; // Break the inner retry loop, proceed to next model in modelsToTry
          }
              
          const isRateLimit = status === 429 || status === 503 || message.includes("429") || message.includes("503") || message.includes("UNAVAILABLE") || message.includes("overloaded");
              
          if (isRateLimit) {
            console.warn(`[${config.model}] Rate limited/503. Retrying in ${delayMs}ms...`);
            if (i < 2) {
              await new Promise(resolve => setTimeout(resolve, delayMs));
              delayMs *= 2;
            }
          } else {
            // If it's a 400 Bad Request or something else, break and try next model
            break;
          }
        }
      }
    }
    
    if (!geminiSuccess) {
      recordFailure(geminiCircuit);
    }
  } else {
    console.log("Gemini circuit is OPEN. Skipping Gemini API and going straight to fallback.");
  }
      
  // Z.ai fallback if Gemini fails completely or circuit is open
  const zApiKey = process.env.Z_AI_API_KEY;
  if (zApiKey) {
    console.log("Using Z.ai API fallback...");
    const modelsToTryZai = process.env.Z_AI_MODEL ? [process.env.Z_AI_MODEL] : ["glm-5.1", "glm-5", "glm-x-preview", "glm-4-flash", "glm-4", "z-ai-default"];
    const baseUrl = process.env.Z_AI_BASE_URL || "https://api.z.ai/api/v1/chat/completions";
    
    for (const modelName of modelsToTryZai) {
      try {
        console.log(`Trying Z.ai model: ${modelName}...`);
        const zaiResponse = await fetch(baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${zApiKey}`,
            "x-api-key": zApiKey // Support both just in case
          },
          body: JSON.stringify({
            model: modelName,
            messages: [{ role: "user", content: prompt }],
            ...(isJson ? { response_format: { type: "json_object" } } : {})
          })
        });
            
        if (zaiResponse.ok) {
          const data = await zaiResponse.json();
          if (data.choices && data.choices.length > 0) {
             console.log(`Z.ai fallback succeeded with model ${modelName}`);
             return { text: data.choices[0].message.content };
          } else if (data.code === 401 || data.error) {
             console.warn(`Z.ai fallback error in response body for ${modelName}: ${JSON.stringify(data)}`);
          }
        } else {
          const errorText = await zaiResponse.text();
          console.warn(`Z.ai fallback failed with status: ${zaiResponse.status} - ${errorText}`);
          if (zaiResponse.status === 403 && errorText.includes("model_access_denied")) {
            console.log(`Model ${modelName} access denied. Trying next model...`);
            continue; // Try next model
          } else if (zaiResponse.status === 429) {
            console.log(`Rate limited on ${modelName}. Trying next model...`);
            continue;
          } else if (zaiResponse.status === 401) {
            console.log("Z.ai API key is invalid or expired. Breaking fallback.");
            break;
          }
        }
      } catch (zaiError) {
        console.error(`Z.ai fallback threw an error with model ${modelName}:`, zaiError);
      }
    }
  }
    
  // If ALL models failed (Gemini and Z.ai), provide a graceful fallback so the app NEVER errors out
  console.error("All AI endpoints failed. Using graceful fallback response.");
  if (isJson) {
    // Return a valid JSON structure depending on the expected format
    if (prompt.includes("market analysis")) {
      return { text: JSON.stringify({ average_salary_range: "$70,000 - $120,000", demand_level: "High", key_companies: ["Various Local Startups", "Tech Giants"] }) };
    } else if (prompt.includes("user_profile_analysis") || prompt.includes("micro_steps_roadmap")) {
      return { text: JSON.stringify({
        user_profile_analysis: { detected_strengths: ["Resilience", "Adaptability"], best_career_path: "Software Engineer", why_this_path_suits_them: "Great fit for logical thinkers." },
        micro_steps_roadmap: [{ phase_name: "Phase 1: Foundations", goal: "Learn the basics", daily_breakdown: [{ title: "Day 1: Getting Started", description: "Set up your environment and write your first program.", estimated_duration_hours: 2, resource_links: [], deadline_approaching: false }] }],
        real_world_projects: [{ project_name: "Portfolio Website", what_you_will_build: "A simple personal site.", skills_gained: ["HTML", "CSS", "JS"] }],
        resource_aggregator: [{ resource_type: "Course", topic: "Intro to Programming", direct_url: "https://www.freecodecamp.org/" }],
        coach_motivation_message: `Debug error: ${errorLog.join(" | ")}`
      }) };
    }
    return { text: "{}" };
  } else {
    return { text: "I'm currently experiencing very high demand and my AI services are momentarily overloaded. Please continue by clicking 'Generate My Path' or trying your request again in a few moments." };
  }
}

const app = express();
app.disable('x-powered-by');

// Production Security Headers & CORS Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://evoskill.ginnela.in',
    process.env.APP_URL
  ].filter(Boolean);

  if (process.env.NODE_ENV !== 'production' || !origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});
const PORT = 3000;

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.use(express.json({ limit: '1mb' }));

const FALLBACK_ROADMAP = {
  user_profile_analysis: {
    detected_strengths: ["Systems Thinking", "Logical Architecture", "Persistence", "Problem-Based Execution"],
    best_career_path: "Distributed Cloud Systems Engineer",
    why_this_path_suits_them: "Your preference for first-principles reasoning and structural problem solving aligns naturally with high-throughput backend infrastructure, database reliability, and cloud architecture."
  },
  market_analysis: {
    average_salary_range: "$125,000 - $175,000",
    demand_level: "Very High",
    key_companies: ["Google Cloud", "Stripe", "Cloudflare", "Datadog", "High-Growth Scaleups"]
  },
  micro_steps_roadmap: [
    {
      phase_name: "Phase 1: First-Principles Architecture & Core Systems",
      goal: "Master concurrency, memory management, and write-ahead logging without frameworks",
      daily_breakdown: [
        {
          title: "Day 1–2: Concurrency Models & Event Loop Internals",
          description: "Analyze synchronous vs asynchronous non-blocking I/O. Build a toy event loop in TypeScript with microtask queues to understand thread starvation.",
          estimated_duration_hours: 2.5,
          resource_links: [
            { title: "Node.js Event Loop Architecture Guide", url: "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick" },
            { title: "libuv Design & Async Primitives", url: "https://docs.libuv.org/en/v1.x/design.html" }
          ],
          deadline_approaching: true
        },
        {
          title: "Day 3–4: Relational Query Planners & B-Tree Indexes",
          description: "Inspect query execution plans with EXPLAIN ANALYZE in PostgreSQL. Build a multi-column compound index and measure sequential scans vs index scans.",
          estimated_duration_hours: 3.0,
          resource_links: [
            { title: "Use The Index, Luke (Canonical SQL Indexing)", url: "https://use-the-index-luke.com/" }
          ],
          deadline_approaching: false
        },
        {
          title: "Day 5–7: Append-Only Commit Logs & Idempotency",
          description: "Implement a disk-backed append-only log with CRC32 checksums. Enforce idempotency using unique keys to survive network retries.",
          estimated_duration_hours: 3.5,
          resource_links: [
            { title: "Designing Data-Intensive Applications (DDIA)", url: "https://dataintensive.net/" }
          ],
          deadline_approaching: false
        }
      ]
    },
    {
      phase_name: "Phase 2: Scalable API Gateways & Message Brokers",
      goal: "Implement pub/sub event pipelines, distributed rate-limiters, and token security",
      daily_breakdown: [
        {
          title: "Day 8–10: Token Bucket Rate Limiting with Redis",
          description: "Build an API middleware implementing sliding-window rate limits in Redis using atomic Lua scripts.",
          estimated_duration_hours: 2.5,
          resource_links: [
            { title: "Redis Rate Limiting Patterns", url: "https://redis.io/glossary/rate-limiting/" }
          ]
        },
        {
          title: "Day 11–14: Pub/Sub Event Streaming with Kafka",
          description: "Set up consumer groups and implement partition offsets with at-least-once message delivery guarantees.",
          estimated_duration_hours: 3.0,
          resource_links: [
            { title: "Apache Kafka Core Architecture", url: "https://kafka.apache.org/documentation/" }
          ]
        }
      ]
    }
  ],
  real_world_projects: [
    {
      project_name: "Distributed Raft Key-Value Cluster",
      what_you_will_build: "Build a fault-tolerant replicated KV store implementing leader election, log replication, and heartbeat timers.",
      skills_gained: ["Consensus Algorithms", "Network Partition Recovery", "RPC Communication", "State Machine Replication"]
    },
    {
      project_name: "High-Throughput Telemetry Event Gateway",
      what_you_will_build: "An edge ingestion pipeline processing 20,000 req/sec with backpressure buffers and Parquet columnar storage.",
      skills_gained: ["Backpressure Handling", "Columnar Storage", "Memory Profiling", "Zero-Copy Serialization"]
    }
  ],
  resource_aggregator: [
    {
      resource_type: "Canonical Book",
      topic: "Distributed Systems & Storage",
      direct_url: "https://dataintensive.net/"
    },
    {
      resource_type: "Interactive Specification",
      topic: "Raft Consensus Visualization",
      direct_url: "https://raft.github.io/"
    }
  ],
  coach_motivation_message: "True engineering competence is forged through struggle and first-principles reasoning. Do not memorize syntax—understand how memory, networks, and disks actually behave."
};

// API route for generating the next assessment question
app.post("/api/next-question", chatRateLimiter, requestTimeout(30000), requireAuth, validateChatHistory, async (req: AuthenticatedRequest, res) => {
  try {
    const { chatHistory } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ question: "What is your primary engineering milestone or target role for the next 6 months?" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
You are 'EvoSkill AI', a highly advanced, professional, and direct Career and Life Coach. 
Your goal is to gather info to determine the user's: 
1. Interests 
2. Education level/learning style 
3. Goals 
4. Time Commitment (how many months/weeks they have to dedicate, and how many hours per day they can spend).

If the user provides a very long or detailed answer that covers ALL of these, DO NOT ask more questions. Instead, state: "Thank you for the detailed information. You can now click 'Generate My Path' below to get your custom roadmap."
Otherwise, ask exactly 1 concise, direct question at a time to gather the missing information.
Maintain a highly professional and efficient tone. Do NOT use overly enthusiastic language, emojis, or unnecessary filler words.

Chat History:
${JSON.stringify(chatHistory, null, 2)}

Provide the next question text only.`;

    const response = await executeWithSmartFallbacks(ai, prompt, false, false, false);

    res.json({ question: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API route for generating the roadmap using Gemini
app.post("/api/generate-roadmap", roadmapRateLimiter, requestTimeout(60000), requireAuth, validateChatHistory, async (req: AuthenticatedRequest, res) => {
  try {
    const { chatHistory } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.json(FALLBACK_ROADMAP);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
You are 'EvoSkill AI', a highly advanced, personalized Career and Life Coach. 
Your goal is to help students and young adults discover their ideal career paths and provide them with a highly specific, micro-stepped, project-based learning roadmap.

Do NOT suggest passive learning (like "watch these 10 tutorials"). 
ALWAYS suggest a First-Principles and Problem-Based Learning approach.

Based on the following user assessment chat history:
${JSON.stringify(chatHistory, null, 2)}

Generate the complete A-to-Z roadmap. You must format your final output STRICTLY as a JSON object so the frontend can parse it.
Do NOT wrap the JSON in Markdown code blocks (like \`\`\`json). Return ONLY the raw JSON string.

IMPORTANT: Ensure all keys (user_profile_analysis, micro_steps_roadmap, real_world_projects, resource_aggregator, coach_motivation_message) are present. Do not miss any fields.

JSON Output Format:
{
  "user_profile_analysis": {
    "detected_strengths": ["string", "string"],
    "best_career_path": "string",
    "why_this_path_suits_them": "string"
  },
  "micro_steps_roadmap": [
    {
      "phase_name": "Phase 1: The Basics (e.g., Week 1-2)",
      "goal": "string",
      "daily_breakdown": [
        {
          "title": "Day 1-2: System Design Basics",
          "description": "Specific actionable project or goal",
          "estimated_duration_hours": 2.5,
          "resource_links": [
            { "title": "Resource Name", "url": "https://actual-verified-link.com" }
          ],
          "deadline_approaching": true
        }
      ]
    }
  ],
  "real_world_projects": [
    {
      "project_name": "string",
      "what_you_will_build": "string",
      "skills_gained": ["string"]
    }
  ],
  "resource_aggregator": [
    {
      "resource_type": "Course / Documentation / Tool",
      "topic": "string",
      "direct_url": "https://..."
    }
  ],
  "coach_motivation_message": "A short, energetic closing message to hype them up for Day 1."
}
`;

    let response;
    try {
      response = await executeWithSmartFallbacks(ai, prompt, true, false, true);
    } catch (apiError: any) {
      console.error("All models failed after retries:", apiError);
      return res.status(503).json({ error: "The AI models are currently experiencing extremely high demand. Please try again in a few minutes." });
    }

    let responseText = response.text || "{}";
    // Robust JSON extraction
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
      responseText = responseText.substring(firstBrace, lastBrace + 1);
    } else {
      // Fallback to original logic if it doesn't look like a standard JSON object
      responseText = responseText.replace(/^```(json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    }
    const parsedData = JSON.parse(responseText);
    
    try {
      if (parsedData.user_profile_analysis && parsedData.user_profile_analysis.best_career_path) {
        const pathName = parsedData.user_profile_analysis.best_career_path;
        const marketPrompt = `
You are a career research assistant. Find the current market analysis for the career: "${pathName}".
Provide a JSON response with exactly this format:
{
  "average_salary_range": "e.g., $80,000 - $120,000",
  "demand_level": "e.g., High, Very High, Moderate",
  "key_companies": ["Company A", "Company B", "Company C"]
}
Do NOT wrap the JSON in markdown code blocks.
`;
        const marketResponse = await executeWithSmartFallbacks(ai, marketPrompt, true, false, false);
        
        let marketText = marketResponse.text || "{}";
        const mFirst = marketText.indexOf('{');
        const mLast = marketText.lastIndexOf('}');
        if (mFirst !== -1 && mLast !== -1 && mLast >= mFirst) {
          marketText = marketText.substring(mFirst, mLast + 1);
        } else {
          marketText = marketText.replace(/^```(json)?\n?/i, "").replace(/\n?```$/i, "").trim();
        }
        parsedData.market_analysis = JSON.parse(marketText);
      }
    } catch (e: any) {
      console.warn(`Market analysis fetch failed: ${e.message}`);
      // Fail silently if market analysis fails
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/study-buddy", chatRateLimiter, requestTimeout(45000), requireAuth, validateStudyBuddy, async (req: AuthenticatedRequest, res) => {
  try {
    const { stepTitle, stepDescription, chatHistory } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        message: "### First-Principles Breakdown: " + (stepTitle || "Systems Architecture") + "\n\nWhen mastering **" + (stepTitle || "this topic") + "**, focus on foundational mental models rather than surface syntax:\n\n1. **Core Problem:** What engineering constraint does this architecture solve?\n2. **Failure Modes:** How does the system behave when nodes fail or network partitions occur?\n3. **Practical Heuristic:** Write a minimal failing test before adding abstractions."
      });
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let chatContext = chatHistory.map((m: any) => `${m.sender === 'user' ? 'User' : 'AI Buddy'}: ${m.text}`).join('\n');
    
    const prompt = `You are a deeply intelligent, patient, and expert 'AI Study Buddy' and Career Mentor.
Your job is to help the user understand a specific concept or project step in their roadmap.
Step Title: ${stepTitle}
Step Description: ${stepDescription}

Current Conversation Context:
${chatContext}

CRITICAL INSTRUCTIONS FOR YOUR RESPONSE:
1. DIRECT ANSWER: Respond to the user's latest message with a clear, insightful, and pedagogical explanation. Explain the 'why' and the 'how'. Use analogies if helpful.
2. EXPAND & CONNECT: Do not just answer the literal question. Anticipate their next hurdle. Provide 1-2 related concepts or deeper insights that connect to their query. Briefly explain how this knowledge applies directly to completing their current task (${stepTitle}).
3. PROACTIVE GUIDANCE: If they seem stuck, suggest a specific, small actionable step they can take right now.
4. CURIOSITY: End with a thought-provoking "Curiosity Question" or a mini-challenge to test their understanding.

Format the response nicely in Markdown (use formatting like headers e.g. '### The Core Concept', bullet points, bold text, code blocks if needed).
Be encouraging, friendly, and act as a senior mentor who wants them to truly master the material.`;

    // Always try to use high thinking for the study buddy
    const response = await executeWithSmartFallbacks(ai, prompt, false, false);
    
    res.json({ message: response.text });
  } catch (error: any) {
    console.error("Study Buddy Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate response." });
  }
});

app.post("/api/daily-insight", chatRateLimiter, requestTimeout(20000), requireAuth, validateDailyInsight, async (req: AuthenticatedRequest, res) => {
  try {
    const { careerPath, currentPhase } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        insight: "Focus on building minimum viable mental models. Test your assumptions with small code scripts before trusting abstractions."
      });
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are a motivating career coach. Provide ONE short, punchy, bite-sized daily tip (max 2 sentences) for someone learning to become a ${careerPath}, currently focusing on ${currentPhase}. Be practical and inspiring.`;
    
    const response = await executeWithSmartFallbacks(ai, prompt, false, false, false);
    res.json({ insight: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.use(safeErrorHandler);

export default app;

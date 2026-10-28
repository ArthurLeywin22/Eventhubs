import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");

const SYSTEM_INSTRUCTION = `You are EventHub AI, a brilliant and friendly campus AI assistant — think of yourself as a combination of Google Gemini and ChatGPT, specialized for college life.

## Your Personality
- Warm, enthusiastic, and encouraging
- Clear, concise, and beautifully formatted with markdown
- Proactive: offer helpful follow-up suggestions

## Your Core Capabilities
1. Open-Ended Conversation: Answer ANY question like a capable general AI — coding help, career advice, study tips, general knowledge, creative brainstorming.
2. Campus Event Intelligence: You have live access to the college event database. Use it to give accurate, grounded answers about events.
3. Event Registration Guidance: Walk students through registering on EventHub step by step.

## Critical Rules
- NEVER invent event names, dates, venues, or details that are not in the catalog.
- For campus event questions, ALWAYS reference the live catalog.
- For general questions (coding, study tips, AI concepts, life advice) — answer freely and confidently like Gemini or ChatGPT.
- Maintain multi-turn conversation memory naturally.
- Format responses with markdown: headers, bold, bullet points, numbered lists, code blocks.

## How to Register for Events
1. Go to the Events page in the navigation bar
2. Click the event card you are interested in
3. Ensure you are signed into your student account
4. Click the blue Register Now button
5. View your events anytime under My Events or Student Dashboard`;

export const configureGeminiKey = async (apiKey) => {
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 15) {
    throw new Error("Invalid Gemini API key format.");
  }
  const cleanKey = apiKey.trim();
  const testAI = new GoogleGenAI({ apiKey: cleanKey });
  await testAI.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [{ role: "user", parts: [{ text: "Reply with just OK." }] }],
  });
  process.env.GEMINI_API_KEY = cleanKey;
  try {
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
      if (envContent.includes("GEMINI_API_KEY=")) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${cleanKey}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${cleanKey}\n`;
      }
    } else {
      envContent = `GEMINI_API_KEY=${cleanKey}\n`;
    }
    fs.writeFileSync(envPath, envContent, "utf8");
  } catch (err) {
    console.warn("[Gemini Service] Could not persist to .env:", err.message);
  }
  return true;
};

export const getGeminiStatus = () => {
  const hasKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10);
  return { isConfigured: hasKey, model: "gemini-3.8-flash" };
};

export const askGeminiAssistant = async (userMessage, eventsContext = [], history = []) => {
  const catalogText = buildEventCatalog(eventsContext);
  const fullSystemPrompt = `${SYSTEM_INSTRUCTION}\n\n## Live College Event Catalog\n${catalogText}\n## End of Catalog`;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      const contents = [];
      const recentHistory = history.slice(-12);
      for (const turn of recentHistory) {
        if (turn.text && turn.text.trim() && turn.sender) {
          contents.push({
            role: turn.sender === "user" ? "user" : "model",
            parts: [{ text: turn.text.trim() }],
          });
        }
      }
      contents.push({ role: "user", parts: [{ text: userMessage }] });
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction: fullSystemPrompt,
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });
      const answer = response?.text;
      if (answer && answer.trim().length > 0) {
        return { answer: answer.trim(), isLiveGemini: true };
      }
    } catch (err) {
      console.error("[Gemini 2.5 Flash Error]:", err.message);
    }
  }

  const answer = localDialogEngine(userMessage, eventsContext, history);
  return { answer, isLiveGemini: false };
};

function buildEventCatalog(events) {
  if (!events || events.length === 0) return "No events currently in the database.";
  return events.map((e, i) => {
    const remaining = Math.max(0, (e.max_participants || 0) - (e.registration_count || 0));
    return `### Event ${i + 1}: ${e.title}\n- **Category**: ${e.category}\n- **Date**: ${e.event_date} | **Time**: ${e.start_time} to ${e.end_time}\n- **Venue**: ${e.venue}\n- **Organizer**: ${e.organizer}\n- **Capacity**: ${e.max_participants} total | ${remaining > 0 ? `${remaining} seats available` : "FULL"}\n- **Registration Deadline**: ${e.registration_deadline}\n- **Description**: ${e.description}`;
  }).join("\n\n");
}

function localDialogEngine(query, events, history) {
  const q = query.toLowerCase().trim();

  if (/who are you|what are you|your name|introduce yourself|what can you do|who made you|tell me about yourself/.test(q)) {
    return `# 👋 Hi! I am EventHub AI\n\nI am your intelligent campus assistant — designed to work like **ChatGPT or Google Gemini**, specialized for college life!\n\n## What I can do:\n- 🎯 **Find and recommend** campus events (hackathons, workshops, fests, sports)\n- 📅 **Check schedules**, venues, deadlines, and live seat counts\n- 💡 **Give advice** on study, tech, career, and competition prep\n- 🔧 **Answer general questions** — coding, AI, life — anything!\n- 📝 **Guide you** through event registration step by step\n\n> 💡 **Tip**: Connect your free Google Gemini API key using the button in the header to unlock full AI conversation mode!\n\nWhat would you like to explore?`;
  }

  if (/^(hi|hello|hey|good morning|good afternoon|good evening|greetings|howdy|yo|sup)[!?., ]*$/.test(q)) {
    const count = events.length;
    return `## Hello! 👋 Great to see you!\n\nI am EventHub AI — your campus intelligence assistant. We currently have **${count} event${count !== 1 ? "s" : ""}** scheduled across hackathons, workshops, cultural fests, and sports!\n\nHow can I help you today? You can ask me:\n- 📅 What upcoming events are there?\n- 🏆 Hackathon tips and prep advice\n- 💻 Coding and tech questions\n- 🎓 Study or career guidance\n\nFire away!`;
  }

  if (/thank|thanks|thx|appreciate|helpful|great job|awesome|nice/.test(q)) {
    return `You are very welcome! 😊 It is my pleasure to help.\n\nFeel free to come back anytime you need event info, study tips, or just want to chat. Good luck out there! 🚀`;
  }

  if (/bye|goodbye|see you|goodnight|good night|cya|later|take care/.test(q)) {
    return `Goodbye! 👋 Have an amazing time on campus. Come back whenever you need help with events or anything else. All the best! 🎓`;
  }

  if (/how (do i|to|can i) register|registration process|sign up process|how (do i|to) sign up/.test(q)) {
    return `## 📝 How to Register for an Event\n\nHere is the step-by-step process:\n\n1. **Browse Events** — Click **Events** in the navigation bar\n2. **Pick an Event** — Click any event card to open its detail page\n3. **Sign In** — Make sure you are logged in with your student account\n4. **Claim Your Seat** — Hit the blue **"Register Now"** button\n5. **Track It** — Find all your registrations under **My Events** or **Student Dashboard**\n\nThat is it! Once registered, your seat is secured. 🎟️\n\nWould you like to know about any specific upcoming event?`;
  }

  if (/how to (learn|start) (coding|programming)|coding tips|learn programming|get started (with|in) (coding|programming|python|javascript|web dev)/.test(q)) {
    return `## 💻 Getting Started with Programming\n\nGreat choice! Here is a solid roadmap:\n\n### For Beginners:\n1. **Pick one language first** — Python is great for beginners (clean syntax, huge community)\n2. **Learn fundamentals** — Variables, loops, functions, data structures\n3. **Build small projects** — A calculator, to-do app, or simple game\n4. **Use free resources** — freeCodeCamp, CS50, The Odin Project\n\n### Key Principles:\n- **Code daily**, even just 30 minutes — consistency beats intensity\n- **Read others code** on GitHub to learn patterns\n- **Break problems down** into small steps before coding\n- **Do not fear errors** — debugging is 50% of programming!\n\n${events.length > 0 ? "> 🎓 **Campus Tip**: Check out our upcoming campus events — there may be workshops or hackathons to sharpen your skills!" : ""}`;
  }

  if (/hackathon tip|prepare for hackathon|win a hackathon|hackathon advice|how to win hackathon/.test(q)) {
    const hack = events.find((e) => e.category === "Hackathon") || events[0];
    return `## 🏆 Hackathon Winning Tips\n\n### Before the Hack\n1. **Form a balanced team** — Frontend, backend, designer, and pitcher (3-4 members is ideal)\n2. **Pre-configure your stack** — Have a starter template ready (Vite + React + Node.js)\n3. **Study the theme** — Brainstorm 5 ideas before arriving\n\n### During the Hack\n4. **Pick a real problem** — Judges love solutions to clear pain points\n5. **Build an MVP first** — A working basic version beats an ambitious broken app\n6. **Save 3 hours for the demo** — A polished pitch can win over a technically superior project!\n\n### The Pitch\n7. **Lead with the problem** — Explain the pain point compellingly\n8. **Live demo always** — Show it working in real time${hack ? `\n\n> 📅 **Upcoming**: **${hack.title}** on **${hack.event_date}** at **${hack.venue}**. Deadline: **${hack.registration_deadline}**!` : ""}`;
  }

  if (/what is docker|learn docker|what is kubernetes|devops|containerization|cloud native/.test(q)) {
    const dockerEvent = events.find((e) => e.title.toLowerCase().includes("docker") || e.category === "Workshop") || null;
    return `## 🐳 Docker and Containerization\n\n**Docker** packages applications into **containers** — isolated, portable environments that run consistently anywhere.\n\n### Key Concepts:\n- **Image** — A read-only blueprint for a container\n- **Container** — A running instance of an image\n- **Dockerfile** — Instructions to build an image\n- **Docker Hub** — Public registry for sharing images\n\n### Why It Matters:\n- Solves the classic "it works on my machine" problem\n- Makes deployment consistent from dev to production\n- Fundamental skill for DevOps and cloud engineering roles\n\n### Quick Start:\n\`\`\`bash\ndocker pull node:18\ndocker run -it node:18 bash\n\`\`\`\n${dockerEvent ? `\n> 🛠️ **Hands-On**: Check out **${dockerEvent.title}** on **${dockerEvent.event_date}** at **${dockerEvent.venue}**!` : ""}`;
  }

  if (/what is (ai|artificial intelligence|machine learning|deep learning|neural network|llm|gpt|gemini)/.test(q)) {
    return `## 🤖 Artificial Intelligence Explained\n\n**AI (Artificial Intelligence)** is the field of building systems that can perform tasks requiring human intelligence.\n\n### The Hierarchy:\n\`\`\`\nArtificial Intelligence\n  └── Machine Learning (learns from data)\n        └── Deep Learning (neural networks)\n              └── LLMs (GPT, Gemini, Claude)\n\`\`\`\n\n### Key Concepts:\n- **Machine Learning**: Algorithms that learn patterns from data\n- **Neural Networks**: Layers of connected nodes inspired by the brain\n- **LLMs**: Trained on massive text to understand and generate language\n\n### Getting Started:\n1. Learn Python first\n2. Study numpy, pandas, and matplotlib\n3. Try Google Machine Learning Crash Course\n4. Experiment on Kaggle datasets`;
  }

  if (/all events|list events|show events|what events|upcoming events|events available|any events/.test(q)) {
    if (events.length === 0) return `No upcoming events are currently in the database. Check back soon or browse the **Events** page!`;
    const list = events.slice(0, 8).map((e) => {
      const rem = Math.max(0, e.max_participants - (e.registration_count || 0));
      return `- **${e.title}** [${e.category}] — ${e.event_date} @ ${e.venue} | ${rem > 0 ? `${rem} seats left` : "**FULL**"}`;
    }).join("\n");
    return `## 📅 Upcoming Campus Events\n\n${list}\n\nWe have **${events.length}** total events. Ask me about any specific one for full details!`;
  }

  const categoryMap = [
    { pattern: /hackathon|coding sprint|tech competition/, category: "Hackathon", label: "Hackathons and Coding Sprints" },
    { pattern: /workshop|bootcamp|hands.on/, category: "Workshop", label: "Workshops and Bootcamps" },
    { pattern: /cultural|fest|music|dance|art/, category: "Cultural", label: "Cultural Fests and Performances" },
    { pattern: /sports|tournament|football|cricket|basketball|match/, category: "Sports", label: "Sports and Tournaments" },
    { pattern: /seminar|talk|lecture|keynote/, category: "Seminar", label: "Seminars and Talks" },
  ];

  for (const { pattern, category, label } of categoryMap) {
    if (pattern.test(q)) {
      const matches = events.filter((e) => e.category === category || e.category.toLowerCase().includes(category.toLowerCase()));
      return formatCategoryList(label, matches);
    }
  }

  if (/deadline|closing soon|last day|registration end/.test(q)) {
    if (events.length === 0) return "No events with upcoming deadlines found.";
    const sorted = [...events].sort((a, b) => new Date(a.registration_deadline) - new Date(b.registration_deadline));
    const list = sorted.slice(0, 5).map((e) => `- **${e.title}** — Deadline: **${e.registration_deadline}** (Event: ${e.event_date})`).join("\n");
    return `## ⏳ Events with Closest Registration Deadlines\n\n${list}\n\n> Register soon — popular events fill up fast!`;
  }

  const mentionedEvent = findEventByMention(q, events);
  let contextEvent = mentionedEvent;
  if (!contextEvent && isFollowUp(q) && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const found = findEventByMention((history[i].text || "").toLowerCase(), events);
      if (found) { contextEvent = found; break; }
    }
  }

  if (contextEvent) {
    const rem = Math.max(0, contextEvent.max_participants - (contextEvent.registration_count || 0));
    if (/when|time|date|schedule|day/.test(q)) {
      return `## 📅 ${contextEvent.title} — Schedule\n\n- **Date**: ${contextEvent.event_date}\n- **Time**: ${contextEvent.start_time} – ${contextEvent.end_time}\n- **Venue**: ${contextEvent.venue}\n- **Registration Deadline**: ${contextEvent.registration_deadline}\n\nWould you like to know about available seats or how to register?`;
    }
    if (/where|venue|location|place|room|hall/.test(q)) {
      return `## 📍 ${contextEvent.title} — Venue\n\n**${contextEvent.venue}**\n\nOrganized by: **${contextEvent.organizer}**\n\nArrive a few minutes before **${contextEvent.start_time}** for check-in!`;
    }
    if (/seat|capacity|available|full|how many|spots/.test(q)) {
      return `## 🎟️ ${contextEvent.title} — Seat Availability\n\n- **Total Capacity**: ${contextEvent.max_participants}\n- **Registered**: ${contextEvent.registration_count || 0}\n- **Available Seats**: ${rem > 0 ? `**${rem} seats open** ✅` : "**FULL** ⚠️"}\n\n${rem > 0 ? "Register now before it fills up!" : "This event is full. Check for cancellations or browse other events."}`;
    }
    if (/register|sign up|join|book|enroll/.test(q)) {
      return `## 📝 Registering for ${contextEvent.title}\n\n1. Go to the **Events** page\n2. Click on **${contextEvent.title}**\n3. Tap the blue **"Register Now"** button\n\n**Deadline**: ${contextEvent.registration_deadline} | **Seats left**: ${rem > 0 ? rem : "FULL"}`;
    }
    return `## 📌 ${contextEvent.title}\n\n- **Category**: ${contextEvent.category}\n- **Organizer**: ${contextEvent.organizer}\n- **Date**: ${contextEvent.event_date}\n- **Time**: ${contextEvent.start_time} – ${contextEvent.end_time}\n- **Venue**: ${contextEvent.venue}\n- **Seats Available**: ${rem > 0 ? `${rem} of ${contextEvent.max_participants}` : "**FULL**"}\n- **Registration Deadline**: ${contextEvent.registration_deadline}\n\n**About this event:**\n${contextEvent.description}\n\nWould you like help registering, or do you have other questions?`;
  }

  const scored = scoreEvents(q, events);
  if (scored.length > 0 && scored[0].score >= 2) {
    const top = scored.slice(0, 3);
    const list = top.map(({ event: e }) => {
      const rem = Math.max(0, e.max_participants - (e.registration_count || 0));
      return `- **${e.title}** [${e.category}] — ${e.event_date} @ ${e.venue} | ${rem > 0 ? `${rem} seats left` : "**FULL**"}`;
    }).join("\n");
    return `## 🔍 Relevant Events Found\n\n${list}\n\nAsk me for full details on any of these!`;
  }

  const sampleEvents = events.slice(0, 3).map((e) => `- **${e.title}** [${e.category}] on ${e.event_date}`).join("\n");
  return `I would love to help! I can assist with:\n\n- 🎓 **Campus events** — schedules, venues, seats, registration\n- 💻 **Coding and tech questions** — programming, AI, tools\n- 📚 **Study and career advice** — tips, roadmaps, strategies\n${sampleEvents ? `\n**Some upcoming events:**\n${sampleEvents}` : ""}\n\nWhat would you like to know more about? Feel free to ask anything!\n\n> 💡 Connect a **Gemini API key** (button at the top) to unlock full AI conversation mode!`;
}

function formatCategoryList(label, events) {
  if (events.length === 0) return `No **${label}** are currently scheduled. Check back soon!`;
  const list = events.map((e) => {
    const rem = Math.max(0, e.max_participants - (e.registration_count || 0));
    return `- **${e.title}** — ${e.event_date} @ ${e.venue}\n  Seats: ${rem > 0 ? `${rem} available` : "**FULL**"} | Deadline: ${e.registration_deadline}`;
  }).join("\n\n");
  return `## 🎯 ${label}\n\n${list}\n\nClick any event on the Events page to register!`;
}

function findEventByMention(text, events) {
  const lower = text.toLowerCase();
  for (const e of events) {
    const titleWords = e.title.toLowerCase().split(/[\s:,-]+/).filter((w) => w.length > 3);
    for (const word of titleWords) {
      if (lower.includes(word)) return e;
    }
  }
  return null;
}

function isFollowUp(text) {
  return /when is it|where is it|what time|how many seats|is it full|tell me more|more details|register for it|register for this|how do i join|how to join/.test(text);
}

function scoreEvents(query, events) {
  const stopWords = new Set(["the", "and", "for", "are", "what", "which", "tell", "about", "can", "how", "show", "any", "some", "event", "events", "give", "list", "that", "this"]);
  const tokens = query.toLowerCase().split(/[\s,?!;.:]+/).filter((w) => w.length > 2 && !stopWords.has(w));
  return events.map((e) => {
    const corpus = `${e.title} ${e.category} ${e.description} ${e.venue} ${e.organizer}`.toLowerCase();
    let score = 0;
    for (const token of tokens) {
      if (corpus.includes(token)) {
        score += 2;
        if (e.title.toLowerCase().includes(token)) score += 3;
        if (e.category.toLowerCase().includes(token)) score += 2;
      }
    }
    return { event: e, score };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
}



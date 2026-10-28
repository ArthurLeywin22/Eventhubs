import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { askAIAssistant } from "../services/api";
import {
  Sparkles, Send, Bot, User, Loader2, Lightbulb, Trash2,
  Copy, Check,
} from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "What hackathons are coming up?",
  "Give me tips to win a hackathon",
  "What is Docker and how do I learn it?",
  "Show me all upcoming events",
  "How do I register for an event?",
  "What events have deadlines soon?",
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

function MessageBubble({ msg, onCopy, copiedId }) {
  const isUser = msg.sender === "user";
  return (
    <div className={`flex items-start gap-3 group ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
        isUser
          ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
          : "bg-gradient-to-br from-slate-700 to-slate-900 text-white"
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className={`relative max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm"
            : "bg-white text-slate-800 border border-slate-200 rounded-tl-sm"
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.text}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-headings:mt-3 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-indigo-700 prose-code:text-xs prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:text-xs prose-strong:text-slate-900 prose-blockquote:border-indigo-300 prose-blockquote:text-slate-500 prose-a:text-indigo-600">
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && (
          <button
            onClick={() => onCopy(msg.text, msg.id)}
            className="opacity-0 group-hover:opacity-100 transition-all mt-1 self-start text-slate-400 hover:text-slate-600 text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-xs hover:shadow-sm"
          >
            {copiedId === msg.id ? (
              <><Check className="w-3 h-3 text-emerald-600" /> Copied!</>
            ) : (
              <><Copy className="w-3 h-3" /> Copy</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AIChatBox() {
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      sender: "assistant",
      text: `# 👋 Welcome to EventHub AI!\n\nI am your intelligent campus assistant — just like **ChatGPT or Google Gemini**, but specialized for college life!\n\nI can help you:\n- 🎓 **Discover events** — hackathons, workshops, cultural fests, sports\n- 📅 **Check schedules**, venues, deadlines, and live seat counts\n- 💡 **Answer any question** — coding, AI, career advice, study tips\n- 📝 **Guide you** through event registration step by step\n\nWhat would you like to explore today?`,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const handleSend = useCallback(async (textToSend) => {
    const question = (textToSend || input).trim();
    if (!question || loading) return;

    const historyPayload = messages.map((m) => ({ sender: m.sender, text: m.text }));

    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text: question }]);
    setInput("");
    setLoading(true);
    abortRef.current = false;

    try {
      const response = await askAIAssistant(question, historyPayload);
      if (abortRef.current) return;
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: response.answer || "I am sorry, I could not process that right now. Please try again!",
        },
      ]);
    } catch (err) {
      if (abortRef.current) return;
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: `**Error**: ${err.message || "Unable to connect to the EventHub AI backend. Make sure the server is running."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    abortRef.current = true;
    setLoading(false);
    setMessages([
      {
        id: Date.now().toString(),
        sender: "assistant",
        text: "✨ Conversation cleared! What would you like to explore or talk about?",
      },
    ]);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[680px] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight">EventHub AI</h3>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-400/40">
                ● Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ask me anything — events, coding, career, study tips and more!
            </p>
          </div>
        </div>
        {messages.length > 2 && (
          <button
            onClick={handleClear}
            title="Clear conversation"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 bg-slate-50/60 scroll-smooth">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} onCopy={handleCopy} copiedId={copiedId} />
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-200 shadow-sm">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="px-5 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">Try:</span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-full text-xs font-medium transition-all border border-slate-200/60 hover:border-indigo-200 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
        <div className="flex items-end gap-3 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-xs">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything — events, coding, AI, life advice... (Enter to send)"
            disabled={loading}
            className="flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none leading-relaxed disabled:opacity-50 min-h-[24px] max-h-[160px]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:shadow-indigo-200 disabled:shadow-none"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2">
          EventHub AI • Always available • No sign-in required for chat
        </p>
      </div>

    </div>
  );
}

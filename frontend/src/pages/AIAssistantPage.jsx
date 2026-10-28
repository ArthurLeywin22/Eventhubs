import React from "react";
import AIChatBox from "../components/AIChatBox";
import { Sparkles, ShieldCheck, Database, BookOpen, Users, Zap, MessageSquare, Search } from "lucide-react";

const FEATURE_CARDS = [
  {
    icon: Zap,
    color: "indigo",
    title: "No API Key Needed",
    description: "Works instantly — no sign-up, no key, no setup. Just ask and get answers right away.",
  },
  {
    icon: Database,
    color: "violet",
    title: "Live Event Database",
    description: "Real-time data — accurate seat counts, schedules, venues, and deadlines pulled live.",
  },
  {
    icon: MessageSquare,
    color: "emerald",
    title: "Natural Conversation",
    description: "Multi-turn memory — it remembers context across the conversation just like Gemini.",
  },
  {
    icon: Search,
    color: "amber",
    title: "Smart Event Search",
    description: "Ask in plain English about any event and get full details instantly.",
  },
  {
    icon: BookOpen,
    color: "rose",
    title: "Study & Career Advice",
    description: "Hackathon tips, programming roadmaps, Docker tutorials, and more.",
  },
  {
    icon: ShieldCheck,
    color: "sky",
    title: "Always Available",
    description: "No external dependencies — the AI works 24/7 without any third-party service.",
  },
];

const colorMap = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
  sky: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-100" },
};

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700 text-xs font-bold uppercase tracking-widest border border-indigo-200/60 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            AI-Powered Campus Assistant
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            EventHub{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              AI Assistant
            </span>
          </h1>
          <p className="text-slate-500 text-base leading-relaxed">
            Your intelligent campus companion. Ask about events, get coding help, career advice, or just have a conversation —{" "}
            <strong className="text-slate-700">no API key required</strong>, works instantly.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            AI is online and ready
          </div>
        </div>

        {/* Main Chat */}
        <AIChatBox />

        {/* Feature Grid */}
        <div>
          <h2 className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-5">
            Why EventHub AI is different
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURE_CARDS.map(({ icon: Icon, color, title, description }) => {
              const c = colorMap[color];
              return (
                <div
                  key={title}
                  className={`bg-white p-5 rounded-2xl border ${c.border} shadow-xs hover:shadow-md transition-shadow flex items-start gap-4`}
                >
                  <div className={`p-2.5 rounded-xl ${c.bg} ${c.text} flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

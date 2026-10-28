import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">EventHub</span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              College Event Management System. Empowering students and campus organizations to discover, organize, and participate in collegiate excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/events" className="hover:text-indigo-600 transition-colors">All Events</Link>
              </li>
              <li>
                <Link to="/events?category=Hackathon" className="hover:text-indigo-600 transition-colors">Hackathons</Link>
              </li>
              <li>
                <Link to="/events?category=Workshop" className="hover:text-indigo-600 transition-colors">Workshops</Link>
              </li>
              <li>
                <Link to="/events?category=Cultural" className="hover:text-indigo-600 transition-colors">Cultural Fests</Link>
              </li>
            </ul>
          </div>

          {/* AI & Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Features</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/ai-assistant" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" /> Gemini AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/my-events" className="hover:text-indigo-600 transition-colors">Instant Registration</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-indigo-600 transition-colors">Admin Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack / Educational Notes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Architecture</h4>
            <div className="text-xs space-y-1.5 text-slate-500">
              <p>• React.js + Vite + Tailwind</p>
              <p>• Node.js + Express.js API</p>
              <p>• Supabase PostgreSQL & RLS</p>
              <p>• Google Gemini AI SDK</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} EventHub. Built for classroom workshops and technical excellence.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Crafted with clean full-stack architecture <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}

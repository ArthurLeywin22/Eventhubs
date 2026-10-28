import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { CATEGORIES } from '../components/FilterBar';
import {
  Sparkles,
  Calendar,
  Compass,
  CheckCircle2,
  Users,
  Search,
  ArrowRight,
  Zap,
} from 'lucide-react';
import Button from '../components/Button';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    setLoading(true);
    try {
      const response = await getEvents({ sort: 'date_asc' });
      setEvents(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load campus events');
    } finally {
      setLoading(false);
    }
  };

  const featuredEvents = events.slice(0, 3);
  const upcomingEvents = events.slice(3, 7);

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-indigo-50/70 via-white to-transparent">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-200/40 to-violet-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span>Campus Event Experience Reimagined</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">College Events</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-600 leading-relaxed font-normal">
            Find hackathons, workshops, seminars, cultural events and more — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/events">
              <Button size="lg" variant="primary" icon={Compass} className="w-full sm:w-auto shadow-lg shadow-indigo-600/25">
                Explore Events
              </Button>
            </Link>
            <Link to="/ai-assistant">
              <Button size="lg" variant="secondary" icon={Sparkles} className="w-full sm:w-auto border-slate-300">
                Ask AI Assistant
              </Button>
            </Link>
          </div>

          {/* Quick Stats Pill */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-center">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-2xl font-black text-indigo-600">100%</p>
              <p className="text-xs font-medium text-slate-500">Live Campus Grounding</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-2xl font-black text-violet-600">Zero</p>
              <p className="text-xs font-medium text-slate-500">Paperwork & Hassle</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-2xl font-black text-emerald-600">Instant</p>
              <p className="text-xs font-medium text-slate-500">One-Click Registration</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-2xl font-black text-amber-600">Gemini</p>
              <p className="text-xs font-medium text-slate-500">Smart AI Assistant</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4" /> Top Picks
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Events</h2>
          </div>
          <Link
            to="/events"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading featured events..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchFeaturedEvents} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Event Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-100/50 rounded-3xl border border-slate-200/60 p-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Browse by Category</h2>
          <p className="text-sm text-slate-500">Choose your area of interest to filter upcoming events instantly</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.filter(c => c !== 'All').map((cat) => (
            <Link
              key={cat}
              to={`/events?category=${encodeURIComponent(cat)}`}
              className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all text-center group"
            >
              <h4 className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">
                {cat}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">Explore {cat}s</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-violet-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4" /> Save the Date
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Upcoming Events</h2>
            </div>
            <Link
              to="/events"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
            >
              See Full Schedule <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* 5. How EventHub Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold uppercase tracking-wider mb-2">
            Simple 3-Step Process
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">How EventHub Works</h2>
          <p className="text-sm text-slate-500 mt-1">Participating in campus activities has never been smoother</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-black text-lg flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Explore & Search</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Browse categories like Hackathons, Workshops, Seminars, or search by keywords to find events matching your technical or cultural passions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 font-black text-lg flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">One-Click Register</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Log in with your student credentials and reserve your seat instantly before the capacity fills or the deadline passes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-black text-lg flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Attend & Participate</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Manage your upcoming events from your Student Dashboard, connect with peers, gain hands-on skills, and receive certificates.
            </p>
          </div>
        </div>
      </section>

      {/* 6. AI Assistant Section Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-8 sm:p-12 shadow-2xl">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold uppercase tracking-wider border border-white/10">
              <Sparkles className="w-3.5 h-3.5" /> Powered by Google Gemini
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Have questions about campus events? Ask our AI.
            </h2>
            <p className="text-sm sm:text-base text-indigo-200 leading-relaxed">
              Our intelligent assistant is directly grounded in live database schedules. Ask about available seats, dates, venues, or category recommendations in natural language.
            </p>
            <div className="pt-2">
              <Link to="/ai-assistant">
                <Button size="lg" variant="accent" icon={Sparkles} className="shadow-lg">
                  Launch AI Assistant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

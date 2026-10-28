import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEventById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RegistrationButton from '../components/RegistrationButton';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { categoryColors } from '../components/EventCard';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Briefcase,
  AlertCircle,
  ArrowLeft,
  Share2,
  CheckCircle,
} from 'lucide-react';

export default function EventDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id, token]);

  const fetchEventDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getEventById(id, token);
      setEvent(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Loading event details..." size="large" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <ErrorMessage message={error || 'Event not found'} onRetry={fetchEventDetails} />
        <Link
          to="/events"
          className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events Catalog
        </Link>
      </div>
    );
  }

  const defaultImage =
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

  const categoryBadgeClass =
    categoryColors[event.category] || 'bg-slate-50 text-slate-700 border-slate-200';

  const remaining = typeof event.remaining_seats === 'number'
    ? event.remaining_seats
    : Math.max(0, event.max_participants - (event.registration_count || 0));

  const percentFilled = Math.min(
    100,
    Math.round(((event.registration_count || 0) / event.max_participants) * 100)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & quick navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Copied Link!
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" /> Share Event
            </>
          )}
        </button>
      </div>

      {/* Main Banner */}
      <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 w-full shadow-lg border border-slate-200">
        <img
          src={event.image_url || defaultImage}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

        {/* Floating Category and Status */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1 text-xs font-bold rounded-xl border backdrop-blur-md shadow-xs ${categoryBadgeClass}`}>
            {event.category}
          </span>
          {event.is_user_registered && (
            <span className="px-3 py-1 text-xs font-bold rounded-xl bg-emerald-500 text-white backdrop-blur-md shadow-xs flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Registered
            </span>
          )}
        </div>

        {/* Title over banner overlay */}
        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <p className="text-xs font-semibold tracking-wider uppercase text-indigo-300">
            Organized by {event.organizer}
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Logistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Event Date</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{event.event_date}</p>
                <p className="text-xs text-slate-500">{event.start_time} - {event.end_time}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Campus Venue</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{event.venue}</p>
                <p className="text-xs text-slate-500">In-person campus attendance</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Capacity & Seats</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{remaining} seats available</p>
                <p className="text-xs text-slate-500">{event.registration_count || 0} / {event.max_participants} registered</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Registration Deadline</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{event.registration_deadline}</p>
                <p className="text-xs text-slate-500">
                  {event.is_closed ? 'Deadline has closed' : 'Registrations open'}
                </p>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900">About this Event</h2>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>
        </div>

        {/* Right Column: Registration Box / Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-6 sticky top-24">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Registration</h3>
              <p className="text-xs text-slate-500 mt-0.5">Secure your pass for this campus activity.</p>
            </div>

            {/* Capacity Gauge */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600">Seats Reserved</span>
                <span className="text-indigo-600">{percentFilled}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    percentFilled >= 100
                      ? 'bg-rose-500'
                      : percentFilled > 75
                      ? 'bg-amber-500'
                      : 'bg-indigo-600'
                  }`}
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 text-right">
                {event.registration_count || 0} of {event.max_participants} filled
              </p>
            </div>

            {/* Interactive Registration Button */}
            <RegistrationButton
              event={event}
              onRegistrationChange={fetchEventDetails}
            />

            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">
                Need answers? Ask our{' '}
                <Link to="/ai-assistant" className="text-indigo-600 font-semibold underline">
                  AI Assistant
                </Link>{' '}
                about this event.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

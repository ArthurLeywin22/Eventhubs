import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyEvents } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import {
  Calendar,
  BookmarkCheck,
  CheckCircle,
  Compass,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
} from 'lucide-react';
import Button from '../components/Button';

export default function StudentDashboardPage() {
  const { user, profile, token } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyRegistrations();
  }, [token]);

  const fetchMyRegistrations = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const response = await getMyEvents(token);
      setRegistrations(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch registered events.');
    } finally {
      setLoading(false);
    }
  };

  const studentName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  const upcoming = registrations.filter(r => r.status === 'Upcoming');
  const completed = registrations.filter(r => r.status === 'Completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-300">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold mt-1">
            Welcome, {studentName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-2 max-w-xl">
            Track your reserved seats, stay updated on deadlines, and ask the AI assistant questions about upcoming campus events.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link to="/events">
            <Button variant="secondary" size="sm" icon={Compass} className="text-xs">
              Browse Events
            </Button>
          </Link>
          <Link to="/ai-assistant">
            <Button variant="accent" size="sm" icon={Sparkles} className="text-xs shadow-md">
              Ask AI Assistant
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <DashboardCard
          title="Registered Events"
          value={registrations.length}
          subtitle="Total campus registrations"
          icon={BookmarkCheck}
          color="indigo"
        />
        <DashboardCard
          title="Upcoming Events"
          value={upcoming.length}
          subtitle="Events ahead on your calendar"
          icon={Calendar}
          color="purple"
        />
        <DashboardCard
          title="Completed Events"
          value={completed.length}
          subtitle="Past participations"
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* Upcoming Registered Events Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" /> Upcoming Registered Events
          </h2>
          {upcoming.length > 0 && (
            <Link
              to="/my-events"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Manage all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingSpinner text="Loading your registrations..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchMyRegistrations} />
        ) : upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming event registrations"
            description="You haven't signed up for any upcoming events yet. Explore hackathons, workshops, or fests today!"
            actionText="Explore Campus Events"
            actionLink="/events"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.slice(0, 3).map((event) => (
              <div
                key={event.registration_id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {event.category}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      Confirmed
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-2">
                    {event.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.event_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.start_time} - {event.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Registered on {new Date(event.registered_at).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/events/${event.id}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAdminDashboard } from '../../services/api';
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import Button from '../../components/Button';
import {
  Calendar,
  Users,
  CheckCircle,
  PlusCircle,
  Shield,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const fetchDashboard = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const response = await getAdminDashboard(token);
      setData(response);
    } catch (err) {
      setError(err.message || 'Failed to fetch administrator statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Compiling campus analytics..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorMessage message={error || 'Could not load admin metrics'} onRetry={fetchDashboard} />
      </div>
    );
  }

  const { stats, recent_events, recent_registrations } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs uppercase font-extrabold tracking-wider">
            <Shield className="w-4 h-4" /> Campus Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time management for college events, student registration rosters, and capacity limits.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/admin/events/create">
            <Button variant="primary" size="md" icon={PlusCircle}>
              Create Event
            </Button>
          </Link>
          <Link to="/admin/events">
            <Button variant="secondary" size="md" icon={Layers}>
              Manage Events
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stats Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Events"
          value={stats.total_events}
          subtitle="All created events"
          icon={Calendar}
          color="indigo"
        />
        <DashboardCard
          title="Upcoming Events"
          value={stats.upcoming_events}
          subtitle="Currently scheduled"
          icon={Clock}
          color="amber"
        />
        <DashboardCard
          title="Total Registrations"
          value={stats.total_registrations}
          subtitle="Student seats claimed"
          icon={TrendingUp}
          color="emerald"
        />
        <DashboardCard
          title="Enrolled Students"
          value={stats.total_students}
          subtitle="Registered accounts"
          icon={Users}
          color="purple"
        />
      </div>

      {/* 2 Column Feed: Recent Events & Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Events Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-6 pb-3 flex items-center justify-between border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Events</h2>
              <p className="text-xs text-slate-400">Latest created activities</p>
            </div>
            <Link
              to="/admin/events"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recent_events.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No events found.</div>
            ) : (
              recent_events.map((e) => (
                <div key={e.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="max-w-[70%]">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                      {e.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-800 mt-1 truncate">{e.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{e.event_date} • {e.venue}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-600">
                      {e.registration_count} / {e.max_participants}
                    </span>
                    <p className="text-[10px] text-slate-400">Registrations</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <Link to="/admin/events/create" className="text-xs font-semibold text-indigo-600 hover:underline">
              + Add a new event to the campus schedule
            </Link>
          </div>
        </div>

        {/* Recent Student Registrations Feed */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-6 pb-3 flex items-center justify-between border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Live Registrations</h2>
              <p className="text-xs text-slate-400">Latest student signups</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {recent_registrations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No registrations yet.</div>
            ) : (
              recent_registrations.map((reg) => (
                <div key={reg.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{reg.student_name}</h4>
                    <p className="text-xs text-slate-500">{reg.student_email} {reg.department ? `(${reg.department})` : ''}</p>
                    <p className="text-[11px] text-indigo-600 font-medium mt-1">For: {reg.event_title}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(reg.registered_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
            Total of {stats.total_registrations} active seat confirmations recorded in database
          </div>
        </div>
      </div>
    </div>
  );
}

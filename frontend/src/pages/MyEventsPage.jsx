import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyEvents, cancelRegistration } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Button from '../components/Button';
import {
  Calendar,
  Clock,
  MapPin,
  BookmarkCheck,
  XCircle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export default function MyEventsPage() {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Cancellation modal state
  const [selectedEventToCancel, setSelectedEventToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [token]);

  const fetchEvents = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const response = await getMyEvents(token);
      setRegistrations(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load your event registrations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedEventToCancel) return;
    setCancelling(true);
    setError('');
    setActionSuccess('');
    try {
      await cancelRegistration(selectedEventToCancel.id, token);
      setActionSuccess(`Successfully cancelled registration for "${selectedEventToCancel.title}".`);
      setSelectedEventToCancel(null);
      await fetchEvents();
    } catch (err) {
      setError(err.message || 'Failed to cancel registration.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
          <BookmarkCheck className="w-4 h-4" /> Personal Schedule
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          My Registered Events
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your upcoming college events, venues, and registration receipts.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={fetchEvents} />}

      {/* Events List */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner text="Retrieving your registered events..." />
        </div>
      ) : registrations.length === 0 ? (
        <EmptyState
          title="No registered events yet"
          description="You haven't reserved a seat for any campus events yet. Explore upcoming hackathons and workshops to get involved!"
          actionText="Browse Events"
          actionLink="/events"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registrations.map((item) => (
            <div
              key={item.registration_id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header status */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {item.category}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.status === 'Upcoming'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {item.description}
                </p>

                {/* Details list */}
                <div className="space-y-2 text-xs text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-700">{item.event_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{item.start_time} - {item.end_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{item.venue}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                    Registered on: {new Date(item.registered_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link to={`/events/${item.id}`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full text-xs" icon={ExternalLink}>
                    View Details
                  </Button>
                </Link>
                {item.status === 'Upcoming' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50 text-xs"
                    onClick={() => setSelectedEventToCancel(item)}
                  >
                    Cancel Seat
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Modal */}
      <Modal
        isOpen={!!selectedEventToCancel}
        onClose={() => setSelectedEventToCancel(null)}
        title="Cancel Registration"
        confirmText="Confirm Cancellation"
        confirmVariant="danger"
        loading={cancelling}
        onConfirm={handleCancel}
      >
        <p>
          Are you sure you want to cancel your seat for{' '}
          <strong>{selectedEventToCancel?.title}</strong>? This will release your reserved spot back to the public pool.
        </p>
      </Modal>
    </div>
  );
}

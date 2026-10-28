import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEvents, deleteEvent } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import SearchBar from '../../components/SearchBar';
import {
  Calendar,
  PlusCircle,
  Edit,
  Trash2,
  Users,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function AdminEventsPage() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');

  // Delete modal state
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [token]);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getEvents({ sort: 'date_asc' });
      setEvents(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch events.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    setDeleting(true);
    setError('');
    setSuccessMsg('');
    try {
      await deleteEvent(eventToDelete.id, token);
      setSuccessMsg(`Event "${eventToDelete.title}" and any associated registrations have been permanently deleted.`);
      setEventToDelete(null);
      await fetchEvents();
    } catch (err) {
      setError(err.message || 'Failed to delete event.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      e.title.toLowerCase().includes(term) ||
      e.category.toLowerCase().includes(term) ||
      e.venue.toLowerCase().includes(term) ||
      e.organizer.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" /> Operations Management
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Manage Campus Events</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, update, monitor registrations, or delete events.
          </p>
        </div>
        <Link to="/admin/events/create">
          <Button variant="primary" icon={PlusCircle}>
            Create New Event
          </Button>
        </Link>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={fetchEvents} />}

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter table by title, category, venue, or organizer..."
          onClear={() => setSearch('')}
        />
      </div>

      {/* Events Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16">
            <LoadingSpinner text="Loading events table..." />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No events found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Venue</th>
                  <th className="py-3.5 px-4 text-center">Capacity</th>
                  <th className="py-3.5 px-4 text-center">Registrations</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEvents.map((event) => {
                  const regCount = event.registration_count || 0;
                  const percent = Math.round((regCount / event.max_participants) * 100);
                  const isFull = event.is_full;
                  const isClosed = event.is_closed;

                  return (
                    <tr key={event.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Title & Organizer */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="font-bold text-slate-900 truncate">{event.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{event.organizer}</p>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px]">
                          {event.category}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-medium text-slate-800">{event.event_date}</p>
                        <p className="text-[11px] text-slate-400">{event.start_time}</p>
                      </td>

                      {/* Venue */}
                      <td className="py-3.5 px-4 max-w-[150px] truncate">
                        {event.venue}
                      </td>

                      {/* Capacity */}
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {event.max_participants}
                      </td>

                      {/* Registrations */}
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          to={`/admin/events/${event.id}/registrations`}
                          className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-colors"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{regCount} ({percent}%)</span>
                        </Link>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isClosed ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600">
                            Closed
                          </span>
                        ) : isFull ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-700">
                            Full
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-700">
                            Open
                          </span>
                        )}
                      </td>

                      {/* Action Menu */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/events/${event.id}`}
                            title="View public details"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/events/${event.id}/registrations`}
                            title="View registered students"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Users className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/events/${event.id}/edit`}
                            title="Edit event"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setEventToDelete(event)}
                            title="Delete event"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal (Requirement 16) */}
      <Modal
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        title="Delete Event"
        confirmText="Yes, Delete Event"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={handleDelete}
      >
        <p className="leading-relaxed">
          Are you sure you want to delete <strong>{eventToDelete?.title}</strong>?
        </p>
        <p className="mt-2 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
          ⚠️ <strong>Safe Handling:</strong> All associated student registration records for this event will also be removed to prevent orphaned data. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

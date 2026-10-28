import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEventById, updateEvent } from '../../services/api';
import EventForm from '../../components/EventForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { Edit, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AdminEditEventPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id, token]);

  const fetchEvent = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getEventById(id, token);
      setEvent(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load event for editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedData) => {
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await updateEvent(id, updatedData, token);
      setSuccessMsg('Event updated successfully!');
      setTimeout(() => {
        navigate('/admin/events');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update event. Please check required fields.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Loading event details..." />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorMessage message={error} onRetry={fetchEvent} />
        <Link
          to="/admin/events"
          className="inline-flex items-center gap-2 mt-4 text-xs font-semibold text-indigo-600"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Manage Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Manage Events
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900">Edit Event</h1>
        <p className="text-sm text-slate-500 mt-1">
          Modify logistics, schedule, capacity limits, or deadlines for "{event?.title}".
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg} Redirecting to event list...</span>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {/* Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8">
        <EventForm
          initialData={event}
          onSubmit={handleUpdate}
          loading={saving}
          submitText="Save Changes"
        />
      </div>
    </div>
  );
}

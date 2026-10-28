import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createEvent } from '../../services/api';
import EventForm from '../../components/EventForm';
import ErrorMessage from '../../components/ErrorMessage';
import { PlusCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AdminCreateEventPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreate = async (eventData) => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await createEvent(eventData, token);
      setSuccessMsg('Event published successfully!');
      setTimeout(() => {
        navigate('/admin/events');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create event. Please verify all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Manage Events
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900">Create Campus Event</h1>
          <p className="text-sm text-slate-500 mt-1">
            Fill in the schedule, capacity, and logistics to publish a new college event.
          </p>
        </div>
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
          onSubmit={handleCreate}
          loading={loading}
          submitText="Publish Event"
        />
      </div>
    </div>
  );
}

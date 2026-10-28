import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerForEvent, cancelRegistration } from '../services/api';
import Button from './Button';
import Modal from './Modal';
import { CheckCircle2, UserCheck, XCircle, LogIn, Lock } from 'lucide-react';

export default function RegistrationButton({
  event,
  onRegistrationChange,
}) {
  const { user, token, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  if (!event) return null;

  const isRegistered = event.is_user_registered;
  const isFull = event.is_full;
  const isClosed = event.is_closed;

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await registerForEvent(event.id, token);
      setSuccessMsg(res.message || 'Registration successful!');
      if (onRegistrationChange) onRegistrationChange();
    } catch (err) {
      setError(err.message || 'Failed to register for this event.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    setLoading(true);
    setError('');
    try {
      await cancelRegistration(event.id, token);
      setCancelModalOpen(false);
      setSuccessMsg('Registration cancelled successfully.');
      if (onRegistrationChange) onRegistrationChange();
    } catch (err) {
      setError(err.message || 'Failed to cancel registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Messages */}
      {error && (
        <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Button State Logic */}
      {!user ? (
        <div className="space-y-2">
          <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2 font-medium">
            <Lock className="w-4 h-4 flex-shrink-0" /> Please log in to register for this event.
          </p>
          <Button
            variant="primary"
            className="w-full"
            icon={LogIn}
            onClick={() => navigate('/login')}
          >
            Sign In to Register
          </Button>
        </div>
      ) : isAdmin ? (
        <div className="p-3 rounded-xl bg-slate-100 text-slate-700 text-xs text-center font-medium">
          Logged in as Campus Administrator
        </div>
      ) : isRegistered ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span>You are Registered for this Event</span>
          </div>
          <Button
            variant="secondary"
            className="w-full text-rose-600 hover:bg-rose-50 border-rose-200 text-xs"
            onClick={() => setCancelModalOpen(true)}
            disabled={loading}
          >
            Cancel Registration
          </Button>
        </div>
      ) : isClosed ? (
        <Button variant="secondary" disabled className="w-full bg-slate-100 text-slate-400 border-slate-200">
          Registration Closed
        </Button>
      ) : isFull ? (
        <Button variant="secondary" disabled className="w-full bg-rose-50 text-rose-400 border-rose-200">
          Event Full
        </Button>
      ) : (
        <Button
          variant="primary"
          size="lg"
          className="w-full shadow-lg shadow-indigo-500/20"
          loading={loading}
          onClick={handleRegister}
        >
          Register Now
        </Button>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Event Registration?"
        confirmText="Yes, Cancel Registration"
        confirmVariant="danger"
        loading={loading}
        onConfirm={handleCancelRegistration}
      >
        <p>
          Are you sure you want to cancel your seat for <strong>{event.title}</strong>? Your spot will be made immediately available to other students.
        </p>
      </Modal>
    </div>
  );
}

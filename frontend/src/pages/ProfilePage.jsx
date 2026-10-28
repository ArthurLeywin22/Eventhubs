import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/api';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  User,
  Mail,
  School,
  BookOpen,
  GraduationCap,
  Shield,
  CheckCircle2,
  Save,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, token, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    college: '',
    department: '',
    year: '',
    role: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const yearOptions = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Postgraduate / Masters',
    'Faculty / Staff',
  ];

  useEffect(() => {
    loadProfile();
  }, [token]);

  const loadProfile = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const response = await getProfile(token);
      if (response && response.data) {
        setFormData({
          full_name: response.data.full_name || '',
          email: response.data.email || user?.email || '',
          college: response.data.college || '',
          department: response.data.department || '',
          year: response.data.year || '3rd Year',
          role: response.data.role || 'student',
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      setError('Full name is required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      await updateProfile(
        {
          full_name: formData.full_name,
          college: formData.college,
          department: formData.department,
          year: formData.year,
        },
        token
      );
      setSuccessMsg('Your profile has been successfully updated.');
      await refreshProfile();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
          <User className="w-4 h-4" /> Account Settings
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Student Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal information, department affiliation, and campus details.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={loadProfile} />}

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar & Role Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {(formData.full_name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{formData.full_name || 'Student'}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500">{formData.email}</span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  formData.role === 'admin'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                }`}>
                  <Shield className="w-3 h-3" /> {formData.role}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <Input
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                icon={User}
                required
              />
            </div>

            {/* Email (Readonly) */}
            <div className="sm:col-span-2">
              <Input
                label="Campus Email (Managed via Supabase Auth)"
                name="email"
                type="email"
                value={formData.email}
                disabled
                icon={Mail}
                helperText="Email address is linked to your institutional login"
              />
            </div>

            {/* College */}
            <Input
              label="College / Institute"
              name="college"
              value={formData.college}
              onChange={handleChange}
              icon={School}
            />

            {/* Department */}
            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              icon={BookOpen}
            />

            {/* Academic Year */}
            <Select
              label="Academic Year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              options={yearOptions}
            />

            {/* Role Badge & Security Note */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Role (Protected)
              </label>
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600">
                <span className="font-semibold capitalize text-slate-800">{formData.role}</span>
                <span className="text-[10px] text-slate-400">Restricted by Supabase RLS</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={saving}
              icon={Save}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

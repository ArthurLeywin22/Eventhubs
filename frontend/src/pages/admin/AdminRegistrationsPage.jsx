import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAdminEventRegistrations } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import SearchBar from '../../components/SearchBar';
import Button from '../../components/Button';
import {
  Users,
  ArrowLeft,
  Download,
  Mail,
  School,
  Calendar,
  GraduationCap,
} from 'lucide-react';

export default function AdminRegistrationsPage() {
  const { id } = useParams();
  const { token } = useAuth();

  const [event, setEvent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, [id, token]);

  const fetchRegistrations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminEventRegistrations(id, token);
      setEvent(response.event);
      setStudents(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load event registrations.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      s.full_name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.department.toLowerCase().includes(term) ||
      s.college.toLowerCase().includes(term)
    );
  });

  const exportToCSV = () => {
    if (students.length === 0) return;
    const headers = ['Student Name', 'Email', 'Department', 'Year', 'College', 'Registration Date'];
    const rows = students.map(s => [
      `"${s.full_name}"`,
      `"${s.email}"`,
      `"${s.department}"`,
      `"${s.year}"`,
      `"${s.college}"`,
      `"${new Date(s.registered_at).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Registrations_${event?.title || 'event'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Retrieving registered student roster..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorMessage message={error} onRetry={fetchRegistrations} />
        <Link to="/admin/events" className="inline-flex items-center gap-1.5 text-xs text-indigo-600 mt-4">
          <ArrowLeft className="w-4 h-4" /> Back to Manage Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Events Management
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900">Event Registrations</h1>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
              {students.length} / {event?.max_participants} Seats Claimed
            </span>
          </div>
          <p className="text-sm font-semibold text-indigo-600 mt-0.5">
            {event?.title}
          </p>
        </div>

        {students.length > 0 && (
          <Button variant="secondary" size="md" icon={Download} onClick={exportToCSV}>
            Export Roster (CSV)
          </Button>
        )}
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter students by name, email, department, or year..."
          onClear={() => setSearch('')}
        />
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            {students.length === 0
              ? 'No students have registered for this event yet.'
              : 'No students match your filter query.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Year</th>
                  <th className="py-3.5 px-4">College</th>
                  <th className="py-3.5 px-4 text-right">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((s, idx) => (
                  <tr key={s.registration_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {s.full_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {s.department || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {s.year || '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-[150px] truncate">
                      {s.college || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 whitespace-nowrap">
                      {new Date(s.registered_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

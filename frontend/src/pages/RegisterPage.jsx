import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { Mail, Lock, User, School, BookOpen, GraduationCap, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    college: 'Campus Institute of Technology',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    role: 'student', // default role
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const yearOptions = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Postgraduate / Masters',
    'Faculty / Staff',
  ];

  const roleOptions = [
    { value: 'student', label: 'Student (Attend & Register for Events)' },
    { value: 'admin', label: 'Admin (Manage & Create Campus Events)' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signUp(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Join EventHub
          </h1>
          <p className="text-xs text-slate-500">
            Create your campus profile to register for workshops, hackathons, and fests
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
          {error && <ErrorMessage message={error} />}

          {success ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center space-y-2">
              <h3 className="font-bold text-lg">Account Created Successfully!</h3>
              <p className="text-xs text-emerald-700">
                Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Alex Mercer"
                icon={User}
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="alex.mercer@college.edu"
                icon={Mail}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                icon={Lock}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="College / Institute"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="Campus Institute of Tech"
                  icon={School}
                />

                <Input
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Computer Science"
                  icon={BookOpen}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Academic Year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  options={yearOptions}
                />

                <Select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  options={roleOptions}
                  helperText="Choose Admin for workshop management demo"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-4"
                size="lg"
                loading={loading}
                icon={UserPlus}
              >
                Create Account
              </Button>
            </form>
          )}

          <div className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800 underline">
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

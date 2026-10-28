import React, { useState } from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import { CATEGORIES } from './FilterBar';
import { Calendar, Clock, MapPin, Users, Image as ImageIcon, Briefcase, FileText } from 'lucide-react';

export default function EventForm({
  initialData = {},
  onSubmit,
  loading = false,
  submitText = 'Save Event',
}) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || 'Workshop',
    event_date: initialData.event_date || '',
    start_time: initialData.start_time || '10:00:00',
    end_time: initialData.end_time || '17:00:00',
    venue: initialData.venue || '',
    organizer: initialData.organizer || '',
    image_url: initialData.image_url || '',
    max_participants: initialData.max_participants || 100,
    registration_deadline: initialData.registration_deadline || '',
  });

  const [errors, setErrors] = useState({});

  const categoryOptions = CATEGORIES.filter(c => c !== 'All').map(c => ({ value: c, label: c }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-level error on edit
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long.';
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long.';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required.';
    }

    if (!formData.event_date) {
      newErrors.event_date = 'Event date is required.';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required.';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'End time is required.';
    }

    if (!formData.venue.trim() || formData.venue.trim().length < 2) {
      newErrors.venue = 'Venue must be at least 2 characters long.';
    }

    if (!formData.organizer.trim() || formData.organizer.trim().length < 2) {
      newErrors.organizer = 'Organizer is required.';
    }

    const capacity = parseInt(formData.max_participants, 10);
    if (isNaN(capacity) || capacity <= 0) {
      newErrors.max_participants = 'Max participants must be greater than 0.';
    }

    if (!formData.registration_deadline) {
      newErrors.registration_deadline = 'Registration deadline is required.';
    } else if (formData.event_date && formData.registration_deadline > formData.event_date) {
      newErrors.registration_deadline = 'Registration deadline must not be after the event date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      max_participants: parseInt(formData.max_participants, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && <ErrorMessage message={errors.form} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <Input
            label="Event Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. HackSphere 2026: 24-Hour National Hackathon"
            error={errors.title}
            required
          />
        </div>

        {/* Category & Organizer */}
        <Select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={categoryOptions}
          error={errors.category}
          required
        />

        <Input
          label="Organizer / Club / Department"
          name="organizer"
          value={formData.organizer}
          onChange={handleChange}
          placeholder="e.g. IEEE Student Branch / CodeCraft Club"
          icon={Briefcase}
          error={errors.organizer}
          required
        />

        {/* Event Date & Venue */}
        <Input
          label="Event Date"
          name="event_date"
          type="date"
          value={formData.event_date}
          onChange={handleChange}
          icon={Calendar}
          error={errors.event_date}
          required
        />

        <Input
          label="Venue / Location"
          name="venue"
          value={formData.venue}
          onChange={handleChange}
          placeholder="e.g. Main Auditorium & Innovation Lab"
          icon={MapPin}
          error={errors.venue}
          required
        />

        {/* Start Time & End Time */}
        <Input
          label="Start Time"
          name="start_time"
          type="time"
          step="1"
          value={formData.start_time}
          onChange={handleChange}
          icon={Clock}
          error={errors.start_time}
          required
        />

        <Input
          label="End Time"
          name="end_time"
          type="time"
          step="1"
          value={formData.end_time}
          onChange={handleChange}
          icon={Clock}
          error={errors.end_time}
          required
        />

        {/* Max Capacity & Registration Deadline */}
        <Input
          label="Max Participants (Capacity)"
          name="max_participants"
          type="number"
          min="1"
          value={formData.max_participants}
          onChange={handleChange}
          icon={Users}
          error={errors.max_participants}
          helperText="Total available seats for this event"
          required
        />

        <Input
          label="Registration Deadline"
          name="registration_deadline"
          type="date"
          value={formData.registration_deadline}
          onChange={handleChange}
          icon={Calendar}
          error={errors.registration_deadline}
          helperText="Must be on or before the event date"
          required
        />

        {/* Image URL */}
        <div className="md:col-span-2">
          <Input
            label="Banner Image URL"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/photo-..."
            icon={ImageIcon}
            error={errors.image_url}
            helperText="Leave empty to use a curated campus default banner"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Full Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the agenda, who can attend, what to bring, prizes, and schedule details..."
            required
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-slate-900 text-sm transition-all shadow-2xs focus:outline-none focus:ring-2 ${
              errors.description
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.description}</p>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
        <Button type="submit" variant="primary" loading={loading} size="lg">
          {submitText}
        </Button>
      </div>
    </form>
  );
}

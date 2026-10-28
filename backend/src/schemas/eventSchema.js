import { z } from 'zod';

const baseEventSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters long'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters long'),
  category: z.string().trim().min(2, 'Category is required'),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Event date must be in YYYY-MM-DD format'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  venue: z.string().trim().min(2, 'Venue must be at least 2 characters long'),
  organizer: z.string().trim().min(2, 'Organizer must be at least 2 characters long'),
  image_url: z.string().url('Image URL must be a valid URL').optional().or(z.literal('')),
  max_participants: z.coerce.number().int('Capacity must be an integer').positive('Capacity must be greater than 0'),
  registration_deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Registration deadline must be in YYYY-MM-DD format'),
});

export const eventSchema = baseEventSchema.refine((data) => {
  const eventDate = new Date(data.event_date);
  const deadline = new Date(data.registration_deadline);
  return deadline <= eventDate;
}, {
  message: 'Registration deadline cannot be after the event date',
  path: ['registration_deadline'],
});

export const eventUpdateSchema = baseEventSchema.partial().refine((data) => {
  if (data.event_date && data.registration_deadline) {
    return new Date(data.registration_deadline) <= new Date(data.event_date);
  }
  return true;
}, {
  message: 'Registration deadline cannot be after the event date',
  path: ['registration_deadline'],
});

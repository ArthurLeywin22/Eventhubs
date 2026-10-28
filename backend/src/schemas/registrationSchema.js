import { z } from 'zod';

export const eventIdParamSchema = z.object({
  id: z.string().uuid('Invalid event ID format'),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  college: z.string().trim().optional(),
  department: z.string().trim().optional(),
  year: z.string().trim().optional(),
});

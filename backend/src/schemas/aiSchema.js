import { z } from 'zod';

export const aiAssistantSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(1000, 'Message cannot exceed 1000 characters'),
  history: z.array(z.object({
    sender: z.enum(['user', 'assistant']),
    text: z.string(),
  })).optional().default([]),
});

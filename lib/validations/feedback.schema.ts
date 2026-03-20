// lib/validations/feedback.schema.ts
import { z } from 'zod';

const ratingField = z.number().int().min(1).max(5, 'Rating must be between 1 and 5');

export const feedbackTwoRatingSchema = z.object({
  request_id: z.string().uuid('Invalid request ID'),
  service_satisfaction: ratingField,
  overall_rating: ratingField,
  comments: z.string().max(1000).optional(),
  is_anonymous: z.boolean().default(false),
});

export const feedbackSchema = feedbackTwoRatingSchema; 

export type FeedbackInput = z.infer<typeof feedbackSchema>;
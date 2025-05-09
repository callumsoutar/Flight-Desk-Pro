import { z } from 'zod';

export const bookingCheckInSchema = z.object({
  hobbs_end: z
    .number({ required_error: 'End Hobbs is required' })
    .min(0, 'End Hobbs must be at least 0'),
  tach_end: z
    .number({ required_error: 'End Tacho is required' })
    .min(0, 'End Tacho must be at least 0'),
  hobbs_start: z.number().min(0),
  tach_start: z.number().min(0),
}).refine(
  (data) => data.hobbs_end >= data.hobbs_start && data.tach_end >= data.tach_start,
  {
    message: 'End values must be greater than or equal to start values.',
    path: ['hobbs_end', 'tach_end'],
  }
);

export type BookingCheckInForm = z.infer<typeof bookingCheckInSchema>; 
import { z } from 'zod';

export const idSchema = z.string().min(1);

export const point3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

export type Point3DInput = z.infer<typeof point3DSchema>;

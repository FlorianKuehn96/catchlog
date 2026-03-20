import { z } from 'zod';

// UUID regex pattern
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Helper für optionale Nummern (String oder Number)
const optionalNumber = z.union([
  z.number().positive(),
  z.string().refine((val) => val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
    message: 'Muss eine positive Zahl sein',
  }),
  z.literal(''),
  z.undefined(),
]).transform((val) => {
  if (val === '' || val === undefined) return undefined;
  if (typeof val === 'string') return parseFloat(val);
  return val;
});

// Catch Schema für POST/PUT
export const catchSchema = z.object({
  id: z.string().regex(uuidPattern).optional(), // Für PUT
  spotId: z.string().min(1, 'Gewässer ist erforderlich'), // Erlaubt UUIDs und temporäre IDs
  species: z.string().min(1, 'Fischart ist erforderlich').max(100),
  length: optionalNumber,
  weight: optionalNumber,
  bait: z.string().min(1, 'Köder ist erforderlich').max(100),
  technique: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  timestamp: z.string().datetime().optional(),
  catchLat: z.number().min(-90).max(90).optional(),
  catchLng: z.number().min(-180).max(180).optional(),
  imageUrl: z.string().optional().or(z.literal('')), // Erlaubt URLs und Base64 data URLs
});

export type CatchInput = z.infer<typeof catchSchema>;

// Spot Schema
export const spotSchema = z.object({
  id: z.string().regex(uuidPattern).optional(),
  name: z.string().min(1, 'Name ist erforderlich').max(100),
  type: z.enum(['lake', 'river', 'pond', 'canal', 'coast', 'other']),
  lat: z.number().min(-90).max(90, 'Ungültiger Breitengrad'),
  lng: z.number().min(-180).max(180, 'Ungültiger Längengrad'),
});

export type SpotInput = z.infer<typeof spotSchema>;

// Query params schema für GET
export const catchQuerySchema = z.object({
  spotId: z.string().regex(uuidPattern).optional(),
  species: z.string().optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
});

/**
 * Unit Tests for Validation Logic
 * Tests the core business logic without Next.js dependencies
 */

import { catchSchema, spotSchema } from '@/lib/validation'

describe('catchSchema Validation', () => {
  it('accepts valid catch data', () => {
    const validCatch = {
      spotId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Valid UUID format
      species: 'Hecht',
      length: 80,
      weight: 4.2,
      bait: 'Wobbler',
      technique: 'Spinnfischen',
      notes: 'Guter Fang',
      timestamp: '2024-03-19T14:30:00Z',
    }

    const result = catchSchema.safeParse(validCatch)
    expect(result.success).toBe(true)
  })

  it('rejects empty species', () => {
    const invalidCatch = {
      spotId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      species: '',
      length: 80,
      weight: 4.2,
      bait: 'Wobbler',
    }

    const result = catchSchema.safeParse(invalidCatch)
    expect(result.success).toBe(false)
  })

  it('rejects empty bait', () => {
    const invalidCatch = {
      spotId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      species: 'Hecht',
      length: 80,
      weight: 4.2,
      bait: '',
    }

    const result = catchSchema.safeParse(invalidCatch)
    expect(result.success).toBe(false)
  })

  it('rejects invalid spotId format', () => {
    const invalidCatch = {
      spotId: 'invalid-uuid',
      species: 'Hecht',
      length: 80,
      weight: 4.2,
      bait: 'Wobbler',
    }

    const result = catchSchema.safeParse(invalidCatch)
    expect(result.success).toBe(false)
  })

  it('accepts minimal valid catch', () => {
    const minimalCatch = {
      spotId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      species: 'Zander',
      bait: 'Gummifisch',
    }

    const result = catchSchema.safeParse(minimalCatch)
    expect(result.success).toBe(true)
  })

  it('accepts catch with empty optional fields', () => {
    const catchWithEmptyFields = {
      spotId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      species: 'Barsch',
      bait: 'Spinner',
      length: '',
      weight: '',
    }

    const result = catchSchema.safeParse(catchWithEmptyFields)
    expect(result.success).toBe(true)
  })
})

describe('spotSchema Validation', () => {
  it('accepts valid spot data', () => {
    const validSpot = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Müggelsee',
      lat: 52.4,
      lng: 13.6,
      type: 'lake' as const,
    }

    const result = spotSchema.safeParse(validSpot)
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const invalidSpot = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: '',
      lat: 52.4,
      lng: 13.6,
      type: 'lake' as const,
    }

    const result = spotSchema.safeParse(invalidSpot)
    expect(result.success).toBe(false)
  })

  it('rejects invalid latitude (out of range)', () => {
    const invalidSpot = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Test',
      lat: 100, // Invalid: > 90
      lng: 13.6,
      type: 'lake' as const,
    }

    const result = spotSchema.safeParse(invalidSpot)
    expect(result.success).toBe(false)
  })

  it('rejects invalid longitude (out of range)', () => {
    const invalidSpot = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Test',
      lat: 52.4,
      lng: 200, // Invalid: > 180
      type: 'lake' as const,
    }

    const result = spotSchema.safeParse(invalidSpot)
    expect(result.success).toBe(false)
  })

  it('rejects invalid spot type', () => {
    const invalidSpot = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Test',
      lat: 52.4,
      lng: 13.6,
      type: 'invalid-type',
    }

    const result = spotSchema.safeParse(invalidSpot)
    expect(result.success).toBe(false)
  })

  it('accepts all valid spot types', () => {
    const types = ['lake', 'river', 'pond', 'canal', 'coast', 'other'] as const
    
    types.forEach(type => {
      const spot = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Test Spot',
        lat: 52.4,
        lng: 13.6,
        type,
      }
      const result = spotSchema.safeParse(spot)
      expect(result.success).toBe(true)
    })
  })
})

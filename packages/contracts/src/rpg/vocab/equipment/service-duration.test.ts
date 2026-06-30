import { describe, expect, it } from 'vitest'

import {
  formatServiceDuration,
  serviceDurationSchema,
  SERVICE_DURATION_UNITS,
} from './service-duration'

describe('serviceDurationSchema', () => {
  it('accepts day and mile units', () => {
    expect(serviceDurationSchema.parse({ value: 1, unit: 'day' })).toEqual({
      value: 1,
      unit: 'day',
    })
    expect(serviceDurationSchema.parse({ value: 3, unit: 'mile' })).toEqual({
      value: 3,
      unit: 'mile',
    })
  })

  it('rejects unknown units', () => {
    expect(serviceDurationSchema.safeParse({ value: 1, unit: 'hour' }).success).toBe(false)
  })
})

describe('formatServiceDuration', () => {
  it('formats singular cadence', () => {
    expect(formatServiceDuration({ value: 1, unit: 'day' })).toBe('per day')
    expect(formatServiceDuration({ value: 1, unit: 'mile' })).toBe('per mile')
  })

  it('formats plural counts', () => {
    expect(formatServiceDuration({ value: 2, unit: 'day' })).toBe('2 per day')
  })
})

describe('SERVICE_DURATION_UNITS', () => {
  it('lists day and mile', () => {
    expect(SERVICE_DURATION_UNITS).toEqual(['day', 'mile'])
  })
})

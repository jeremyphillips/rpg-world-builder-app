import { describe, expect, it } from 'vitest'

import {
  formatHolySymbolUsage,
  getHolySymbolUsageLabel,
  holySymbolUsageSchema,
} from './holy-symbol-usage'

describe('holySymbolUsageSchema', () => {
  it('accepts the four SRD usage modes', () => {
    expect(holySymbolUsageSchema.parse('worn')).toBe('worn')
    expect(holySymbolUsageSchema.parse('borne_on_shield')).toBe('borne_on_shield')
  })

  it('rejects unknown values', () => {
    expect(holySymbolUsageSchema.safeParse('carried').success).toBe(false)
  })
})

describe('getHolySymbolUsageLabel', () => {
  it('returns display labels', () => {
    expect(getHolySymbolUsageLabel('borne_on_fabric')).toBe('Borne on fabric')
  })
})

describe('formatHolySymbolUsage', () => {
  it('formats multiple usages', () => {
    expect(formatHolySymbolUsage(['borne_on_fabric', 'borne_on_shield'])).toBe(
      'Borne on fabric, Borne on shield',
    )
  })
})

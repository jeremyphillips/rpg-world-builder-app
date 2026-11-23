import { describe, expect, it } from 'vitest'

import { resolveAcquisitionAvailability } from './resolve-acquisition-availability'

describe('resolveAcquisitionAvailability', () => {
  it('prefers occurrence over prerequisite and readiness', () => {
    expect(
      resolveAcquisitionAvailability({
        occurrence: { message: 'Only one Spellcasting profile is allowed.' },
        prerequisite: { message: 'Missing alternate forms.' },
        readiness: { message: 'Catalog is not ready.' },
      }),
    ).toEqual({
      status: 'unavailable',
      code: 'occurrence',
      message: 'Only one Spellcasting profile is allowed.',
    })
  })

  it('prefers prerequisite over readiness', () => {
    expect(
      resolveAcquisitionAvailability({
        prerequisite: { message: 'Not equipped' },
        readiness: { message: 'Equipment catalog is not ready' },
      }),
    ).toEqual({
      status: 'unavailable',
      code: 'prerequisite',
      message: 'Not equipped',
    })
  })

  it('returns available when no facts are set', () => {
    expect(resolveAcquisitionAvailability({})).toEqual({ status: 'available' })
  })
})

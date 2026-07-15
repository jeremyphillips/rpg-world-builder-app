import { describe, expect, it, vi } from 'vitest'

import { createOutcomeApplicationAppendValue } from './resolution-outcome-form-fields'
import {
  appendOutcomeApplication,
  readOutcomeApplications,
} from './resolution-outcome-applications.lib'
import type { ResolutionFormValues } from './resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'

const baseResolution: ResolutionFormValues = {
  targetCount: 1,
  targetKind: 'creature-or-object',
  proximityKind: 'distance',
  proximityDistanceFt: 120,
  methodKind: 'attack',
  attackType: 'ranged-spell',
  applicationPatternKind: 'none',
  effects: [
    {
      id: 'damage',
      kind: 'damage',
      roll: { dice: { count: 1, faces: 10 } },
      damageType: 'force',
    },
    {
      id: 'bonus-force',
      kind: 'damage',
      roll: { dice: { count: 1, faces: 4 } },
      damageType: 'force',
    },
  ],
  outcomes: [
    {
      result: 'hit',
      applications: [createOutcomeApplicationAppendValue('damage')],
    },
    { result: 'miss', applications: [] },
  ],
}

describe('resolution outcome application helpers', () => {
  it('reads empty applications as an empty array', () => {
    expect(readOutcomeApplications(undefined)).toEqual([])
  })

  it('appends a complete application to one outcome branch', () => {
    const setValue = vi.fn()
    const getValues = vi.fn(() => baseResolution)

    appendOutcomeApplication(getValues, setValue, 1, 'bonus-force')

    expect(setValue).toHaveBeenCalledWith(
      `${RESOLUTION_FIELD_NAME}.outcomes`,
      [
        baseResolution.outcomes![0],
        {
          result: 'miss',
          applications: [createOutcomeApplicationAppendValue('bonus-force')],
        },
      ],
      { shouldDirty: true, shouldValidate: false },
    )
  })
})

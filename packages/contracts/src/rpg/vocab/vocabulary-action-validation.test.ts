import { describe, expect, it } from 'vitest'

import {
  mapSingleVocabularyDisableAvailabilityToValidationResult,
  mapVocabularyDisableAvailabilityBatchToValidationResult,
  mapVocabularyDisableAvailabilityToActionTarget,
} from './vocabulary-action-validation'

describe('vocabulary action validation adapters', () => {
  it('maps disable availability to shared action target results', () => {
    expect(
      mapVocabularyDisableAvailabilityToActionTarget(
        { targetId: 'entry_1', targetName: 'Blinded' },
        { status: 'allowed' },
      ).status,
    ).toBe('eligible')

    expect(
      mapVocabularyDisableAvailabilityToActionTarget(
        { targetId: 'entry_1', targetName: 'Blinded' },
        {
          status: 'blocked',
          blockers: [{ kind: 'rule', code: 'in-use', message: 'In use.' }],
        },
      ).status,
    ).toBe('blocked')
  })

  it('normalizes single disable availability to one-target validation results', () => {
    const result = mapSingleVocabularyDisableAvailabilityToValidationResult(
      { targetId: 'entry_1', targetName: 'Blinded' },
      { status: 'allowed' },
    )

    expect(result.targets).toHaveLength(1)
  })

  it('maps batch disable availability entries to validation results', () => {
    const result = mapVocabularyDisableAvailabilityBatchToValidationResult([
      {
        target: { targetId: 'a', targetName: 'Alpha' },
        availability: { status: 'allowed' },
      },
      {
        target: { targetId: 'b', targetName: 'Beta' },
        availability: {
          status: 'blocked',
          blockers: [{ kind: 'rule', code: 'in-use', message: 'In use.' }],
        },
      },
    ])

    expect(result.targets.map((target) => target.status)).toEqual(['eligible', 'blocked'])
  })
})

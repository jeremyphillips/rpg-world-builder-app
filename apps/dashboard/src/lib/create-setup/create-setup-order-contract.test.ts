import { describe, expect, it } from 'vitest'

import {
  resolveCreateSetupActiveSetId,
  resolveCreateSetupVisibleSetIds,
} from './create-setup-sequence.lib'
import type { CreateSetupSequenceItem } from './create-setup.types'

function sequence(
  items: Array<{
    id: string
    isComplete: boolean
    required?: boolean
    visibleWhenComplete?: readonly string[]
    summaryGroup?: string
  }>,
): CreateSetupSequenceItem[] {
  return items
}

describe('create-setup array order contract', () => {
  it('uses array order for presentation while summary groups stay declaration-based', () => {
    const sets = sequence([
      { id: 'form', isComplete: true, required: false, summaryGroup: 'identity' },
      { id: 'inserted', isComplete: false },
      {
        id: 'facility',
        isComplete: false,
        visibleWhenComplete: ['form'],
        summaryGroup: 'identity',
      },
    ])

    expect(resolveCreateSetupActiveSetId({ sets })).toBe('inserted')
    expect(
      resolveCreateSetupVisibleSetIds({
        sets,
        activeSetId: 'inserted',
      }),
    ).toEqual(['form', 'inserted'])

    const setsAfterInserted = sequence([
      { id: 'form', isComplete: true, required: false, summaryGroup: 'identity' },
      { id: 'inserted', isComplete: true },
      {
        id: 'facility',
        isComplete: false,
        visibleWhenComplete: ['form'],
        summaryGroup: 'identity',
      },
    ])

    expect(resolveCreateSetupActiveSetId({ sets: setsAfterInserted })).toBe('facility')
    expect(
      resolveCreateSetupVisibleSetIds({
        sets: setsAfterInserted,
        activeSetId: 'facility',
      }),
    ).toEqual(['form', 'inserted', 'facility'])
  })
})

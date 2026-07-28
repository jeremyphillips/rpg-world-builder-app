import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../character-builder-fixtures'
import {
  mergeValidationVisibleStepIds,
  pruneValidationVisibleStepIds,
  removeValidationVisibleStepId,
} from './builder-validation-visible-steps.lib'

const context = createPopulatedStandaloneBuilderContextFixture()

describe('builder-validation-visible-steps', () => {
  it('merges and removes validation-visible step ids', () => {
    expect(mergeValidationVisibleStepIds(['identity'], ['species', 'identity'])).toEqual([
      'identity',
      'species',
    ])
    expect(removeValidationVisibleStepId(['identity', 'species'], 'identity')).toEqual(['species'])
  })

  it('prunes steps whose submit validation now passes', () => {
    const incompleteDraft = createEmptyCharacterBuilderDraft()
    expect(pruneValidationVisibleStepIds(incompleteDraft, context, ['abilities'], null)).toEqual([
      'abilities',
    ])

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Verna', alignment: 'ng' as const },
    }

    expect(pruneValidationVisibleStepIds(draft, context, ['identity', 'abilities'], null)).toEqual([
      'abilities',
    ])
  })
})

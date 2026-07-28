import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../draft'
import type { ChoiceSet } from '../choice-set'
import { resolveUnresolvedChoiceSetSummaries } from './resolve-unresolved-choice-set-summaries'

const skillChoiceSet = {
  id: 'class:srd-cc-5.2.1:fighter:class-skills',
  sourceType: 'class',
  sourceId: 'srd-cc-5.2.1:fighter',
  choiceType: 'skillProficiency',
  label: 'Choose Skills',
  min: 2,
  max: 2,
  options: [{ id: 'srd-cc-5.2.1:athletics', label: 'Athletics' }],
  required: true,
} as const satisfies ChoiceSet

const optionalChoiceSet = {
  ...skillChoiceSet,
  id: 'class:srd-cc-5.2.1:fighter:optional-tools',
  label: 'Optional Tools',
  min: 0,
  max: 1,
  required: false,
} as const satisfies ChoiceSet

describe('resolveUnresolvedChoiceSetSummaries', () => {
  it('returns summaries for unsatisfied required choice sets', () => {
    const draft = createEmptyCharacterBuilderDraft()

    const summaries = resolveUnresolvedChoiceSetSummaries(draft, [skillChoiceSet])

    expect(summaries).toEqual([
      {
        choiceSetId: skillChoiceSet.id,
        label: 'Choose Skills',
        stepId: 'proficiencies',
        stepLabel: 'Proficiencies',
        min: 2,
        max: 2,
        selectedCount: 0,
        message: 'Choose at least 2 options for Choose Skills.',
      },
    ])
  })

  it('omits satisfied and optional choice sets', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      choiceSelections: {
        [skillChoiceSet.id]: ['srd-cc-5.2.1:athletics', 'srd-cc-5.2.1:acrobatics'],
      },
    }

    expect(resolveUnresolvedChoiceSetSummaries(draft, [skillChoiceSet, optionalChoiceSet])).toEqual(
      [],
    )
  })

  it('reports partial progress for partially satisfied choice sets', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      choiceSelections: {
        [skillChoiceSet.id]: ['srd-cc-5.2.1:athletics'],
      },
    }

    expect(resolveUnresolvedChoiceSetSummaries(draft, [skillChoiceSet])).toMatchObject([
      {
        selectedCount: 1,
        message: 'Choose at least 2 options for Choose Skills.',
      },
    ])
  })
})

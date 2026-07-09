import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft, resolveAvailableChoices } from '@rpg/contracts'

import {
  createSpellsStepContextFixture,
  spellsStepWizardCantrips,
  spellsStepWizardClass,
} from './spells-step.fixtures'
import {
  collectPreviewSpellLabels,
  formatPreviewSpellsSubsection,
} from './character-builder-preview-panel.lib'

const context = createSpellsStepContextFixture()

describe('character-builder-preview-panel.lib', () => {
  it('collects selected cantrip and spell labels in choice-set order', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: spellsStepWizardClass.id, level: 1 as const },
      choiceSelections: {
        [`spellcasting:${spellsStepWizardClass.id}:cantrips`]: [
          spellsStepWizardCantrips[0]!.id,
          spellsStepWizardCantrips[1]!.id,
        ],
      },
    }
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)

    expect(collectPreviewSpellLabels(draft, resolvedChoiceSets)).toEqual([
      'Arcane Bolt',
      'Mage Hand',
    ])
  })

  it('shows an empty hint only when spellcasting is active and nothing is selected', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: spellsStepWizardClass.id, level: 1 as const },
    }
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)

    expect(formatPreviewSpellsSubsection(draft, resolvedChoiceSets, true, true)).toEqual({
      resolvedText: null,
      emptyHint: 'Choose starting spells.',
    })
  })

  it('shows not-applicable copy for non-caster classes', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
    }
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)

    expect(formatPreviewSpellsSubsection(draft, resolvedChoiceSets, true, false)).toEqual({
      resolvedText: null,
      emptyHint: 'Not applicable for this class.',
    })
  })
})

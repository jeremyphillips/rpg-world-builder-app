import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import type { CharacterBuilderDraft } from '../../draft/draft'
import { indexCharacterBuildCatalog } from '../../context'
import { resolveSpellcastingProfile } from './builder-spellcasting'
import { resolveSpellcastingChoices } from './resolve-spellcasting-choices'
import { resolveSpellStepModel } from './resolve-spell-step-model'
import { spellcastingChoiceSetId } from './resolve-spellcasting-choice-sets'
import {
  spellcastingTestContext,
  wizardClass,
  wizardLevelOneSpells,
} from '../../spellcasting-test-fixtures'

function draftWith(overrides: Partial<CharacterBuilderDraft>): CharacterBuilderDraft {
  return { ...createEmptyCharacterBuilderDraft(), ...overrides }
}

describe('resolveSpellStepModel', () => {
  const catalogIndex = indexCharacterBuildCatalog(spellcastingTestContext.catalog)

  it('keeps global quotas on choice blocks and defers wizard prepared from level tabs', () => {
    const draft = draftWith({
      class: { classId: wizardClass.id, level: 1 },
      choiceSelections: {
        [spellcastingChoiceSetId(wizardClass.id, 'spellbook')]: wizardLevelOneSpells.map(
          (spell) => spell.id,
        ),
      },
    })
    const profile = resolveSpellcastingProfile(draft, spellcastingTestContext)!
    const choiceSets = resolveSpellcastingChoices(draft, spellcastingTestContext, catalogIndex)

    const model = resolveSpellStepModel({
      draft,
      context: spellcastingTestContext,
      preview: null,
      profile,
      choiceSets,
    })

    expect(model.deferredPreparedSection?.kind).toBe('deferredPrepared')
    expect(model.spellLevelSections).toHaveLength(1)
    expect(model.spellLevelSections[0]?.aggregateCount).toEqual({
      selected: 6,
      max: 6,
      label: '6 / 6 chosen',
    })
    expect(model.levelTabs[0]?.activityLabel).toBe('6 selected')
  })

  it('uses activity labels per level without synthetic denominators', () => {
    const draft = draftWith({
      class: { classId: wizardClass.id, level: 1 },
      choiceSelections: {
        [spellcastingChoiceSetId(wizardClass.id, 'spellbook')]: wizardLevelOneSpells
          .slice(0, 2)
          .map((spell) => spell.id),
      },
    })
    const profile = resolveSpellcastingProfile(draft, spellcastingTestContext)!
    const choiceSets = resolveSpellcastingChoices(draft, spellcastingTestContext, catalogIndex)

    const model = resolveSpellStepModel({
      draft,
      context: spellcastingTestContext,
      preview: null,
      profile,
      choiceSets,
    })

    expect(model.levelTabs[0]?.activityLabel).toBe('2 selected')
    expect(model.levelTabs[0]).not.toHaveProperty('max')
  })

  it('exposes wizard spellbook identity on a single spell-level section', () => {
    const draft = draftWith({
      class: { classId: wizardClass.id, level: 1 },
      choiceSelections: {
        [spellcastingChoiceSetId(wizardClass.id, 'spellbook')]: wizardLevelOneSpells.map(
          (spell) => spell.id,
        ),
      },
    })
    const profile = resolveSpellcastingProfile(draft, spellcastingTestContext)!
    const choiceSets = resolveSpellcastingChoices(draft, spellcastingTestContext, catalogIndex)

    const model = resolveSpellStepModel({
      draft,
      context: spellcastingTestContext,
      preview: null,
      profile,
      choiceSets,
    })

    expect(model.spellLevelSections[0]?.identityLine).toMatch(/Wizard/i)
  })
})

import { describe, expect, it } from 'vitest'

import { CHARACTER_BUILDER_STEP_IDS } from '../../character-builder/step-ids'
import {
  BUILDER_STEPS,
  CHOICE_STEP_IDS,
  CHOICE_TYPE_STEP,
  getBuilderStepStatus,
  getChoiceSetStepId,
  isBuilderStepComplete,
  isChoiceStep,
  resolveEffectiveBuilderSteps,
  isEffectiveBuilderStep,
  resolveBuilderStepDescription,
  STEP_CHOICE_TYPES_BY_STEP,
} from './steps'
import type { BuilderStep } from './steps'
import type { CampaignNpcBuildContext, CampaignPcBuildContext } from './context'
import { createCharacterBuildContext } from './test-fixtures'
import { CHOICE_TYPES } from './choice-set'
import { createEmptyCharacterBuilderDraft } from './draft/draft'
import type { CharacterBuilderDraft } from './draft/draft'
import type { ChoiceSet } from './choice-set'
import type { Organization } from '../../content/organization'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeDraft(overrides: Partial<CharacterBuilderDraft> = {}): CharacterBuilderDraft {
  return { ...createEmptyCharacterBuilderDraft(), ...overrides }
}

function makeCompleteDraft(): CharacterBuilderDraft {
  return {
    identity: { name: 'Verna', alignment: 'ng' },
    species: { speciesId: 'srd-cc-5.2.1:elf' },
    class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
    abilities: {
      method: 'standard-array',
      scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
    },
    connections: { organizations: [], locations: [] },
    choiceSelections: {},
    touchedStepIds: ['identity', 'species', 'class', 'abilities'],
  }
}

function makeSkillChoiceSet(overrides: Partial<ChoiceSet> = {}): ChoiceSet {
  return {
    id: 'class:srd-cc-5.2.1:fighter:class-skills',
    sourceType: 'class',
    sourceId: 'srd-cc-5.2.1:fighter',
    choiceType: 'skillProficiency',
    label: 'Choose Skills',
    min: 2,
    max: 2,
    options: [
      { id: 'srd-cc-5.2.1:athletics', label: 'Athletics' },
      { id: 'srd-cc-5.2.1:perception', label: 'Perception' },
    ],
    required: true,
    ...overrides,
  }
}

function makeEquipmentChoiceSet(overrides: Partial<ChoiceSet> = {}): ChoiceSet {
  return {
    id: 'class:srd-cc-5.2.1:fighter:starting-equipment',
    sourceType: 'class',
    sourceId: 'srd-cc-5.2.1:fighter',
    choiceType: 'equipment',
    label: 'Choose Starting Equipment',
    min: 1,
    max: 1,
    options: [
      { id: 'pack-a', label: 'Pack A' },
      { id: 'pack-b', label: 'Pack B' },
    ],
    required: true,
    ...overrides,
  }
}

function makeSpellChoiceSet(overrides: Partial<ChoiceSet> = {}): ChoiceSet {
  return {
    id: 'spellcasting:srd-cc-5.2.1:wizard:cantrips',
    sourceType: 'spellcasting',
    sourceId: 'srd-cc-5.2.1:wizard',
    choiceType: 'cantrip',
    label: 'Choose Cantrips',
    min: 3,
    max: 3,
    options: [{ id: 'srd-cc-5.2.1:fire-bolt', label: 'Fire Bolt' }],
    required: true,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// BUILDER_STEPS metadata
// ---------------------------------------------------------------------------

describe('BUILDER_STEPS', () => {
  it('contains every step id exactly once', () => {
    const ids = BUILDER_STEPS.map((s) => s.id)
    expect(ids).toEqual(CHARACTER_BUILDER_STEP_IDS)
  })

  it('every step has a non-empty label and description', () => {
    for (const step of BUILDER_STEPS) {
      expect(step.label.length, `${step.id} label`).toBeGreaterThan(0)
      expect(step.description.length, `${step.id} description`).toBeGreaterThan(0)
    }
  })

  it('is readonly and contains 9 registered steps', () => {
    expect(BUILDER_STEPS).toHaveLength(9)
  })

  it('satisfies BuilderStep shape', () => {
    const step: BuilderStep = BUILDER_STEPS[0]!
    expect(typeof step.id).toBe('string')
    expect(typeof step.label).toBe('string')
    expect(typeof step.description).toBe('string')
  })
})

// ---------------------------------------------------------------------------
// Choice type → step mapping
// ---------------------------------------------------------------------------

describe('choice type step mapping', () => {
  it('maps every choice type to a builder step', () => {
    for (const choiceType of CHOICE_TYPES) {
      expect(CHOICE_TYPE_STEP[choiceType]).toBeDefined()
    }
  })

  it('derives STEP_CHOICE_TYPES_BY_STEP as the inverse of CHOICE_TYPE_STEP', () => {
    for (const choiceType of CHOICE_TYPES) {
      const stepId = CHOICE_TYPE_STEP[choiceType]
      expect(STEP_CHOICE_TYPES_BY_STEP[stepId]?.has(choiceType)).toBe(true)
    }

    for (const [stepId, choiceTypes] of Object.entries(STEP_CHOICE_TYPES_BY_STEP)) {
      for (const choiceType of choiceTypes ?? []) {
        expect(CHOICE_TYPE_STEP[choiceType]).toBe(stepId)
      }
    }
  })

  it('exports choice step ids derived from the forward mapping', () => {
    expect([...CHOICE_STEP_IDS].sort()).toEqual(['equipment', 'proficiencies', 'species', 'spells'])
    expect(isChoiceStep('species')).toBe(true)
    expect(isChoiceStep('identity')).toBe(false)
  })

  it('routes choice sets via getChoiceSetStepId', () => {
    expect(
      getChoiceSetStepId({
        ...makeSkillChoiceSet(),
        choiceType: 'skillProficiency',
      }),
    ).toBe('proficiencies')

    expect(
      getChoiceSetStepId({
        ...makeEquipmentChoiceSet(),
        choiceType: 'equipment',
      }),
    ).toBe('equipment')
  })
})

// ---------------------------------------------------------------------------
// getBuilderStepStatus — active state
// ---------------------------------------------------------------------------

describe('getBuilderStepStatus — active', () => {
  it('returns active when the step is the currentStepId', () => {
    const draft = makeDraft({ currentStepId: 'identity' })
    expect(getBuilderStepStatus('identity', draft, null)).toBe('active')
  })

  it('active takes precedence over complete data', () => {
    const draft = makeCompleteDraft()
    draft.currentStepId = 'species'
    expect(getBuilderStepStatus('species', draft, [])).toBe('active')
  })
})

// ---------------------------------------------------------------------------
// isBuilderStepComplete — content checks ignore navigation position
// ---------------------------------------------------------------------------

describe('isBuilderStepComplete', () => {
  it('returns true for a complete step even when it is the currentStepId', () => {
    const draft = makeDraft({
      currentStepId: 'identity',
      identity: { name: 'Verna' },
    })
    expect(isBuilderStepComplete('identity', draft, null)).toBe(true)
  })

  it('returns false for an incomplete step that is the currentStepId', () => {
    const draft = makeDraft({ currentStepId: 'identity' })
    expect(isBuilderStepComplete('identity', draft, null)).toBe(false)
  })

  it('returns false for deferred choice steps when resolvedChoiceSets is null', () => {
    expect(isBuilderStepComplete('proficiencies', makeDraft(), null)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getBuilderStepStatus — identity step
// ---------------------------------------------------------------------------

describe('getBuilderStepStatus — identity', () => {
  it('returns incomplete when name is missing', () => {
    expect(getBuilderStepStatus('identity', makeDraft(), null)).toBe('incomplete')
  })

  it('returns incomplete when name is whitespace only', () => {
    const draft = makeDraft({ identity: { name: '   ' } })
    expect(getBuilderStepStatus('identity', draft, null)).toBe('incomplete')
  })

  it('returns complete when name is set', () => {
    const draft = makeDraft({ identity: { name: 'Verna' } })
    expect(getBuilderStepStatus('identity', draft, null)).toBe('complete')
  })
})

// ---------------------------------------------------------------------------
// getBuilderStepStatus — species step
// ---------------------------------------------------------------------------

describe('getBuilderStepStatus — species', () => {
  it('returns incomplete when no speciesId', () => {
    expect(getBuilderStepStatus('species', makeDraft(), [])).toBe('incomplete')
  })

  it('returns complete with speciesId and no ChoiceSets needed', () => {
    const draft = makeDraft({ species: { speciesId: 'srd-cc-5.2.1:dwarf' } })
    expect(getBuilderStepStatus('species', draft, [])).toBe('complete')
    expect(getBuilderStepStatus('species', draft, null)).toBe('complete')
  })

  it('returns incomplete when heritage ChoiceSet is unsatisfied', () => {
    const draft = makeDraft({ species: { speciesId: 'srd-cc-5.2.1:elf' } })
    const heritageCs: ChoiceSet = {
      id: 'species:srd-cc-5.2.1:elf:heritage',
      sourceType: 'species',
      sourceId: 'srd-cc-5.2.1:elf',
      choiceType: 'trait',
      label: 'Choose Heritage',
      min: 1,
      max: 1,
      options: [{ id: 'high-elf', label: 'High Elf' }],
      required: true,
    }
    expect(getBuilderStepStatus('species', draft, [heritageCs])).toBe('incomplete')
  })

  it('returns complete when heritage ChoiceSet is satisfied', () => {
    const draft = makeDraft({
      species: { speciesId: 'srd-cc-5.2.1:elf' },
      choiceSelections: { 'species:srd-cc-5.2.1:elf:heritage': ['high-elf'] },
    })
    const heritageCs: ChoiceSet = {
      id: 'species:srd-cc-5.2.1:elf:heritage',
      sourceType: 'species',
      sourceId: 'srd-cc-5.2.1:elf',
      choiceType: 'trait',
      label: 'Choose Heritage',
      min: 1,
      max: 1,
      options: [{ id: 'high-elf', label: 'High Elf' }],
      required: true,
    }
    expect(getBuilderStepStatus('species', draft, [heritageCs])).toBe('complete')
  })
})

// ---------------------------------------------------------------------------
// getBuilderStepStatus — class step
// ---------------------------------------------------------------------------

describe('getBuilderStepStatus — class', () => {
  it('returns incomplete when classId is missing', () => {
    expect(getBuilderStepStatus('class', makeDraft(), null)).toBe('incomplete')
  })

  it('returns complete when classId is set', () => {
    const draft = makeDraft({ class: { classId: 'srd-cc-5.2.1:fighter', level: 1 } })
    expect(getBuilderStepStatus('class', draft, null)).toBe('complete')
  })
})

// ---------------------------------------------------------------------------
// getBuilderStepStatus — abilities step
// ---------------------------------------------------------------------------

describe('getBuilderStepStatus — abilities', () => {
  it('returns incomplete when method is missing', () => {
    expect(getBuilderStepStatus('abilities', makeDraft(), null)).toBe('incomplete')
  })

  it('returns incomplete when some ability scores are missing', () => {
    const draft = makeDraft({
      abilities: { method: 'standard-array', scores: { str: 15, dex: 14 } },
    })
    expect(getBuilderStepStatus('abilities', draft, null)).toBe('incomplete')
  })

  it('returns complete when method and all 6 scores are set', () => {
    const draft = makeDraft({
      abilities: {
        method: 'standard-array',
        scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      },
    })
    expect(getBuilderStepStatus('abilities', draft, null)).toBe('complete')
  })

  it('returns incomplete when standard-array scores duplicate a value', () => {
    const draft = makeDraft({
      abilities: {
        method: 'standard-array',
        scores: { str: 15, dex: 15, con: 13, int: 12, wis: 10, cha: 8 },
      },
    })
    expect(getBuilderStepStatus('abilities', draft, null)).toBe('incomplete')
  })

  it('accepts manual method', () => {
    const draft = makeDraft({
      abilities: {
        method: 'manual',
        scores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      },
    })
    expect(getBuilderStepStatus('abilities', draft, null)).toBe('complete')
  })
})

// ---------------------------------------------------------------------------
// getBuilderStepStatus — choice-dependent steps (deferred / complete)
// ---------------------------------------------------------------------------

describe('getBuilderStepStatus — proficiencies', () => {
  it('returns deferred when resolvedChoiceSets is null', () => {
    expect(getBuilderStepStatus('proficiencies', makeDraft(), null)).toBe('deferred')
  })

  it('returns complete when resolver ran and no ChoiceSets for this step', () => {
    expect(getBuilderStepStatus('proficiencies', makeDraft(), [])).toBe('complete')
  })

  it('returns incomplete when required ChoiceSet is unsatisfied', () => {
    const draft = makeDraft()
    expect(getBuilderStepStatus('proficiencies', draft, [makeSkillChoiceSet()])).toBe('incomplete')
  })

  it('returns complete when all required ChoiceSets are satisfied', () => {
    const draft = makeDraft({
      choiceSelections: {
        'class:srd-cc-5.2.1:fighter:class-skills': [
          'srd-cc-5.2.1:athletics',
          'srd-cc-5.2.1:perception',
        ],
      },
    })
    expect(getBuilderStepStatus('proficiencies', draft, [makeSkillChoiceSet()])).toBe('complete')
  })
})

describe('getBuilderStepStatus — equipment', () => {
  it('returns deferred when resolvedChoiceSets is null', () => {
    expect(getBuilderStepStatus('equipment', makeDraft(), null)).toBe('deferred')
  })

  it('returns complete when resolver ran and no equipment ChoiceSets', () => {
    expect(getBuilderStepStatus('equipment', makeDraft(), [])).toBe('complete')
  })

  it('returns complete when equipment ChoiceSet is satisfied', () => {
    const draft = makeDraft({
      choiceSelections: { 'class:srd-cc-5.2.1:fighter:starting-equipment': ['pack-a'] },
    })
    expect(getBuilderStepStatus('equipment', draft, [makeEquipmentChoiceSet()])).toBe('complete')
  })
})

describe('getBuilderStepStatus — spells', () => {
  it('returns deferred when resolvedChoiceSets is null', () => {
    expect(getBuilderStepStatus('spells', makeDraft(), null)).toBe('deferred')
  })

  it('returns complete when resolver ran and no spell ChoiceSets (non-caster)', () => {
    expect(getBuilderStepStatus('spells', makeDraft(), [])).toBe('complete')
  })

  it('returns incomplete when required spell ChoiceSet is unsatisfied', () => {
    expect(getBuilderStepStatus('spells', makeDraft(), [makeSpellChoiceSet()])).toBe('incomplete')
  })
})

// ---------------------------------------------------------------------------
// getBuilderStepStatus — review step
// ---------------------------------------------------------------------------

describe('getBuilderStepStatus — review', () => {
  it('returns incomplete on empty draft with null choiceSets', () => {
    // identity, species, class, abilities all incomplete → review incomplete
    expect(getBuilderStepStatus('review', makeDraft(), null)).toBe('incomplete')
  })

  it('returns complete in MVP-A when core steps done and choice steps deferred (null)', () => {
    // null → proficiencies/equipment/spells are 'deferred' (non-blocking)
    expect(getBuilderStepStatus('review', makeCompleteDraft(), null)).toBe('complete')
  })

  it('returns incomplete when one core step is incomplete', () => {
    const draft = makeCompleteDraft()
    draft.identity.name = ''
    expect(getBuilderStepStatus('review', draft, null)).toBe('incomplete')
  })

  it('returns complete when all steps (including choice steps) are complete', () => {
    const draft = makeCompleteDraft()
    draft.choiceSelections = {
      'class:srd-cc-5.2.1:fighter:class-skills': [
        'srd-cc-5.2.1:athletics',
        'srd-cc-5.2.1:perception',
      ],
      'class:srd-cc-5.2.1:fighter:starting-equipment': ['pack-a'],
    }
    const choiceSets = [makeSkillChoiceSet(), makeEquipmentChoiceSet()]
    expect(getBuilderStepStatus('review', draft, choiceSets)).toBe('complete')
  })

  it('returns incomplete when a required choice step has unsatisfied ChoiceSets', () => {
    // skill ChoiceSet present but not satisfied
    expect(getBuilderStepStatus('review', makeCompleteDraft(), [makeSkillChoiceSet()])).toBe(
      'incomplete',
    )
  })
})

describe('resolveBuilderStepDescription', () => {
  const TEST_CAMPAIGN_ID = 'camp_1'

  it('returns static metadata for non-review steps', () => {
    const context = createCharacterBuildContext()

    expect(resolveBuilderStepDescription(context, 'identity')).toBe(
      'Name, appearance, and alignment',
    )
  })

  it('returns variant-specific review copy for campaign invite PCs', () => {
    const context = {
      ...createCharacterBuildContext(),
      characterKind: 'pc',
      mode: 'dashboard',
      scope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: 'srd-cc-5.2.1' },
      rulesScope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: 'srd-cc-5.2.1' },
      ownershipTarget: { type: 'user', userId: 'user_1' },
      acquisition: {
        kind: 'campaign_pc_onboarding',
        campaignId: TEST_CAMPAIGN_ID,
      },
    } satisfies CampaignPcBuildContext

    expect(resolveBuilderStepDescription(context, 'review')).toBe(
      'Review and create your campaign character',
    )
  })

  it('returns variant-specific review copy for campaign NPCs', () => {
    const context = {
      ...createCharacterBuildContext({
        characterKind: 'npc',
        rulesScope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: 'srd-cc-5.2.1' },
      }),
      characterKind: 'npc',
      mode: 'dashboard',
      scope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: 'srd-cc-5.2.1' },
      rulesScope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: 'srd-cc-5.2.1' },
      ownershipTarget: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID },
      acquisition: { kind: 'campaign_npc', campaignId: TEST_CAMPAIGN_ID },
    } satisfies CampaignNpcBuildContext

    expect(resolveBuilderStepDescription(context, 'review')).toBe(
      'Review and add this NPC to your campaign',
    )
  })
})

describe('isEffectiveBuilderStep', () => {
  it('returns true when the step is in the effective flow', () => {
    const context = createCharacterBuildContext()
    const draft = makeDraft()

    expect(isEffectiveBuilderStep(context, draft, 'class')).toBe(true)
  })

  it('returns false when the step is filtered out of the effective flow', () => {
    const context = createCharacterBuildContext()
    const draft = makeDraft({ class: { classId: undefined, level: 0 } })

    expect(isEffectiveBuilderStep(context, draft, 'class')).toBe(false)
  })
})

describe('resolveEffectiveBuilderSteps', () => {
  const organization = {
    id: 'organization-1',
    slug: 'lantern-guild',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    status: 'published',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: 'Lantern Guild',
    organizationDomain: 'occupational',
    functions: [],
    practices: [],
    connections: { locations: [] },
  } satisfies Organization

  it('omits Connections when no organizations are selectable or selected', () => {
    expect(
      resolveEffectiveBuilderSteps(createCharacterBuildContext(), makeDraft()).map(({ id }) => id),
    ).not.toContain('connections')
  })

  it('inserts Connections after Identity when an organization is selectable', () => {
    const context = createCharacterBuildContext({
      catalog: {
        ...createCharacterBuildContext().catalog,
        organizations: [organization],
      },
    })

    expect(
      resolveEffectiveBuilderSteps(context, makeDraft())
        .map(({ id }) => id)
        .slice(0, 3),
    ).toEqual(['identity', 'connections', 'species'])
  })

  it('keeps Connections visible for recovery when the draft contains a stale selection', () => {
    const draft = makeDraft({
      connections: { organizations: [{ organizationId: 'removed-organization' }], locations: [] },
    })

    expect(
      resolveEffectiveBuilderSteps(createCharacterBuildContext(), draft).map(({ id }) => id),
    ).toContain('connections')
  })
})

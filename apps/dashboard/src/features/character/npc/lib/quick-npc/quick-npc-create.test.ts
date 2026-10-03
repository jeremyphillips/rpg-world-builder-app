import { describe, expect, it } from 'vitest'

import {
  CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
  createEmptyCharacterBuilderDraft,
  isCharacterBuildFinalizationError,
  type CharacterBuildContext,
} from '@rpg/contracts'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'
import {
  createEquipmentStepContextFixture,
  equipmentStepBattleaxeFixture,
  equipmentStepCatalogFixture,
  equipmentStepDaggerFixture,
  equipmentStepMonkClassFixture,
} from '../../../lib/equipment/equipment-step.fixtures'
import { makeSpecies } from '@/test/fixtures/factories/species'
import { prepareQuickNpcAuthoringCreate } from './quick-npc-authoring-submit.lib'
import {
  buildQuickNpcCreateInput,
  formatQuickNpcCreationError,
  resolveQuickNpcPreparedDraft,
} from './quick-npc-create'
import { quickNpcAuthoringTabDefaultValues } from './quick-npc-form-fields'
import {
  quickNpcStandaloneCreateContext,
  quickNpcStandaloneSetupValues,
} from './quick-npc-test-fixtures'

/** Fighter variant whose skill choice is satisfiable by the fixture catalog. */
const quickFighter = {
  ...populatedBuilderCatalog.classes[0]!,
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }],
      },
    },
  },
}

const lanternGuild = {
  id: 'organization-1',
  slug: 'lantern-guild',
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'homebrew' as const,
  status: 'published' as const,
  campaignId: 'campaign-test-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Lantern Guild',
  organizationDomain: 'occupational' as const,
  functions: [],
  practices: [],
  members: {
    classAffinityIds: [],
    speciesAffinityIds: [],
    titles: [{ id: 'omt_member', label: 'Member', priority: 10 as const }],
  },
  connections: { locations: [] },
}

function quickNpcTestContext(): CharacterBuildContext {
  return createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: [quickFighter],
      organizations: [lanternGuild],
    },
  })
}

const seed = {
  name: 'Guild Quartermaster',
  speciesId: populatedBuilderCatalog.species[0]!.id,
  classId: quickFighter.id,
  level: 1,
  alignment: 'ln',
  gender: 'male',
} as const

describe('buildQuickNpcCreateInput', () => {
  it('produces a canonical NPC create input without organization edges when membership is omitted', () => {
    const input = buildQuickNpcCreateInput({
      seed,
      context: quickNpcTestContext(),
    })

    expect(input.relationshipEdges).toEqual([])
  })

  it('produces a canonical NPC create input with the membership edge included', () => {
    const input = buildQuickNpcCreateInput({
      seed,
      context: quickNpcTestContext(),
      membership: { organizationId: 'organization-1', membershipTitleId: 'omt_guildmaster' },
    })

    expect(input).toMatchObject({
      name: 'Guild Quartermaster',
      alignment: 'ln',
      classes: [{ classId: quickFighter.id, level: 1 }],
      species: { id: seed.speciesId },
    })
    expect(input.relationshipEdges?.[0]).toMatchObject({
      kind: 'organizationMembership',
      characterId: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
      organizationId: 'organization-1',
      details: expect.objectContaining({
        membershipTitleId: 'omt_guildmaster',
      }),
    })
  })

  it('omits title and priority for an untitled membership', () => {
    const input = buildQuickNpcCreateInput({
      seed,
      context: quickNpcTestContext(),
      membership: { organizationId: 'organization-1' },
    })

    expect(input.relationshipEdges).toEqual([
      expect.objectContaining({
        kind: 'organizationMembership',
        organizationId: 'organization-1',
      }),
    ])
  })

  it('throws a finalization error carrying builder issues for an unavailable species', () => {
    expect.assertions(2)
    try {
      buildQuickNpcCreateInput({
        seed: { ...seed, speciesId: 'srd-cc-5.2.1:not-a-species' },
        context: quickNpcTestContext(),
        membership: { organizationId: 'organization-1' },
      })
    } catch (error) {
      expect(isCharacterBuildFinalizationError(error)).toBe(true)
      if (isCharacterBuildFinalizationError(error)) {
        expect(error.validationIssues).toEqual([
          expect.objectContaining({ code: 'species_not_in_catalog' }),
        ])
      }
    }
  })
})

describe('formatQuickNpcCreationError', () => {
  it('joins builder issue messages from a finalization error', () => {
    let caught: unknown
    try {
      buildQuickNpcCreateInput({
        seed: { ...seed, speciesId: 'srd-cc-5.2.1:not-a-species' },
        context: quickNpcTestContext(),
      })
    } catch (error) {
      caught = error
    }

    const message = formatQuickNpcCreationError(caught)
    expect(message).toBeTruthy()
    expect(message).toMatch(/no longer available/i)
  })

  it('returns undefined for non-builder errors so callers use their fallback', () => {
    expect(formatQuickNpcCreationError(new Error('network down'))).toBeUndefined()
    expect(formatQuickNpcCreationError(undefined)).toBeUndefined()
  })
})

describe('Quick NPC build advisories', () => {
  const species = makeSpecies({ slug: 'scout', name: 'Scout' })
  const context = createEquipmentStepContextFixture({
    catalog: {
      ...equipmentStepCatalogFixture,
      species: [species],
      classes: [equipmentStepMonkClassFixture],
    },
  })

  function prepared(equipmentId: string) {
    return prepareQuickNpcAuthoringCreate({
      createContext: quickNpcStandaloneCreateContext(),
      setup: quickNpcStandaloneSetupValues({
        speciesId: species.id,
        classId: equipmentStepMonkClassFixture.id,
        level: 1,
      }),
      tabValues: {
        ...quickNpcAuthoringTabDefaultValues,
        gender: 'female',
        name: 'Scout',
        alignment: 'ln',
        equipmentSelections: [{ equipmentId, quantity: 1, origin: 'manual' }],
      },
      buildContext: context,
    })
  }

  it('flags a retained manual weapon the class is not proficient with', () => {
    expect(prepared(equipmentStepBattleaxeFixture.id).advisories).toEqual([
      expect.objectContaining({
        code: 'equipment_not_proficient',
        subject: expect.objectContaining({ equipmentId: equipmentStepBattleaxeFixture.id }),
      }),
    ])
    expect(prepared(equipmentStepDaggerFixture.id).advisories).toEqual([])
  })

  it('returns no advisories for a classless fallback draft', () => {
    const fallbackDraft = {
      ...createEmptyCharacterBuilderDraft(),
      equipment: {
        mode: 'package' as const,
        purchases: [],
        editedSincePackageSelection: false,
        grants: [{ equipmentId: equipmentStepBattleaxeFixture.id, quantity: 1 }],
      },
    }
    const result = resolveQuickNpcPreparedDraft({
      seed: { name: 'Scout', speciesId: species.id, level: 1, alignment: 'ln', gender: 'female' },
      context,
      fallbackDraft,
      startingChoiceIssues: [{ code: 'class_required', message: 'Choose a class.' }],
    })
    expect(result.ok).toBe(false)
    expect(result.advisories).toEqual([])
  })
})

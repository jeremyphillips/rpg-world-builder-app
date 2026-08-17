import { describe, expect, it } from 'vitest'

import type { ClassStored } from '../../content/classes/class'
import type { ResolvedContentCampaignAccess } from '../../content/lib/campaign-access'
import { isContentPlayableFor } from '../campaign/content-resolution-policy'
import type { ContentPlayActor } from '../campaign/content-play-actor'
import type { CharacterBuildContext } from './context'
import { DEFAULT_ABILITY_GENERATION_RULES } from './ability/ability-generation'
import { resolveCharacterCreationPatch } from '../../campaign/patches/campaign-character-creation-patch'
import { defaultCampaignMechanicsPatch } from '../../campaign/patches/campaign-mechanics-patch'
import { resolveCharacterOwnershipTarget } from '../character-acquisition'
import { createEmptyCharacterBuilderDraft } from './draft/draft'
import { indexPlayableBuilderCatalog } from './preview/index-playable-builder-catalog'
import { resolvePlayableBuilderContent } from './preview/resolve-playable-builder-content'
import { startingWealthSeed } from './test-fixtures'
import { validateCharacterBuild } from './validate/validate-character-build'
import { validateClass, validateSpecies } from './validate/validate-step-fields'

const timestamps = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

function access(
  overrides: Partial<ResolvedContentCampaignAccess> = {},
): ResolvedContentCampaignAccess {
  return {
    available: true,
    visibilityMode: 'all_players',
    participantIds: [],
    unavailableParticipantIds: [],
    effectiveAudience: 'all_players',
    ...overrides,
  }
}

function makeStoredClass(
  id: string,
  campaignAccess: ResolvedContentCampaignAccess,
): ClassStored & { campaignAccess: ResolvedContentCampaignAccess } {
  return {
    id,
    slug: id.split(':').pop() ?? id,
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    status: 'published',
    campaignId: null,
    ...timestamps,
    name: id,
    primaryAbilities: ['str'],
    hitDie: 10,
    proficiencies: {
      savingThrows: ['str', 'con'],
      armor: { categories: ['light'], items: [] },
      weapons: { categories: ['simple'], items: [] },
      skills: { categories: [], items: [] },
    },
    features: [],
    campaignAccess,
  }
}

function makeContext(input: {
  playActor: ContentPlayActor
  classes: ClassStored[]
}): CharacterBuildContext {
  return {
    channel: 'build',
    surface: 'dashboard',
    characterKind: 'pc',
    mode: 'dashboard',
    scope: { type: 'campaign', campaignId: 'camp-1', rulesetId: 'srd-cc-5.2.1' },
    rulesScope: { type: 'campaign', campaignId: 'camp-1', rulesetId: 'srd-cc-5.2.1' },
    ownershipTarget: resolveCharacterOwnershipTarget('pc', {
      type: 'campaign',
      campaignId: 'camp-1',
      rulesetId: 'srd-cc-5.2.1',
    }),
    rulesetId: 'srd-cc-5.2.1',
    catalog: {
      species: [],
      classes: input.classes,
      spells: [],
      equipment: [],
      skillProficiencies: [],
      organizations: [],
      languages: [],
    },
    characterCreationRules: {
      ...resolveCharacterCreationPatch(undefined, startingWealthSeed),
      abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
      armorClass: defaultCampaignMechanicsPatch().armorClass,
    },
    permissions: { canCreateCharacter: true },
    playActor: input.playActor,
  }
}

describe('play-actor builder regression matrix', () => {
  const publicClass = makeStoredClass('srd-cc-5.2.1:fighter', access())
  const pcOnlyClass = makeStoredClass(
    'campaign:paladin',
    access({
      visibilityMode: 'specific_players',
      participantIds: ['pc-a'],
      effectiveAudience: 'specific_players',
    }),
  )
  const dmOnlyClass = makeStoredClass(
    'campaign:death-knight',
    access({ visibilityMode: 'dm_only', effectiveAudience: 'dm_only' }),
  )
  const catalog = [publicClass, pcOnlyClass, dmOnlyClass]

  it('scopes playable classes per play actor', () => {
    expect(
      resolvePlayableBuilderContent(
        makeContext({ playActor: { kind: 'pc', characterId: 'pc-a' }, classes: catalog }),
      )
        .classes.map(({ id }) => id)
        .sort(),
    ).toEqual(['campaign:paladin', 'srd-cc-5.2.1:fighter'].sort())

    expect(
      resolvePlayableBuilderContent(
        makeContext({ playActor: { kind: 'pc', characterId: 'pc-b' }, classes: catalog }),
      ).classes.map(({ id }) => id),
    ).toEqual(['srd-cc-5.2.1:fighter'])

    expect(
      resolvePlayableBuilderContent(
        makeContext({ playActor: { kind: 'new_pc' }, classes: catalog }),
      ).classes.map(({ id }) => id),
    ).toEqual(['srd-cc-5.2.1:fighter'])

    expect(
      resolvePlayableBuilderContent(makeContext({ playActor: { kind: 'npc' }, classes: catalog }))
        .classes.map(({ id }) => id)
        .sort(),
    ).toEqual(['campaign:death-knight', 'srd-cc-5.2.1:fighter'].sort())
  })

  it('keeps policy, resolver output, and indexed validation universe aligned', () => {
    const context = makeContext({
      playActor: { kind: 'pc', characterId: 'pc-a' },
      classes: catalog,
    })
    const playable = resolvePlayableBuilderContent(context)
    const index = indexPlayableBuilderCatalog(context)

    expect([...index.classes.keys()].sort()).toEqual(playable.classes.map(({ id }) => id).sort())
    expect(playable.classes.every((row) => isContentPlayableFor(row, context.playActor))).toBe(true)
  })

  it('rejects tampered sibling-PC class ids at step and final validation', () => {
    const context = makeContext({ playActor: { kind: 'new_pc' }, classes: catalog })
    const stepClassIds = new Set(resolvePlayableBuilderContent(context).classes.map(({ id }) => id))
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
      class: { classId: 'campaign:paladin', level: 1 as const },
    }

    expect(stepClassIds.has('campaign:paladin')).toBe(false)
    expect(
      validateClass(draft, context).some((issue) => issue.code === 'class_not_in_catalog'),
    ).toBe(true)
    expect(validateCharacterBuild(draft, context, 'finalSubmit').ok).toBe(false)
  })

  it('rejects tampered species ids outside the playable index', () => {
    const context = makeContext({ playActor: { kind: 'new_pc' }, classes: [publicClass] })
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: 'campaign:hidden-species' },
      class: { classId: publicClass.id, level: 1 as const },
    }

    expect(
      validateSpecies(draft, context).some((issue) => issue.code === 'species_not_in_catalog'),
    ).toBe(true)
  })
})

import { describe, expect, it } from 'vitest'

import { isCharacterBuildFinalizationError, type CharacterBuildContext } from '@rpg/contracts'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import { buildQuickNpcCreateInput, formatQuickNpcCreationError } from './quick-npc-create'

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
} as const

describe('buildQuickNpcCreateInput', () => {
  it('produces a canonical NPC create input with the membership connection included', () => {
    const input = buildQuickNpcCreateInput({
      seed,
      context: quickNpcTestContext(),
      membership: { organizationId: 'organization-1', title: 'Guildmaster', priority: 50 },
    })

    expect(input).toMatchObject({
      name: 'Guild Quartermaster',
      alignment: 'ln',
      classes: [{ classId: quickFighter.id, level: 1 }],
      species: { id: seed.speciesId },
    })
    expect(input.connections.organizations).toEqual([
      { organizationId: 'organization-1', title: 'Guildmaster', priority: 50 },
    ])
  })

  it('omits title and priority for an untitled membership', () => {
    const input = buildQuickNpcCreateInput({
      seed,
      context: quickNpcTestContext(),
      membership: { organizationId: 'organization-1' },
    })

    expect(input.connections.organizations).toEqual([{ organizationId: 'organization-1' }])
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

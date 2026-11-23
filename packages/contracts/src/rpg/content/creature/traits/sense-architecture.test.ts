import { describe, expect, it } from 'vitest'

import { createSpeciesInputSchema, contentTraitSchema, type SpeciesBodyTrait } from '../../species'
import { resolveCreatureSenses } from '../../../runtime/creature/senses'
import { resolveCreatureTraitGrants } from '../../../runtime/creature/traits'
import { collectSourcedGrants } from '../../../runtime/character-builder/assembly/collect-sourced-grants'
import { createEmptyCharacterBuilderDraft } from '../../../runtime/character-builder/draft/draft'
import {
  indexCharacterBuildCatalog,
  type CharacterBuildCatalog,
} from '../../../runtime/character-builder/context'
import { proficiencyTestCatalog } from '../../../runtime/character-builder/proficiency-test-fixtures'
import { unlockedGrantChoiceSets } from '../../../runtime/character-builder/resolvers/grants/unlocked-grant-choice-sets'
import { resolveMechanicalGrantsFromContent } from '../../../runtime/creature/mechanical-grants'
import type { Species } from '../../species'
import { createMonsterDraftInputSchema, createMonsterInputSchema } from '../../monster'
import {
  formatCreatureSenseCompactLine,
  formatCreatureSenseTraitRulesSentence,
} from '../../../vocab/sense'
import { defineSenseTemplate } from './sense-templates'

const elfTemplateDarkvision: SpeciesBodyTrait = {
  kind: 'template',
  id: 'darkvision',
  templateId: defineSenseTemplate('darkvision'),
  config: { range: 60 },
}

const drowDarkvisionGrant: SpeciesBodyTrait = {
  kind: 'grant',
  id: 'drow-superior-darkvision',
  grantGroups: [{ grants: [{ id: 'sense-drow', kind: 'sense', type: 'darkvision', range: 120 }] }],
}

describe('sense display parity', () => {
  const senseFact = { type: 'darkvision' as const, range: 120 }

  it('formats the same compact line and rules sentence from one sense fact', () => {
    expect(formatCreatureSenseCompactLine(senseFact)).toBe('Darkvision 120 ft.')
    expect(formatCreatureSenseTraitRulesSentence(senseFact)).toBe(
      'You have Darkvision with a range of 120 feet.',
    )
  })

  it('matches monster-authored and template-projected sense facts', () => {
    const fromTemplate = resolveCreatureTraitGrants([
      {
        trait: { ...elfTemplateDarkvision, config: { range: 120 } },
        source: 'species',
      },
    ])[0]?.grant
    expect(fromTemplate).toMatchObject({ kind: 'sense', ...senseFact })
    expect(resolveCreatureSenses({ authored: [senseFact], grants: [] })).toEqual([senseFact])
    expect(
      resolveCreatureSenses({
        grants: [fromTemplate!],
      }),
    ).toEqual([senseFact])
  })
})

describe('sense template registry', () => {
  it('projects a sense grant from template config', () => {
    const resolved = resolveCreatureTraitGrants([
      { trait: { ...elfTemplateDarkvision, config: { range: 120 } }, source: 'elf' },
    ])
    expect(resolved).toHaveLength(1)
    expect(resolved[0]?.grant).toMatchObject({
      kind: 'sense',
      type: 'darkvision',
      range: 120,
    })
  })

  it('keeps emit-each grants in one resolution call', () => {
    const resolved = resolveCreatureTraitGrants([
      { trait: { ...elfTemplateDarkvision, id: 'dv-1', config: { range: 60 } }, source: 'first' },
      {
        trait: { ...elfTemplateDarkvision, id: 'dv-2', config: { range: 120 } },
        source: 'second',
      },
    ])

    expect(resolved).toHaveLength(2)
    expect(resolveCreatureSenses({ grants: resolved.map((row) => row.grant) })).toEqual([
      { type: 'darkvision', range: 120 },
    ])
  })
})

describe('collectSourcedGrants with sense templates', () => {
  const elfSpecies = {
    id: 'srd-cc-5.2.1:elf-fixture',
    slug: 'elf-fixture',
    rulesetId: 'srd-cc-5.2.1',
    catalogLayer: 'system',
    status: 'published',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: 'Elf Fixture',
    description: '<p>Fixture</p>',
    creatureType: 'humanoid',
    sizes: ['medium'],
    movement: { walk: 30 },
    traits: [elfTemplateDarkvision],
    heritage: {
      id: 'lineage',
      name: 'Lineage',
      options: [drowDarkvisionGrant],
    },
  } satisfies Species

  const catalog: CharacterBuildCatalog = {
    ...proficiencyTestCatalog,
    species: [elfSpecies],
  }

  it('includes projected sense grants and merges with heritage', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: elfSpecies.id, heritageId: drowDarkvisionGrant.id },
    }

    const sourced = collectSourcedGrants(draft, indexCharacterBuildCatalog(catalog))
    const senses = resolveCreatureSenses({
      grants: sourced.filter((row) => row.grant.kind === 'sense').map((row) => row.grant),
    })

    expect(senses).toEqual([{ type: 'darkvision', range: 120 }])
    expect(
      sourced.some(
        (row) =>
          row.grant.kind === 'sense' &&
          row.sources.some((source) => source.grantId === 'darkvision'),
      ),
    ).toBe(true)
  })
})

describe('mechanical grant readers', () => {
  it('returns no choice sets for sense templates', () => {
    const choices = unlockedGrantChoiceSets(
      elfTemplateDarkvision,
      indexCharacterBuildCatalog(proficiencyTestCatalog),
      {
        sourceType: 'species',
        sourceId: 'elf',
        slot: 'trait:darkvision',
        provenance: {
          ownerKind: 'species',
          ownerLabel: 'Elf',
          featureLabel: 'Darkvision',
        },
      },
    )
    expect(choices).toEqual([])
  })

  it('collects sense vocabulary from template traits', () => {
    const grants = resolveMechanicalGrantsFromContent(elfTemplateDarkvision)
    expect(grants).toMatchObject([{ kind: 'sense', type: 'darkvision', range: 60 }])
  })
})

describe('occurrence refinements', () => {
  it('rejects duplicate species sense templates', () => {
    const result = createSpeciesInputSchema.safeParse({
      slug: 'duplicate-sense',
      name: 'Dup',
      creatureType: 'humanoid',
      sizes: ['medium'],
      movement: { walk: 30 },
      traits: [elfTemplateDarkvision, { ...elfTemplateDarkvision, id: 'darkvision-2' }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects publish stored sense grant traits on species', () => {
    const result = createSpeciesInputSchema.safeParse({
      slug: 'grant-sense',
      name: 'Grant',
      creatureType: 'humanoid',
      sizes: ['medium'],
      movement: { walk: 30 },
      traits: [drowDarkvisionGrant],
    })
    expect(result.success).toBe(false)
  })

  it('rejects sense templates on monster drafts and publish bodies', () => {
    const draftBody = {
      slug: 'bad-monster',
      name: 'Bad',
      creatureType: 'humanoid',
      size: 'medium' as const,
      alignment: ['neutral'],
      armorClass: 10,
      hitPoints: { average: 10 },
      challengeRating: '0',
      movement: { walk: 30 },
      senses: [],
      traits: [
        contentTraitSchema.parse({
          kind: 'template',
          id: 'dv',
          templateId: defineSenseTemplate('darkvision'),
          config: { range: 60 },
        }),
      ],
      actions: [] as const,
    }
    expect(createMonsterDraftInputSchema.safeParse(draftBody).success).toBe(false)

    const result = createMonsterInputSchema.safeParse({
      slug: 'bad-monster',
      name: 'Bad',
      creatureType: 'humanoid',
      size: 'medium',
      alignment: ['neutral'],
      armorClass: 10,
      hitPoints: { average: 10 },
      challengeRating: '0',
      movement: { walk: 30 },
      senses: [],
      traits: [
        contentTraitSchema.parse({
          kind: 'template',
          id: 'dv',
          templateId: defineSenseTemplate('darkvision'),
          config: { range: 60 },
        }),
      ],
      actions: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects duplicate monster sense types', () => {
    const result = createMonsterInputSchema.safeParse({
      slug: 'dup-senses',
      name: 'Dup',
      creatureType: 'humanoid',
      size: 'medium',
      alignment: ['neutral'],
      armorClass: 10,
      hitPoints: { average: 10 },
      challengeRating: '0',
      movement: { walk: 30 },
      senses: [
        { type: 'darkvision', range: 60 },
        { type: 'darkvision', range: 120 },
      ],
      traits: [],
      actions: [],
    })
    expect(result.success).toBe(false)
  })
})

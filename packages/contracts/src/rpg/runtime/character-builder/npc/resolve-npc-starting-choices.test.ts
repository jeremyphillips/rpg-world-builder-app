import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../content/equipment'
import type { SkillProficiency } from '../../../content/skill-proficiency'
import { getNpcTemplateEntry } from '../../../vocab/npc/npc-template'
import { buildChoiceSetId } from '../choice-set'
import type { CharacterBuildContext } from '../context'
import { athleticsSkill, createCharacterBuildContext, dwarfSpecies } from '../test-fixtures'
import { npcTemplateSkillChoiceSetId } from '../resolvers/npc-template/resolve-npc-template-role-choices'

import { resolveNpcStartingChoices } from './resolve-npc-starting-choices'

const RULESET = 'srd-cc-5.2.1' as const

function skill(slug: string, name: string): SkillProficiency {
  return {
    ...athleticsSkill,
    id: `${RULESET}:${slug}`,
    slug,
    name,
  }
}

const perception = skill('perception', 'Perception')
const stealth = skill('stealth', 'Stealth')
const intimidation = skill('intimidation', 'Intimidation')

const spear = equipmentSchema.parse({
  id: `${RULESET}:spear`,
  slug: 'spear',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Spear',
  description: '',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'weapon',
  category: 'simple',
  mode: 'melee',
  damage: { dice: { count: 1, faces: 6 } },
  damageType: 'piercing',
  properties: [],
  mastery: 'sap',
})

const longsword = equipmentSchema.parse({
  ...spear,
  id: `${RULESET}:longsword`,
  slug: 'longsword',
  name: 'Longsword',
  category: 'martial',
  mastery: 'sap',
})

function guardContext(): CharacterBuildContext {
  const base = createCharacterBuildContext({
    characterKind: 'npc',
    rulesScope: { type: 'campaign', campaignId: 'campaign-1', rulesetId: RULESET },
  })
  return {
    ...base,
    catalog: {
      ...base.catalog,
      skillProficiencies: [athleticsSkill, perception, stealth, intimidation],
      equipment: [spear, longsword],
    },
  }
}

describe('resolveNpcStartingChoices', () => {
  const context = guardContext()
  const seed = {
    speciesId: dwarfSpecies.id,
    level: 0,
    npcTemplateId: 'guard' as const,
  }
  const preferences = {
    skills: [
      { id: 'perception', sources: ['template' as const] },
      { id: 'athletics', sources: ['template' as const] },
      { id: 'intimidation', sources: ['template' as const] },
      { id: 'insight', sources: ['template' as const] },
    ],
    tools: [
      { id: 'thieves-tools', sources: ['template' as const] },
      { id: 'disguise-kit', sources: ['template' as const] },
    ],
  }

  it('does not treat a Guard default loadout as a fixed equipment grant', () => {
    const choices = resolveNpcStartingChoices({
      context,
      seed,
      preferences,
    })

    const equipment = choices.contributions.find((entry) => entry.category === 'equipment')
    expect(equipment).toBeUndefined()

    const skills = choices.contributions.find((entry) => entry.category === 'skill')
    expect(skills).toMatchObject({
      mechanic: 'choice-allowance',
      overridden: false,
      choiceSetId: npcTemplateSkillChoiceSetId('guard'),
      allowance: { min: 2, max: 2 },
      selectedIds: [perception.id, athleticsSkill.id],
      owner: { ownerKind: 'npcTemplate', ownerLabel: 'Guard' },
    })
    expect(getNpcTemplateEntry('guard')?.recommendations.skillSlugs[0]).toBe('perception')
  })

  it('uses a complete override without padding leftover recommendation ids', () => {
    const choiceSetId = npcTemplateSkillChoiceSetId('guard')
    const choices = resolveNpcStartingChoices({
      context,
      seed,
      preferences,
      startingChoiceOverrides: {
        [choiceSetId]: [athleticsSkill.id, stealth.id],
      },
    })

    const skills = choices.contributions.find(
      (entry) => entry.mechanic === 'choice-allowance' && entry.choiceSetId === choiceSetId,
    )
    expect(skills?.selectedIds).toEqual([athleticsSkill.id, stealth.id])
    expect(skills?.mechanic === 'choice-allowance' ? skills.overridden : false).toBe(true)
    expect(skills?.mechanic === 'choice-allowance' ? skills.suggestedBy : undefined).toBeUndefined()
    expect(skills?.selectedIds).not.toContain(perception.id)
  })

  it('restores the canonical fill when the override key is removed', () => {
    const choiceSetId = npcTemplateSkillChoiceSetId('guard')
    const withOverride = resolveNpcStartingChoices({
      context,
      seed,
      preferences,
      startingChoiceOverrides: {
        [choiceSetId]: [athleticsSkill.id, stealth.id],
      },
    })
    const overridden = withOverride.contributions.find(
      (entry) => entry.mechanic === 'choice-allowance' && entry.choiceSetId === choiceSetId,
    )
    expect(overridden?.mechanic === 'choice-allowance' ? overridden.overridden : false).toBe(true)

    const restored = resolveNpcStartingChoices({
      context,
      seed,
      preferences,
    })
    expect(
      restored.contributions.find(
        (entry) => entry.mechanic === 'choice-allowance' && entry.choiceSetId === choiceSetId,
      )?.selectedIds,
    ).toEqual([perception.id, athleticsSkill.id])
  })

  it('keeps a required weapon when the role default was not materialized', () => {
    const choices = resolveNpcStartingChoices({
      context,
      seed,
      preferences,
      requiredWeaponIds: [spear.id, longsword.id, spear.id],
    })

    const weapons = choices.contributions.find((entry) => entry.category === 'weapon')
    expect(weapons?.selectedIds).toEqual([spear.id, longsword.id])
    expect(weapons?.mechanic).toBe('explicit-constraint')
  })

  it('drops an override when its choice-set id is no longer active', () => {
    const choiceSetId = npcTemplateSkillChoiceSetId('guard')
    const resolved = resolveNpcStartingChoices({
      context,
      seed,
      preferences,
      startingChoiceOverrides: {
        [choiceSetId]: [athleticsSkill.id, stealth.id],
        'npcTemplate:criminal:skills': [stealth.id],
      },
    })
    expect(resolved.removedOverrideIds).toEqual(['npcTemplate:criminal:skills'])
    const skills = resolved.contributions.find(
      (entry) => entry.mechanic === 'choice-allowance' && entry.choiceSetId === choiceSetId,
    )
    expect(skills?.selectedIds).toEqual([athleticsSkill.id, stealth.id])
  })

  it('keeps Elf and Fighter skill overrides independent', () => {
    const fighterContext = {
      ...context,
      catalog: {
        ...context.catalog,
        species: [
          ...context.catalog.species,
          {
            ...dwarfSpecies,
            id: `${RULESET}:elf`,
            slug: 'elf',
            name: 'Elf',
            languageAffinities: ['elvish'],
            traits: [
              {
                kind: 'custom' as const,
                id: 'keen-senses',
                name: 'Keen Senses',
                description: '<p>Choose one skill.</p>',
                grantGroups: [
                  {
                    grants: [
                      {
                        kind: 'skillProficiency' as const,
                        grant: {
                          kind: 'choice' as const,
                          choose: 1,
                          pool: {
                            source: 'explicit' as const,
                            skillIds: ['perception', 'athletics', 'stealth'],
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        classes: [
          ...context.catalog.classes,
          {
            id: `${RULESET}:fighter`,
            slug: 'fighter',
            rulesetId: RULESET,
            source: 'system' as const,
            status: 'published' as const,
            campaignId: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            name: 'Fighter',
            primaryAbilities: ['str' as const],
            hitDie: 10 as const,
            proficiencies: {
              savingThrows: ['str' as const, 'con' as const],
              armor: { categories: ['light' as const], items: [] },
              weapons: { categories: ['simple' as const], items: [] },
              skills: { categories: [], items: [] },
            },
            characterCreation: {
              proficiencies: {
                skills: {
                  choices: [
                    {
                      id: 'class-skills',
                      choose: 1,
                      from: ['perception', 'athletics', 'stealth'],
                    },
                  ],
                },
              },
            },
            features: [],
          },
        ],
      },
    }
    const keenId = `species:${RULESET}:elf:trait:keen-senses:skillProficiency`
    const fighterId = buildChoiceSetId('class', `${RULESET}:fighter`, 'class-skills')
    const choices = resolveNpcStartingChoices({
      context: fighterContext,
      seed: { speciesId: `${RULESET}:elf`, classId: `${RULESET}:fighter`, level: 1 },
      preferences,
      startingChoiceOverrides: {
        [keenId]: [perception.id],
        [fighterId]: [athleticsSkill.id],
      },
    })
    const keen = choices.contributions.find((entry) => entry.id === keenId)
    const fighter = choices.contributions.find(
      (entry) => entry.mechanic === 'choice-allowance' && entry.choiceSetId === fighterId,
    )
    expect(keen?.selectedIds).toEqual([perception.id])
    expect(fighter?.selectedIds).toEqual([athleticsSkill.id])
  })

  it('does not emit a fixed-grant contribution for the scout default loadout', () => {
    const arrows = equipmentSchema.parse({
      ...spear,
      id: `${RULESET}:arrows`,
      slug: 'arrows',
      name: 'Arrows',
    })
    const scoutContext = {
      ...context,
      catalog: { ...context.catalog, equipment: [...context.catalog.equipment, arrows] },
    }
    const choices = resolveNpcStartingChoices({
      context: scoutContext,
      seed: { speciesId: dwarfSpecies.id, level: 0, npcTemplateId: 'scout' },
      preferences,
    })
    expect(
      choices.contributions.some(
        (entry) => entry.category === 'equipment' && entry.mechanic === 'fixed-grant',
      ),
    ).toBe(false)
  })
})

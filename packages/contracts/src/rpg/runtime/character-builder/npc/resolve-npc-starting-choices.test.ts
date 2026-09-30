import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../content/equipment'
import type { SkillProficiency } from '../../../content/skill-proficiency'
import { getNpcTemplateEntry } from '../../../vocab/npc/npc-template'
import { buildChoiceSetId, type ChoiceSet } from '../choice-set'
import type { CharacterBuildContext } from '../context'
import { athleticsSkill, createCharacterBuildContext, dwarfSpecies } from '../test-fixtures'
import { npcTemplateSkillChoiceSetId } from '../resolvers/npc-template/resolve-npc-template-role-choices'

import {
  npcStartingChoiceAllowanceIds,
  pruneNpcStartingChoiceOverrides,
  resolveNpcStartingChoiceAllowances,
  resolveNpcStartingChoices,
} from './resolve-npc-starting-choices'

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

function skillChoiceSet(id: string, min: number): ChoiceSet {
  return {
    id,
    sourceType: 'npcTemplate',
    sourceId: 'guard',
    choiceType: 'skillProficiency',
    label: 'Choose skills',
    min,
    max: min,
    required: true,
    options: [
      { id: athleticsSkill.id, label: 'Athletics' },
      { id: perception.id, label: 'Perception' },
      { id: stealth.id, label: 'Stealth' },
    ],
    provenance: { ownerKind: 'npcTemplate', ownerLabel: 'Guard' },
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
    skillSlugs: ['perception', 'athletics', 'intimidation', 'insight'],
    toolSlugs: ['thieves-tools', 'disguise-kit'],
  }

  it('shows Guard kit as a fixed grant and a 2-skill canonical fill', () => {
    const choices = resolveNpcStartingChoices({
      context,
      seed,
      preferences,
      suggestionOwnerLabel: 'Guard',
    })

    const equipment = choices.entries.find((entry) => entry.kind === 'equipment')
    expect(equipment).toMatchObject({
      ownership: 'fixed-grant',
      editable: false,
      selectedIds: [spear.id],
      provenance: { ownerKind: 'npcTemplate', ownerLabel: 'Guard' },
    })

    const skills = choices.entries.find((entry) => entry.kind === 'skill')
    expect(skills).toMatchObject({
      ownership: 'allowance-fill',
      editable: true,
      overridden: false,
      choiceSetId: npcTemplateSkillChoiceSetId('guard'),
      allowance: { chosen: 2, required: 2 },
      selectedIds: [perception.id, athleticsSkill.id],
      provenance: { suggestionOwnerLabel: 'Guard', suggestedBy: 'template' },
    })
    expect(getNpcTemplateEntry('guard')?.recommendations.skillSlugs[0]).toBe('perception')
  })

  it('uses a complete override without padding leftover recommendation ids', () => {
    const choiceSetId = npcTemplateSkillChoiceSetId('guard')
    const choices = resolveNpcStartingChoices({
      context,
      seed,
      preferences,
      suggestionOwnerLabel: 'Guard',
      startingChoiceOverrides: {
        [choiceSetId]: [athleticsSkill.id, stealth.id],
      },
    })

    const skills = choices.entries.find((entry) => entry.choiceSetId === choiceSetId)
    expect(skills?.selectedIds).toEqual([athleticsSkill.id, stealth.id])
    expect(skills?.overridden).toBe(true)
    expect(skills?.provenance.suggestedBy).toBeUndefined()
    expect(skills?.selectedIds).not.toContain(perception.id)
  })

  it('restores the canonical fill when the override key is removed', () => {
    const withOverride = resolveNpcStartingChoices({
      context,
      seed,
      preferences,
      startingChoiceOverrides: {
        [npcTemplateSkillChoiceSetId('guard')]: [athleticsSkill.id, stealth.id],
      },
    })
    const choiceSetId = npcTemplateSkillChoiceSetId('guard')
    expect(
      withOverride.entries.find((entry) => entry.choiceSetId === choiceSetId)?.overridden,
    ).toBe(true)

    const restored = resolveNpcStartingChoices({
      context,
      seed,
      preferences,
      suggestionOwnerLabel: 'Guard',
    })
    expect(
      restored.entries.find((entry) => entry.choiceSetId === choiceSetId)?.selectedIds,
    ).toEqual([perception.id, athleticsSkill.id])
  })

  it('omits a manual weapon already granted by the kit', () => {
    const choices = resolveNpcStartingChoices({
      context,
      seed,
      preferences,
      requiredWeaponIds: [spear.id, longsword.id, spear.id],
    })

    const weapons = choices.entries.find((entry) => entry.kind === 'weapon')
    expect(weapons?.selectedIds).toEqual([longsword.id])
    expect(weapons?.ownership).toBe('manual')
  })

  it('drops an override when its choice-set id is no longer active', () => {
    const active = new Set(
      npcStartingChoiceAllowanceIds(resolveNpcStartingChoices({ context, seed, preferences })),
    )
    const pruned = pruneNpcStartingChoiceOverrides(
      {
        [npcTemplateSkillChoiceSetId('guard')]: [athleticsSkill.id, stealth.id],
        'npcTemplate:criminal:skills': [stealth.id],
      },
      active,
    )
    expect(pruned).toEqual({
      [npcTemplateSkillChoiceSetId('guard')]: [athleticsSkill.id, stealth.id],
    })
  })

  it('keeps two skill allowances independent', () => {
    const firstId = buildChoiceSetId('npcTemplate', 'guard', 'skills')
    const secondId = buildChoiceSetId('class', 'srd-cc-5.2.1:fighter', 'class-skills')
    const entries = resolveNpcStartingChoiceAllowances({
      choiceSets: [skillChoiceSet(firstId, 2), skillChoiceSet(secondId, 1)],
      overrides: {
        [firstId]: [athleticsSkill.id, stealth.id],
        [secondId]: [perception.id],
      },
      preferences: { skillSlugs: ['perception', 'athletics'] },
    })

    expect(entries.map((entry) => entry.choiceSetId)).toEqual([firstId, secondId])
    expect(entries[0]?.selectedIds).toEqual([athleticsSkill.id, stealth.id])
    expect(entries[1]?.selectedIds).toEqual([perception.id])
  })

  it('treats a criminal tool recommendation as an allowance fill', () => {
    const toolSet: ChoiceSet = {
      id: buildChoiceSetId('npcTemplate', 'criminal', 'tools'),
      sourceType: 'npcTemplate',
      sourceId: 'criminal',
      choiceType: 'toolProficiency',
      label: 'Choose 1 role tool',
      min: 1,
      max: 1,
      required: true,
      options: [
        { id: `${RULESET}:thieves-tools`, label: "Thieves' Tools" },
        { id: `${RULESET}:disguise-kit`, label: 'Disguise Kit' },
      ],
      provenance: { ownerKind: 'npcTemplate', ownerLabel: 'Criminal' },
    }
    const [entry] = resolveNpcStartingChoiceAllowances({
      choiceSets: [toolSet],
      preferences: { toolSlugs: ['thieves-tools', 'disguise-kit'] },
      suggestionOwnerLabel: 'Criminal',
    })

    expect(entry).toMatchObject({
      kind: 'tool',
      ownership: 'allowance-fill',
      editable: true,
      selectedIds: [`${RULESET}:thieves-tools`],
      allowance: { required: 1, chosen: 1 },
    })
  })
})

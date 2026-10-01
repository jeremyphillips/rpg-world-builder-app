import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../content/equipment'
import type { ClassStored } from '../../../content/classes/class'
import { createCharacterBuildContext, dwarfSpecies, athleticsSkill } from '../test-fixtures'
import { startingEquipmentChoiceSetId } from '../resolvers/equipment/resolve-starting-equipment-choice-sets'
import {
  resolveNpcTemplateRecommendations,
  toAutomaticNpcBuildPreferences,
} from '../npc/resolve-npc-template-recommendations'
import type { AutomaticNpcBuildSeed } from './automatic-npc-build-seed'
import { resolveAutomaticNpcBuild } from './resolve-automatic-npc-build'
import { nestedStartingEquipmentChoiceSetId } from '../resolvers/equipment/resolve-starting-equipment-choice-sets'

const RULESET = 'srd-cc-5.2.1' as const

const META = {
  rulesetId: RULESET,
  source: 'system' as const,
  status: 'published' as const,
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function weapon(slug: string, category: 'simple' | 'martial' = 'martial') {
  return equipmentSchema.parse({
    ...META,
    id: `${RULESET}:${slug}`,
    slug,
    name: slug,
    description: '',
    cost: { amount: 10, currency: 'gp' },
    weight: { value: 3, unit: 'lb' },
    kind: 'weapon',
    category,
    mode: 'melee',
    damage: { dice: { count: 1, faces: 8 } },
    damageType: 'slashing',
    properties: [],
    mastery: 'sap',
  })
}

function armor(slug: string, category: 'light' | 'medium' | 'heavy' = 'heavy') {
  return equipmentSchema.parse({
    ...META,
    id: `${RULESET}:${slug}`,
    slug,
    name: slug,
    description: '',
    cost: { amount: 50, currency: 'gp' },
    weight: { value: 40, unit: 'lb' },
    kind: 'armor',
    category,
    baseAc: 16,
    addDexModifier: category === 'light',
    stealthDisadvantage: category !== 'light',
    strengthRequirement: category === 'heavy' ? 13 : undefined,
  })
}

const packageFighter: ClassStored = {
  ...META,
  id: `${RULESET}:package-fighter`,
  slug: 'package-fighter',
  name: 'Package Fighter',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: ['light', 'medium', 'heavy'], items: [] },
    weapons: { categories: ['simple', 'martial'], items: [] },
    skills: { categories: [], items: [] },
  },
  characterCreation: {
    proficiencies: {
      skills: { choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }] },
    },
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'heavy-armor',
          label: 'Heavy Armor',
          items: [
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'chain-mail' },
              quantity: 1,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'greatsword' },
              quantity: 1,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'javelin' },
              quantity: 1,
            },
          ],
          wealth: { gp: 4 },
        },
        {
          id: 'skirmisher',
          label: 'Skirmisher',
          items: [
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'studded-leather' },
              quantity: 1,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'scimitar' },
              quantity: 1,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'longbow' },
              quantity: 1,
            },
          ],
          wealth: { gp: 11 },
        },
        { id: 'starting-gold', label: 'Starting Gold', items: [], wealth: { gp: 100 } },
      ],
    },
  },
  features: [],
}

const poolFighter: ClassStored = {
  ...packageFighter,
  id: `${RULESET}:pool-fighter`,
  slug: 'pool-fighter',
  name: 'Pool Fighter',
  characterCreation: {
    proficiencies: packageFighter.characterCreation!.proficiencies,
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'dagger-kit',
          label: 'Dagger Kit',
          items: [
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'dagger' },
              quantity: 1,
            },
          ],
          wealth: { gp: 5 },
        },
        {
          id: 'pool-kit',
          label: 'Pool Kit',
          items: [
            {
              kind: 'choice',
              choose: 1,
              pool: { source: 'filtered', equipmentKind: 'weapon', weaponCategory: 'martial' },
            },
          ],
          wealth: { gp: 5 },
        },
      ],
    },
  },
}

function packageContext(classEntry: ClassStored) {
  const base = createCharacterBuildContext()
  return {
    ...base,
    catalog: {
      ...base.catalog,
      classes: [classEntry],
      equipment: [
        weapon('greatsword'),
        weapon('javelin', 'simple'),
        weapon('scimitar'),
        weapon('longbow'),
        weapon('dagger', 'simple'),
        weapon('greataxe'),
        armor('chain-mail', 'heavy'),
        armor('studded-leather', 'light'),
        armor('leather-armor', 'light'),
      ],
      skillProficiencies: [athleticsSkill],
    },
  }
}

function seed(
  classId: string,
  npcTemplateId?: AutomaticNpcBuildSeed['npcTemplateId'],
): AutomaticNpcBuildSeed {
  return {
    name: 'Test NPC',
    speciesId: dwarfSpecies.id,
    classId,
    level: 1,
    alignment: 'ln',
    gender: 'male',
    ...(npcTemplateId ? { npcTemplateId } : {}),
  }
}

describe('equipment preference package bias', () => {
  it('selects skirmisher for scout role preferences on a dual-package fighter', () => {
    const context = packageContext(packageFighter)
    const preferences = toAutomaticNpcBuildPreferences(
      resolveNpcTemplateRecommendations({
        level: 1,
        userTemplateId: 'scout',
        playableClasses: [packageFighter],
      }),
    )
    const result = resolveAutomaticNpcBuild({
      seed: seed(packageFighter.id, 'scout'),
      context,
      preferences,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.draft.choiceSelections[startingEquipmentChoiceSetId(packageFighter.id)]).toEqual([
      'skirmisher',
    ])
  })

  it('keeps heavy-armor for guard role preferences', () => {
    const context = packageContext(packageFighter)
    const preferences = toAutomaticNpcBuildPreferences(
      resolveNpcTemplateRecommendations({
        level: 1,
        userTemplateId: 'guard',
        playableClasses: [packageFighter],
      }),
    )
    const result = resolveAutomaticNpcBuild({
      seed: seed(packageFighter.id, 'guard'),
      context,
      preferences,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.draft.choiceSelections[startingEquipmentChoiceSetId(packageFighter.id)]).toEqual([
      'heavy-armor',
    ])
  })

  it('lets one user weapon preference beat multiple role matches', () => {
    const context = packageContext(packageFighter)
    const rolePrefs = toAutomaticNpcBuildPreferences(
      resolveNpcTemplateRecommendations({
        level: 1,
        userTemplateId: 'guard',
        playableClasses: [packageFighter],
      }),
    )
    const preferences = {
      ...rolePrefs,
      equipmentPreferences: [
        {
          kind: 'weapon' as const,
          slug: 'longbow',
          source: 'user' as const,
          sourcePriority: 0,
          index: 0,
        },
        ...(rolePrefs.equipmentPreferences ?? []),
      ],
    }
    const result = resolveAutomaticNpcBuild({
      seed: seed(packageFighter.id, 'guard'),
      context,
      preferences,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.draft.choiceSelections[startingEquipmentChoiceSetId(packageFighter.id)]).toEqual([
      'skirmisher',
    ])
  })

  it('prefers a nested pool package when it can satisfy a recommended weapon', () => {
    const context = packageContext(poolFighter)
    const preferences = toAutomaticNpcBuildPreferences(
      resolveNpcTemplateRecommendations({
        level: 1,
        userTemplateId: 'guard',
        playableClasses: [poolFighter],
      }),
    )
    const result = resolveAutomaticNpcBuild({
      seed: seed(poolFighter.id, 'guard'),
      context,
      preferences: {
        ...preferences,
        equipmentPreferences: [
          {
            kind: 'weapon',
            slug: 'greataxe',
            source: 'user',
            sourcePriority: 0,
            index: 0,
          },
        ],
      },
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.draft.choiceSelections[startingEquipmentChoiceSetId(poolFighter.id)]).toEqual([
      'pool-kit',
    ])
    expect(
      result.draft.choiceSelections[
        nestedStartingEquipmentChoiceSetId(poolFighter.id, 'pool-kit', 0)
      ],
    ).toEqual([`${RULESET}:greataxe`])
  })

  it('still honors required weapon constraints over soft preferences', () => {
    const context = packageContext(packageFighter)
    const preferences = toAutomaticNpcBuildPreferences(
      resolveNpcTemplateRecommendations({
        level: 1,
        userTemplateId: 'scout',
        playableClasses: [packageFighter],
      }),
    )
    const result = resolveAutomaticNpcBuild({
      seed: seed(packageFighter.id, 'scout'),
      context,
      preferences,
      constraints: { requiredWeaponIds: [`${RULESET}:greatsword`], requiredSpellIds: [] },
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.draft.choiceSelections[startingEquipmentChoiceSetId(packageFighter.id)]).toEqual([
      'heavy-armor',
    ])
  })
})

import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../content/equipment'
import type { ClassStored } from '../../../content/classes/class'
import { buildChoiceSetId } from '../choice-set'
import type { CharacterBuildContext } from '../context'
import { spellcastingTestContext, wizardClass } from '../spellcasting-test-fixtures'
import { createCharacterBuildContext, dwarfSpecies, athleticsSkill } from '../test-fixtures'
import {
  nestedStartingEquipmentChoiceSetId,
  startingEquipmentChoiceSetId,
} from '../resolvers/equipment/resolve-starting-equipment-choice-sets'

import type { AutomaticNpcBuildSeed } from './automatic-npc-build-seed'
import { listReachableSpellOptions } from './list-reachable-spell-options'
import { listReachableStartingWeapons } from './list-reachable-starting-weapons'
import { resolveAutomaticNpcBuild } from './resolve-automatic-npc-build'

const RULESET = 'srd-cc-5.2.1' as const

const longsword = equipmentSchema.parse({
  id: `${RULESET}:longsword`,
  slug: 'longsword',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Longsword',
  description: '',
  cost: { amount: 15, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'weapon',
  category: 'martial',
  mode: 'melee',
  damage: { dice: { count: 1, faces: 8 } },
  damageType: 'slashing',
  properties: [],
  mastery: 'sap',
})

const dagger = equipmentSchema.parse({
  id: `${RULESET}:dagger`,
  slug: 'dagger',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Dagger',
  description: '',
  cost: { amount: 2, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'weapon',
  category: 'simple',
  mode: 'melee',
  damage: { dice: { count: 1, faces: 4 } },
  damageType: 'piercing',
  properties: ['finesse', 'light', 'thrown'],
  mastery: 'nick',
})

const greataxe = equipmentSchema.parse({
  id: `${RULESET}:greataxe`,
  slug: 'greataxe',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Greataxe',
  description: '',
  cost: { amount: 30, currency: 'gp' },
  weight: { value: 7, unit: 'lb' },
  kind: 'weapon',
  category: 'martial',
  mode: 'melee',
  damage: { dice: { count: 1, faces: 12 } },
  damageType: 'slashing',
  properties: ['heavy', 'two-handed'],
  mastery: 'cleave',
})

const weaponConstraintFighter: ClassStored = {
  id: `${RULESET}:weapon-fighter`,
  slug: 'weapon-fighter',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Weapon Fighter',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: ['light', 'medium'], items: [] },
    weapons: { categories: ['simple', 'martial'], items: [] },
    skills: { categories: [], items: [] },
  },
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }],
      },
    },
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
          id: 'sword-kit',
          label: 'Sword Kit',
          items: [
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'longsword' },
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
              pool: {
                source: 'filtered',
                equipmentKind: 'weapon',
                weaponCategory: 'martial',
              },
            },
          ],
          wealth: { gp: 5 },
        },
        { id: 'starting-gold', label: 'Starting Gold', items: [], wealth: { gp: 50 } },
      ],
    },
  },
  features: [],
}

function weaponConstraintContext(): CharacterBuildContext {
  const base = createCharacterBuildContext()
  return {
    ...base,
    catalog: {
      ...base.catalog,
      classes: [weaponConstraintFighter],
      equipment: [longsword, dagger, greataxe],
      skillProficiencies: [athleticsSkill],
    },
  }
}

function weaponFighterSeed(overrides: Partial<AutomaticNpcBuildSeed> = {}): AutomaticNpcBuildSeed {
  return {
    name: 'Arms Master',
    speciesId: dwarfSpecies.id,
    classId: weaponConstraintFighter.id,
    level: 1,
    alignment: 'ln',
    ...overrides,
  }
}

describe('resolveAutomaticNpcBuild constraints', () => {
  it('prefers a starting package that can provide the required weapon over gold', () => {
    const context = weaponConstraintContext()
    const result = resolveAutomaticNpcBuild({
      seed: weaponFighterSeed(),
      constraints: { requiredWeaponIds: [longsword.id], requiredSpellIds: [] },
      context,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(
      result.draft.choiceSelections[startingEquipmentChoiceSetId(weaponConstraintFighter.id)],
    ).toEqual(['sword-kit'])
  })

  it('selects the required weapon from a nested equipment pool', () => {
    const context = weaponConstraintContext()
    const result = resolveAutomaticNpcBuild({
      seed: weaponFighterSeed(),
      constraints: { requiredWeaponIds: [greataxe.id], requiredSpellIds: [] },
      context,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(
      result.draft.choiceSelections[startingEquipmentChoiceSetId(weaponConstraintFighter.id)],
    ).toEqual(['pool-kit'])
    expect(
      result.draft.choiceSelections[
        nestedStartingEquipmentChoiceSetId(weaponConstraintFighter.id, 'pool-kit', 0)
      ],
    ).toEqual([greataxe.id])
  })

  it('fails with a structured issue when the required weapon is unreachable', () => {
    const context = weaponConstraintContext()
    const result = resolveAutomaticNpcBuild({
      seed: weaponFighterSeed(),
      constraints: {
        requiredWeaponIds: [`${RULESET}:unreachable-weapon`],
        requiredSpellIds: [],
      },
      context,
    })

    expect(result).toMatchObject({
      ok: false,
      issues: [expect.objectContaining({ code: 'automatic_constraint_unsatisfiable' })],
    })
  })

  it('selects a required spell before remaining first-eligible defaults', () => {
    const context: CharacterBuildContext = { ...spellcastingTestContext, characterKind: 'npc' }
    const seed = {
      name: 'Arcane Guard',
      speciesId: `${RULESET}:fixture-dwarf`,
      classId: wizardClass.id,
      level: 1 as const,
      alignment: 'ln' as const,
    }
    const requiredSpellId = `${RULESET}:magic-missile`

    const result = resolveAutomaticNpcBuild({
      seed,
      constraints: { requiredWeaponIds: [], requiredSpellIds: [requiredSpellId] },
      context,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(
      result.draft.choiceSelections[buildChoiceSetId('spellcasting', wizardClass.id, 'spells')],
    ).toContain(requiredSpellId)
  })

  it('is deterministic with the same seed, constraints, and catalog', () => {
    const context = weaponConstraintContext()
    const args = {
      seed: weaponFighterSeed(),
      constraints: { requiredWeaponIds: [longsword.id], requiredSpellIds: [] },
      context,
    }
    const first = resolveAutomaticNpcBuild(args)
    const second = resolveAutomaticNpcBuild(args)

    expect(first).toEqual(second)
  })

  it('produces identical builds for spell requirement order [A,B] and [B,A]', () => {
    const context: CharacterBuildContext = { ...spellcastingTestContext, characterKind: 'npc' }
    const seed = {
      name: 'Arcane Guard',
      speciesId: `${RULESET}:fixture-dwarf`,
      classId: wizardClass.id,
      level: 1 as const,
      alignment: 'ln' as const,
    }
    const spellA = `${RULESET}:magic-missile`
    const spellB = `${RULESET}:shield`

    const first = resolveAutomaticNpcBuild({
      seed,
      constraints: { requiredWeaponIds: [], requiredSpellIds: [spellA, spellB] },
      context,
    })
    const second = resolveAutomaticNpcBuild({
      seed,
      constraints: { requiredWeaponIds: [], requiredSpellIds: [spellB, spellA] },
      context,
    })

    expect(first).toEqual(second)
  })

  it('fails when individually reachable weapons are jointly unsatisfiable', () => {
    const context = weaponConstraintContext()
    const weapons = listReachableStartingWeapons({
      seed: { classId: weaponConstraintFighter.id },
      context,
    })
    expect(weapons.map((weapon) => weapon.id)).toEqual(
      expect.arrayContaining([longsword.id, greataxe.id]),
    )

    const result = resolveAutomaticNpcBuild({
      seed: weaponFighterSeed(),
      constraints: { requiredWeaponIds: [longsword.id, greataxe.id], requiredSpellIds: [] },
      context,
    })

    expect(result).toMatchObject({
      ok: false,
      issues: [expect.objectContaining({ code: 'automatic_constraint_unsatisfiable' })],
    })
  })
})

describe('automatic NPC discovery helpers', () => {
  it('lists reachable starting weapons from non-gold packages', () => {
    const context = weaponConstraintContext()
    const weapons = listReachableStartingWeapons({
      seed: { classId: weaponConstraintFighter.id },
      context,
    })

    expect(weapons.map((weapon) => weapon.id).sort()).toEqual(
      [dagger.id, greataxe.id, longsword.id].sort(),
    )
  })

  it('lists reachable spell options for the seed class level', () => {
    const context: CharacterBuildContext = { ...spellcastingTestContext, characterKind: 'npc' }
    const options = listReachableSpellOptions({
      seed: { classId: wizardClass.id, level: 1 },
      context,
    })

    expect(options.some((option) => option.id === `${RULESET}:magic-missile`)).toBe(true)
    expect(options.some((option) => option.id === `${RULESET}:fireball`)).toBe(false)
  })
})

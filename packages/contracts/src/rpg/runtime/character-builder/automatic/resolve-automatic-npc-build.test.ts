import { describe, expect, it } from 'vitest'

import type { ClassStored } from '../../../content/classes/class'
import type { Species } from '../../../content/species'
import type { SkillProficiency } from '../../../content/skill-proficiency'
import { finalizeNpcCharacterBuild } from '../finalize/finalize-npc'
import type { CharacterBuildContext } from '../context'
import { buildChoiceSetId, isChoiceSetSatisfied } from '../choice-set'
import {
  athleticsSkill as spellcastingAthleticsSkill,
  spellcastingTestContext,
  wizardClass,
} from '../spellcasting-test-fixtures'
import { createCharacterBuildContext, dwarfSpecies, storedFighter } from '../test-fixtures'

import type { AutomaticNpcBuildSeed } from './automatic-npc-build-seed'
import { resolveAutomaticNpcBuild } from './resolve-automatic-npc-build'

const RULESET = 'srd-cc-5.2.1' as const

const acrobaticsSkill = {
  ...spellcastingAthleticsSkill,
  id: `${RULESET}:acrobatics`,
  slug: 'acrobatics',
  name: 'Acrobatics',
  ability: 'dex',
} as const satisfies SkillProficiency

const athleticsSkill = {
  ...spellcastingAthleticsSkill,
  id: `${RULESET}:athletics`,
} as const satisfies SkillProficiency

/** Fighter variant with enough skill options and a starting-equipment package. */
const automaticFighter: ClassStored = {
  ...storedFighter,
  id: `${RULESET}:auto-fighter`,
  slug: 'auto-fighter',
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 2, from: ['athletics', 'acrobatics'] }],
      },
    },
    startingEquipment: {
      choose: 1,
      options: [
        { id: 'standard-kit', label: 'Standard Kit', items: [], wealth: { gp: 9 } },
        { id: 'starting-gold', label: 'Starting Gold', items: [], wealth: { gp: 50 } },
      ],
    },
  },
}

const elfSpecies = {
  ...dwarfSpecies,
  id: `${RULESET}:auto-elf`,
  slug: 'auto-elf',
  name: 'Elf',
  heritage: {
    id: 'elven-lineage',
    name: 'Elven Lineage',
    choose: 1,
    options: [
      { kind: 'custom' as const, id: 'high-elf', name: 'High Elf' },
      { kind: 'custom' as const, id: 'wood-elf', name: 'Wood Elf' },
    ],
  },
} as const satisfies Species

const featChoiceSpecies = {
  ...dwarfSpecies,
  id: `${RULESET}:auto-human`,
  slug: 'auto-human',
  name: 'Human',
  traits: [
    {
      kind: 'custom' as const,
      id: 'versatile',
      name: 'Versatile',
      grantGroups: [
        { grants: [{ kind: 'featChoice' as const, category: 'origin' as const, choose: 1 }] },
      ],
    },
  ],
} as const satisfies Species

function automaticTestContext(
  overrides: Partial<CharacterBuildContext> = {},
): CharacterBuildContext {
  const base = createCharacterBuildContext(overrides)
  return {
    ...base,
    catalog: {
      ...base.catalog,
      species: [dwarfSpecies, elfSpecies, featChoiceSpecies],
      classes: [automaticFighter, storedFighter],
      skillProficiencies: [athleticsSkill, acrobaticsSkill],
      ...overrides.catalog,
    },
  }
}

function fighterSeed(overrides: Partial<AutomaticNpcBuildSeed> = {}): AutomaticNpcBuildSeed {
  return {
    name: 'Guard Captain',
    speciesId: dwarfSpecies.id,
    classId: automaticFighter.id,
    level: 1,
    alignment: 'ln',
    ...overrides,
  }
}

describe('resolveAutomaticNpcBuild', () => {
  it('completes a fighter build with deterministic first-eligible selections', () => {
    const context = automaticTestContext()
    const result = resolveAutomaticNpcBuild({ seed: fighterSeed(), context })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.draft.identity).toEqual({ name: 'Guard Captain', alignment: 'ln' })
    expect(result.draft.species).toEqual({ speciesId: dwarfSpecies.id })
    expect(result.draft.class).toEqual({ classId: automaticFighter.id, level: 1 })

    // Standard array assigned by class priority: str primary receives the highest score.
    expect(result.draft.abilities).toEqual({
      method: 'standard-array',
      scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
    })

    // First eligible skills in authored order.
    expect(
      result.draft.choiceSelections[buildChoiceSetId('class', automaticFighter.id, 'class-skills')],
    ).toEqual([athleticsSkill.id, acrobaticsSkill.id])

    // First starting-equipment package in authored order.
    expect(
      result.draft.choiceSelections[
        buildChoiceSetId('class', automaticFighter.id, 'starting-equipment')
      ],
    ).toEqual(['standard-kit'])

    // Every required ChoiceSet is satisfied.
    for (const choiceSet of result.resolvedChoiceSets) {
      if (!choiceSet.required) continue
      expect(
        isChoiceSetSatisfied(choiceSet, result.draft.choiceSelections[choiceSet.id] ?? []),
      ).toBe(true)
    }
  })

  it('produces a draft that passes canonical finalization', () => {
    const context = automaticTestContext()
    const result = resolveAutomaticNpcBuild({ seed: fighterSeed(), context })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const input = finalizeNpcCharacterBuild(result.draft, context, {
      resolvedChoiceSets: result.resolvedChoiceSets,
    })

    expect(input).toMatchObject({
      name: 'Guard Captain',
      alignment: 'ln',
      classes: [{ classId: automaticFighter.id, level: 1 }],
      species: { id: dwarfSpecies.id },
    })
  })

  it('is deterministic — same seed and content produce deep-equal drafts', () => {
    const context = automaticTestContext()
    const first = resolveAutomaticNpcBuild({ seed: fighterSeed(), context })
    const second = resolveAutomaticNpcBuild({ seed: fighterSeed(), context })

    expect(first.ok).toBe(true)
    expect(second).toEqual(first)
  })

  it('resolves species heritage and syncs species.heritageId', () => {
    const context = automaticTestContext()
    const result = resolveAutomaticNpcBuild({
      seed: fighterSeed({ speciesId: elfSpecies.id }),
      context,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(
      result.draft.choiceSelections[buildChoiceSetId('species', elfSpecies.id, 'heritage')],
    ).toEqual(['high-elf'])
    expect(result.draft.species).toEqual({ speciesId: elfSpecies.id, heritageId: 'high-elf' })
  })

  it('never selects optional choice sets', () => {
    const context = automaticTestContext()
    const result = resolveAutomaticNpcBuild({
      seed: fighterSeed({ speciesId: featChoiceSpecies.id }),
      context,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const optionalSetIds = result.resolvedChoiceSets
      .filter((choiceSet) => !choiceSet.required)
      .map((choiceSet) => choiceSet.id)
    expect(optionalSetIds.length).toBeGreaterThan(0)
    for (const choiceSetId of optionalSetIds) {
      expect(result.draft.choiceSelections[choiceSetId]).toBeUndefined()
    }
  })

  it('resolves required spell selections in canonical (name) order', () => {
    const context: CharacterBuildContext = {
      ...spellcastingTestContext,
      characterKind: 'npc',
    }
    const seed = fighterSeed({
      speciesId: `${RULESET}:fixture-dwarf`,
      classId: wizardClass.id,
    })
    const result = resolveAutomaticNpcBuild({ seed, context })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    // Alphabetical first-eligible; the level-3 spell is not selectable at level 1.
    expect(
      result.draft.choiceSelections[buildChoiceSetId('spellcasting', wizardClass.id, 'cantrips')],
    ).toEqual([`${RULESET}:arcane-bolt`, `${RULESET}:mage-hand`, `${RULESET}:prestidigitation`])
    expect(
      result.draft.choiceSelections[buildChoiceSetId('spellcasting', wizardClass.id, 'spells')],
    ).toEqual([
      `${RULESET}:burning-hands`,
      `${RULESET}:charm-person`,
      `${RULESET}:detect-magic`,
      `${RULESET}:magic-missile`,
    ])
  })

  it('is insensitive to catalog insertion order (resolver-owned canonical order)', () => {
    const context: CharacterBuildContext = { ...spellcastingTestContext, characterKind: 'npc' }
    const reversedContext: CharacterBuildContext = {
      ...context,
      catalog: {
        ...context.catalog,
        spells: [...context.catalog.spells].reverse(),
      },
    }
    const seed = fighterSeed({
      speciesId: `${RULESET}:fixture-dwarf`,
      classId: wizardClass.id,
    })

    const fromOriginal = resolveAutomaticNpcBuild({ seed, context })
    const fromReversed = resolveAutomaticNpcBuild({ seed, context: reversedContext })

    expect(fromOriginal.ok).toBe(true)
    if (!fromOriginal.ok || !fromReversed.ok) return
    expect(fromReversed.draft).toEqual(fromOriginal.draft)
  })

  it('rejects a species id that is not campaign-available', () => {
    const result = resolveAutomaticNpcBuild({
      seed: fighterSeed({ speciesId: 'srd-cc-5.2.1:not-a-species' }),
      context: automaticTestContext(),
    })

    expect(result).toMatchObject({
      ok: false,
      issues: [expect.objectContaining({ code: 'species_not_in_catalog', stepId: 'species' })],
    })
  })

  it('rejects a class id that is not campaign-available', () => {
    const result = resolveAutomaticNpcBuild({
      seed: fighterSeed({ classId: 'srd-cc-5.2.1:not-a-class' }),
      context: automaticTestContext(),
    })

    expect(result).toMatchObject({
      ok: false,
      issues: [expect.objectContaining({ code: 'class_not_in_catalog', stepId: 'class' })],
    })
  })

  it('rejects a level above the campaign maximum', () => {
    const result = resolveAutomaticNpcBuild({
      seed: fighterSeed({ level: 99 }),
      context: automaticTestContext(),
    })

    expect(result).toMatchObject({
      ok: false,
      issues: [expect.objectContaining({ code: 'level_exceeds_campaign_maximum' })],
    })
  })

  it('fails with the existing unsatisfied issue when a required choice set lacks options', () => {
    // storedFighter requires 2 skills but authors only one eligible option.
    const result = resolveAutomaticNpcBuild({
      seed: fighterSeed({ classId: storedFighter.id }),
      context: automaticTestContext(),
    })

    expect(result).toMatchObject({
      ok: false,
      issues: [
        expect.objectContaining({
          code: 'choice_set_unsatisfied',
          choiceSetId: buildChoiceSetId('class', storedFighter.id, 'class-skills'),
        }),
      ],
    })
  })

  it('continues without starting equipment when the class authors no package options', () => {
    const noPackagesFighter: ClassStored = {
      ...automaticFighter,
      id: `${RULESET}:auto-fighter-bare`,
      slug: 'auto-fighter-bare',
      characterCreation: {
        ...automaticFighter.characterCreation,
        startingEquipment: { choose: 1, options: [] },
      },
    }
    const context = automaticTestContext()
    const result = resolveAutomaticNpcBuild({
      seed: fighterSeed({ classId: noPackagesFighter.id }),
      context: {
        ...context,
        catalog: { ...context.catalog, classes: [noPackagesFighter] },
      },
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.draft.equipment?.skipped).toBe(true)
  })

  it('resolves required choices unlocked by multi-level progression', () => {
    const context: CharacterBuildContext = { ...spellcastingTestContext, characterKind: 'npc' }
    const seed = fighterSeed({
      speciesId: `${RULESET}:fixture-dwarf`,
      classId: wizardClass.id,
      level: 5,
    })
    const result = resolveAutomaticNpcBuild({ seed, context })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    // At level 5, third-level spells become selectable and precede later names alphabetically.
    expect(
      result.draft.choiceSelections[buildChoiceSetId('spellcasting', wizardClass.id, 'spells')],
    ).toContain(`${RULESET}:fireball`)

    const input = finalizeNpcCharacterBuild(result.draft, context, {
      resolvedChoiceSets: result.resolvedChoiceSets,
    })
    expect(input.classes).toEqual([{ classId: wizardClass.id, level: 5 }])
  })
})

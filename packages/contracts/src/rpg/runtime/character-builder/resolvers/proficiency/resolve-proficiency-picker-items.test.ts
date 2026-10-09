import { describe, expect, it } from 'vitest'

import { classSchema } from '../../../../content/classes/class'
import type { SkillProficiency } from '../../../../content/skill-proficiency'
import type { Ability } from '../../../../vocab/ability'
import { createEmptyCharacterBuilderDraft, type CharacterBuilderDraft } from '../../draft/draft'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from '../../context'
import type { ChoiceSet } from '../../choice-set'
import { assembleCharacterProficiencies } from '../../assembly/assemble-proficiencies'
import { ABILITY_FIT_RECOMMENDATION_REASON } from '../../recommendation'
import { PICKER_DISABLED_REASON_SELECTION_FULL } from '../picker/picker-item-state'
import { compareProficiencyPickerItemsByRecommendation } from '../picker/proficiency-picker-item'
import { resolveAvailableChoices } from '../registry/resolve-choices'
import { resolveClassSkillChoiceSets } from '../class/resolve-class-skill-choice-sets'
import { resolveLanguageChoiceSets } from '../ruleset/resolve-language-choice-sets'
import {
  resolveProficiencyPickerItems,
  type ProficiencyPickerItem,
} from './resolve-proficiency-picker-items'
import {
  acrobaticsSkill,
  bardClass,
  dwarfSpecies,
  perceptionSkill,
  proficiencyTestCatalog,
  proficiencyTestContext,
  rogueClass,
  stealthSkill,
} from '../../proficiency-test-fixtures'

describe('resolveProficiencyPickerItems', () => {
  const catalogIndex = indexCharacterBuildCatalog(proficiencyTestCatalog)

  it('disables unselected rows when the ChoiceSet is full', () => {
    const choiceSets = resolveClassSkillChoiceSets(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: rogueClass.id, level: 1 },
      },
      catalogIndex,
    )
    const choiceSetId = choiceSets[0]!.id
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: rogueClass.id, level: 1 as const },
      choiceSelections: {
        [choiceSetId]: [stealthSkill.id, acrobaticsSkill.id],
      },
    }
    const proficiencies = assembleCharacterProficiencies(
      draft,
      catalogIndex,
      choiceSets,
      rogueClass,
    )

    const items = resolveProficiencyPickerItems({
      draft,
      context: proficiencyTestContext,
      choiceSetId,
      proficiencies,
    })

    const selected = items.filter((item) => item.state.isAlreadySelected)
    const unselected = items.filter((item) => !item.state.isAlreadySelected)

    expect(selected.length).toBeGreaterThan(0)
    selected.forEach((item) => {
      expect(item.state.disabledReasons).toHaveLength(0)
    })

    expect(unselected).toHaveLength(1)
    expect(unselected[0]?.optionId).toBe(perceptionSkill.id)
    expect(unselected[0]?.state.canSelect).toBe(false)
    expect(unselected[0]?.state.disabledReasons).toContain(PICKER_DISABLED_REASON_SELECTION_FULL)
  })

  it('disables already-granted options that are not selected', () => {
    const choiceSets = resolveClassSkillChoiceSets(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: rogueClass.id, level: 1 },
      },
      catalogIndex,
    )
    const choiceSetId = choiceSets[0]!.id
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: rogueClass.id, level: 1 as const },
      choiceSelections: {
        [choiceSetId]: [acrobaticsSkill.id],
      },
    }
    const proficiencies = assembleCharacterProficiencies(draft, catalogIndex, choiceSets, {
      ...rogueClass,
      proficiencies: {
        ...rogueClass.proficiencies,
        skills: { categories: [], items: ['stealth'] },
      },
    })

    const items = resolveProficiencyPickerItems({
      draft,
      context: proficiencyTestContext,
      choiceSetId,
      proficiencies,
    })

    const stealth = items.find((item) => item.optionId === stealthSkill.id)
    expect(stealth?.state.isAlreadyGranted).toBe(true)
    expect(stealth?.state.canSelect).toBe(false)
    expect(stealth?.state.disabledReasons[0]).toBe('Already granted by Rogue')
  })

  it('marks species language affinities as recommended in language ChoiceSets', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: dwarfSpecies.id },
    }
    const choiceSets = resolveLanguageChoiceSets(draft, proficiencyTestContext)
    const choiceSetId = choiceSets[0]!.id
    const proficiencies = assembleCharacterProficiencies(draft, catalogIndex, choiceSets, undefined)

    const items = resolveProficiencyPickerItems({
      draft,
      context: proficiencyTestContext,
      choiceSetId,
      proficiencies,
    })

    const dwarvish = items.find((item) => item.optionId === 'dwarvish')
    const elvish = items.find((item) => item.optionId === 'elvish')

    expect(dwarvish?.state.isRecommended).toBe(true)
    expect(dwarvish?.state.recommendation).toMatchObject({
      strength: 'strong',
      signals: [
        expect.objectContaining({
          basis: 'affinity',
          source: { kind: 'species', id: dwarfSpecies.id },
        }),
      ],
    })
    expect(dwarvish?.state.presentation?.facts[0]).toMatchObject({
      label: 'Recommended by species',
      sourceKind: 'species',
    })
    expect(elvish?.state.isRecommended).toBe(false)
  })

  it('includes compactSummary for skill proficiency rows', () => {
    const choiceSets = resolveClassSkillChoiceSets(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: rogueClass.id, level: 1 },
      },
      catalogIndex,
    )
    const choiceSetId = choiceSets[0]!.id
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: rogueClass.id, level: 1 as const },
    }
    const proficiencies = assembleCharacterProficiencies(
      draft,
      catalogIndex,
      choiceSets,
      rogueClass,
    )

    const items = resolveProficiencyPickerItems({
      draft,
      context: proficiencyTestContext,
      choiceSetId,
      proficiencies,
    })

    const stealth = items.find((item) => item.optionId === stealthSkill.id)
    expect(stealth?.compactSummary).toEqual({
      abilityLabel: 'Dexterity',
      exampleUses: stealthSkill.examples,
    })
  })
})

const sleightOfHandSkill = {
  id: 'srd-cc-5.2.1:sleight-of-hand',
  slug: 'sleight-of-hand',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Sleight of Hand',
  ability: 'dex',
  examples: ['Palm an object or plant something on someone else'],
} as const satisfies SkillProficiency

const athleticsSkill = {
  id: 'srd-cc-5.2.1:athletics',
  slug: 'athletics',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Athletics',
  ability: 'str',
  examples: ['Jump farther than normal'],
} as const satisfies SkillProficiency

const dexSkillRogue = classSchema.parse({
  ...rogueClass,
  id: 'srd-cc-5.2.1:dex-rogue',
  slug: 'dex-rogue',
  name: 'Dex Rogue',
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [
          {
            id: 'class-skills',
            label: 'Rogue Skills',
            choose: 2,
            from: ['acrobatics', 'sleight-of-hand', 'stealth', 'perception', 'athletics'],
          },
        ],
      },
    },
  },
})

const armedRogue = classSchema.parse({
  ...rogueClass,
  id: 'srd-cc-5.2.1:armed-rogue',
  slug: 'armed-rogue',
  name: 'Armed Rogue',
  features: [
    {
      kind: 'custom',
      id: 'weapon-training',
      name: 'Weapon Training',
      level: 1,
      grantGroups: [
        {
          grants: [
            {
              kind: 'weaponProficiency',
              grant: {
                kind: 'choice',
                choose: 1,
                pool: { source: 'explicit', weaponSlugs: ['longsword', 'dagger'] },
              },
            },
          ],
        },
      ],
    },
    {
      kind: 'custom',
      id: 'armor-training',
      name: 'Armor Training',
      level: 1,
      grantGroups: [
        {
          grants: [
            {
              kind: 'armorTraining',
              grant: {
                kind: 'choice',
                choose: 1,
                pool: { source: 'explicit', armorSlugs: ['leather', 'chain-mail'] },
              },
            },
          ],
        },
      ],
    },
  ],
})

function contextWith(
  classes: CharacterBuildContext['catalog']['classes'],
  skills: SkillProficiency[],
) {
  return {
    ...proficiencyTestContext,
    catalog: {
      ...proficiencyTestCatalog,
      classes: [...proficiencyTestCatalog.classes, ...classes],
      skillProficiencies: [...proficiencyTestCatalog.skillProficiencies, ...skills],
    },
  }
}

function draftFor(
  classId: string | undefined,
  options: {
    scores?: Partial<Record<Ability, number>>
    speciesId?: string
    choiceSelections?: CharacterBuilderDraft['choiceSelections']
  } = {},
): CharacterBuilderDraft {
  return {
    ...createEmptyCharacterBuilderDraft(),
    ...(classId ? { class: { classId, level: 1 as const } } : {}),
    ...(options.speciesId ? { species: { speciesId: options.speciesId } } : {}),
    ...(options.scores ? { abilities: { scores: options.scores } } : {}),
    ...(options.choiceSelections ? { choiceSelections: options.choiceSelections } : {}),
  }
}

function itemsFor(
  context: CharacterBuildContext,
  draft: CharacterBuilderDraft,
  choiceType: ChoiceSet['choiceType'],
) {
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const choiceSets = resolveAvailableChoices(draft, context)
  const choiceSet = choiceSets.find((entry) => entry.choiceType === choiceType)
  if (!choiceSet) throw new Error(`missing ${choiceType}`)
  const characterClass = draft.class.classId
    ? catalogIndex.classes.get(draft.class.classId)
    : undefined
  const proficiencies = assembleCharacterProficiencies(
    draft,
    catalogIndex,
    choiceSets,
    characterClass,
  )
  return resolveProficiencyPickerItems({
    draft,
    context,
    choiceSetId: choiceSet.id,
    proficiencies,
  })
}

function labelsByStrength(items: readonly ProficiencyPickerItem[]): string[] {
  return [...items].sort(compareProficiencyPickerItemsByRecommendation).map((item) => item.label)
}

function labelsByRecommendedBoolean(items: readonly ProficiencyPickerItem[]): string[] {
  return [...items]
    .sort((left, right) => {
      if (left.state.isRecommended !== right.state.isRecommended) {
        return left.state.isRecommended ? -1 : 1
      }
      return left.label.localeCompare(right.label, undefined, { sensitivity: 'base' })
    })
    .map((item) => item.label)
}

function expectNeutralNameOrder(items: readonly ProficiencyPickerItem[]) {
  expect(items.length).toBeGreaterThan(1)
  expect(items.every((item) => item.state.recommendation.strength === 'neutral')).toBe(true)
  expect(items.every((item) => !item.state.isRecommended)).toBe(true)
  const byName = [...items]
    .map((item) => item.label)
    .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: 'base' }))
  expect(labelsByStrength(items)).toEqual(labelsByRecommendedBoolean(items))
  expect(labelsByStrength(items)).toEqual(byName)
}

describe('proficiency recommendation order', () => {
  const skillContext = contextWith(
    [dexSkillRogue, armedRogue],
    [sleightOfHandSkill, athleticsSkill],
  )

  it('keeps skill, tool, weapon, and armor rows neutral and name-sorted', () => {
    const skillDraft = draftFor(rogueClass.id)
    expectNeutralNameOrder(itemsFor(proficiencyTestContext, skillDraft, 'skillProficiency'))

    const toolDraft = draftFor(bardClass.id)
    expectNeutralNameOrder(itemsFor(proficiencyTestContext, toolDraft, 'toolProficiency'))

    const armedDraft = draftFor(armedRogue.id)
    expectNeutralNameOrder(itemsFor(skillContext, armedDraft, 'weaponProficiency'))
    expectNeutralNameOrder(itemsFor(skillContext, armedDraft, 'armorTraining'))
  })

  it('keeps language species affinity on the strong band', () => {
    const items = itemsFor(
      proficiencyTestContext,
      draftFor(undefined, { speciesId: dwarfSpecies.id }),
      'language',
    )
    const dwarvish = items.find((item) => item.optionId === 'dwarvish')

    expect(dwarvish?.state.recommendation.strength).toBe('strong')
    expect(items.some((item) => item.state.recommendation.strength === 'compatible')).toBe(false)
    expect(labelsByStrength(items)).toEqual(labelsByRecommendedBoolean(items))
    expect(labelsByStrength(items)[0]).toBe('Dwarvish')
  })
})

function expectAbilityFit(item: ProficiencyPickerItem | undefined) {
  expect(item?.state.isRecommended).toBe(false)
  expect(item?.state.recommendation).toEqual({
    strength: 'compatible',
    signals: [
      {
        strength: 'compatible',
        basis: 'inferred',
        specificity: 'exact',
        reason: ABILITY_FIT_RECOMMENDATION_REASON,
      },
    ],
  })
  expect(item?.state.recommendation.signals[0]).not.toHaveProperty('detail')
  expect(item?.state.presentation).toBeUndefined()
}

describe('skill ability fit', () => {
  const skillContext = contextWith(
    [dexSkillRogue, armedRogue],
    [sleightOfHandSkill, athleticsSkill],
  )
  const dexHighest = { str: 10, dex: 16, con: 10, int: 10, wis: 10, cha: 10 }

  it('marks skills governed by the strongest positive ability', () => {
    const items = itemsFor(
      skillContext,
      draftFor(dexSkillRogue.id, { scores: dexHighest }),
      'skillProficiency',
    )
    const compatible = items.filter((item) => item.state.recommendation.strength === 'compatible')

    expect(compatible.map((item) => item.label).sort()).toEqual([
      'Acrobatics',
      'Sleight of Hand',
      'Stealth',
    ])
    compatible.forEach((item) => expectAbilityFit(item))
    expect(
      items.find((item) => item.optionId === perceptionSkill.id)?.state.recommendation.strength,
    ).toBe('neutral')
    expect(
      items.find((item) => item.optionId === athleticsSkill.id)?.state.recommendation.strength,
    ).toBe('neutral')
  })

  it('marks every ability tied for the highest modifier', () => {
    const items = itemsFor(
      skillContext,
      draftFor(dexSkillRogue.id, {
        scores: { str: 8, dex: 15, con: 10, int: 10, wis: 14, cha: 10 },
      }),
      'skillProficiency',
    )

    expect(
      items
        .filter((item) => item.state.recommendation.strength === 'compatible')
        .map((item) => item.label)
        .sort(),
    ).toEqual(['Acrobatics', 'Perception', 'Sleight of Hand', 'Stealth'])
    expect(
      items.find((item) => item.optionId === athleticsSkill.id)?.state.recommendation.strength,
    ).toBe('neutral')
  })

  it('marks nothing when the highest modifier is not positive or scores are unset', () => {
    const floorDraft = draftFor(dexSkillRogue.id, {
      scores: { str: 8, dex: 11, con: 10, int: 9, wis: 8, cha: 10 },
    })
    const unsetDraft = draftFor(dexSkillRogue.id)

    for (const draft of [floorDraft, unsetDraft]) {
      const items = itemsFor(skillContext, draft, 'skillProficiency')
      expect(items.every((item) => item.state.recommendation.strength === 'neutral')).toBe(true)
    }
  })

  it('leaves language, tool, weapon, and armor rows neutral when an ability leads', () => {
    const languageItems = itemsFor(
      skillContext,
      draftFor(undefined, { scores: dexHighest, speciesId: dwarfSpecies.id }),
      'language',
    )
    expect(
      languageItems.find((item) => item.optionId === 'dwarvish')?.state.recommendation.strength,
    ).toBe('strong')
    expect(
      languageItems.find((item) => item.optionId === 'elvish')?.state.recommendation.strength,
    ).toBe('neutral')
    expect(languageItems.some((item) => item.state.recommendation.strength === 'compatible')).toBe(
      false,
    )

    const toolItems = itemsFor(
      skillContext,
      draftFor(bardClass.id, { scores: dexHighest }),
      'toolProficiency',
    )
    expect(toolItems.every((item) => item.state.recommendation.strength === 'neutral')).toBe(true)

    const armedDraft = draftFor(armedRogue.id, { scores: dexHighest })
    expect(
      itemsFor(skillContext, armedDraft, 'weaponProficiency').every(
        (item) => item.state.recommendation.strength === 'neutral',
      ),
    ).toBe(true)
    expect(
      itemsFor(skillContext, armedDraft, 'armorTraining').every(
        (item) => item.state.recommendation.strength === 'neutral',
      ),
    ).toBe(true)
  })

  it('keeps the signal on granted and selected skills without a recommendation fact', () => {
    const choiceSets = resolveAvailableChoices(
      draftFor(dexSkillRogue.id, { scores: dexHighest }),
      skillContext,
    )
    const choiceSetId = choiceSets.find((entry) => entry.choiceType === 'skillProficiency')!.id
    const catalogIndex = indexCharacterBuildCatalog(skillContext.catalog)
    const grantedDraft = draftFor(dexSkillRogue.id, {
      scores: dexHighest,
      choiceSelections: { [choiceSetId]: [acrobaticsSkill.id] },
    })
    const proficiencies = assembleCharacterProficiencies(grantedDraft, catalogIndex, choiceSets, {
      ...dexSkillRogue,
      proficiencies: {
        ...dexSkillRogue.proficiencies,
        skills: { categories: [], items: ['stealth'] },
      },
    })
    const items = resolveProficiencyPickerItems({
      draft: grantedDraft,
      context: skillContext,
      choiceSetId,
      proficiencies,
    })

    const stealth = items.find((item) => item.optionId === stealthSkill.id)
    const acrobatics = items.find((item) => item.optionId === acrobaticsSkill.id)
    expect(stealth?.state.isAlreadyGranted).toBe(true)
    expect(acrobatics?.state.isAlreadySelected).toBe(true)
    expectAbilityFit(stealth)
    expectAbilityFit(acrobatics)
  })
})

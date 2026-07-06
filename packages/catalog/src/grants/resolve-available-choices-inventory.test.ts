import { describe, expect, it } from 'vitest'
import {
  createEmptyCharacterBuilderDraft,
  resolveAvailableChoices,
  type CharacterBuildContext,
} from '@rpg/contracts'
import { resolveCharacterCreationPatch } from '@rpg/contracts'
import { defaultCampaignMechanicsPatch } from '@rpg/contracts'
import { DEFAULT_ABILITY_GENERATION_RULES } from '@rpg/contracts'

import { loadSeedClasses } from '../classes'
import { loadSeedSpecies } from '../species'
import { loadSeedSkillProficiencies } from '../skill-proficiencies'
import { standardStartingWealthSeed } from '../starting-wealth/test-fixtures'

const RULESET = 'srd-cc-5.2.1' as const

function seedBuildContext(): CharacterBuildContext {
  return {
    mode: 'dashboard',
    scope: { type: 'standalone', rulesetId: RULESET },
    rulesetId: RULESET,
    catalog: {
      species: loadSeedSpecies(RULESET),
      classes: loadSeedClasses(RULESET),
      spells: [],
      equipment: [],
      skillProficiencies: loadSeedSkillProficiencies(RULESET),
    },
    characterCreationRules: {
      ...resolveCharacterCreationPatch(undefined, standardStartingWealthSeed()),
      abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
      armorClass: defaultCampaignMechanicsPatch().armorClass,
    },
    permissions: { canCreateCharacter: true },
  }
}

function choiceShapeKeys(choiceSets: ReturnType<typeof resolveAvailableChoices>): string[] {
  const keys = new Set<string>()

  for (const choiceSet of choiceSets) {
    if (choiceSet.id.endsWith(':heritage')) keys.add('heritage')
    if (choiceSet.id.endsWith(':skills')) keys.add('classSkills:choose:from')
    if (choiceSet.choiceType === 'feat') {
      keys.add(
        choiceSet.label.toLowerCase().includes('fighting')
          ? 'featChoice:fighting-style'
          : 'featChoice:origin',
      )
    }
  }

  return [...keys].sort()
}

describe('resolveAvailableChoices against srd-cc-5.2.1 seeds', () => {
  const context = seedBuildContext()

  it('covers heritage choices for every species with heritage options', () => {
    for (const species of context.catalog.species) {
      if (!species.heritage) continue

      const draft = {
        ...createEmptyCharacterBuilderDraft(),
        species: { speciesId: species.id },
      }

      const heritage = resolveAvailableChoices(draft, context).find((choiceSet) =>
        choiceSet.id.endsWith(':heritage'),
      )

      expect(heritage, species.slug).toMatchObject({
        choiceType: 'trait',
        min: 1,
        max: 1,
        required: true,
        options: species.heritage.options.map((option) => ({ id: option.id })),
      })
    }
  })

  it('covers class skill choices for every seeded class', () => {
    for (const characterClass of context.catalog.classes) {
      const draft = {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: characterClass.id, level: 1 as const },
      }

      const skills = resolveAvailableChoices(draft, context).find((choiceSet) =>
        choiceSet.id.endsWith(':skills'),
      )

      expect(skills, characterClass.slug).toMatchObject({
        choiceType: 'skillProficiency',
        min: characterClass.proficiencies.skills.choose,
        max: characterClass.proficiencies.skills.choose,
        required: true,
      })
      expect(skills?.options.length).toBe(characterClass.proficiencies.skills.from?.length ?? 0)
    }
  })

  it('documents BENCH-087 choice shapes present in seeds (excluding BENCH-089)', () => {
    const shapes = new Set<string>()

    for (const species of context.catalog.species) {
      if (!species.heritage) continue
      const draft = {
        ...createEmptyCharacterBuilderDraft(),
        species: { speciesId: species.id },
      }
      for (const key of choiceShapeKeys(resolveAvailableChoices(draft, context))) {
        shapes.add(key)
      }
    }

    for (const characterClass of context.catalog.classes) {
      const draft = {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: characterClass.id, level: 1 as const },
      }
      for (const key of choiceShapeKeys(resolveAvailableChoices(draft, context))) {
        shapes.add(key)
      }

      const combinedDraft = {
        ...createEmptyCharacterBuilderDraft(),
        species: { speciesId: 'srd-cc-5.2.1:human' },
        class: { classId: characterClass.id, level: 1 as const },
      }
      if (characterClass.slug === 'fighter') {
        for (const key of choiceShapeKeys(resolveAvailableChoices(combinedDraft, context))) {
          shapes.add(key)
        }
      }
    }

    expect([...shapes].sort()).toEqual([
      'classSkills:choose:from',
      'featChoice:fighting-style',
      'featChoice:origin',
      'heritage',
    ])
  })

  it('emits starting-equipment ChoiceSets for every seeded class with packages', () => {
    for (const characterClass of context.catalog.classes) {
      if (!characterClass.characterCreation?.startingEquipment) continue

      const draft = {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: characterClass.id, level: 1 as const },
      }

      const startingEquipment = resolveAvailableChoices(draft, context).find((choiceSet) =>
        choiceSet.id.endsWith(':starting-equipment'),
      )

      expect(startingEquipment, characterClass.slug).toMatchObject({
        choiceType: 'equipment',
        min: 1,
        max: 1,
        required: true,
        options: characterClass.characterCreation.startingEquipment.options.map((option) => ({
          id: option.id,
        })),
      })
    }
  })
})

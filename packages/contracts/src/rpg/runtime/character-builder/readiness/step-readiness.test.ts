import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../content/equipment'
import type { ClassStored } from '../../../content/classes/class'
import { formatFieldMessage } from '../../../../validation/define-message'
import { characterBuilderStepReadinessMessages } from '../messages/character-builder-messages'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import type { CharacterBuilderDraft } from '../draft/draft'
import { indexCharacterBuildCatalog, type CharacterBuildCatalog } from '../context'
import { resolveAvailableChoices } from '../resolvers/registry/resolve-choices'
import { buildChoiceSetId } from '../choice-set'
import { startingEquipmentChoiceSetId } from '../resolvers/equipment/resolve-starting-equipment-choice-sets'
import {
  proficiencyTestContext,
  rogueClass,
  stealthSkill,
  acrobaticsSkill,
  luteTool,
  fluteTool,
  monkClass,
} from '../proficiency-test-fixtures'
import { ORIGIN_LANGUAGES_CHOICE_ID } from '../../../primitives/proficiency/character-creation-proficiency-rules'
import {
  nonCasterClass,
  spellcastingTestContext,
  wizardCantrips,
  wizardClass,
  wizardLevelOneSpells,
} from '../spellcasting-test-fixtures'
import { builderTestContext, fighterClass } from '../test-fixtures'
import { minimalStartingWealthSeedCoveringStandardMax } from '../../../../test/fixtures/starting-wealth-minimal'
import { resolveCharacterCreationPatch } from '../../../campaign/patches/campaign-character-creation-patch'
import { resolveBuilderStepReadiness } from './step-readiness'
import { formatStepReadinessMessage } from './step-readiness-helpers'

const RULESET = 'srd-cc-5.2.1' as const

const leatherArmor = equipmentSchema.parse({
  id: `${RULESET}:leather-armor`,
  slug: 'leather-armor',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Leather Armor',
  description: '',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 10, unit: 'lb' },
  kind: 'armor',
  category: 'light',
  baseAc: 11,
  addDexModifier: true,
  stealthDisadvantage: false,
})

const rations = equipmentSchema.parse({
  id: `${RULESET}:rations`,
  slug: 'rations',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Rations',
  description: '',
  kind: 'adventuring_gear',
  gearKind: 'consumable',
  cost: { amount: 5, currency: 'sp' },
  weight: { value: 2, unit: 'lb' },
})

const equipmentBardClass: ClassStored = {
  id: `${RULESET}:bard`,
  slug: 'bard',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Bard',
  primaryAbilities: ['cha'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['dex', 'cha'],
    armor: { categories: ['light'], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
  characterCreation: {
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'standard-equipment',
          label: 'Standard Equipment',
          items: [
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'leather-armor' },
              quantity: 1,
              equipped: true,
            },
          ],
        },
      ],
    },
  },
}

const equipmentMonkClass: ClassStored = {
  ...monkClass,
  characterCreation: {
    ...monkClass.characterCreation,
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'standard-equipment',
          label: 'Standard Equipment',
          items: [
            {
              kind: 'grant',
              target: { source: 'proficiency_choice', choiceId: 'class-tools' },
              quantity: 1,
            },
          ],
        },
      ],
    },
  },
}

const equipmentTestContext = {
  ...builderTestContext,
  catalog: {
    ...builderTestContext.catalog,
    classes: [fighterClass, equipmentBardClass],
    equipment: [leatherArmor, rations],
  },
}

function draftWith(overrides: Partial<CharacterBuilderDraft>): CharacterBuilderDraft {
  return { ...createEmptyCharacterBuilderDraft(), ...overrides }
}

function catalogFor(classes: ClassStored[]): CharacterBuildCatalog {
  return {
    species: [],
    classes,
    spells: [],
    equipment: [leatherArmor, rations],
    skillProficiencies: [],
    organizations: [],
    languages: [],
  }
}

describe('resolveBuilderStepReadiness', () => {
  describe('spells', () => {
    it('blocks before class selection', () => {
      const choiceSets = resolveAvailableChoices(draftWith({}), spellcastingTestContext)

      expect(
        resolveBuilderStepReadiness('spells', draftWith({}), spellcastingTestContext, choiceSets),
      ).toEqual({
        readiness: 'blocked',
        message: formatFieldMessage(characterBuilderStepReadinessMessages.spellsBlockedNoClass()),
      })
    })

    it('marks non-casters notApplicable after class selection', () => {
      const draft = draftWith({ class: { classId: nonCasterClass.id, level: 1 } })
      const choiceSets = resolveAvailableChoices(draft, spellcastingTestContext)

      expect(
        resolveBuilderStepReadiness('spells', draft, spellcastingTestContext, choiceSets),
      ).toEqual({
        readiness: 'notApplicable',
        message: formatFieldMessage(
          characterBuilderStepReadinessMessages.spellsNotApplicableNoSpellcasting({
            className: 'Fighter',
          }),
        ),
      })
    })

    it('marks inactive spellcasting notApplicable at the draft level', () => {
      const delayedCaster = {
        ...wizardClass,
        spellcasting: {
          ...wizardClass.spellcasting!,
          level: 2,
        },
      }
      const context = {
        ...spellcastingTestContext,
        catalog: {
          ...spellcastingTestContext.catalog,
          classes: [delayedCaster],
        },
      }
      const draft = draftWith({ class: { classId: delayedCaster.id, level: 1 } })
      const choiceSets = resolveAvailableChoices(draft, context)

      expect(resolveBuilderStepReadiness('spells', draft, context, choiceSets)).toEqual({
        readiness: 'notApplicable',
        message: formatFieldMessage(
          characterBuilderStepReadinessMessages.spellsNotApplicableInactiveAtLevel({
            className: 'Wizard',
            level: 1,
          }),
        ),
      })
    })

    it('returns readyWithChoices while spell picks are pending', () => {
      const draft = draftWith({ class: { classId: wizardClass.id, level: 1 } })
      const choiceSets = resolveAvailableChoices(draft, spellcastingTestContext)

      expect(
        resolveBuilderStepReadiness('spells', draft, spellcastingTestContext, choiceSets),
      ).toEqual({
        readiness: 'readyWithChoices',
      })
    })

    it('returns complete when required spell choices are satisfied', () => {
      const draft = draftWith({
        class: { classId: wizardClass.id, level: 1 },
        choiceSelections: {
          [`spellcasting:${wizardClass.id}:cantrips`]: wizardCantrips
            .slice(0, 3)
            .map((spell) => spell.id),
          [`spellcasting:${wizardClass.id}:spells`]: wizardLevelOneSpells
            .slice(0, 4)
            .map((spell) => spell.id),
        },
      })
      const choiceSets = resolveAvailableChoices(draft, spellcastingTestContext)

      expect(
        resolveBuilderStepReadiness('spells', draft, spellcastingTestContext, choiceSets),
      ).toEqual({
        readiness: 'complete',
        message: formatFieldMessage(characterBuilderStepReadinessMessages.spellsReviewComplete()),
      })
    })
  })

  describe('equipment', () => {
    it('blocks before class selection', () => {
      expect(
        resolveBuilderStepReadiness('equipment', draftWith({}), equipmentTestContext, []),
      ).toEqual({
        readiness: 'blocked',
        message: formatFieldMessage(
          characterBuilderStepReadinessMessages.equipmentBlockedNoClass(),
        ),
      })
    })

    it('returns readyEmpty when the class has no starting equipment choices', () => {
      const draft = draftWith({ class: { classId: fighterClass.id, level: 1 } })
      const catalogIndex = indexCharacterBuildCatalog(equipmentTestContext.catalog)
      const choiceSets = resolveAvailableChoices(draft, equipmentTestContext)

      expect(
        catalogIndex.classes.get(fighterClass.id)?.characterCreation?.startingEquipment,
      ).toBeUndefined()
      expect(
        resolveBuilderStepReadiness('equipment', draft, equipmentTestContext, choiceSets),
      ).toEqual({
        readiness: 'readyEmpty',
        message: formatFieldMessage(characterBuilderStepReadinessMessages.equipmentNoOptions()),
      })
    })

    it('returns readyWithChoices when package selection is pending', () => {
      const draft = draftWith({ class: { classId: equipmentBardClass.id, level: 1 } })
      const choiceSets = resolveAvailableChoices(draft, equipmentTestContext)

      expect(
        resolveBuilderStepReadiness('equipment', draft, equipmentTestContext, choiceSets),
      ).toEqual({
        readiness: 'readyWithChoices',
      })
    })

    it('returns complete when the player skipped starting equipment', () => {
      const draft = draftWith({
        class: { classId: equipmentBardClass.id, level: 1 },
        equipment: {
          mode: 'package',
          purchases: [],
          removedPackageItemKeys: [],
          customized: false,
          skipped: true,
        },
      })

      expect(resolveBuilderStepReadiness('equipment', draft, equipmentTestContext, [])).toEqual({
        readiness: 'complete',
        message: formatFieldMessage(
          characterBuilderStepReadinessMessages.equipmentContinuingWithout(),
        ),
      })
    })

    it('returns complete when required equipment choices are satisfied', () => {
      const draft = draftWith({
        class: { classId: equipmentBardClass.id, level: 1 },
        choiceSelections: {
          [startingEquipmentChoiceSetId(equipmentBardClass.id)]: ['standard-equipment'],
        },
      })
      const choiceSets = resolveAvailableChoices(draft, equipmentTestContext)

      expect(
        resolveBuilderStepReadiness('equipment', draft, equipmentTestContext, choiceSets),
      ).toEqual({
        readiness: 'complete',
      })
    })

    it('stays complete when gold purchases include multi-quantity stackables', () => {
      const draft = draftWith({
        class: { classId: equipmentBardClass.id, level: 1 },
        choiceSelections: {
          [startingEquipmentChoiceSetId(equipmentBardClass.id)]: ['starting-gold'],
        },
        equipment: {
          mode: 'gold',
          purchases: [
            {
              equipmentId: rations.id,
              quantity: 4,
              sourceMode: 'startingGold',
              origin: 'picker',
            },
          ],
          removedPackageItemKeys: [],
          customized: false,
        },
      })
      const choiceSets = resolveAvailableChoices(draft, equipmentTestContext)

      expect(
        resolveBuilderStepReadiness('equipment', draft, equipmentTestContext, choiceSets),
      ).toEqual({
        readiness: 'complete',
      })
    })

    it('stays incomplete when a linked proficiency grant is still pending', () => {
      const draft = draftWith({
        class: { classId: equipmentMonkClass.id, level: 1 },
        choiceSelections: {
          [startingEquipmentChoiceSetId(equipmentMonkClass.id)]: ['standard-equipment'],
        },
      })
      const monkContext = {
        ...equipmentTestContext,
        catalog: {
          ...equipmentTestContext.catalog,
          classes: [...equipmentTestContext.catalog.classes, equipmentMonkClass],
          equipment: [leatherArmor, luteTool, fluteTool],
        },
      }
      const choiceSets = resolveAvailableChoices(draft, monkContext)

      expect(resolveBuilderStepReadiness('equipment', draft, monkContext, choiceSets)).toEqual({
        readiness: 'readyWithChoices',
        message: formatFieldMessage(
          characterBuilderStepReadinessMessages.equipmentPendingIncludedTool(),
        ),
      })
    })

    it('completes when the linked proficiency answer is satisfied', () => {
      const monkToolChoiceSetId = buildChoiceSetId('class', equipmentMonkClass.id, 'class-tools')
      const draft = draftWith({
        class: { classId: equipmentMonkClass.id, level: 1 },
        choiceSelections: {
          [startingEquipmentChoiceSetId(equipmentMonkClass.id)]: ['standard-equipment'],
          [monkToolChoiceSetId]: [luteTool.id],
        },
      })
      const monkContext = {
        ...equipmentTestContext,
        catalog: {
          ...equipmentTestContext.catalog,
          classes: [...equipmentTestContext.catalog.classes, equipmentMonkClass],
          equipment: [leatherArmor, luteTool, fluteTool],
        },
      }
      const choiceSets = resolveAvailableChoices(draft, monkContext)

      expect(resolveBuilderStepReadiness('equipment', draft, monkContext, choiceSets)).toEqual({
        readiness: 'complete',
      })
    })

    it('stays incomplete when exact magic-item grants remain after skip', () => {
      const magicItemContext = {
        ...equipmentTestContext,
        characterCreationRules: {
          ...equipmentTestContext.characterCreationRules,
          ...resolveCharacterCreationPatch(undefined, minimalStartingWealthSeedCoveringStandardMax),
        },
      }
      const draft = draftWith({
        class: { classId: equipmentBardClass.id, level: 2 },
        equipment: {
          mode: 'package',
          purchases: [],
          removedPackageItemKeys: [],
          customized: false,
          skipped: true,
          magicItemSelections: [],
        },
      })

      expect(resolveBuilderStepReadiness('equipment', draft, magicItemContext, [])).toEqual({
        readiness: 'readyWithChoices',
        message: formatStepReadinessMessage(
          characterBuilderStepReadinessMessages.equipmentMagicItemGrantIncomplete,
          {
            rarityLabel: 'Common',
            remaining: 1,
          },
        ),
      })
    })

    it('reports invalid linked proficiency answers separately from pending guidance', () => {
      const monkToolChoiceSetId = buildChoiceSetId('class', equipmentMonkClass.id, 'class-tools')
      const draft = draftWith({
        class: { classId: equipmentMonkClass.id, level: 1 },
        choiceSelections: {
          [startingEquipmentChoiceSetId(equipmentMonkClass.id)]: ['standard-equipment'],
          [monkToolChoiceSetId]: [luteTool.id, fluteTool.id],
        },
      })
      const monkContext = {
        ...equipmentTestContext,
        catalog: {
          ...equipmentTestContext.catalog,
          classes: [...equipmentTestContext.catalog.classes, equipmentMonkClass],
          equipment: [leatherArmor, luteTool, fluteTool],
        },
      }
      const choiceSets = resolveAvailableChoices(draft, monkContext)

      expect(resolveBuilderStepReadiness('equipment', draft, monkContext, choiceSets)).toEqual({
        readiness: 'readyWithChoices',
        message: 'Proficiency choice must have exactly one selected option.',
      })
    })
  })

  describe('proficiencies', () => {
    it('partially blocks class-dependent content before class selection', () => {
      const draft = draftWith({})
      const choiceSets = resolveAvailableChoices(draft, proficiencyTestContext)

      expect(
        resolveBuilderStepReadiness('proficiencies', draft, proficiencyTestContext, choiceSets),
      ).toEqual({
        readiness: 'blocked',
        classDependentBlocked: true,
        message: formatFieldMessage(
          characterBuilderStepReadinessMessages.proficienciesBlockedNoClass(),
        ),
        helperText: formatFieldMessage(
          characterBuilderStepReadinessMessages.proficienciesBlockedNoClassHelper(),
        ),
      })
    })

    it('returns readyWithChoices while rogue skill picks are pending', () => {
      const draft = draftWith({ class: { classId: rogueClass.id, level: 1 } })
      const choiceSets = resolveAvailableChoices(draft, proficiencyTestContext)

      expect(
        resolveBuilderStepReadiness('proficiencies', draft, proficiencyTestContext, choiceSets),
      ).toEqual({
        readiness: 'readyWithChoices',
      })
    })

    it('returns complete when required proficiency choices are satisfied', () => {
      const draft = draftWith({
        class: { classId: rogueClass.id, level: 1 },
        choiceSelections: {
          'class:srd-cc-5.2.1:rogue:class-skills': [stealthSkill.id, acrobaticsSkill.id],
          [`ruleset:${RULESET}:${ORIGIN_LANGUAGES_CHOICE_ID}`]: ['elvish', 'dwarvish'],
        },
      })
      const choiceSets = resolveAvailableChoices(draft, proficiencyTestContext)

      expect(
        resolveBuilderStepReadiness('proficiencies', draft, proficiencyTestContext, choiceSets),
      ).toEqual({
        readiness: 'complete',
        message: formatFieldMessage(
          characterBuilderStepReadinessMessages.proficienciesReviewComplete(),
        ),
      })
    })

    it('returns readyEmpty when the class has no proficiency ChoiceSets', () => {
      const bareClass: ClassStored = {
        ...fighterClass,
        characterCreation: {},
      }
      const context = {
        ...builderTestContext,
        catalog: catalogFor([bareClass]),
      }
      const draft = draftWith({ class: { classId: bareClass.id, level: 1 } })
      const choiceSets = resolveAvailableChoices(draft, context)

      expect(resolveBuilderStepReadiness('proficiencies', draft, context, choiceSets)).toEqual({
        readiness: 'readyEmpty',
        message: formatFieldMessage(
          characterBuilderStepReadinessMessages.proficienciesNoChoicesRequired(),
        ),
      })
    })
  })
})

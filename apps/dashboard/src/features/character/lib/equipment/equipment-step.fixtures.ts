import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'
import {
  DEFAULT_ABILITY_GENERATION_RULES,
  DEFAULT_SYSTEM_RULESET_ID,
  defaultCampaignMechanicsPatch,
  indexCharacterBuildCatalog,
  resolveCharacterCreationPatch,
  type CharacterBuildContext,
  type StartingWealthRules,
} from '@rpg/contracts'

import { pickEquipment } from '@/test/fixtures/pick'
import { makeClassStored } from '@/test/fixtures/factories/additional/class-stored'

export const equipmentStepBreastplateFixture = pickEquipment('breastplate')

export const equipmentStepLeatherArmorFixture = pickEquipment('leather-armor')

export const equipmentStepLuteFixture = pickEquipment('lute')

export const equipmentStepDrumFixture = pickEquipment('drum')

export const equipmentStepPotionOfHealingFixture = pickEquipment('potion-of-healing')

export const equipmentStepRationsFixture = pickEquipment('rations')

export const equipmentStepSpearFixture = pickEquipment('spear')

export const equipmentStepBattleaxeFixture = pickEquipment('battleaxe')

export const equipmentStepDaggerFixture = pickEquipment('dagger')

export const equipmentStepExplorersPackFixture = pickEquipment('explorers-pack')

export const equipmentStepBardClassFixture = makeClassStored({
  slug: 'bard',
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
    proficiencies: {
      tools: {
        choices: [
          {
            id: 'class-tools',
            label: 'Musical Instruments',
            choose: 3,
            pool: { source: 'filtered', toolCategories: ['musical_instrument'] },
          },
        ],
      },
    },
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
            {
              kind: 'choice',
              choose: 1,
              pool: {
                source: 'filtered',
                equipmentKind: 'tool',
                toolCategory: 'musical_instrument',
              },
            },
          ],
          wealth: { gp: 19 },
        },
        {
          id: 'starting-gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 90 },
        },
      ],
    },
  },
})

export const equipmentStepMonkClassFixture = makeClassStored({
  slug: 'monk',
  name: 'Monk',
  primaryAbilities: ['dex', 'wis'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['str', 'dex'],
    armor: { categories: [], items: [] },
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
              target: { source: 'equipment', equipmentSlug: 'spear' },
              quantity: 1,
              equipped: true,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'dagger' },
              quantity: 5,
            },
            {
              kind: 'grant',
              target: { source: 'proficiency_choice', choiceId: 'class-tools' },
              quantity: 1,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'explorers-pack' },
              quantity: 1,
            },
          ],
          wealth: { gp: 11 },
        },
        {
          id: 'starting-gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 50 },
        },
      ],
    },
    proficiencies: {
      tools: {
        choices: [
          {
            id: 'class-tools',
            label: "Artisan's Tools or Musical Instrument",
            choose: 1,
            pool: {
              source: 'filtered',
              toolCategories: ['artisan', 'musical_instrument'],
            },
          },
        ],
      },
    },
  },
})

export const equipmentStepCatalogFixture = {
  species: [],
  classes: [equipmentStepBardClassFixture, equipmentStepMonkClassFixture],
  spells: [],
  equipment: [
    equipmentStepBreastplateFixture,
    equipmentStepLeatherArmorFixture,
    equipmentStepLuteFixture,
    equipmentStepDrumFixture,
    equipmentStepSpearFixture,
    equipmentStepBattleaxeFixture,
    equipmentStepDaggerFixture,
    equipmentStepExplorersPackFixture,
    equipmentStepPotionOfHealingFixture,
    equipmentStepRationsFixture,
  ],
  skillProficiencies: [],
  organizations: [],
  languages: [],
}

export const equipmentStepCatalogIndexFixture = indexCharacterBuildCatalog(
  equipmentStepCatalogFixture,
)

export function createEquipmentStepContextFixture(
  overrides: Partial<CharacterBuildContext> = {},
): CharacterBuildContext {
  const rulesetId = overrides.rulesetId ?? DEFAULT_SYSTEM_RULESET_ID

  return {
    channel: 'build',
    surface: 'dashboard',
    characterKind: 'pc',
    mode: 'dashboard',
    scope: { type: 'standalone', rulesetId },
    rulesScope: { type: 'ruleset', rulesetId },
    ownershipTarget: { type: 'user' },
    rulesetId,
    catalog: equipmentStepCatalogFixture,
    characterCreationRules: {
      ...resolveCharacterCreationPatch(undefined, getStandardStartingWealthRules(rulesetId)),
      abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
      armorClass: defaultCampaignMechanicsPatch().armorClass,
    },
    permissions: { canCreateCharacter: true },
    playActor: { kind: 'new_pc' },
    ...overrides,
  }
}

export const equipmentStepContextFixture = createEquipmentStepContextFixture()

/** Starting wealth with common magic-item grants at level 1 (cart integration tests). */
export const equipmentStepHeroMagicItemWealthFixture = {
  name: 'Hero test wealth',
  scope: { kind: 'standard' as const },
  tiers: [
    {
      id: 'hero',
      label: 'Hero',
      minLevel: 1,
      maxLevel: 20,
      includeNormalStartingEquipment: true,
      bonusGold: null,
      magicItemGrants: [{ rarity: 'common' as const, quantity: 2 }],
    },
  ],
} satisfies StartingWealthRules

export function createEquipmentStepContextWithMagicItemGrantsFixture(
  overrides: Partial<CharacterBuildContext> = {},
): CharacterBuildContext {
  return createEquipmentStepContextFixture({
    characterCreationRules: {
      ...createEquipmentStepContextFixture().characterCreationRules,
      startingWealth: equipmentStepHeroMagicItemWealthFixture,
    },
    ...overrides,
  })
}

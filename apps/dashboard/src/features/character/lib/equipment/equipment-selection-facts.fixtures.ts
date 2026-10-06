import {
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
  resolveAvailableChoices,
  startingEquipmentChoiceSetId,
  type CharacterBuildCatalogIndex,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuilderDraftEquipmentPurchase,
  type ClassStored,
  type Equipment,
  type StartingEquipmentOption,
} from '@rpg/contracts'

import { makeCharacterBuildCatalog } from '@/test/fixtures/factories/additional/character-build-catalog'
import { pickClass, pickEquipment } from '@/test/fixtures/pick'

import { createStandaloneBuilderContextFixture } from '../fixtures/character-builder-fixtures'
import {
  deriveEquipmentSelectionFacts,
  type EquipmentSelectionFacts,
} from './equipment-selection-facts.lib'

const EQUIPMENT_SLUGS = [
  'dagger',
  'arcane-staff',
  'robe',
  'spellbook',
  'scholars-pack',
  'component-pouch',
  'plate-armor',
  'chain-mail',
  'greataxe',
  'greatsword',
  'flail',
  'javelin',
  'dungeoneers-pack',
] as const

type SelectionFactsEquipmentSlug = (typeof EQUIPMENT_SLUGS)[number]

export const selectionFactsWizardClass = pickClass('wizard') as ClassStored
export const selectionFactsFighterClass = pickClass('fighter') as ClassStored

export const selectionFactsEquipment = Object.fromEntries(
  EQUIPMENT_SLUGS.map((slug) => [slug, pickEquipment(slug)]),
) as Record<SelectionFactsEquipmentSlug, Equipment>

const { cost: _robeCost, ...robeWithoutCost } = selectionFactsEquipment.robe

/** Robe without a market price, so package conversion blocks it. */
export const selectionFactsUnpricedRobe = robeWithoutCost as Equipment

const STANDARD_EQUIPMENT_OPTION_ID = 'standard-equipment'

function withStandardPackageItems(
  characterClass: ClassStored,
  mapItems: (items: StartingEquipmentOption['items']) => StartingEquipmentOption['items'],
): ClassStored {
  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) throw new Error(`${characterClass.slug} has no starting equipment`)
  return {
    ...characterClass,
    characterCreation: {
      ...characterClass.characterCreation,
      startingEquipment: {
        ...startingEquipment,
        options: startingEquipment.options.map((option) =>
          option.id === STANDARD_EQUIPMENT_OPTION_ID
            ? { ...option, items: mapItems(option.items) }
            : option,
        ),
      },
    },
  }
}

function packageItemSlug(item: StartingEquipmentOption['items'][number]): string | undefined {
  return item.kind === 'grant' && item.target.source === 'equipment'
    ? item.target.equipmentSlug
    : undefined
}

/** Wizard whose Standard Equipment omits the spellbook. */
export const selectionFactsWizardWithoutSpellbookClass = withStandardPackageItems(
  selectionFactsWizardClass,
  (items) => items.filter((item) => packageItemSlug(item) !== 'spellbook'),
)

/** Wizard whose Standard Equipment carries a component pouch in place of the arcane staff. */
export const selectionFactsWizardPouchPackageClass = withStandardPackageItems(
  selectionFactsWizardClass,
  (items) =>
    items.map((item) =>
      packageItemSlug(item) === 'arcane-staff' && item.kind === 'grant'
        ? {
            ...item,
            id: 'component-pouch',
            target: { source: 'equipment' as const, equipmentSlug: 'component-pouch' },
          }
        : item,
    ),
)

type SelectionFactsScenario = {
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
}

export function selectionFactsScenario(
  args: {
    classes?: readonly ClassStored[]
    equipment?: readonly Equipment[]
  } = {},
): SelectionFactsScenario {
  const context = createStandaloneBuilderContextFixture({
    catalog: makeCharacterBuildCatalog({
      classes: [...(args.classes ?? [selectionFactsWizardClass, selectionFactsFighterClass])],
      equipment: [...(args.equipment ?? Object.values(selectionFactsEquipment))],
    }),
  })
  return { context, catalogIndex: indexCharacterBuildCatalog(context.catalog) }
}

function scores(str: number): CharacterBuilderDraft['abilities']['scores'] {
  return { str, dex: 14, con: 13, int: 15, wis: 12, cha: 10 }
}

export function selectionFactsPurchase(
  slug: SelectionFactsEquipmentSlug,
  overrides: Partial<CharacterBuilderDraftEquipmentPurchase> = {},
): CharacterBuilderDraftEquipmentPurchase {
  return {
    id: `purchase-${slug}`,
    equipmentId: selectionFactsEquipment[slug].id,
    quantity: 1,
    sourceMode: 'startingGold',
    origin: 'picker',
    ...overrides,
  }
}

/** Builder draft for a class on one starting option, STR 8 unless overridden. */
export function selectionFactsDraft(args: {
  characterClass?: ClassStored
  optionId: string
  purchases?: readonly CharacterBuilderDraftEquipmentPurchase[]
  grants?: NonNullable<CharacterBuilderDraft['equipment']>['grants']
  str?: number
}): CharacterBuilderDraft {
  const characterClass = args.characterClass ?? selectionFactsWizardClass
  const empty = createEmptyCharacterBuilderDraft()
  return {
    ...empty,
    class: { classId: characterClass.id, level: 1 },
    abilities: { ...empty.abilities, scores: scores(args.str ?? 8) },
    choiceSelections: { [startingEquipmentChoiceSetId(characterClass.id)]: [args.optionId] },
    equipment: {
      mode: args.optionId === 'starting-gold' ? 'gold' : 'package',
      purchases: [...(args.purchases ?? [])],
      ...(args.grants ? { grants: args.grants } : {}),
      editedSincePackageSelection: false,
    },
  }
}

export function selectionFactsForDraft(
  scenario: SelectionFactsScenario,
  draft: CharacterBuilderDraft,
): EquipmentSelectionFacts {
  return deriveEquipmentSelectionFacts({
    draft,
    catalogIndex: scenario.catalogIndex,
    choiceSets: resolveAvailableChoices(draft, scenario.context),
    rulesetId: scenario.context.rulesetId,
  })
}

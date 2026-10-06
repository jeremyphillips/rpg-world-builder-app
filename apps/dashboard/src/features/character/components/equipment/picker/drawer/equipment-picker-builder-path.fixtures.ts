import {
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
  resolveAvailableChoices,
  startingEquipmentChoiceSetId,
  type CharacterBuilderDraft,
  type EquipmentBudgetSummary,
} from '@rpg/contracts'

import { makeCharacterBuildCatalog } from '@/test/fixtures/factories/additional/character-build-catalog'
import { pickClass, pickEquipment } from '@/test/fixtures/pick'

import { createStandaloneBuilderContextFixture } from '../../../../lib/fixtures/character-builder-fixtures'
import { buildEquipmentPickerRecommendationContext } from '../../../../lib/equipment/equipment-picker-recommendation-context.lib'
import { equipmentPickerItemFixture } from './equipment-picker-drawer.fixtures'
import type { EquipmentPickerItem } from './equipment-picker-drawer.types'

const UNAFFORDABLE = { status: 'unaffordable' as const, shortfallCp: 1 }

const PICKER_SLUGS = [
  'wand',
  'component-pouch',
  'spellbook',
  'greataxe',
  'greatsword',
  'dagger',
  'plate-armor',
  'splint',
  'chain-mail',
] as const

export type BuilderPathPickerSlug = (typeof PICKER_SLUGS)[number]

/** Gold path after some spending: 5 GP left of 55. */
export const builderPathGoldBudgetFixture: EquipmentBudgetSummary = {
  starting: { cp: 0, sp: 0, gp: 55, pp: 0 },
  spent: { cp: 0, sp: 0, gp: 50, pp: 0 },
  remaining: { cp: 0, sp: 0, gp: 5, pp: 0 },
}

function scores(str: number): CharacterBuilderDraft['abilities']['scores'] {
  return { str, dex: 14, con: 13, int: 15, wis: 12, cha: 10 }
}

/**
 * Picker items resolved through the real contracts derivation on the gold path,
 * with per-row affordability chosen to show each documented row state.
 */
function goldPathPickerItems(args: {
  classSlug: 'wizard' | 'fighter'
  str: number
  unaffordable: readonly BuilderPathPickerSlug[]
}): Record<BuilderPathPickerSlug, EquipmentPickerItem> {
  const characterClass = pickClass(args.classSlug)
  const equipment = PICKER_SLUGS.map((slug) => pickEquipment(slug))
  const context = createStandaloneBuilderContextFixture({
    catalog: makeCharacterBuildCatalog({ classes: [characterClass], equipment }),
  })
  const empty = createEmptyCharacterBuilderDraft()
  const draft: CharacterBuilderDraft = {
    ...empty,
    class: { classId: characterClass.id, level: 1 },
    abilities: { ...empty.abilities, scores: scores(args.str) },
    choiceSelections: { [startingEquipmentChoiceSetId(characterClass.id)]: ['starting-gold'] },
    equipment: { mode: 'gold', purchases: [], editedSincePackageSelection: false },
  }
  const { items } = buildEquipmentPickerRecommendationContext({
    equipment,
    draft,
    characterClass,
    catalogIndex: indexCharacterBuildCatalog(context.catalog),
    choiceSets: resolveAvailableChoices(draft, context),
  })
  const bySlug = new Map(items.map((item) => [item.equipment.slug, item]))
  return Object.fromEntries(
    PICKER_SLUGS.map((slug) => {
      const item = bySlug.get(slug)
      if (!item) throw new Error(`missing picker item ${slug}`)
      const unaffordable = args.unaffordable.includes(slug)
      return [
        slug,
        equipmentPickerItemFixture({
          equipment: item.equipment,
          state: {
            ...item.state,
            ...(unaffordable
              ? { purchaseAvailability: UNAFFORDABLE, isWithinRemainingBudget: false }
              : { purchaseAvailability: { status: 'available' as const } }),
          },
        }),
      ]
    }),
  ) as Record<BuilderPathPickerSlug, EquipmentPickerItem>
}

/** STR 8 Wizard shopping with gold. */
export const wizardGoldPathPickerItemsFixture = goldPathPickerItems({
  classSlug: 'wizard',
  str: 8,
  unaffordable: ['wand', 'spellbook', 'greataxe', 'plate-armor'],
})

/** STR 12 Fighter shopping with gold. */
export const fighterGoldPathPickerItemsFixture = goldPathPickerItems({
  classSlug: 'fighter',
  str: 12,
  unaffordable: ['splint', 'chain-mail'],
})

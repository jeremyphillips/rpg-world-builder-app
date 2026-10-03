import * as ui from '@rpg/ui'
import * as uiForm from '@rpg/ui/form'
import { describe, expect, it } from 'vitest'

import * as content from '@/features/content'
import { ChoiceBlockRow } from '@/features/character/components/builder/steps/shared/choice-section/choice-block-row'
import { QuickNpcStartingChoiceSelectedRow } from '@/features/character/npc/components/quick-npc/quick-npc-starting-choice-selected-row'
import { QuickNpcStartingChoices } from '@/features/character/npc/components/quick-npc/quick-npc-starting-choices'
import { DetailEntityRow } from '@/features/content/lib/detail/row/entity/detail-entity-row'
import { DrawerEntityBlock } from '@/features/content/lib/entity/surfaces/drawer/drawer-entity-block'

import { CARD_RECIPES, CARD_RECIPE_SECTIONS } from './card-recipes.registry'

/** Entity surfaces exported from `@/features/content` — every one needs a recipe. */
const CONTENT_ENTITY_SURFACES = [
  'ContentEntityCard',
  'DisclosureEntityCard',
  'CatalogEntityRow',
  'CatalogEntitySurfaceRow',
  'EntitySurfaceContentCard',
  'EntityAnatomyHost',
  'EntityRowList',
  'EntityDisclosureArrayItemShell',
] as const

const UI_ROW_PRIMITIVES = [
  'InteractiveListRow',
  'ComboboxOptionRow',
  'MenuChoiceRow',
  'ContentCard',
  'SelectionOptionCard',
  'SelectionSummaryCard',
  'CollapsibleListItem',
] as const

const UI_FORM_ROW_PRIMITIVES = ['ArrayItemAnatomyGrid'] as const

const LOCAL_ROW_SURFACES = {
  DetailEntityRow,
  DrawerEntityBlock,
  QuickNpcStartingChoiceSelectedRow,
  QuickNpcStartingChoices,
  ChoiceBlockRow,
} as const

const recipeComponents = new Set(CARD_RECIPES.map((recipe) => recipe.component))

describe('card recipe registry', () => {
  it.each(CONTENT_ENTITY_SURFACES)('covers content entity surface %s', (name) => {
    expect(content[name]).toBeDefined()
    expect(recipeComponents.has(name)).toBe(true)
  })

  it.each(UI_ROW_PRIMITIVES)('covers @rpg/ui row primitive %s', (name) => {
    expect(ui[name]).toBeDefined()
    expect(recipeComponents.has(name)).toBe(true)
  })

  it.each(UI_FORM_ROW_PRIMITIVES)('covers @rpg/ui/form row primitive %s', (name) => {
    expect(uiForm[name]).toBeDefined()
    expect(recipeComponents.has(name)).toBe(true)
  })

  it.each(Object.entries(LOCAL_ROW_SURFACES))('covers feature-local row %s', (name, component) => {
    expect(component).toBeDefined()
    expect(recipeComponents.has(name)).toBe(true)
  })

  it('uses unique recipe names', () => {
    const names = CARD_RECIPES.map((recipe) => recipe.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('places every recipe in a declared section', () => {
    const sectionIds = new Set(CARD_RECIPE_SECTIONS.map((section) => section.id))
    for (const recipe of CARD_RECIPES) {
      expect(sectionIds.has(recipe.section)).toBe(true)
    }
  })

  it('classifies every recipe', () => {
    expect(CARD_RECIPES.filter((recipe) => recipe.anatomy === 'unclassified')).toEqual([])
  })
})

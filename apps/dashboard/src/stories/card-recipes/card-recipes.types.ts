import type { ReactNode } from 'react'

/**
 * `row-track` — composes RowAnatomy (band / meta / status tracks, edge-aware inset).
 * `different` — a distinct anatomy with its own contract (see packages/ui/docs/row-anatomy.md).
 * `unclassified` — not yet reviewed against the row-track contract.
 */
export type CardRecipeAnatomy = 'row-track' | 'different' | 'unclassified'

export type CardRecipeSection =
  | 'entity-surfaces'
  | 'picker-rows'
  | 'detail-rows'
  | 'ui-list-rows'
  | 'ui-cards-form-rows'
  | 'feature-grids'

export type CardRecipeDensity = 'compact' | 'comfortable' | 'fixed'

export type CardRecipe = {
  /** Unique recipe label — also the `data-recipe-name` on the rendered tile. */
  name: string
  section: CardRecipeSection
  /** Exported component the recipe demonstrates (coverage key). */
  component: string
  /** Composition path from the consumer-facing surface down to the layout owner. */
  chain: readonly string[]
  useWhen: string
  density: CardRecipeDensity
  leading: string
  trailing: string
  anatomy: CardRecipeAnatomy
  render: () => ReactNode
}

import type { Species } from '@rpg/contracts'
import { resolveTraitName } from '@rpg/contracts'
import type { CollectionSummaryItem } from '@rpg/ui'

export function resolveSpeciesTraitSummaryItems(entity: Species): CollectionSummaryItem[] {
  return entity.traits.map((trait) => ({
    id: trait.id,
    label: resolveTraitName(trait),
  }))
}

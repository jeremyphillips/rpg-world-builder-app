import { resolveClassFeatureName, type CharacterClass, type ClassListItem } from '@rpg/contracts'
import type { CollectionSummaryItem } from '@rpg/ui'

export function resolveSubclassSummaryItems(entity: ClassListItem): CollectionSummaryItem[] {
  return entity.subclasses.map((subclass) => ({
    id: subclass.id,
    label: subclass.name,
  }))
}

export function resolveClassFeatureSummaryItems(entity: CharacterClass): CollectionSummaryItem[] {
  return entity.features.map((feature) => ({
    id: feature.id,
    label: resolveClassFeatureName(feature, entity.name),
    secondary: feature.level != null ? `Level ${feature.level}` : undefined,
  }))
}

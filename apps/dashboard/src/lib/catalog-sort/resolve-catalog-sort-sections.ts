import type { SortMenuOption, SortMenuSection } from '@rpg/ui'

import { CATALOG_SORT_AXES, type CatalogSortAxisKey } from './catalog-sort-axes'
import { CATALOG_SORT_PRESETS, type CatalogSortPresetKey } from './catalog-sort-presets'
import type { CatalogSortDirection } from './catalog-sort.types'

export type ResolveCatalogSortSectionsArgs = {
  /** Directional axes to include (group headings from the registry). */
  axes?: readonly CatalogSortAxisKey[]
  /** Named presets rendered ungrouped above axis groups. */
  presets?: readonly CatalogSortPresetKey[]
  /**
   * When set, only modes in this set appear. Used for workflow gating
   * (e.g. hide price modes) without rebuilding the registry.
   */
  availableValues?: ReadonlySet<string> | readonly string[]
}

function toAvailableSet(
  availableValues: ResolveCatalogSortSectionsArgs['availableValues'],
): Set<string> | undefined {
  if (availableValues == null) return undefined
  return availableValues instanceof Set ? availableValues : new Set(availableValues)
}

function directionOption(
  axisKey: CatalogSortAxisKey,
  direction: CatalogSortDirection,
): SortMenuOption {
  const def = CATALOG_SORT_AXES[axisKey][direction]
  return {
    value: def.value,
    label: def.label,
    triggerLabel: def.triggerLabel,
  }
}

/**
 * Builds Greenfield SortMenu sections: ungrouped presets, then headed axis groups.
 * Owns presentation convention; features pass enabled axes/presets only.
 */
export function resolveCatalogSortSections({
  axes = [],
  presets = [],
  availableValues,
}: ResolveCatalogSortSectionsArgs): SortMenuSection[] {
  const available = toAvailableSet(availableValues)
  const allow = (value: string) => available == null || available.has(value)
  const sections: SortMenuSection[] = []

  const presetOptions: SortMenuOption[] = []
  for (const presetId of presets) {
    const preset = CATALOG_SORT_PRESETS[presetId]
    if (!allow(preset.value)) continue
    presetOptions.push({
      value: preset.value,
      label: preset.label,
      triggerLabel: preset.triggerLabel,
    })
  }
  if (presetOptions.length > 0) {
    sections.push({ type: 'ungrouped', options: presetOptions })
  }

  for (const axisKey of axes) {
    const axis = CATALOG_SORT_AXES[axisKey]
    const order = axis.directionOrder ?? (['ascending', 'descending'] as const)
    const options = order
      .map((direction) => directionOption(axisKey, direction))
      .filter((option) => allow(option.value))
    if (options.length === 0) continue
    sections.push({ type: 'group', heading: axis.label, options })
  }

  return sections
}

/** Flatten resolved section values — useful for workflow available-mode lists. */
export function collectCatalogSortValues(sections: readonly SortMenuSection[]): string[] {
  return sections.flatMap((section) => section.options.map((option) => option.value))
}

import { resolveArrayItemChrome } from '../config/array/array-item-config.lib'
import {
  buildFormSectionChildContext,
  type FormSectionContextValue,
} from '../context/form-section.context'
import type { ArrayConfig } from '../field-config'
import {
  DEFAULT_ARRAY_SECTION_DENSITY,
  resolveArrayLegendDensity,
  resolveSectionDensity,
} from '../form-density'
import { resolveNamedGroupDepthAfterEntering } from '../form-heading.lib'
import { hasNamedArrayHeading } from '../resolve-container-heading.lib'

export function buildArraySectionChildContext(
  parent: FormSectionContextValue,
  depth: number,
  config: ArrayConfig,
  options?: { sectionChromeActive?: boolean },
): FormSectionContextValue {
  const chrome = resolveArrayItemChrome(config)
  const hasNamedHeading = hasNamedArrayHeading(config)
  const childNamedGroupDepth = resolveNamedGroupDepthAfterEntering(
    hasNamedHeading,
    parent.namedGroupDepth,
  )
  return buildFormSectionChildContext(parent, depth, {
    density: resolveSectionDensity({
      explicit: config.density,
      inherited: parent.density,
      sectionDefault: DEFAULT_ARRAY_SECTION_DENSITY,
    }),
    arrayLegendDensity: resolveArrayLegendDensity({
      explicit: config.density,
      inherited: parent.density,
    }),
    arrayItemSurface: chrome.surface ?? parent.arrayItemSurface,
    arrayItemTone: chrome.tone ?? parent.arrayItemTone,
    namedGroupDepth: childNamedGroupDepth,
    headingTier: hasNamedHeading ? 'leaf' : parent.headingTier,
    fieldChromeCascade: config.fieldChrome ?? parent.fieldChromeCascade,
    fieldChromeSuppressed: options?.sectionChromeActive || parent.fieldChromeSuppressed || true,
  })
}

export function buildSlotSectionChildContext(
  parent: FormSectionContextValue,
  depth: number,
): FormSectionContextValue {
  return buildFormSectionChildContext(parent, depth, {
    // Slots bring their own layout; opt into `chrome` explicitly when a shell is needed.
    fieldChromeSuppressed: true,
  })
}

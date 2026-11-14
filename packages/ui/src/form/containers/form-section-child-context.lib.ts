import { resolveArrayItemChrome } from '../config/array/array-item-config.lib'
import {
  buildFormSectionChildContext,
  type FormSectionContextValue,
} from '../context/form-section.context'
import type { ArrayConfig } from '../field-config'
import { resolveNamedGroupDepthAfterEntering } from '../form-heading.lib'
import { hasNamedArrayHeading } from '../config/array/resolve-array-heading.lib'
import { resolveArraySectionDensities } from '../config/array/resolve-array-section-densities.lib'

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
  const { presentationDensity, bodyLayoutDensity, defaultControlSize } =
    resolveArraySectionDensities(config, parent)
  return buildFormSectionChildContext(parent, depth, {
    density: bodyLayoutDensity,
    arraySectionPresentationDensity: presentationDensity,
    defaultControlSize,
    arrayItemSurface: chrome.surface ?? parent.arrayItemSurface,
    arrayItemTone: chrome.tone ?? parent.arrayItemTone,
    namedGroupDepth: childNamedGroupDepth,
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

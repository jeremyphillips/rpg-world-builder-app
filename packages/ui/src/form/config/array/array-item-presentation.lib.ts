import type { ArrayConfig, ArrayItemHeaderConfig, ArrayItemReorder } from '../../field-config'
import { normalizeArrayItemContent } from './array-item-content-normalizer.lib'
import { resolveArrayItemConfig, resolveArrayItemHeader } from './array-item-config.lib'

export type ArrayItemHeaderVisibility = 'auto' | 'hidden'

export type ArrayItemResolvedPresentation = {
  itemLabel: 'none' | 'visible'
  headerAnatomy: 'none' | 'present'
  contentLayout: 'inline' | 'stacked'
  disclosure: 'none' | 'collapsible'
  chrome: 'flat' | 'disclosure'
  stackTreatment: 'merged' | 'separated'
  listGap: 'rhythm' | 'tight' | 'merged'
  reserveDragHandleSlot: boolean
  sortableEnabled: boolean
}

export type ArrayItemPresentationAnatomy = 'flatNoHeader' | 'flatWithHeader' | 'disclosure'

export type ArrayItemActionsLocation = 'itemRow' | 'header'

export function resolveArrayItemActionsLocation(
  presentation: Pick<ArrayItemResolvedPresentation, 'headerAnatomy'>,
): ArrayItemActionsLocation {
  return presentation.headerAnatomy === 'present' ? 'header' : 'itemRow'
}

type ResolveArrayItemPresentationInput = {
  config: ArrayConfig
  variant: 'compact' | 'detailed'
  reorder: ArrayItemReorder
  fieldsLength: number
  legend?: string
  /** Renderer-derived collapse wiring — overrides raw `item.collapsible` when set. */
  collapsible?: boolean
}

function normalizeHeaderVisibility(
  headerVisibility: ArrayItemHeaderVisibility | undefined,
  collapsible: boolean,
): ArrayItemHeaderVisibility {
  const resolved = headerVisibility ?? 'auto'
  if (collapsible && resolved === 'hidden') return 'auto'
  return resolved
}

function resolveItemLabelAuto(
  headerConfig: ArrayItemHeaderConfig,
  variant: 'compact' | 'detailed',
  contentLayout: 'inline' | 'stacked',
  collapsible: boolean,
): 'none' | 'visible' {
  if (collapsible) return 'visible'

  if (variant === 'detailed') {
    return headerConfig.srOnly ? 'none' : 'visible'
  }

  if (contentLayout === 'inline') return 'none'
  if (headerConfig.srOnly) return 'none'

  if (headerConfig.primary || headerConfig.primaryField) {
    return 'visible'
  }

  return 'none'
}

function resolveItemLabel(
  headerVisibility: ArrayItemHeaderVisibility,
  headerConfig: ArrayItemHeaderConfig,
  variant: 'compact' | 'detailed',
  contentLayout: 'inline' | 'stacked',
  collapsible: boolean,
): 'none' | 'visible' {
  if (headerVisibility === 'hidden') return 'none'
  return resolveItemLabelAuto(headerConfig, variant, contentLayout, collapsible)
}

function resolveHeaderAnatomy(
  itemLabel: 'none' | 'visible',
  disclosure: 'none' | 'collapsible',
): 'none' | 'present' {
  if (disclosure === 'collapsible') return 'present'
  return itemLabel === 'visible' ? 'present' : 'none'
}

function resolveStackTreatment(
  chrome: 'flat' | 'disclosure',
  itemLabel: 'none' | 'visible',
  disclosure: 'none' | 'collapsible',
): 'merged' | 'separated' {
  if (chrome === 'flat' && itemLabel === 'none' && disclosure === 'none') {
    return 'merged'
  }
  return 'separated'
}

function resolveListGap(
  stackTreatment: 'merged' | 'separated',
  chrome: 'flat' | 'disclosure',
  variant: 'compact' | 'detailed',
): 'rhythm' | 'tight' | 'merged' {
  if (stackTreatment === 'merged') return 'merged'
  if (chrome === 'flat' && variant === 'compact') return 'tight'
  return 'rhythm'
}

export function resolveArrayItemPresentationAnatomy(
  presentation: ArrayItemResolvedPresentation,
): ArrayItemPresentationAnatomy {
  if (presentation.disclosure === 'collapsible') return 'disclosure'
  if (presentation.headerAnatomy === 'none') return 'flatNoHeader'
  return 'flatWithHeader'
}

export function resolveArrayItemPresentation({
  config,
  variant,
  reorder,
  fieldsLength,
  legend,
  collapsible: collapsibleOverride,
}: ResolveArrayItemPresentationInput): ArrayItemResolvedPresentation {
  const itemConfig = resolveArrayItemConfig(config)
  const headerConfig = resolveArrayItemHeader(config, legend)
  const collapsible = collapsibleOverride ?? itemConfig.collapsible
  const disclosure = collapsible ? 'collapsible' : 'none'
  const headerVisibility = normalizeHeaderVisibility(itemConfig.headerVisibility, collapsible)
  const normalized = normalizeArrayItemContent(config.fields)
  const contentLayout =
    variant === 'compact' && normalized.contentLayout === 'inline' ? 'inline' : 'stacked'
  const itemLabel = resolveItemLabel(
    headerVisibility,
    headerConfig,
    variant,
    contentLayout,
    collapsible,
  )
  const headerAnatomy = resolveHeaderAnatomy(itemLabel, disclosure)
  const chrome = disclosure === 'collapsible' ? 'disclosure' : 'flat'
  const stackTreatment = resolveStackTreatment(chrome, itemLabel, disclosure)
  const listGap = resolveListGap(stackTreatment, chrome, variant)
  const reserveDragHandleSlot = reorder === 'dragHandle'
  const sortableEnabled = reserveDragHandleSlot && fieldsLength > 1

  return {
    itemLabel,
    headerAnatomy,
    contentLayout,
    disclosure,
    chrome,
    stackTreatment,
    listGap,
    reserveDragHandleSlot,
    sortableEnabled,
  }
}

import type { CSSProperties } from 'react'

import type { FieldWidth } from '../../../components/ui/field-control.variants'
import type { FieldSize } from '../../../components/ui/field-root.lib'
import {
  resolveDigitInlineSizeClasses,
  type FieldDigits,
} from '../../../components/ui/field-digit-metrics'
import { resolveFieldRowColumnTracks } from '../../../components/ui/field-row-column-tracks.lib'
import { buildCollapsibleListItemLeadingChromeStyle } from '../../../components/ui/collapsible-list-item/collapsible-list-item-leading-chrome.lib'
import { cn } from '../../../lib/utils'

import {
  ARRAY_ITEM_ANATOMY_GRIP_COLUMN_TRACK,
  ARRAY_ITEM_CHROME_GAP_CLASS,
  ARRAY_ITEM_FIELD_GAP_DENSE_CLASS,
  ARRAY_ITEM_FIELD_GAP_DEFAULT_CLASS,
  type ArrayFieldGap,
} from './array-item-anatomy-grid.variants'

export {
  ARRAY_ITEM_CHROME_GAP_CLASS,
  ARRAY_ITEM_FIELD_GAP_DENSE_CLASS,
  ARRAY_ITEM_FIELD_GAP_DEFAULT_CLASS,
}
export type { ArrayFieldGap }

/** 24px — legacy flat grid (today's form gap on anatomy inline rows). */
export const ARRAY_ITEM_FIELD_GAP_LEGACY_FORM_CLASS = 'gap-x-6'

export type SpacingPrototypeCandidate =
  | 'legacy-flat-form'
  | 'single-field-default'
  | 'single-field-dense'
  | 'two-tier-dense'
  | 'two-tier-default'

/** Target ship candidate — two-tier dense (8px chrome / 12px field columns). */
export const TARGET_SHIP_SPACING_CANDIDATE =
  'two-tier-dense' as const satisfies SpacingPrototypeCandidate

/** Production flat shell for side-by-side comparison in Storybook. */
export const ARRAY_ITEM_SPACING_PROTOTYPE_LEGACY_SHELL_PADDING_CLASSES = 'pl-2 pr-3 py-2'

/** Optional grip pull-back when experimenting with tighter shells — off by default. */
export const ARRAY_ITEM_SPACING_PROTOTYPE_GRIP_INSET_CLASSES = '-ml-1'

/**
 * Prototype shell inset — chrome-aware on both inline edges:
 * - leading grip present → pl-2 (8px), else pl-3 (12px)
 * - trailing action present → pr-2 (8px), else pr-3 (12px)
 */
export function resolveSpacingPrototypeShellPaddingClasses(options: {
  showGrip: boolean
  showActions: boolean
}): string {
  return cn(options.showGrip ? 'pl-2' : 'pl-3', options.showActions ? 'pr-2' : 'pr-3', 'py-2')
}

export function resolveSpacingPrototypeGripChromeClasses(
  showGrip: boolean,
  applyGripInset = false,
): string {
  return showGrip && applyGripInset ? ARRAY_ITEM_SPACING_PROTOTYPE_GRIP_INSET_CLASSES : ''
}

/** Flat single-gap candidates kept for regression comparison only. */
export const LEGACY_FLAT_SPACING_CANDIDATES = [
  'legacy-flat-form',
  'single-field-default',
  'single-field-dense',
] as const satisfies readonly SpacingPrototypeCandidate[]

/** Target two-tier candidates for Phase 1 ship. */
export const TARGET_SHIP_SPACING_CANDIDATES = [
  TARGET_SHIP_SPACING_CANDIDATE,
  'two-tier-default',
] as const satisfies readonly SpacingPrototypeCandidate[]

export type ChromePresence =
  | 'fields-only'
  | 'grip-fields'
  | 'fields-actions'
  | 'grip-fields-actions'

export function resolveChromePresenceFlags(presence: ChromePresence): {
  showGrip: boolean
  showActions: boolean
} {
  switch (presence) {
    case 'fields-only':
      return { showGrip: false, showActions: false }
    case 'grip-fields':
      return { showGrip: true, showActions: false }
    case 'fields-actions':
      return { showGrip: false, showActions: true }
    case 'grip-fields-actions':
      return { showGrip: true, showActions: true }
  }
}

export function isTwoTierSpacingCandidate(candidate: SpacingPrototypeCandidate): boolean {
  return candidate === 'two-tier-dense' || candidate === 'two-tier-default'
}

export function resolvePrototypeMovementFixEnabled(
  candidate: SpacingPrototypeCandidate,
  intrinsicAuto?: boolean,
): boolean {
  return intrinsicAuto ?? isTwoTierSpacingCandidate(candidate)
}

export function resolvePrototypeOuterGapClass(candidate: SpacingPrototypeCandidate): string {
  if (isTwoTierSpacingCandidate(candidate)) return ARRAY_ITEM_CHROME_GAP_CLASS
  if (candidate === 'legacy-flat-form') return ARRAY_ITEM_FIELD_GAP_LEGACY_FORM_CLASS
  if (candidate === 'single-field-dense') return ARRAY_ITEM_FIELD_GAP_DENSE_CLASS
  return ARRAY_ITEM_FIELD_GAP_DEFAULT_CLASS
}

export function resolvePrototypeFieldGapClass(
  candidate: SpacingPrototypeCandidate,
  fieldGap: ArrayFieldGap = 'dense',
): string {
  if (candidate === 'two-tier-dense') return ARRAY_ITEM_FIELD_GAP_DENSE_CLASS
  if (candidate === 'two-tier-default') return ARRAY_ITEM_FIELD_GAP_DEFAULT_CLASS
  return fieldGap === 'dense'
    ? ARRAY_ITEM_FIELD_GAP_DENSE_CLASS
    : ARRAY_ITEM_FIELD_GAP_DEFAULT_CLASS
}

/**
 * Prototype track resolver — `auto` can use an intrinsic floor when simulating Speed.
 * Production `full` stays `minmax(0, 1fr)`.
 */
export function resolvePrototypeArrayFieldColumnTracks(
  fieldWidths: readonly FieldWidth[],
  options: { intrinsicAuto?: boolean } = {},
): string[] {
  const { tracks } = resolveFieldRowColumnTracks(fieldWidths)
  return tracks.map((track, index) => {
    if (fieldWidths[index] !== 'auto') return track
    return options.intrinsicAuto ? 'minmax(min-content, max-content)' : 'minmax(0, 1fr)'
  })
}

export function buildPrototypeFlatGridTemplateColumns(
  fieldWidths: readonly FieldWidth[],
  options: {
    showGrip: boolean
    showActions: boolean
    intrinsicAuto?: boolean
  },
): string {
  const fieldColumns = resolvePrototypeArrayFieldColumnTracks(fieldWidths, {
    intrinsicAuto: options.intrinsicAuto,
  }).join(' ')
  const gripColumn = options.showGrip ? `${ARRAY_ITEM_ANATOMY_GRIP_COLUMN_TRACK} ` : ''
  const actionsColumn = options.showActions ? ' max-content' : ''
  return `${gripColumn}${fieldColumns}${actionsColumn}`
}

export function buildPrototypeTwoTierParentTemplateColumns(options: {
  showGrip: boolean
  showActions: boolean
}): string {
  const grip = options.showGrip ? `${ARRAY_ITEM_ANATOMY_GRIP_COLUMN_TRACK} ` : ''
  const actions = options.showActions ? ' max-content' : ''
  return `${grip}minmax(0, 1fr)${actions}`
}

export function buildPrototypeFieldsClusterTemplateColumns(
  fieldWidths: readonly FieldWidth[],
  options: { intrinsicAuto?: boolean } = {},
): string {
  return resolvePrototypeArrayFieldColumnTracks(fieldWidths, options).join(' ')
}

export function resolvePrototypeSpacingPresentation(
  fieldWidths: readonly FieldWidth[],
  options: {
    candidate: SpacingPrototypeCandidate
    showGrip: boolean
    showActions: boolean
    intrinsicAuto?: boolean
    fieldGap?: ArrayFieldGap
  },
): {
  className: string
  style: CSSProperties
  usesFieldsCluster: boolean
  fieldGapClass: string
} {
  const usesFieldsCluster = isTwoTierSpacingCandidate(options.candidate)
  const outerGapClass = resolvePrototypeOuterGapClass(options.candidate)
  const fieldGapClass = resolvePrototypeFieldGapClass(options.candidate, options.fieldGap)

  const style: CSSProperties = {
    ...buildCollapsibleListItemLeadingChromeStyle({
      showDragHandle: options.showGrip,
      reserveDragHandleSlot: options.showGrip,
      collapsible: false,
    }),
  }

  if (usesFieldsCluster) {
    style.gridTemplateColumns = buildPrototypeTwoTierParentTemplateColumns({
      showGrip: options.showGrip,
      showActions: options.showActions,
    })
  } else {
    style.gridTemplateColumns = buildPrototypeFlatGridTemplateColumns(fieldWidths, {
      showGrip: options.showGrip,
      showActions: options.showActions,
      intrinsicAuto: options.intrinsicAuto,
    })
  }

  return {
    className: cn(
      '@container/array-item array-item-anatomy-grid grid min-w-0 grid-rows-[auto_auto_auto]',
      outerGapClass,
    ),
    style,
    usesFieldsCluster,
    fieldGapClass,
  }
}

/**
 * Pre-Phase-1 intrinsic grouped shell — Storybook divider crush comparison only.
 * Production uses {@link fieldGroupedShellIntrinsicLayoutClasses}.
 */
export const JOINED_PAIR_LEGACY_INTRINSIC_SHELL_CLASSES = 'grid-cols-[auto_1px_auto]'

/**
 * Pre-Phase-1 grouped divider — Storybook divider crush comparison only.
 * Production uses {@link fieldGroupedDividerClasses}.
 */
export const JOINED_PAIR_LEGACY_DIVIDER_CLASSES = 'w-px shrink-0 self-stretch bg-border'

/** @deprecated Use {@link resolveDigitInlineSizeClasses} — retained for Storybook imports. */
export function prototypeDigitInlineSizeClasses(
  digits: FieldDigits,
  size: FieldSize = 'md',
): string {
  return resolveDigitInlineSizeClasses(digits, size)
}

export type SharedAnatomyTrackProbe = {
  labelTops: (number | null)[]
  controlTops: (number | null)[]
  messageTops: (number | null)[]
  labelsAligned: boolean
  controlsAligned: boolean
}

function queryRegionTop(fieldId: string, region: 'label' | 'control' | 'message'): number | null {
  const field = document.getElementById(fieldId)?.closest('[data-field-anatomy]')
  const selector =
    region === 'label'
      ? '[data-field-label-region]'
      : region === 'control'
        ? '[data-field-control-region]'
        : '[data-field-message-region]'
  const node = field?.querySelector(selector)
  if (!node) return null
  return Math.round(node.getBoundingClientRect().top)
}

function regionsAligned(values: (number | null)[]): boolean {
  const defined = values.filter((value): value is number => value != null)
  if (defined.length < 2) return true
  return defined.every((value) => value === defined[0])
}

/** Verifies field participants share parent label/control/message track origins. */
export function readSharedAnatomyTrackProbe(fieldIds: readonly string[]): SharedAnatomyTrackProbe {
  const labelTops = fieldIds.map((id) => queryRegionTop(id, 'label'))
  const controlTops = fieldIds.map((id) => queryRegionTop(id, 'control'))
  const messageTops = fieldIds.map((id) => queryRegionTop(id, 'message'))

  return {
    labelTops,
    controlTops,
    messageTops,
    labelsAligned: regionsAligned(labelTops),
    controlsAligned: regionsAligned(controlTops),
  }
}

export const CHROME_PRESENCE_LABELS: Record<ChromePresence, string> = {
  'fields-only': 'Fields only',
  'grip-fields': 'Grip + fields',
  'fields-actions': 'Fields + action',
  'grip-fields-actions': 'Grip + fields + action',
}

export const SPACING_CANDIDATE_LABELS: Record<SpacingPrototypeCandidate, string> = {
  'legacy-flat-form': 'Legacy flat (24px everywhere)',
  'single-field-default': 'Single tier default (16px)',
  'single-field-dense': 'Single tier dense (12px)',
  'two-tier-dense': 'Two-tier chrome 8px + dense 12px',
  'two-tier-default': 'Two-tier chrome 8px + default 16px',
}

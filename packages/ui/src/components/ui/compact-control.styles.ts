import type { ControlActionMetricsTier } from './control-action.variants'

export const UI_COMPACT_CONTROL_BLOCK_CLASS = 'ui-compact-control' as const

export type CompactControlIconRecipeKey = 'icon-compact' | 'icon-xs' | 'icon-default' | 'icon-lg'

export type CompactControlTextRecipeKey = 'text-compact' | 'text-with-icon-compact'

export type CompactControlRecipeKey =
  | CompactControlIconRecipeKey
  | CompactControlTextRecipeKey
  | 'min-height-compact'

export type CompactControlSegmentSizeKey = 'sm'

export type CompactControlTabsTriggerKey = 'pill'

export type CompactControlMenuItemSizeKey = 'sm' | 'md' | 'lg'

export type CompactControlListRowSizeKey = 'sm' | 'md' | 'lg'

export type CompactControlStepperButtonSizeKey = 'xs' | 'sm' | 'md' | 'lg'

export type CompactControlRecipeSpec = {
  recipe: CompactControlRecipeKey
  className: string
  hitTarget: string
  iconGlyph: string
  useCase: string
}

export const COMPACT_CONTROL_RECIPE_SPECS: readonly CompactControlRecipeSpec[] = [
  {
    recipe: 'icon-compact',
    className: 'ui-compact-control--icon-compact',
    hitTarget: '24px',
    iconGlyph: 'md (14px)',
    useCase: 'Icon ghosts, chip remove md, drag handles',
  },
  {
    recipe: 'icon-xs',
    className: 'ui-compact-control--icon-xs',
    hitTarget: '24px',
    iconGlyph: 'xs (10px)',
    useCase: 'Button icon-xs density-independent',
  },
  {
    recipe: 'icon-default',
    className: 'ui-compact-control--icon-default',
    hitTarget: '36px',
    iconGlyph: 'lg (16px)',
    useCase: 'Default icon buttons, chip remove lg',
  },
  {
    recipe: 'icon-lg',
    className: 'ui-compact-control--icon-lg',
    hitTarget: '40px',
    iconGlyph: 'lg (16px)',
    useCase: 'Large icon buttons',
  },
  {
    recipe: 'text-compact',
    className: 'ui-compact-control--text-compact',
    hitTarget: '24px height',
    iconGlyph: '—',
    useCase: 'Compact text actions (content card links)',
  },
  {
    recipe: 'text-with-icon-compact',
    className: 'ui-compact-control--text-with-icon-compact',
    hitTarget: '24px height',
    iconGlyph: 'sm (12px)',
    useCase: 'Compact labeled micro-actions',
  },
  {
    recipe: 'min-height-compact',
    className: 'ui-compact-control--min-height-compact',
    hitTarget: '24px min-height',
    iconGlyph: '—',
    useCase: 'Row action bands aligned to compact control lane',
  },
] as const

const COMPACT_CONTROL_RECIPE_CLASS: Record<CompactControlRecipeKey, string> = {
  'icon-compact': 'ui-compact-control--icon-compact',
  'icon-xs': 'ui-compact-control--icon-xs',
  'icon-default': 'ui-compact-control--icon-default',
  'icon-lg': 'ui-compact-control--icon-lg',
  'text-compact': 'ui-compact-control--text-compact',
  'text-with-icon-compact': 'ui-compact-control--text-with-icon-compact',
  'min-height-compact': 'ui-compact-control--min-height-compact',
}

const COMPACT_CONTROL_GAP_CLASS: Record<ControlActionMetricsTier, string> = {
  xs: 'ui-compact-control--gap-xs',
  sm: 'ui-compact-control--gap-sm',
  md: 'ui-compact-control--gap-md',
}

const COMPACT_CONTROL_SEGMENT_CLASS: Record<CompactControlSegmentSizeKey, string> = {
  sm: 'ui-compact-control--segment-sm',
}

const COMPACT_CONTROL_TABS_TRIGGER_CLASS: Record<CompactControlTabsTriggerKey, string> = {
  pill: 'ui-compact-control--tabs-pill',
}

const COMPACT_CONTROL_MENU_ITEM_CLASS: Record<CompactControlMenuItemSizeKey, string> = {
  sm: 'ui-compact-control--menu-item-sm',
  md: 'ui-compact-control--menu-item-md',
  lg: 'ui-compact-control--menu-item-lg',
}

const COMPACT_CONTROL_LIST_ROW_CLASS: Record<CompactControlListRowSizeKey, string> = {
  sm: 'ui-compact-control--list-row-sm',
  md: 'ui-compact-control--list-row-md',
  lg: 'ui-compact-control--list-row-lg',
}

const COMPACT_CONTROL_STEPPER_BUTTON_CLASS: Record<CompactControlStepperButtonSizeKey, string> = {
  xs: 'ui-compact-control--stepper-button-xs',
  sm: 'ui-compact-control--stepper-button-sm',
  md: 'ui-compact-control--stepper-button-md',
  lg: 'ui-compact-control--stepper-button-lg',
}

/** Chip remove sm — compact square + sm glyph (not the md icon-compact pairing). */
export const UI_COMPACT_CONTROL_ICON_COMPACT_SM_CLASS =
  'ui-compact-control--icon-compact-sm' as const

export function resolveCompactControlRecipeClasses(
  recipe: CompactControlRecipeKey,
  options: { includeBlock?: boolean } = {},
): string {
  const includeBlock = options.includeBlock ?? true
  const modifier = COMPACT_CONTROL_RECIPE_CLASS[recipe]
  return includeBlock ? `${UI_COMPACT_CONTROL_BLOCK_CLASS} ${modifier}` : modifier
}

export function resolveControlActionGapClass(tier: ControlActionMetricsTier): string {
  return COMPACT_CONTROL_GAP_CLASS[tier]
}

export function resolveCompactControlSegmentClasses(size: CompactControlSegmentSizeKey): string {
  return `${UI_COMPACT_CONTROL_BLOCK_CLASS} ${COMPACT_CONTROL_SEGMENT_CLASS[size]}`
}

export function resolveCompactControlTabsTriggerClasses(
  variant: CompactControlTabsTriggerKey,
): string {
  return `${UI_COMPACT_CONTROL_BLOCK_CLASS} ${COMPACT_CONTROL_TABS_TRIGGER_CLASS[variant]}`
}

export function resolveCompactControlMenuItemClasses(size: CompactControlMenuItemSizeKey): string {
  return COMPACT_CONTROL_MENU_ITEM_CLASS[size]
}

export function resolveCompactControlListRowClasses(size: CompactControlListRowSizeKey): string {
  return COMPACT_CONTROL_LIST_ROW_CLASS[size]
}

export function resolveCompactControlStepperButtonClasses(
  size: CompactControlStepperButtonSizeKey,
): string {
  return `${UI_COMPACT_CONTROL_BLOCK_CLASS} ${COMPACT_CONTROL_STEPPER_BUTTON_CLASS[size]}`
}

export function resolveCompactControlIconCompactSmClasses(): string {
  return `${UI_COMPACT_CONTROL_BLOCK_CLASS} ${UI_COMPACT_CONTROL_ICON_COMPACT_SM_CLASS}`
}

export const UI_COMPACT_CONTROL_SIZE_MODIFIER_CLASSES = [
  ...Object.values(COMPACT_CONTROL_RECIPE_CLASS),
  UI_COMPACT_CONTROL_ICON_COMPACT_SM_CLASS,
  ...Object.values(COMPACT_CONTROL_SEGMENT_CLASS),
  ...Object.values(COMPACT_CONTROL_TABS_TRIGGER_CLASS),
  ...Object.values(COMPACT_CONTROL_MENU_ITEM_CLASS),
  ...Object.values(COMPACT_CONTROL_LIST_ROW_CLASS),
  ...Object.values(COMPACT_CONTROL_STEPPER_BUTTON_CLASS),
  ...Object.values(COMPACT_CONTROL_GAP_CLASS),
] as const

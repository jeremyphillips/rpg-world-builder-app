export const UI_BUTTON_BLOCK_CLASS = 'ui-button' as const

export type ButtonAppearanceKey =
  | 'primary'
  | 'destructive'
  | 'warning'
  | 'secondary'
  | 'outline'
  | 'ghost'

export type ButtonChromeSizeKey = 'md' | 'xs' | 'sm' | 'lg'
export type ButtonIconSizeKey = 'icon-md' | 'icon-xs' | 'icon-sm' | 'icon-lg'

export type ButtonAppearanceSpec = {
  appearance: ButtonAppearanceKey
  className: string
  useCase: string
}

export const BUTTON_APPEARANCE_SPECS: readonly ButtonAppearanceSpec[] = [
  {
    appearance: 'primary',
    className: 'ui-button--primary',
    useCase: 'Default call to action',
  },
  {
    appearance: 'destructive',
    className: 'ui-button--destructive',
    useCase: 'Irreversible or dangerous actions',
  },
  {
    appearance: 'warning',
    className: 'ui-button--warning',
    useCase: 'Proceed-with-caution emphasis',
  },
  {
    appearance: 'secondary',
    className: 'ui-button--secondary',
    useCase: 'Secondary filled actions',
  },
  {
    appearance: 'outline',
    className: 'ui-button--outline',
    useCase: 'Neutral bordered controls and triggers',
  },
  {
    appearance: 'ghost',
    className: 'ui-button--ghost',
    useCase: 'Toolbar and low-chrome icon actions',
  },
] as const

export type ButtonSizeSpec = {
  size: string
  className: string
  controlHeight: string
  useCase: string
}

export const BUTTON_SIZE_SPECS: readonly ButtonSizeSpec[] = [
  {
    size: 'default',
    className: 'ui-button--md',
    controlHeight: '36px',
    useCase: 'Default labeled button',
  },
  {
    size: 'xs',
    className: 'ui-button--xs',
    controlHeight: '24px',
    useCase: 'Dense micro-actions (24px)',
  },
  {
    size: 'sm',
    className: 'ui-button--sm',
    controlHeight: '32px',
    useCase: 'Toolbar and filter actions',
  },
  {
    size: 'lg',
    className: 'ui-button--lg',
    controlHeight: '40px',
    useCase: 'Hero or emphasis actions',
  },
  {
    size: 'icon',
    className: 'ui-button--icon-md',
    controlHeight: '36px',
    useCase: 'Standard icon button',
  },
  {
    size: 'icon-xs',
    className: 'ui-button--icon-xs',
    controlHeight: '24px',
    useCase: 'Smallest icon hit target',
  },
  {
    size: 'icon-sm',
    className: 'ui-button--icon-sm',
    controlHeight: '32px',
    useCase: 'Toolbar icon button (matches labeled sm)',
  },
  {
    size: 'icon-lg',
    className: 'ui-button--icon-lg',
    controlHeight: '40px',
    useCase: 'Large icon button',
  },
] as const

export const UI_BUTTON_TEXT_SIZE_CLASS = 'ui-button--text' as const

export type ButtonTextSizeKey = 'default' | 'xs' | 'sm' | 'lg'

const TEXT_GEOMETRY_PREFIX = 'ui-button__text' as const

export const TEXT_BUTTON_SIZE_CLASS: Record<ButtonTextSizeKey, string> = {
  default: `${TEXT_GEOMETRY_PREFIX}--default`,
  xs: `${TEXT_GEOMETRY_PREFIX}--xs`,
  sm: `${TEXT_GEOMETRY_PREFIX}--sm`,
  lg: `${TEXT_GEOMETRY_PREFIX}--lg`,
}

export const UI_BUTTON_ATTACHED_SIZE_CLASS = 'ui-button--attached' as const

type LabeledSizeProp = 'default' | 'xs' | 'sm' | 'lg'
type IconSizeProp = 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'

function normalizeLabeledSize(size: LabeledSizeProp): ButtonChromeSizeKey {
  if (size === 'default') return 'md'
  return size
}

/** Labeled chrome + icon-only size modifiers (not text or attached). */
export function resolveButtonChromeSizeClass(size: LabeledSizeProp | IconSizeProp): string {
  if (size === 'icon-xs') return 'ui-button--icon-xs'
  if (size === 'icon-sm') return 'ui-button--icon-sm'
  if (size === 'icon-lg') return 'ui-button--icon-lg'
  if (size === 'icon') return 'ui-button--icon-md'

  const normalized = normalizeLabeledSize(size)
  return `ui-button--${normalized}`
}

export function resolveTextButtonGeometryClass(size: ButtonTextSizeKey = 'default'): string {
  return TEXT_BUTTON_SIZE_CLASS[size]
}

export const BUTTON_VARIANT_TO_APPEARANCE: Record<
  'default' | 'destructive' | 'warning' | 'secondary' | 'outline' | 'ghost',
  string
> = {
  default: 'ui-button--primary',
  destructive: 'ui-button--destructive',
  warning: 'ui-button--warning',
  secondary: 'ui-button--secondary',
  outline: 'ui-button--outline',
  ghost: 'ui-button--ghost',
}

/** twMerge group — derived from {@link BUTTON_APPEARANCE_SPECS}. */
export const UI_BUTTON_APPEARANCE_CLASSES = BUTTON_APPEARANCE_SPECS.map(
  (spec) => spec.className,
) as readonly string[]

/**
 * twMerge group — labeled, icon-only, and attached size modifiers.
 * `ui-button--text` stays out of this group so text chrome can compose with icon-only sizes.
 */
export const UI_BUTTON_SIZE_CLASSES = [
  ...BUTTON_SIZE_SPECS.map((spec) => spec.className),
  UI_BUTTON_ATTACHED_SIZE_CLASS,
] as readonly string[]

/** twMerge group — text button geometry modifiers. */
export const UI_BUTTON_TEXT_GEOMETRY_CLASSES = Object.values(
  TEXT_BUTTON_SIZE_CLASS,
) as readonly string[]

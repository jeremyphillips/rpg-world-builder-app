export const UI_BUTTON_BLOCK_CLASS = 'ui-button' as const

export type ButtonAppearanceKey =
  | 'primary'
  | 'destructive'
  | 'warning'
  | 'secondary'
  | 'outline'
  | 'ghost'

export type ButtonChromeSizeKey = 'md' | 'xs' | 'sm' | 'lg'
export type ButtonDensityKey = 'default' | 'compact'
export type ButtonIconSizeKey = 'icon-md' | 'icon-compact' | 'icon-xs' | 'icon-lg'

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
  density: ButtonDensityKey
  className: string
  controlHeight: string
  useCase: string
}

export const BUTTON_SIZE_SPECS: readonly ButtonSizeSpec[] = [
  {
    size: 'default',
    density: 'default',
    className: 'ui-button--md',
    controlHeight: '36px',
    useCase: 'Default labeled button',
  },
  {
    size: 'default',
    density: 'compact',
    className: 'ui-button--md-compact',
    controlHeight: '32px',
    useCase: 'Compact default labeled button',
  },
  {
    size: 'xs',
    density: 'default',
    className: 'ui-button--xs',
    controlHeight: '28px',
    useCase: 'Dense micro-actions',
  },
  {
    size: 'xs',
    density: 'compact',
    className: 'ui-button--xs-compact',
    controlHeight: '24px',
    useCase: 'Dense micro-actions with icons',
  },
  {
    size: 'sm',
    density: 'default',
    className: 'ui-button--sm',
    controlHeight: '32px',
    useCase: 'Toolbar and filter actions',
  },
  {
    size: 'sm',
    density: 'compact',
    className: 'ui-button--sm-compact',
    controlHeight: '24px',
    useCase: 'Compact toolbar actions',
  },
  {
    size: 'lg',
    density: 'default',
    className: 'ui-button--lg',
    controlHeight: '40px',
    useCase: 'Hero or emphasis actions',
  },
  {
    size: 'lg',
    density: 'compact',
    className: 'ui-button--lg-compact',
    controlHeight: '36px',
    useCase: 'Compact large emphasis',
  },
  {
    size: 'icon',
    density: 'default',
    className: 'ui-button--icon-md',
    controlHeight: '36px',
    useCase: 'Standard icon button',
  },
  {
    size: 'icon',
    density: 'compact',
    className: 'ui-button--icon-compact',
    controlHeight: '24px',
    useCase: 'Compact icon button',
  },
  {
    size: 'icon-xs',
    density: 'default',
    className: 'ui-button--icon-xs',
    controlHeight: '24px',
    useCase: 'Smallest icon hit target',
  },
  {
    size: 'icon-lg',
    density: 'default',
    className: 'ui-button--icon-lg',
    controlHeight: '40px',
    useCase: 'Large icon button',
  },
] as const

export const UI_BUTTON_TEXT_SIZE_CLASS = 'ui-button--text' as const

export type ButtonTextSizeKey = 'default' | 'xs' | 'sm' | 'lg'

const TEXT_GEOMETRY_PREFIX = 'ui-button__text' as const

export const TEXT_BUTTON_SIZE_CLASS: Record<ButtonTextSizeKey, Record<ButtonDensityKey, string>> = {
  default: {
    default: `${TEXT_GEOMETRY_PREFIX}--default`,
    compact: `${TEXT_GEOMETRY_PREFIX}--default-compact`,
  },
  xs: {
    default: `${TEXT_GEOMETRY_PREFIX}--xs`,
    compact: `${TEXT_GEOMETRY_PREFIX}--xs-compact`,
  },
  sm: {
    default: `${TEXT_GEOMETRY_PREFIX}--sm`,
    compact: `${TEXT_GEOMETRY_PREFIX}--sm-compact`,
  },
  lg: {
    default: `${TEXT_GEOMETRY_PREFIX}--lg`,
    compact: `${TEXT_GEOMETRY_PREFIX}--lg-compact`,
  },
}

export const UI_BUTTON_ATTACHED_SIZE_CLASS = 'ui-button--attached' as const

type LabeledSizeProp = 'default' | 'xs' | 'sm' | 'lg'
type IconSizeProp = 'icon' | 'icon-xs' | 'icon-lg'

function normalizeLabeledSize(size: LabeledSizeProp): ButtonChromeSizeKey {
  if (size === 'default') return 'md'
  return size
}

/** Labeled chrome + icon-only size modifiers (not text or attached). */
export function resolveButtonChromeSizeClass(
  size: LabeledSizeProp | IconSizeProp,
  density: ButtonDensityKey,
): string {
  if (size === 'icon-xs') return 'ui-button--icon-xs'
  if (size === 'icon-lg') return 'ui-button--icon-lg'
  if (size === 'icon') {
    return density === 'compact' ? 'ui-button--icon-compact' : 'ui-button--icon-md'
  }

  const normalized = normalizeLabeledSize(size)
  const suffix = density === 'compact' ? '-compact' : ''
  return `ui-button--${normalized}${suffix}`
}

export function resolveTextButtonGeometryClass(
  size: ButtonTextSizeKey = 'default',
  density: ButtonDensityKey = 'default',
): string {
  return TEXT_BUTTON_SIZE_CLASS[size][density]
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

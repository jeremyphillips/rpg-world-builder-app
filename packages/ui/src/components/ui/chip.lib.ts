export const CHIP_SIZES = ['xs', 'sm', 'md', 'lg'] as const

export type ChipSize = (typeof CHIP_SIZES)[number]

/** twMerge group — chip size modifiers. */
export const UI_CHIP_SIZE_CLASSES = CHIP_SIZES.map((size) => `ui-chip--${size}` as const)

export function chipSizeClass(size: ChipSize): (typeof UI_CHIP_SIZE_CLASSES)[number] {
  return `ui-chip--${size}`
}

export function chipRemovablePaddingClass(size: ChipSize): `ui-chip--removable-${ChipSize}` {
  return `ui-chip--removable-${size}`
}

export const CHIP_SIZES = ['xs', 'sm', 'md', 'lg'] as const

export type ChipSize = (typeof CHIP_SIZES)[number]

/** twMerge group — chip size modifiers. */
export const UI_CHIP_SIZE_CLASSES = CHIP_SIZES.map((size) => `ui-chip--${size}` as const)

/** twMerge group — dismiss hit-target modifiers. Separate from chip shell size. */
export const UI_CHIP_REMOVE_SIZE_CLASSES = CHIP_SIZES.map(
  (size) => `ui-chip__remove--${size}` as const,
)

export function chipSizeClass(size: ChipSize): (typeof UI_CHIP_SIZE_CLASSES)[number] {
  return `ui-chip--${size}`
}

export function chipRemovablePaddingClass(size: ChipSize): `ui-chip--removable-${ChipSize}` {
  return `ui-chip--removable-${size}`
}

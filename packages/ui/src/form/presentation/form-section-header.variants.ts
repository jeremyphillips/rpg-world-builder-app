import { cn } from '../../lib/utils'

/** Section heading row when an action sits beside the label stack. */
export const formSectionHeaderActionLayoutGridClasses =
  'grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-4'

/** Label + stacked hint — action aligns with the top of the heading stack. */
export const formSectionHeaderActionLayoutAlignWithHintClasses = 'items-start'

/** Single-line label row — action vertically centers with the heading line. */
export const formSectionHeaderActionLayoutAlignSingleLineClasses = 'items-center'

/**
 * @deprecated Use {@link resolveFormSectionHeaderActionLayoutClasses} — alignment depends on hint stack.
 */
export const formSectionHeaderActionLayoutClasses = cn(
  formSectionHeaderActionLayoutGridClasses,
  formSectionHeaderActionLayoutAlignWithHintClasses,
)

export function resolveFormSectionHeaderActionLayoutClasses(options: {
  hasStackedHint: boolean
}): string {
  return cn(
    formSectionHeaderActionLayoutGridClasses,
    options.hasStackedHint
      ? formSectionHeaderActionLayoutAlignWithHintClasses
      : formSectionHeaderActionLayoutAlignSingleLineClasses,
  )
}

export const formSectionHeaderActionSlotClasses = 'flex shrink-0 items-center justify-self-end'

/** Label line accessories (required marker, issue links) sit beside the label text. */
export const formSectionHeaderLabelRowClasses = 'flex min-w-0 items-center gap-2'

/** Vertical gap between section heading label and hint — 2px below the heading line. */
export const formSectionHeaderHeadingStackClasses = 'flex flex-col gap-0.5'

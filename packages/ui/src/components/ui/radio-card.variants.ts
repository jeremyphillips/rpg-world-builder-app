import { cva } from 'class-variance-authority'

const radioCardCardBase =
  'group relative flex w-full cursor-pointer flex-col rounded-xl border border-border bg-card text-left text-card-foreground shadow-sm transition-colors hover:border-primary/50 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-accent/30 data-[state=checked]:ring-1 data-[state=checked]:ring-primary/20 aria-invalid:border-destructive'

const radioCardRowBase =
  'group relative flex w-full cursor-pointer flex-col rounded-md border-0 bg-transparent text-left text-card-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-muted/50 aria-invalid:border aria-invalid:border-destructive'

/** Card-style radio option: selected, hover, and focus states use design tokens only. */
export const radioCardVariants = cva('', {
  variants: {
    variant: {
      card: radioCardCardBase,
      row: radioCardRowBase,
    },
    density: {
      default: '',
      compact: '',
    },
  },
  compoundVariants: [
    { variant: 'card', density: 'default', class: 'gap-2 p-4 sm:p-6' },
    { variant: 'card', density: 'compact', class: 'gap-1 p-3' },
    { variant: 'row', density: 'default', class: 'gap-1 px-0 py-2' },
    { variant: 'row', density: 'compact', class: 'gap-0.5 px-0 py-2' },
  ],
  defaultVariants: {
    variant: 'card',
    density: 'default',
  },
})

/** Outer shell when a details action sits beside the radio item (avoids nested interactives). */
export const radioCardShellVariants = cva(
  'relative overflow-hidden rounded-xl border border-border bg-card text-left text-card-foreground shadow-sm transition-colors has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background',
  {
    variants: {
      density: {
        default: 'p-4 sm:p-6',
        compact: 'p-3',
      },
      selected: {
        true: 'border-card-selected-border bg-accent/30',
        false: 'hover:border-primary/50 hover:bg-accent/50',
      },
    },
    defaultVariants: {
      density: 'default',
      selected: false,
    },
  },
)

/** Grid for radio + title row + right-aligned details link on one line. */
export const radioCardDetailsGridVariants = cva(
  'grid w-full grid-cols-[auto_1fr_auto] items-start gap-x-3',
  {
    variants: {
      density: {
        default: 'gap-y-2',
        compact: 'gap-y-1',
      },
    },
    defaultVariants: {
      density: 'default',
    },
  },
)

/** Radix item wrapper — children participate in the parent details grid. */
export const radioCardItemWithDetailsVariants = cva(
  'contents cursor-pointer border-0 bg-transparent p-0 text-left text-inherit shadow-none outline-none disabled:cursor-not-allowed disabled:opacity-50',
)

/** Right-aligned details link aligned with the title row. */
export const radioCardDetailsInlineSlotVariants = cva('col-start-3 row-start-1 shrink-0 self-start')

/** Decorative radio circle shown inside the card, synced to the parent item state. */
export const radioCardControlVariants = cva(
  'flex aspect-square shrink-0 items-center justify-center rounded-full border border-input text-primary shadow-sm transition-colors group-data-[state=checked]:border-primary',
  {
    variants: {
      variant: {
        card: 'size-5',
        row: 'size-4',
      },
    },
    defaultVariants: {
      variant: 'card',
    },
  },
)

export const radioCardIndicatorVariants = cva(
  'opacity-0 transition-opacity group-data-[state=checked]:opacity-100',
)

export const radioCardBodyVariants = cva('flex min-w-0 flex-1 flex-col', {
  variants: {
    density: {
      default: 'gap-2',
      compact: 'gap-1',
    },
  },
  defaultVariants: {
    density: 'default',
  },
})

export const radioCardRootLayoutVariants = cva('flex items-start', {
  variants: {
    controlPosition: {
      left: 'gap-4',
      right: 'flex-row-reverse gap-4',
    },
    density: {
      default: '',
      compact: 'gap-3',
    },
  },
  defaultVariants: {
    controlPosition: 'left',
    density: 'default',
  },
})

export const radioCardMetaListVariants = cva('flex flex-wrap gap-1.5')

export const radioCardTitleVariants = cva('text-md font-bold')

export const radioCardTitleRowVariants = cva('flex min-w-0 flex-wrap items-center gap-2')

/** Inline muted copy immediately after the card title (e.g. dependent-choice status). */
export const radioCardTitleMetaVariants = cva('text-muted-foreground')

export const radioCardSummaryLinesVariants = cva('flex flex-col gap-0.5')

export const radioCardSummaryVariants = cva('text-muted-foreground')

export const radioCardDetailsLinkVariants = cva('h-auto shrink-0 px-0 py-0 text-muted-foreground')

/** Horizontal padding shared by compact card shells and embedded configuration panels. */
export const radioCardCompactPaddingXClasses = 'px-3'

export const radioCardCompactPaddingRightClasses = 'pr-3'

/**
 * Left inset aligning panel copy with the compact card body column
 * (shell padding + radio control + column gap).
 */
export const radioCardCompactBodyInsetClasses = 'pl-[calc(0.75rem+1.25rem+0.75rem)]'

/** Panel horizontal padding: body-column inset left, shell padding right. */
export const radioCardCompactPanelPaddingClasses = `${radioCardCompactBodyInsetClasses} ${radioCardCompactPaddingRightClasses}`

/** Slot below the primary card row when a selected option reveals nested content. */
export const radioCardEmbeddedSlotVariants = cva('', {
  variants: {
    tone: {
      divider: 'border-t border-border',
      panel: 'border-t border-border bg-muted',
    },
    density: {
      default: '',
      compact: '',
    },
  },
  compoundVariants: [
    { tone: 'divider', density: 'default', class: 'mt-4 pt-4' },
    { tone: 'divider', density: 'compact', class: 'mt-3 pt-3' },
    {
      tone: 'panel',
      density: 'default',
      class: '-mx-4 -mb-4 mt-4 rounded-b-xl pb-4 pt-4 sm:-mx-6',
    },
    {
      tone: 'panel',
      density: 'compact',
      class: '-mx-3 -mb-3 mt-3 rounded-b-xl pb-3 pt-3',
    },
  ],
  defaultVariants: {
    tone: 'divider',
    density: 'default',
  },
})

/** Vertical gap between sibling radio options in a group. */
export const radioCardGroupGapVariants = cva('grid', {
  variants: {
    variant: {
      card: 'gap-3',
      row: 'gap-1',
    },
  },
  defaultVariants: {
    variant: 'card',
  },
})

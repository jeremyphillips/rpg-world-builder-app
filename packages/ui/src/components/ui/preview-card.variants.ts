import { cva, type VariantProps } from 'class-variance-authority'

const previewCardListInteractiveClasses =
  'hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground'

export const previewCardRootVariants = cva('w-full text-left transition-colors', {
  variants: {
    tone: {
      default: 'border border-border bg-background',
      transparent: 'border-0 bg-transparent',
      selected: 'border border-border bg-muted/30',
    },
    density: {
      compact: '',
      comfortable: '',
    },
    layout: {
      /** Flush list row for dropdown/combobox menus — default site-wide. */
      list: 'rounded-none',
      /** Bordered, rounded card for standalone summaries. */
      card: 'rounded-md',
    },
    interactive: {
      true: 'cursor-pointer',
      false: 'cursor-default',
    },
  },
  compoundVariants: [
    {
      tone: 'default',
      interactive: true,
      layout: 'card',
      className: 'hover:bg-accent hover:text-accent-foreground',
    },
    {
      tone: 'transparent',
      interactive: true,
      layout: 'card',
      className: 'hover:bg-accent hover:text-accent-foreground',
    },
    {
      tone: 'transparent',
      interactive: true,
      layout: 'list',
      className: previewCardListInteractiveClasses,
    },
    {
      tone: 'default',
      interactive: true,
      layout: 'list',
      className: previewCardListInteractiveClasses,
    },
    {
      tone: 'selected',
      interactive: true,
      className: 'hover:bg-muted/40 hover:text-foreground',
    },
  ],
  defaultVariants: {
    tone: 'default',
    density: 'compact',
    layout: 'list',
    interactive: false,
  },
})

export const previewCardBodyVariants = cva('flex items-start gap-2', {
  variants: {
    density: {
      compact: '',
      comfortable: '',
    },
    layout: {
      list: 'px-3 py-1.5',
      card: '',
    },
  },
  compoundVariants: [
    {
      layout: 'card',
      density: 'compact',
      className: 'px-2 py-1.5',
    },
    {
      layout: 'card',
      density: 'comfortable',
      className: 'px-3 py-2.5',
    },
  ],
  defaultVariants: {
    density: 'compact',
    layout: 'list',
  },
})

export const previewCardTitleVariants = cva('truncate font-body-emphasis', {
  variants: {
    density: {
      compact: '',
      comfortable: 'text-sm',
    },
    layout: {
      list: 'mb-1 text-sm',
      card: '',
    },
  },
  compoundVariants: [
    {
      layout: 'card',
      density: 'compact',
      className: 'text-xs',
    },
    {
      layout: 'card',
      density: 'comfortable',
      className: 'text-sm',
    },
  ],
  defaultVariants: {
    density: 'compact',
    layout: 'list',
  },
})

export const previewCardDescriptionVariants = cva('text-muted-foreground', {
  variants: {
    density: {
      compact: 'text-xs',
      comfortable: 'text-sm',
    },
    inline: {
      true: 'inline',
      false: 'truncate',
    },
  },
  defaultVariants: {
    density: 'compact',
    inline: false,
  },
})

/** Secondary line for list rows (e.g. availability notes) — matches description scale. */
export const previewCardNoteVariants = cva('truncate text-muted-foreground italic', {
  variants: {
    density: {
      compact: 'text-xs',
      comfortable: 'text-sm',
    },
  },
  defaultVariants: {
    density: 'compact',
  },
})

export type PreviewCardRootVariantProps = VariantProps<typeof previewCardRootVariants>
export type PreviewCardLayout = NonNullable<PreviewCardRootVariantProps['layout']>

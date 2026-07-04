import { cva, type VariantProps } from 'class-variance-authority'

export const previewCardRootVariants = cva('w-full rounded-md text-left transition-colors', {
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
    interactive: {
      true: 'cursor-pointer',
      false: 'cursor-default',
    },
  },
  compoundVariants: [
    {
      tone: 'default',
      interactive: true,
      className: 'hover:bg-accent hover:text-accent-foreground',
    },
    {
      tone: 'transparent',
      interactive: true,
      className: 'hover:bg-accent hover:text-accent-foreground',
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
    interactive: false,
  },
})

export const previewCardBodyVariants = cva('flex items-start gap-2', {
  variants: {
    density: {
      compact: 'px-2 py-1.5',
      comfortable: 'px-3 py-2.5',
    },
  },
  defaultVariants: {
    density: 'compact',
  },
})

export const previewCardTitleVariants = cva('truncate font-body-emphasis', {
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

export type PreviewCardRootVariantProps = VariantProps<typeof previewCardRootVariants>

import { cva, type VariantProps } from 'class-variance-authority'

export const richTextLinkPreviewCardRootVariants = cva(
  'w-full rounded-md border text-left transition-colors',
  {
    variants: {
      tone: {
        default: 'border-border bg-background',
        selected: 'border-border bg-muted/30',
      },
      interactive: {
        true: 'cursor-pointer hover:bg-accent hover:text-accent-foreground',
        false: 'cursor-default',
      },
    },
    compoundVariants: [
      {
        tone: 'selected',
        interactive: true,
        className: 'hover:bg-muted/40 hover:text-foreground',
      },
    ],
    defaultVariants: {
      tone: 'default',
      interactive: false,
    },
  },
)

export const richTextLinkPreviewCardEyebrowVariants = cva(
  'text-[10px] font-semibold uppercase tracking-wide text-muted-foreground',
)

export const richTextLinkPreviewCardTitleVariants = cva('truncate text-sm font-medium')
export const richTextLinkPreviewCardMetaVariants = cva('truncate text-xs text-muted-foreground')

export type RichTextLinkPreviewCardRootVariantProps = VariantProps<
  typeof richTextLinkPreviewCardRootVariants
>

import { cva } from 'class-variance-authority'

export const directListChromeInsetClasses = 'px-3'

export const conversationListRowVariants = cva(
  'flex items-start gap-3 px-3 py-3 transition-colors hover:bg-muted',
  {
    variants: {
      selected: {
        true: 'border-l-2 border-row-selected-border bg-row-selected hover:bg-row-selected',
        false: 'border-l-2 border-transparent',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
)

export const conversationListTitleUnreadClasses = 'font-body-emphasis'

import { cva } from 'class-variance-authority'

/** Horizontal inset for card chrome. Plain chrome leaves padding to the host. */
export const previewRailSectionInsetVariants = cva('', {
  variants: {
    chrome: {
      card: 'px-4',
      plain: '',
    },
  },
  defaultVariants: {
    chrome: 'card',
  },
})

/** Fills a viewport-bounded aside column; internal scroll owns overflow. */
export const previewRailLayoutVariants = cva('', {
  variants: {
    layout: {
      default: '',
      fill: 'min-h-0 w-full min-w-0 flex-1 overflow-hidden',
    },
  },
  defaultVariants: {
    layout: 'default',
  },
})

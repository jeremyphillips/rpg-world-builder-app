import { cva } from 'class-variance-authority'

export const drawerShellBodyVariants = cva('', {
  variants: {
    mode: {
      scrolling: '',
      managed: 'flex min-h-0 flex-1 flex-col overflow-hidden p-0',
    },
  },
  defaultVariants: {
    mode: 'scrolling',
  },
})

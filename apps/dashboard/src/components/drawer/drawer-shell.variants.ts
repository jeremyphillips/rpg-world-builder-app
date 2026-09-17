import { cva } from 'class-variance-authority'

export const drawerShellBodyVariants = cva('', {
  variants: {
    mode: {
      scrolling: '',
      managed: '',
    },
  },
  defaultVariants: {
    mode: 'scrolling',
  },
})

import { cva, type VariantProps } from 'class-variance-authority'

import { borderStrength } from './border-strength'
import { TOAST_TONES } from './toast.constants'

export { TOAST_TONES }

const TOAST_STATUS_TONES = ['success', 'warning', 'destructive'] as const

/** Status borders. Default uses `borderStrength()` and is not in this group. */
export const UI_TOAST_TONE_CLASSES = TOAST_STATUS_TONES.map((tone) => `ui-toast--${tone}` as const)

/** Radix swipe and enter/exit. Not semantic CSS — swipe offsets are Radix variables. */
export const toastMotionClasses = [
  'transition-all',
  'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out',
  'data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
].join(' ')

export const toastVariants = cva(['ui-toast', toastMotionClasses], {
  variants: {
    tone: {
      default: borderStrength(),
      success: 'ui-toast--success',
      warning: 'ui-toast--warning',
      destructive: 'ui-toast--destructive',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})

export type ToastVariantProps = VariantProps<typeof toastVariants>

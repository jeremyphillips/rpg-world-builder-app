import { cva, type VariantProps } from 'class-variance-authority'

import { TOAST_TONES } from './toast.constants'

export { TOAST_TONES }

export const toastVariants = cva(
  [
    'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg',
    'transition-all',
    'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out',
    'data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
  ].join(' '),
  {
    variants: {
      tone: {
        // Opaque panel fill — status *-subtle washes are translucent and show content behind floating toasts.
        default: 'border-border bg-card text-foreground',
        success: 'border-success-muted bg-card text-foreground',
        warning: 'border-warning-muted bg-card text-foreground',
        destructive: 'border-destructive-muted bg-card text-foreground',
      },
    },
    defaultVariants: {
      tone: 'default',
    },
  },
)

export const toastViewportVariants = cva([
  'fixed z-toast flex max-h-screen flex-col gap-2 outline-none',
  'bottom-0 left-0 right-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]',
  'sm:bottom-auto sm:left-auto sm:top-4 sm:right-4 sm:w-[min(100vw-2rem,26.25rem)] sm:min-w-[22.5rem] sm:px-0 sm:pb-0',
])

export const toastTitleVariants = cva('text-sm font-medium text-foreground')

export const toastDescriptionVariants = cva('text-sm text-muted-foreground')

export const toastActionsVariants = cva('flex shrink-0 items-center gap-2')

export const toastCloseVariants = cva(
  'rounded-sm text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

export type ToastVariantProps = VariantProps<typeof toastVariants>

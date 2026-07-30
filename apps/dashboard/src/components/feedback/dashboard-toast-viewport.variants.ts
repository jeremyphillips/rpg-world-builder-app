import { cva } from 'class-variance-authority'

/**
 * Body portal shell — owns `fixed` + `z-toast`. Radix wraps the viewport `ol` in
 * DismissableLayer.Branch without layer classes; keep stacking on this element.
 */
export const dashboardToastPortalVariants = cva([
  'pointer-events-none fixed z-toast flex max-h-screen w-full flex-col gap-2',
  'bottom-0 left-0 right-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]',
  'md:bottom-auto md:left-auto md:top-[calc(3rem+1rem)] md:right-6 md:w-[min(100vw-2rem,26.25rem)] md:min-w-[22.5rem] md:px-0 md:pb-0',
])

/** Inner Radix viewport `ol` — layout only; layer lives on the portal shell. */
export const dashboardToastViewportVariants = cva([
  '!static !z-auto flex w-full flex-col gap-2 outline-none',
])

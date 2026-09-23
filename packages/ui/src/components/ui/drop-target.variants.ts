import { cva } from 'class-variance-authority'

/** Alpha scrim surface for every active drop target (inline fields and modal cover overlays). */
export const dropTargetActiveSurfaceClasses =
  'border-drop-target-overlay-border bg-drop-target-overlay text-drop-target-overlay-foreground'

/** Alpha scrim surface when dragged files fail validation. */
export const dropTargetInvalidSurfaceClasses =
  'border-destructive-muted bg-drop-target-overlay-invalid text-drop-target-overlay-invalid-foreground'

export const dropTargetActiveIconClasses = 'text-drop-target-overlay-foreground'

export const dropTargetInvalidIconClasses = 'text-drop-target-overlay-invalid-foreground'

export const dropTargetActiveTitleClasses = 'text-drop-target-overlay-foreground'

export const dropTargetInvalidTitleClasses = 'text-drop-target-overlay-invalid-foreground'

export const dropTargetSurfaceVariants = cva(
  [
    'relative flex flex-col items-center justify-center text-center',
    'rounded-md border-2 border-dashed transition-colors duration-150',
  ],
  {
    variants: {
      layout: {
        inline: '',
        cover: 'pointer-events-none absolute inset-0 z-10',
      },
      density: {
        compact: 'gap-2 px-6 py-8',
        comfortable: 'min-h-48 gap-3 px-6 py-10',
      },
      state: {
        idle: 'border-border bg-sunken text-muted-foreground',
        active: dropTargetActiveSurfaceClasses,
        invalid: dropTargetInvalidSurfaceClasses,
        disabled: 'pointer-events-none border-border text-muted-foreground opacity-50',
      },
    },
    defaultVariants: {
      layout: 'inline',
      density: 'compact',
      state: 'idle',
    },
  },
)

export const dropTargetIconVariants = cva('', {
  variants: {
    density: {
      compact: 'size-8',
      comfortable: 'size-10',
    },
    state: {
      idle: 'text-muted-foreground',
      active: dropTargetActiveIconClasses,
      invalid: dropTargetInvalidIconClasses,
      disabled: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    density: 'compact',
    state: 'idle',
  },
})

export const dropTargetTitleVariants = cva('font-semibold', {
  variants: {
    density: {
      compact: 'text-sm',
      comfortable: 'text-base',
    },
    state: {
      idle: 'text-foreground',
      active: dropTargetActiveTitleClasses,
      invalid: dropTargetInvalidTitleClasses,
      disabled: 'text-foreground',
    },
  },
  defaultVariants: {
    density: 'compact',
    state: 'idle',
  },
})

export const dropTargetDescriptionVariants = cva('text-sm text-muted-foreground')

export const dropTargetRequirementsVariants = cva('text-xs text-muted-foreground')

export const dropTargetActionsVariants = cva('flex flex-col items-center gap-2')

export const dropTargetBrowseIconVariants = cva('size-4')

/** Hides idle chrome in place so inline drop targets keep stable height during active/invalid. */
export const dropTargetLayoutPreserveHiddenVariants = cva('invisible pointer-events-none')

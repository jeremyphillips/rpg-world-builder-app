import { cva, type VariantProps } from 'class-variance-authority'

const scoreTokenSurfaceTokenClasses =
  'rounded-md border border-border bg-secondary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

const scoreTokenInteractiveClasses = 'cursor-grab touch-none active:cursor-grabbing'

/** Token chrome on hover/focus — padding only while interactive affordance is visible. */
const scoreTokenAssignedPlainInteractiveClasses =
  'hover:rounded-md hover:border hover:border-border hover:bg-secondary hover:px-4 hover:py-2 hover:shadow-sm focus-visible:rounded-md focus-visible:border focus-visible:border-border focus-visible:bg-secondary focus-visible:px-4 focus-visible:py-2 focus-visible:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const scoreTokenVariants = cva(
  'inline-flex shrink-0 items-center justify-center tabular-nums transition-colors',
  {
    variants: {
      size: {
        pool: 'size-16 min-h-16 min-w-16 p-0 text-lg font-semibold',
        assigned:
          'min-h-16 w-fit min-w-0 px-0 py-0 font-semibold text-[length:var(--text-heading-2)] leading-[length:var(--text-heading-2--line-height)]',
      },
      surface: {
        token: scoreTokenSurfaceTokenClasses,
        plain: 'border-0 bg-transparent shadow-none',
        placeholder: 'text-center text-sm font-normal text-muted-foreground',
      },
      interactive: {
        true: '',
        false: 'cursor-default',
      },
      dragging: {
        true: 'opacity-40',
        false: '',
      },
      dragOverlay: {
        true: 'pointer-events-none shadow-lg',
        false: '',
      },
      sourceHidden: {
        true: 'invisible',
        false: '',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
    },
    compoundVariants: [
      {
        size: 'assigned',
        surface: 'token',
        class: 'px-4 py-2',
      },
      {
        surface: 'token',
        interactive: true,
        class: scoreTokenInteractiveClasses,
      },
      {
        size: 'assigned',
        surface: 'plain',
        interactive: true,
        class: [scoreTokenInteractiveClasses, scoreTokenAssignedPlainInteractiveClasses],
      },
      {
        size: 'assigned',
        surface: 'plain',
        dragging: true,
        class: scoreTokenSurfaceTokenClasses,
      },
      {
        size: 'assigned',
        surface: 'plain',
        sourceHidden: true,
        class: 'opacity-0',
      },
      {
        surface: 'placeholder',
        interactive: false,
        class: 'cursor-default',
      },
      {
        surface: 'placeholder',
        class: 'pointer-events-none',
      },
    ],
    defaultVariants: {
      size: 'pool',
      surface: 'token',
      interactive: false,
      dragging: false,
      dragOverlay: false,
      sourceHidden: false,
      disabled: false,
    },
  },
)

export type ScoreTokenVariantProps = VariantProps<typeof scoreTokenVariants>

export function resolveScoreTokenSurface({
  surface,
  dragging,
  dragOverlay,
  sourceHidden,
}: {
  surface: NonNullable<ScoreTokenVariantProps['surface']>
  dragging?: boolean
  dragOverlay?: boolean
  sourceHidden?: boolean
}): NonNullable<ScoreTokenVariantProps['surface']> {
  if (surface === 'placeholder') return 'placeholder'
  if (dragOverlay || (dragging && !sourceHidden)) return 'token'
  return surface
}

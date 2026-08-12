import { cva } from 'class-variance-authority'

/** Surface-owned inline-start inset — density × leading chrome policy. */
export const ENTITY_SURFACE_INLINE_START_VAR = '--entity-surface-inline-start'

/** Surface-owned inline-end inset — density only. */
export const ENTITY_SURFACE_INLINE_END_VAR = '--entity-surface-inline-end'

/** Asymmetric horizontal inset from surface tokens — header/body/shell padding. */
export const entitySurfaceHorizontalInsetClasses =
  'pl-[var(--entity-surface-inline-start)] pr-[var(--entity-surface-inline-end)]'

/**
 * Publishes surface inset tokens on card shells (CEC, DEC article).
 *
 * |              | no leading | leading present |
 * | compact      | 12px start | 4px start       |
 * | comfortable  | 20px start | 8px start       |
 * | end (both)   | 12px / 20px unchanged       |
 */
export const entitySurfaceInsetVariants = cva('', {
  variants: {
    density: {
      compact: '',
      comfortable: '',
    },
    leading: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      density: 'compact',
      leading: false,
      class:
        '[--entity-surface-inline-start:calc(var(--spacing)*3)] [--entity-surface-inline-end:calc(var(--spacing)*3)]',
    },
    {
      density: 'compact',
      leading: true,
      class:
        '[--entity-surface-inline-start:calc(var(--spacing)*1)] [--entity-surface-inline-end:calc(var(--spacing)*3)]',
    },
    {
      density: 'comfortable',
      leading: false,
      class:
        '[--entity-surface-inline-start:calc(var(--spacing)*5)] [--entity-surface-inline-end:calc(var(--spacing)*5)]',
    },
    {
      density: 'comfortable',
      leading: true,
      class:
        '[--entity-surface-inline-start:calc(var(--spacing)*2)] [--entity-surface-inline-end:calc(var(--spacing)*5)]',
    },
  ],
  defaultVariants: {
    density: 'comfortable',
    leading: false,
  },
})

export const entitySurfaceVerticalInsetVariants = cva('', {
  variants: {
    density: {
      compact: 'py-2',
      comfortable: 'py-3',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

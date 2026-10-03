import { cva } from 'class-variance-authority'

import {
  ENTITY_SURFACE_INLINE_END_VAR,
  ENTITY_SURFACE_INLINE_START_VAR,
} from '../anatomy/entity-geometry.tokens'

export { ENTITY_SURFACE_INLINE_END_VAR, ENTITY_SURFACE_INLINE_START_VAR }

/** Asymmetric horizontal inset from surface tokens — header/body/shell padding. */
export const entitySurfaceHorizontalInsetClasses =
  'pl-[var(--entity-surface-inline-start)] pr-[var(--entity-surface-inline-end)]'

/**
 * Expanded body inline edges — static literals (Tailwind cannot read interpolated classes).
 * Values are published by `buildEntityContentOffsetStyle`.
 */
export const entityBodyInlineStartClasses = 'pl-[var(--entity-body-inline-start)]'

export const entityBodyInlineEndClasses = 'pr-[var(--entity-body-inline-end)]'

/**
 * Publishes surface inset tokens on card shells (CEC, DEC article, catalog row, detail row).
 * Density publishes two base values; each edge independently picks one.
 *
 * |             | default edge | utility edge |
 * | compact     | 16px         | 4px          |
 * | comfortable | 20px         | 8px          |
 *
 * `start: 'utility'` — leading grip/caret present.
 * `end: 'utility'` — trailing `utility` or chevron `indicator` (ghost 24px controls).
 * Expanded bodies always use the default end via `--entity-body-inline-end`.
 */
export const entitySurfaceInsetVariants = cva('', {
  variants: {
    density: {
      compact:
        '[--entity-surface-inset:calc(var(--spacing)*4)] [--entity-surface-utility-inset:calc(var(--spacing)*1)]',
      comfortable:
        '[--entity-surface-inset:calc(var(--spacing)*5)] [--entity-surface-utility-inset:calc(var(--spacing)*2)]',
    },
    start: {
      default: '[--entity-surface-inline-start:var(--entity-surface-inset)]',
      utility: '[--entity-surface-inline-start:var(--entity-surface-utility-inset)]',
    },
    end: {
      default: '[--entity-surface-inline-end:var(--entity-surface-inset)]',
      utility: '[--entity-surface-inline-end:var(--entity-surface-utility-inset)]',
    },
  },
  defaultVariants: {
    density: 'comfortable',
    start: 'default',
    end: 'default',
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

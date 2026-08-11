import { cva } from 'class-variance-authority'

import { cn, establishSurfaceCurrent } from '@rpg/ui'

import { ENTITY_LEADING_OFFSET_VAR } from './entity-leading-rail.lib'

/**
 * Density-owned horizontal inset shared by DEC header edges and body inline-end.
 * Leading utilities only extend the body/header content *start* — never the end.
 */
export const DISCLOSURE_ENTITY_DENSITY_INLINE_VAR = '--entity-density-inline'

/** Body content start: density inset + leading utility offset. */
export const disclosureEntityCardBodyInlineStartClasses = `pl-[calc(var(--entity-density-inline)+var(${ENTITY_LEADING_OFFSET_VAR}))]`

/** Body content end: density inset only — independent of trailing actions. */
export const disclosureEntityCardBodyInlineEndClasses = 'pr-[var(--entity-density-inline)]'

/** Bordered disclosure shell — owns card plane so nested form hosts cannot bleed fill. */
export const disclosureEntityCardShellVariants = cva(
  cn(
    'w-full min-w-0 overflow-hidden rounded-md border border-border bg-card',
    establishSurfaceCurrent('card'),
  ),
  {
    variants: {
      disabled: {
        true: 'opacity-60',
        false: '',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
)

/** Strip CollapsibleListItem outer chrome and publish DEC density tokens. */
export const disclosureEntityCardListItemVariants = cva('border-0 rounded-none shadow-none', {
  variants: {
    density: {
      compact: '[--entity-density-inline:calc(var(--spacing)*3)]',
      comfortable: '[--entity-density-inline:calc(var(--spacing)*5)]',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

/** Density-aware header inset — same inline token as body end edge. */
export const disclosureEntityCardHeaderPaddingVariants = cva('min-w-0', {
  variants: {
    density: {
      compact: 'px-[var(--entity-density-inline)] py-2',
      comfortable: 'px-[var(--entity-density-inline)] py-3',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

/**
 * Full-bleed expanded body wash — divider/wash span shell edge.
 * Inline-start = density inset + leading indent; inline-end = density inset only.
 */
export const disclosureEntityCardBodyWashVariants = cva(
  cn(
    'border-t border-border-subtle bg-surface-muted',
    establishSurfaceCurrent('surface-muted'),
    disclosureEntityCardBodyInlineStartClasses,
    disclosureEntityCardBodyInlineEndClasses,
  ),
  {
    variants: {
      density: {
        compact: 'pb-3 pt-3',
        comfortable: 'pb-3 pt-3',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  },
)

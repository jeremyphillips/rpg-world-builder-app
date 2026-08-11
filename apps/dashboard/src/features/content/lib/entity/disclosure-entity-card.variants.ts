import { cva } from 'class-variance-authority'

import { cn, establishSurfaceCurrent } from '@rpg/ui'

/**
 * Density-owned horizontal inset shared by DEC header edges and body inline-end.
 * Leading utilities only extend the body/header content *start* — never the end.
 */
export const DISCLOSURE_ENTITY_DENSITY_INLINE_VAR = '--entity-density-inline'

/** Body content start — value published on DEC article as {@link ENTITY_BODY_INLINE_START_VAR}. */
export const disclosureEntityCardBodyInlineStartClasses = 'pl-[var(--entity-body-inline-start)]'

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
      density: {
        compact: '[--entity-density-inline:calc(var(--spacing)*3)]',
        comfortable: '[--entity-density-inline:calc(var(--spacing)*5)]',
      },
      disabled: {
        true: 'opacity-60',
        false: '',
      },
    },
    defaultVariants: {
      density: 'comfortable',
      disabled: false,
    },
  },
)

/** Strip CollapsibleListItem outer chrome — density tokens live on DEC article. */
export const disclosureEntityCardListItemVariants = cva('border-0 rounded-none shadow-none')

/** Density-aware header inset — fills the CLI toolbar region so anatomy column 3 can align trailing. */
export const disclosureEntityCardHeaderPaddingVariants = cva('w-full min-w-0', {
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

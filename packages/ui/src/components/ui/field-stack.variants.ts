import { cva, type VariantProps } from 'class-variance-authority'

/** Surface tone for dependents-only chrome on toggle-dependent stacks. */
export type FieldStackDependentsTone = 'subtle' | 'warning' | 'error'

/** Where `dependentsChrome` tone applies on toggle-dependent stacks. */
export type FieldStackDependentsChromeScope = 'wrapper' | 'arrayItems'

/**
 * Border/bg tone only — no layout padding. Shared by stack dependents wrapper
 * chrome and array item shells when `dependentsChromeScope: 'arrayItems'`.
 */
export const fieldSurfaceToneVariants = cva('', {
  variants: {
    tone: {
      subtle: 'border-border bg-muted/30',
      /** Stub until warning design tokens exist — distinct from subtle via accent wash. */
      warning: 'border-border bg-accent/30',
      error: 'border-destructive/50 bg-destructive/10',
    },
  },
  defaultVariants: {
    tone: 'subtle',
  },
})

export type FieldSurfaceToneVariantProps = VariantProps<typeof fieldSurfaceToneVariants>

export type FieldStackDependentsChromeVariantProps = VariantProps<
  typeof fieldStackDependentsChromeVariants
>

/**
 * Border/bg inset around stack dependents (index ≥ 1). Tones are token-driven;
 * extend the `tone` map when new semantic colors land (e.g. `--warning`).
 */
export const fieldStackDependentsChromeVariants = cva('rounded-md border p-3', {
  variants: {
    tone: {
      subtle: '',
      warning: '',
      error: '',
    },
  },
  compoundVariants: [
    { tone: 'subtle', class: fieldSurfaceToneVariants({ tone: 'subtle' }) },
    { tone: 'warning', class: fieldSurfaceToneVariants({ tone: 'warning' }) },
    { tone: 'error', class: fieldSurfaceToneVariants({ tone: 'error' }) },
  ],
  defaultVariants: {
    tone: 'subtle',
  },
})

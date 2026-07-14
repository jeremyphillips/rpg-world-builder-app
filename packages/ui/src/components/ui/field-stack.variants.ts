import { cva, type VariantProps } from 'class-variance-authority'

import { fieldSurfaceToneVariants } from './field-surface.variants'

export type {
  FieldSurfaceTone,
  FieldGroupPanelTone,
  FieldGroupOutlineTone,
} from './field-surface.variants'
export {
  fieldSurfaceToneVariants,
  fieldGroupBodyShellLayoutClasses,
  isCompactLabelTone,
  resolveFieldGroupOutlineToneClasses,
  resolveFieldGroupPanelToneClasses,
} from './field-surface.variants'

/** Surface tone for dependents-only chrome on toggle-dependent stacks. */
export type FieldStackDependentsTone = 'main' | 'subtle' | 'medium' | 'warning' | 'error'

/** Where `dependentsChrome` tone applies on toggle-dependent stacks. */
export type FieldStackDependentsChromeScope = 'wrapper' | 'arrayItems'

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
      main: '',
      subtle: '',
      medium: '',
      warning: '',
      error: '',
    },
  },
  compoundVariants: [
    { tone: 'main', class: fieldSurfaceToneVariants({ tone: 'main' }) },
    { tone: 'subtle', class: fieldSurfaceToneVariants({ tone: 'subtle' }) },
    { tone: 'medium', class: fieldSurfaceToneVariants({ tone: 'medium' }) },
    { tone: 'warning', class: fieldSurfaceToneVariants({ tone: 'warning' }) },
    { tone: 'error', class: fieldSurfaceToneVariants({ tone: 'error' }) },
  ],
  defaultVariants: {
    tone: 'subtle',
  },
})

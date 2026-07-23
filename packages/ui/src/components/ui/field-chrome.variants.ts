import { cva } from 'class-variance-authority'

import type { FieldSize } from './field.client'
import { resolveChromeOutlineClasses, resolveChromePanelClasses } from './chrome.variants'
import type {
  ChromeBorderAccent,
  SemanticTone,
  SurfaceElevation,
  VisualEmphasis,
} from './visual-vocabulary.types'

export type FieldPanelChrome = {
  variant: 'panel'
  tone?: SemanticTone
  emphasis?: VisualEmphasis
  elevation?: SurfaceElevation
}

export type FieldOutlineChrome = {
  variant: 'outline'
  tone?: SemanticTone
  emphasis?: VisualEmphasis
  borderAccent?: ChromeBorderAccent
}

type FieldComposableChrome = FieldPanelChrome | FieldOutlineChrome

/** Visual shell around a single field's full anatomy (label + control + messages). */
export type FieldChrome = { variant: 'plain' } | FieldComposableChrome

export interface FieldChromeProps {
  chrome?: FieldChrome
}

/** Maps declarative field config chrome onto primitive field props. */
export function pickFieldChromeProps(config: { chrome?: FieldChrome }): FieldChromeProps {
  return { chrome: config.chrome }
}

export function hasActiveFieldChrome(
  chrome: FieldChrome | undefined,
): chrome is FieldComposableChrome {
  return Boolean(chrome && chrome.variant !== 'plain')
}

/** Padding inside field chrome for `sm` rhythm fields — 12px (`p-3`). */
export const fieldChromePaddingSmClasses = 'p-3'

/** Padding inside field chrome for `md` rhythm fields — 12px (`p-3`) for now. */
export const fieldChromePaddingMdClasses = 'p-3'

export const fieldChromePaddingVariants = cva('', {
  variants: {
    size: {
      sm: fieldChromePaddingSmClasses,
      md: fieldChromePaddingMdClasses,
      lg: fieldChromePaddingMdClasses,
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Resolves border/bg/padding classes for leaf `chrome` on a field config. */
export function resolveFieldChromeClassNames(
  chrome: FieldChrome | undefined,
  size: FieldSize = 'md',
): string {
  if (!chrome || chrome.variant === 'plain') return ''

  const paddingClasses = fieldChromePaddingVariants({ size })

  switch (chrome.variant) {
    case 'panel':
      return resolveChromePanelClasses(chrome, 'field', paddingClasses)
    case 'outline':
      return resolveChromeOutlineClasses(chrome, 'field', paddingClasses)
    default:
      return ''
  }
}

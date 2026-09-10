import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import { resolveChromeOutlineClasses, resolveChromePanelClasses } from './chrome.variants'
import { fieldShellLayoutClasses } from './field-surface.variants'
import { resolveSurfaceClasses } from './surface.variants'
import { establishSurfaceCurrent } from './surface-current.lib'
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

export type FieldContainerChrome = {
  variant: 'container'
  tone?: SemanticTone
}

type FieldComposableChrome = FieldPanelChrome | FieldOutlineChrome | FieldContainerChrome

/** @deprecated Use `{ variant: 'none' }`. */
export type FieldPlainChrome = { variant: 'plain' }

export type FieldNoneChrome = { variant: 'none' }

/** Visual shell around a single field's full anatomy (label + control + messages). */
export type FieldChrome = FieldNoneChrome | FieldPlainChrome | FieldComposableChrome

export interface FieldChromeProps {
  chrome?: FieldChrome
}

export const DEFAULT_FIELD_CHROME: FieldContainerChrome = { variant: 'container' }

export const FIELD_CHROME_NONE: FieldNoneChrome = { variant: 'none' }

/** Normalizes deprecated `plain` to `none`. */
export function normalizeFieldChrome(chrome: FieldChrome | undefined): FieldChrome | undefined {
  if (!chrome) return undefined
  if (chrome.variant === 'plain') return FIELD_CHROME_NONE
  return chrome
}

export interface FieldChromeContext {
  fieldChromeCascade?: FieldChrome
  fieldChromeSuppressed?: boolean
}

/** Resolves leaf/row/slot/dependent chrome from explicit config, ancestor cascade, suppression, or default. */
export function resolveEffectiveFieldChrome(
  config: { chrome?: FieldChrome },
  context: FieldChromeContext,
): FieldChrome | undefined {
  const explicit = normalizeFieldChrome(config.chrome)
  if (explicit) {
    return explicit.variant === 'none' ? undefined : explicit
  }

  const cascade = normalizeFieldChrome(context.fieldChromeCascade)
  if (cascade) {
    return cascade.variant === 'none' ? undefined : cascade
  }

  if (context.fieldChromeSuppressed) {
    return undefined
  }

  return DEFAULT_FIELD_CHROME
}

/** Maps declarative field config chrome onto primitive field props (standalone / explicit only). */
export function pickFieldChromeProps(config: { chrome?: FieldChrome }): FieldChromeProps {
  const normalized = normalizeFieldChrome(config.chrome)
  if (!normalized || normalized.variant === 'none') {
    return { chrome: undefined }
  }
  return { chrome: normalized }
}

/** Context-aware chrome resolution for schema-driven form renderers. */
export function resolveFieldChromeProps(
  config: { chrome?: FieldChrome },
  context: FieldChromeContext,
): FieldChromeProps {
  const resolved = resolveEffectiveFieldChrome(config, context)
  return resolved ? { chrome: resolved } : { chrome: undefined }
}

export function hasActiveFieldChrome(
  chrome: FieldChrome | undefined,
): chrome is FieldComposableChrome {
  return Boolean(chrome && chrome.variant !== 'plain' && chrome.variant !== 'none')
}

/** Container chrome fills the parent column; control `width` still sizes the input only. */
export function resolveFieldAnatomyWidth(
  width: FieldWidth | undefined,
  chrome: FieldChrome | undefined,
): FieldWidth | undefined {
  if (normalizeFieldChrome(chrome)?.variant === 'container') {
    return 'full'
  }
  return width
}

/** Padding inside default field containers — 16px (`p-4`). */
export const fieldChromePaddingContainerClasses = 'p-4'

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

function resolveFieldContainerClasses(chrome: FieldContainerChrome): string {
  if (chrome.tone && chrome.tone !== 'neutral') {
    return cn(
      fieldShellLayoutClasses,
      'w-full',
      fieldChromePaddingContainerClasses,
      resolveSurfaceClasses({ tone: chrome.tone, emphasis: 'subtle' }),
    )
  }

  return cn(
    fieldShellLayoutClasses,
    'w-full',
    fieldChromePaddingContainerClasses,
    'border-border-subtle bg-field-container',
    establishSurfaceCurrent('field-container'),
  )
}

/** Resolves border/bg/padding classes for leaf `chrome` on a field config. */
export function resolveFieldChromeClassNames(
  chrome: FieldChrome | undefined,
  size: FieldSize = 'md',
): string {
  const normalized = normalizeFieldChrome(chrome)
  if (!normalized || normalized.variant === 'none') return ''

  const paddingClasses = fieldChromePaddingVariants({ size })

  switch (normalized.variant) {
    case 'container':
      return resolveFieldContainerClasses(normalized)
    case 'panel':
      return resolveChromePanelClasses(normalized, 'field', paddingClasses)
    case 'outline':
      return resolveChromeOutlineClasses(normalized, 'field', paddingClasses)
    default:
      return ''
  }
}

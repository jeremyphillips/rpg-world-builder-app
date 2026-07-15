import { cva } from 'class-variance-authority'

import type { FieldSize } from './field.client'
import { cn } from '../../lib/utils'
import {
  fieldShellLayoutClasses,
  resolveFieldGroupOutlineToneClasses,
  resolveFieldGroupPanelToneClasses,
  type FieldGroupOutlineTone,
  type FieldGroupPanelTone,
} from './field-surface.variants'

/** Field-level panel chrome — shares tone tokens with group `fieldsChrome.panel`. */
export interface FieldPanelChrome {
  variant: 'panel'
  tone?: FieldGroupPanelTone
}

/** Field-level outline chrome — shares tone tokens with group `fieldsChrome.outline`. */
export interface FieldOutlineChrome {
  variant: 'outline'
  tone?: FieldGroupOutlineTone
}

/** Visual shell around a single field's full anatomy (label + control + messages). */
export type FieldChrome = { variant: 'plain' } | FieldPanelChrome | FieldOutlineChrome

export function hasActiveFieldChrome(
  chrome: FieldChrome | undefined,
): chrome is FieldPanelChrome | FieldOutlineChrome {
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

  const shell = cn(fieldShellLayoutClasses, fieldChromePaddingVariants({ size }))

  switch (chrome.variant) {
    case 'panel':
      return cn(shell, resolveFieldGroupPanelToneClasses(chrome.tone))
    case 'outline':
      return cn(shell, 'bg-transparent', resolveFieldGroupOutlineToneClasses(chrome.tone))
    default:
      return ''
  }
}

import { cn } from '../../lib/utils'
import type { CheckboxOptionScale } from './checkbox-option.lib'

export const CHOICE_OPTION_TYPOGRAPHY_BASE = 'text-style-option' as const

export function choiceOptionTypographySizeModifier(scale: CheckboxOptionScale): string {
  return scale === 'sm' ? 'text-style-option--sm' : 'text-style-option--md'
}

/** Compose base + size modifier for checkbox and radio group option labels. */
export function choiceOptionLabelClassName(scale: CheckboxOptionScale, className?: string): string {
  return cn(CHOICE_OPTION_TYPOGRAPHY_BASE, choiceOptionTypographySizeModifier(scale), className)
}

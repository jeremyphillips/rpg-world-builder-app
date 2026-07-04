import { midSentenceLabel, singularizeLabel } from '@rpg/contracts'

import type { ArrayItemHeaderConfig } from '../field-config'

/** Derives a mid-sentence item label for array min/max copy from `itemHeader` or `legend`. */
export function arrayItemLabel(header: ArrayItemHeaderConfig, legend: string): string {
  const fallback = header.fallback(0)
  const withoutIndex = fallback.replace(/ #\d+$/, '')
  if (withoutIndex !== fallback) {
    return midSentenceLabel(withoutIndex)
  }
  return midSentenceLabel(singularizeLabel(legend))
}

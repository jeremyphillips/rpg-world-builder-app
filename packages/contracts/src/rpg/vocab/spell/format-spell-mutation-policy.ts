import { REST_KIND_ENTRIES } from '../rest'
import type { SpellMutationPolicy } from './spell-mutation-policy'

const AFTER_LONG_REST = `after a ${REST_KIND_ENTRIES.long.label}` as const

export type SpellMutationCopyTrigger = typeof AFTER_LONG_REST | 'when you gain a class level'

export type SpellMutationCopyParts = {
  trigger: SpellMutationCopyTrigger
  replaceCount: number | 'all'
} | null

const TRIGGER_PHRASES: Record<
  Extract<SpellMutationPolicy, { kind: 'replace' }>['trigger'],
  SpellMutationCopyTrigger
> = {
  longRest: AFTER_LONG_REST,
  levelUp: 'when you gain a class level',
}

/** Structured mutation copy pieces for model-owned acquisition sentences. */
export function formatSpellMutationCopyParts(policy: SpellMutationPolicy): SpellMutationCopyParts {
  if (policy.kind === 'none') return null

  return {
    trigger: TRIGGER_PHRASES[policy.trigger],
    replaceCount: policy.limit,
  }
}

import type { SpellMutationPolicy } from './spell-mutation-policy'

export type SpellMutationCopyTrigger = 'after a long rest' | 'when you gain a class level'

export type SpellMutationCopyParts = {
  trigger: SpellMutationCopyTrigger
  replaceCount: number | 'all'
} | null

const TRIGGER_PHRASES: Record<
  Extract<SpellMutationPolicy, { kind: 'replace' }>['trigger'],
  SpellMutationCopyTrigger
> = {
  longRest: 'after a long rest',
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

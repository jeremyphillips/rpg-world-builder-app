import {
  isRestKind,
  REST_KIND_ENTRIES,
  REST_KINDS,
  type RestKind,
  type RestLimitedUse,
} from '@rpg/contracts'

export const SPELL_USE_LIMITS = ['at-will', 'uses'] as const
export type SpellUseLimit = (typeof SPELL_USE_LIMITS)[number]

export const SPELL_USE_COUNT_KINDS = ['fixed', 'proficiency-bonus'] as const
export type SpellUseCountKind = (typeof SPELL_USE_COUNT_KINDS)[number]

export const SPELL_USE_LIMIT_OPTIONS = [
  { value: 'at-will', label: 'At will' },
  { value: 'uses', label: 'Limited uses' },
] as const

export const SPELL_USE_COUNT_KIND_OPTIONS = [
  { value: 'fixed', label: 'Fixed number' },
  { value: 'proficiency-bonus', label: 'Proficiency bonus' },
] as const

export const SPELL_MINIMUM_REST_OPTIONS = REST_KINDS.map((id) => ({
  value: id,
  label: REST_KIND_ENTRIES[id].label,
}))

type LimitedUseFormFields = {
  spellUseLimit?: string
  spellUseCountKind?: string
  spellUseCount?: number | string
  spellMinimumRest?: string
}

/** Rest-based grant limit from form fields. At will and incomplete rows omit the limit. */
export function limitedUseFromForm(row: LimitedUseFormFields): RestLimitedUse | undefined {
  if (row.spellUseLimit !== 'uses') return undefined
  if (!isRestKind(row.spellMinimumRest)) return undefined
  if (row.spellUseCountKind === 'proficiency-bonus') {
    return {
      kind: 'uses',
      count: { kind: 'proficiency-bonus' },
      recovery: { minimumRest: row.spellMinimumRest },
    }
  }
  if (row.spellUseCountKind !== 'fixed') return undefined
  const value =
    typeof row.spellUseCount === 'number' ? row.spellUseCount : Number(row.spellUseCount)
  if (!Number.isInteger(value) || value < 1) return undefined
  return {
    kind: 'uses',
    count: { kind: 'fixed', value },
    recovery: { minimumRest: row.spellMinimumRest },
  }
}

export function formFieldsFromLimitedUse(use?: RestLimitedUse): {
  spellUseLimit: SpellUseLimit
  spellUseCountKind?: SpellUseCountKind
  spellUseCount?: number
  spellMinimumRest?: RestKind
} {
  if (!use?.count) return { spellUseLimit: 'at-will' }
  return {
    spellUseLimit: 'uses',
    spellUseCountKind: use.count.kind,
    spellUseCount: use.count.kind === 'fixed' ? use.count.value : undefined,
    spellMinimumRest: use.recovery.minimumRest,
  }
}

import type { SavingThrowDcSource } from '../../content/lib/saving-throw/schema'
import { abilitySaveDc } from './spell-dc'

function ensurePeriod(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return ''
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

/** Fixed number, or the spellcasting DC from `abilitySaveDc`. Does not store the result. */
export function resolveProseSavingThrowDc(args: {
  source: SavingThrowDcSource
  spellcastingAbilityScore?: number
  proficiencyBonus: number
}): number | undefined {
  if (args.source.kind === 'fixed') return args.source.dc
  if (args.spellcastingAbilityScore === undefined) return undefined
  return abilitySaveDc(args.spellcastingAbilityScore, args.proficiencyBonus)
}

/**
 * Stat-block clauses for a prose saving throw.
 * The parent places this paragraph around its own rules text.
 */
export function formatSavingThrowClauses(args: {
  abilityLabel: string
  dc: number | undefined
  targets: string
  failure: string
  success?: string
}): string {
  const lead = ensurePeriod(
    `${args.abilityLabel} Saving Throw: DC ${args.dc ?? '—'}, ${args.targets.trim()}`,
  )
  const failure = `Failure: ${ensurePeriod(args.failure)}`
  const success = args.success?.trim() ? `Success: ${ensurePeriod(args.success)}` : undefined
  return [lead, failure, success].filter((clause): clause is string => Boolean(clause)).join(' ')
}

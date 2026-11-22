import type { SavingThrowDcSource } from '../../content/lib/saving-throw/schema'
import { getResolutionOutcomeResultStatBlockLead } from '../../vocab/resolution'
import {
  joinStatBlockProsePlainText,
  statBlockOutcomeLead,
  statBlockProseSpacing,
  statBlockSaveLead,
  type StatBlockProse,
  type StatBlockProseSegment,
} from '../monster/stat-block-prose'
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

/** Structured stat-block saving throw paragraph for presentation. */
export function formatSavingThrowClausesProse(args: {
  abilityLabel: string
  dc: number | undefined
  targets: string
  failure: string
  success?: string
}): StatBlockProse {
  const prose: StatBlockProseSegment[] = [
    ...statBlockSaveLead(args.abilityLabel, args.dc, args.targets),
  ]
  prose.push(
    statBlockProseSpacing(),
    ...statBlockOutcomeLead(
      getResolutionOutcomeResultStatBlockLead('failed-save'),
      ensurePeriod(args.failure),
    ),
  )
  if (args.success?.trim()) {
    prose.push(
      statBlockProseSpacing(),
      ...statBlockOutcomeLead(
        getResolutionOutcomeResultStatBlockLead('successful-save'),
        ensurePeriod(args.success),
      ),
    )
  }
  return prose
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
  return joinStatBlockProsePlainText(formatSavingThrowClausesProse(args))
}

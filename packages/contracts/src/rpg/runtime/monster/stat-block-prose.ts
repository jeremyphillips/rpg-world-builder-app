import type { MonsterAttackActionSentenceParts } from './format-monster-attack-action'

export type StatBlockLeadTreatment = 'inline' | 'paragraph'

export type StatBlockProseSegment =
  | { kind: 'lead'; treatment: StatBlockLeadTreatment; label: string }
  | { kind: 'text'; value: string; emphasis?: 'italic' }

/** One paragraph: inline leads + text, no block break. */
export type StatBlockProse = readonly StatBlockProseSegment[]

/** Multiple paragraphs (spell frequency groups, optional intro + groups). */
export type StatBlockProseDocument = readonly StatBlockProse[]

export const STAT_BLOCK_LEAD_SEPARATORS = {
  inline: ':',
  paragraph: ':',
} satisfies Record<StatBlockLeadTreatment, string>

/** Single lookup for tests and renderers — do not mutate in tests. */
export function statBlockLeadSeparator(treatment: StatBlockLeadTreatment): string {
  return STAT_BLOCK_LEAD_SEPARATORS[treatment]
}

export function joinStatBlockProseParagraph(segments: StatBlockProse): string {
  let out = ''
  for (const segment of segments) {
    if (segment.kind === 'lead') {
      out += `${segment.label}${statBlockLeadSeparator(segment.treatment)}`
      continue
    }
    out += segment.value
  }
  return out
}

export function joinStatBlockProseDocument(document: StatBlockProseDocument): string {
  return document.map(joinStatBlockProseParagraph).join('\n\n')
}

/** Plain sentence for catalog parity and tests — do not parse for presentation. */
export function joinStatBlockProsePlainText(prose: StatBlockProse): string {
  return joinStatBlockProseParagraph(prose)
}

export function statBlockProseSpacing(): StatBlockProseSegment {
  return { kind: 'text', value: ' ' }
}

export function statBlockOutcomeLead(label: string, body: string): StatBlockProseSegment[] {
  const trimmed = body.trim()
  if (!trimmed) {
    return [{ kind: 'lead', treatment: 'inline', label }]
  }
  const withPeriod = /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
  return [
    { kind: 'lead', treatment: 'inline', label },
    { kind: 'text', value: ` ${withPeriod}` },
  ]
}

export function statBlockSaveLead(
  abilityLabel: string,
  dc: number | undefined,
  targets: string,
): StatBlockProseSegment[] {
  const targetText = targets.trim()
  const leadTail = ` DC ${dc ?? '—'}, ${targetText}`
  const period = /[.!?]$/.test(leadTail.trim()) ? '' : '.'
  return [
    { kind: 'lead', treatment: 'inline', label: `${abilityLabel} Saving Throw` },
    { kind: 'text', value: `${leadTail}${period}` },
  ]
}

export function monsterAttackActionPartsToProse(
  parts: MonsterAttackActionSentenceParts,
): StatBlockProse {
  const segments: StatBlockProseSegment[] = [
    { kind: 'lead', treatment: 'inline', label: parts.attackLabel },
    { kind: 'text', value: ` ${parts.bonusAndDistance}` },
  ]
  if (parts.hitBody) {
    segments.push(
      statBlockProseSpacing(),
      { kind: 'lead', treatment: 'inline', label: 'Hit' },
      { kind: 'text', value: ` ${parts.hitBody}.` },
    )
  }
  return segments
}

export function statBlockReactionLead(label: 'Trigger' | 'Response', body: string): StatBlockProse {
  return [
    { kind: 'lead', treatment: 'inline', label },
    { kind: 'text', value: ` ${body}` },
  ]
}

export function appendStatBlockPlainSentences(
  prose: StatBlockProse,
  sentences: readonly string[],
): StatBlockProse {
  const extra: StatBlockProseSegment[] = []
  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    if (!trimmed) continue
    if (extra.length > 0 || prose.length > 0) {
      extra.push(statBlockProseSpacing())
    }
    extra.push({ kind: 'text', value: trimmed })
  }
  return [...prose, ...extra]
}

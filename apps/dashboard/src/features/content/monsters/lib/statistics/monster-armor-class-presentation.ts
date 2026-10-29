import {
  CREATURE_ARMOR_CLASS_KIND_TERM,
  formatSignedModifier,
  getCreatureArmorClassKindLabel,
  getTermCompactLabel,
  type MonsterArmorClassAlternative,
  type MonsterArmorClassResolution,
  type MonsterArmorClassRow,
} from '@rpg/contracts'

export type MonsterArmorClassPresentationRow = {
  id: string
  label: string
  value: string
}

/** Body source that beat the other candidate. Fixed overrides are not a comparison winner. */
function comparisonWinnerLabel(resolution: MonsterArmorClassResolution): string | undefined {
  if (resolution.source === 'armor') return resolution.bodyArmor?.label ?? 'Armor'
  if (resolution.source === 'natural') return 'Natural armor'
  if (resolution.source === 'unarmored') return getCreatureArmorClassKindLabel('unarmored')
  return undefined
}

/** Caption beside the Armor Class total: worn pieces, natural armor, or a fixed override. */
export function monsterArmorClassCaption(resolution: MonsterArmorClassResolution): string {
  if (resolution.source === 'fixed') return 'Fixed override'
  const body = comparisonWinnerLabel(resolution) ?? getCreatureArmorClassKindLabel('unarmored')
  return resolution.shield ? `${body} + ${resolution.shield.label}` : body
}

/** Compact Armor Class label from vocabulary (`AC`). */
export function monsterArmorClassCompactLabel(): string {
  return getTermCompactLabel(CREATURE_ARMOR_CLASS_KIND_TERM)
}

function rowLabel(row: MonsterArmorClassRow): string {
  switch (row.kind) {
    case 'ruleset-base':
      return `Base ${monsterArmorClassCompactLabel()}`
    case 'armor-base':
      return `${row.label} (base)`
    case 'dex':
      return row.cap === undefined
        ? 'DEX modifier'
        : `DEX modifier (max ${formatSignedModifier(row.cap)})`
    case 'natural':
      return 'Natural armor'
    case 'shield':
    case 'enhancement':
      return row.label
    case 'fixed':
      return 'Fixed Armor Class'
  }
}

function rowValue(row: MonsterArmorClassRow): string {
  if (row.kind === 'ruleset-base' || row.kind === 'armor-base' || row.kind === 'fixed') {
    return String(row.value)
  }
  return formatSignedModifier(row.value)
}

/**
 * Optional add-ons. A zero here does not change the total, so the compact
 * preview omits it. The resolver still records a zero DEX contribution
 * separately from armor that does not apply DEX at all.
 */
function isZeroOptionalModifier(row: MonsterArmorClassRow): boolean {
  return (
    (row.kind === 'dex' ||
      row.kind === 'natural' ||
      row.kind === 'shield' ||
      row.kind === 'enhancement') &&
    row.value === 0
  )
}

export function monsterArmorClassBreakdownRows(
  resolution: MonsterArmorClassResolution,
): MonsterArmorClassPresentationRow[] {
  return resolution.rows
    .filter((row) => !isZeroOptionalModifier(row))
    .map((row, index) => ({
      id: `${row.kind}-${index}`,
      label: rowLabel(row),
      value: rowValue(row),
    }))
}

/** Wins copy is only for natural armor against worn armor. Unarmored stays in the caption. */
function isNaturalVersusArmor(
  resolution: MonsterArmorClassResolution,
  alternative: MonsterArmorClassAlternative,
): boolean {
  const sources = [resolution.source, alternative.source]
  return sources.includes('natural') && sources.includes('armor')
}

function alternativeSentence(
  resolution: MonsterArmorClassResolution,
  alternative: MonsterArmorClassAlternative,
): string | undefined {
  const loser = `${alternative.label}: ${alternative.ac}.`
  const winner = comparisonWinnerLabel(resolution)
  if (!winner) return loser
  if (!isNaturalVersusArmor(resolution, alternative)) return undefined
  return `${winner} wins. ${loser}`
}

export function monsterArmorClassAlternativeMessages(
  resolution: MonsterArmorClassResolution,
): string[] {
  const messages = resolution.alternatives.flatMap((alternative) => {
    const sentence = alternativeSentence(resolution, alternative)
    return sentence ? [sentence] : []
  })
  if (resolution.calculatedAc !== undefined) {
    messages.push(
      `Calculated ${monsterArmorClassCompactLabel()} without override: ${resolution.calculatedAc}`,
    )
  }
  return messages
}

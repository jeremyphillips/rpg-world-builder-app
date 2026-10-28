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

/** Caption beside the Armor Class total: worn pieces, natural armor, or a fixed override. */
export function monsterArmorClassCaption(resolution: MonsterArmorClassResolution): string {
  if (resolution.source === 'fixed') return 'Fixed override'
  const body =
    resolution.source === 'armor'
      ? (resolution.bodyArmor?.label ?? 'Armor')
      : resolution.source === 'natural'
        ? 'Natural armor'
        : getCreatureArmorClassKindLabel('unarmored')
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

export function monsterArmorClassBreakdownRows(
  resolution: MonsterArmorClassResolution,
): MonsterArmorClassPresentationRow[] {
  return resolution.rows.map((row, index) => ({
    id: `${row.kind}-${index}`,
    label: rowLabel(row),
    value: rowValue(row),
  }))
}

function alternativeSentence(alternative: MonsterArmorClassAlternative): string {
  if (alternative.source === 'natural') return `Natural armor would provide ${alternative.ac}.`
  if (alternative.source === 'unarmored') return `Unarmored would provide ${alternative.ac}.`
  return `${alternative.label} would provide ${alternative.ac}.`
}

export function monsterArmorClassAlternativeMessages(
  resolution: MonsterArmorClassResolution,
): string[] {
  const messages = resolution.alternatives.map(alternativeSentence)
  if (resolution.calculatedAc !== undefined) {
    messages.push(
      `Calculated ${monsterArmorClassCompactLabel()} without override: ${resolution.calculatedAc}`,
    )
  }
  return messages
}

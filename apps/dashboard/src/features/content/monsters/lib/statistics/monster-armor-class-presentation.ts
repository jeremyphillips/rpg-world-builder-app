import {
  CREATURE_ARMOR_CLASS_KIND_TERM,
  formatSignedModifier,
  getCreatureArmorClassKindLabel,
  getTermCompactLabel,
  type DerivedFieldReason,
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

/** Catalog and custom names in prose. The first letter is capital only when the name starts the sentence. */
function proseArmorName(name: string, leading: boolean): string {
  const lower = name.toLocaleLowerCase()
  if (!leading || lower.length === 0) return lower
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`
}

function equippedArmorName(
  resolution: MonsterArmorClassResolution,
  alternative: MonsterArmorClassAlternative,
): string {
  if (resolution.source === 'armor') return resolution.bodyArmor?.label ?? 'Armor'
  return alternative.label
}

function alternativeSentence(
  resolution: MonsterArmorClassResolution,
  alternative: MonsterArmorClassAlternative,
): string | undefined {
  if (!isNaturalVersusArmor(resolution, alternative)) return undefined
  const armorName = equippedArmorName(resolution, alternative)
  const naturalAc = resolution.source === 'natural' ? resolution.ac : alternative.ac
  const armorAc = resolution.source === 'armor' ? resolution.ac : alternative.ac
  if (naturalAc === armorAc) {
    return `Natural armor and ${proseArmorName(armorName, false)} both provide ${naturalAc}.`
  }
  if (naturalAc > armorAc) {
    return `Natural armor wins: ${naturalAc} vs. ${armorAc} with ${proseArmorName(armorName, false)}.`
  }
  return `${proseArmorName(armorName, true)} wins: ${armorAc} vs. ${naturalAc} with natural armor.`
}

/** Rules note when worn armor caps or ignores DEX. Independent of natural-versus-armor winner. */
export function monsterArmorClassDexAdvisory(
  resolution: MonsterArmorClassResolution,
): string | undefined {
  if (resolution.source === 'fixed') return undefined
  const restriction = resolution.dexRestriction
  if (!restriction?.affectsOutcome) return undefined
  const name = proseArmorName(resolution.bodyArmor?.label ?? 'Armor', true)
  const original = formatSignedModifier(restriction.abilityModifier)
  if (restriction.mode === 'capped') {
    return `${name} limits the ${original} DEX modifier to ${formatSignedModifier(restriction.appliedModifier)}.`
  }
  return `${name} ignores the ${original} DEX modifier.`
}

function unavailableArmorCopy(reason: DerivedFieldReason): string {
  if (reason === 'missing-reference') return 'Missing armor reference'
  if (reason === 'conflict') {
    return 'Only one body armor and one shield can be owned, each with quantity 1.'
  }
  return 'Not set'
}

export function monsterArmorClassAlternativeMessages(
  resolution: MonsterArmorClassResolution,
): string[] {
  if (resolution.alternatives.status === 'unavailable') {
    return [unavailableArmorCopy(resolution.alternatives.reason)]
  }

  const messages = resolution.alternatives.value.flatMap((alternative) => {
    const sentence = alternativeSentence(resolution, alternative)
    return sentence ? [sentence] : []
  })
  if (resolution.calculatedAc?.status === 'resolved') {
    messages.push(
      `Calculated ${monsterArmorClassCompactLabel()} without override: ${resolution.calculatedAc.value}`,
    )
  }
  return messages
}

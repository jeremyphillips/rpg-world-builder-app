import {
  buildSpellPickerCompactSummary,
  formatLimitedUseNotation,
  formatSpellLevel,
  formatSpellPickerMetadataGroupLabel,
  limitedUseSchema,
  MAX_SPELL_LEVEL,
  MIN_SPELL_LEVEL,
  type LimitedUse,
  type Spell,
} from '@rpg/contracts'

export const SPELL_ENTRY_FREQUENCY_AT_WILL = 'at-will'
export const SPELL_ENTRY_FREQUENCY_CUSTOM = 'custom'
export const SPELL_ENTRY_FREQUENCY_SHARED = 'shared'
export const SPELL_ENTRY_FREQUENCY_AT_WILL_LABEL = 'At will'
export const SPELL_ENTRY_FREQUENCY_DAILY_MAX = 5

const DAILY_COUNTS = [1, 2, 3, 4, 5] as const

export type SpellEntryDailyCount = (typeof DAILY_COUNTS)[number]

export type SpellFrequencyReading =
  | { status: 'at-will' }
  | { status: 'daily'; count: SpellEntryDailyCount }
  | { status: 'unsupported'; label: string }
  | { status: 'incomplete' }

export type SpellFrequencyOption = { value: string; label: string }

/** How a stored spell-row limit should be presented. Absence is At will. */
export function readSpellFrequency(limitedUse: unknown): SpellFrequencyReading {
  if (limitedUse == null) return { status: 'at-will' }
  const parsed = limitedUseSchema.safeParse(limitedUse)
  if (!parsed.success) return { status: 'incomplete' }
  const daily = dailyCount(parsed.data)
  if (daily !== undefined) return { status: 'daily', count: daily }
  const label = formatLimitedUseNotation(parsed.data, 'stat-block')
  if (!label) return { status: 'incomplete' }
  return { status: 'unsupported', label }
}

/**
 * Menu choice → stored limit.
 * `unchanged` means the author re-selected the current custom value.
 * `undefined` is an explicit At will clear.
 */
export function limitedUseFromSpellFrequency(
  selection: string,
): LimitedUse | undefined | 'unchanged' {
  if (selection === SPELL_ENTRY_FREQUENCY_CUSTOM || selection === SPELL_ENTRY_FREQUENCY_SHARED) {
    return 'unchanged'
  }
  if (selection === SPELL_ENTRY_FREQUENCY_AT_WILL) return undefined
  const count = Number(selection)
  if (!isDailyCount(count)) return 'unchanged'
  return {
    kind: 'uses',
    count: { kind: 'fixed', value: count },
    recovery: { minimumRest: 'long' },
  }
}

export function spellFrequencyOptions(reading: SpellFrequencyReading): SpellFrequencyOption[] {
  const standard: SpellFrequencyOption[] = [
    { value: SPELL_ENTRY_FREQUENCY_AT_WILL, label: SPELL_ENTRY_FREQUENCY_AT_WILL_LABEL },
    ...DAILY_COUNTS.map((count) => ({ value: String(count), label: `${count}/Day` })),
  ]
  if (reading.status !== 'unsupported') return standard
  return [{ value: SPELL_ENTRY_FREQUENCY_CUSTOM, label: reading.label }, ...standard]
}

export function spellEntryFrequencyLabel(
  spellLimitedUse: unknown,
  actionLimitedUse: unknown,
): string | undefined {
  const spell = readSpellFrequency(spellLimitedUse)
  if (spell.status === 'daily') return `${spell.count}/Day`
  if (spell.status === 'unsupported') return spell.label
  if (spell.status === 'incomplete') return undefined
  const shared = sharedLimitLabel(actionLimitedUse)
  if (shared) return shared
  return SPELL_ENTRY_FREQUENCY_AT_WILL_LABEL
}

/** A bare spell row shows the action pool instead of At will, and its menu stays closed. */
export function spellFrequencyControlIsShared(
  spellLimitedUse: unknown,
  actionLimitedUse: unknown,
): boolean {
  return (
    readSpellFrequency(spellLimitedUse).status === 'at-will' &&
    sharedLimitLabel(actionLimitedUse) !== undefined
  )
}

/** Upcast is only meaningful below the top spell level slot column. */
export function spellAllowsHigherCastLevel(level: number | undefined): boolean {
  return level !== undefined && level >= MIN_SPELL_LEVEL && level < MAX_SPELL_LEVEL
}

export function higherCastLevelOptions(spellLevel: number): SpellFrequencyOption[] {
  const options: SpellFrequencyOption[] = []
  for (let level = spellLevel + 1; level <= MAX_SPELL_LEVEL; level += 1) {
    options.push({ value: String(level), label: formatSpellLevel(level) })
  }
  return options
}

/** Upcast copy. The spell's own level, and anything lower, stays off the card. */
export function castAtLevelUpcastLabel(
  castAtLevel: unknown,
  spellLevel: number | undefined,
): string | undefined {
  const level = castLevelNumber(castAtLevel)
  if (level === undefined || spellLevel === undefined || level <= spellLevel) return undefined
  return `Cast at ${formatSpellLevel(level)} level`
}

export function spellEntryCatalogMetadata(spell: Spell): string[] {
  const groups = buildSpellPickerCompactSummary(spell).groups
  const classification = groups.find((group) => group.kind === 'classification')
  const castingTime = groups.find((group) => group.kind === 'castingTime')
  return [classification, castingTime].flatMap((group) =>
    group ? [formatSpellPickerMetadataGroupLabel(group)] : [],
  )
}

export function spellEntryFrequencyMetadata(
  spellLimitedUse: unknown,
  actionLimitedUse: unknown,
  castAtLevel: unknown,
  spellLevel: number | undefined,
): string[] {
  const frequency = spellEntryFrequencyLabel(spellLimitedUse, actionLimitedUse)
  const upcast = castAtLevelUpcastLabel(castAtLevel, spellLevel)
  return [frequency, upcast].flatMap((part) => (part ? [part] : []))
}

/** Keep the row, swap the spell, and drop the previous cast level. */
export function replaceMonsterSpellRow(
  row: Record<string, unknown>,
  spellId: string,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...row, spellId }
  delete next.castAtLevel
  return next
}

function sharedLimitLabel(actionLimitedUse: unknown): string | undefined {
  const action = readSpellFrequency(actionLimitedUse)
  if (action.status === 'daily') return `${action.count}/Day shared`
  if (action.status === 'unsupported') return `${action.label} shared`
  return undefined
}

function dailyCount(use: LimitedUse): SpellEntryDailyCount | undefined {
  if (use.kind !== 'uses') return undefined
  if (use.count.kind !== 'fixed') return undefined
  if (use.recovery.minimumRest !== 'long') return undefined
  if (!isDailyCount(use.count.value)) return undefined
  return use.count.value
}

function isDailyCount(value: number): value is SpellEntryDailyCount {
  return DAILY_COUNTS.some((count) => count === value)
}

function castLevelNumber(value: unknown): number | undefined {
  const level =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN
  if (!Number.isInteger(level)) return undefined
  return level
}

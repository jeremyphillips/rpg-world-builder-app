import { creatureWeaponProficiencyTargetsFromGrantSet } from '../../runtime/creature/proficiencies'
import type { CreatureWeaponProficiencies } from '../creature'
import type { CreatureLanguageProficiencyEntry } from '../creature/proficiencies'

export class LegacyMonsterDocumentConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LegacyMonsterDocumentConflictError'
  }
}

type LanguageRow = CreatureLanguageProficiencyEntry

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeLanguageRow(entry: unknown): LanguageRow | undefined {
  if (!isRecord(entry) || typeof entry.language !== 'string') return undefined
  const row: LanguageRow = { language: entry.language }
  if (entry.speaks === false) row.speaks = false
  return row
}

function languageSignature(rows: readonly LanguageRow[]): string[] {
  return rows.map((row) => `${row.language}:${row.speaks === false ? '0' : '1'}`).sort()
}

function languageRowsEqual(left: readonly LanguageRow[], right: readonly LanguageRow[]): boolean {
  const a = languageSignature(left)
  const b = languageSignature(right)
  return a.length === b.length && a.every((value, index) => value === b[index])
}

function normalizeLanguageRows(entries: unknown[]): LanguageRow[] {
  return entries.flatMap((entry) => {
    const row = normalizeLanguageRow(entry)
    return row ? [row] : []
  })
}

function readCanonicalLanguageRows(record: Record<string, unknown>): {
  present: boolean
  rows: LanguageRow[]
} {
  const proficiencies = record.proficiencies
  if (!isRecord(proficiencies) || !Array.isArray(proficiencies.languages)) {
    return { present: false, rows: [] }
  }
  return {
    present: true,
    rows: normalizeLanguageRows(proficiencies.languages),
  }
}

function readLegacyLanguageList(
  record: Record<string, unknown>,
): { present: boolean; rows: LanguageRow[] } | undefined {
  const communication = record.communication
  if (isRecord(communication) && isRecord(communication.languages)) {
    const entries = communication.languages.entries
    if (Array.isArray(entries)) {
      return { present: true, rows: normalizeLanguageRows(entries) }
    }
  }
  if (isRecord(record.languages) && Array.isArray(record.languages.entries)) {
    return { present: true, rows: normalizeLanguageRows(record.languages.entries) }
  }
  return undefined
}

function applyLanguageMigration(record: Record<string, unknown>): void {
  const canonical = readCanonicalLanguageRows(record)
  const legacy = readLegacyLanguageList(record)

  if (canonical.present && legacy?.present) {
    if (!languageRowsEqual(canonical.rows, legacy.rows)) {
      throw new LegacyMonsterDocumentConflictError(
        'Conflicting language lists on proficiencies.languages and legacy communication.languages.',
      )
    }
  } else if (!canonical.present && legacy?.present) {
    const proficiencies = isRecord(record.proficiencies) ? { ...record.proficiencies } : {}
    proficiencies.languages = legacy.rows
    record.proficiencies = proficiencies
  } else if (canonical.present) {
    const proficiencies = isRecord(record.proficiencies) ? { ...record.proficiencies } : {}
    proficiencies.languages = canonical.rows
    record.proficiencies = proficiencies
  }
}

function readLegacyTelepathy(record: Record<string, unknown>): number | undefined {
  const communication = record.communication
  if (isRecord(communication) && typeof communication.telepathy === 'number') {
    return communication.telepathy
  }
  if (isRecord(record.languages) && typeof record.languages.telepathy === 'number') {
    return record.languages.telepathy
  }
  return undefined
}

function applyTelepathyMigration(record: Record<string, unknown>): void {
  const communication = isRecord(record.communication) ? record.communication : undefined
  const legacyTelepathy = isRecord(record.languages) ? record.languages.telepathy : undefined
  const commTelepathy =
    communication && typeof communication.telepathy === 'number'
      ? communication.telepathy
      : undefined

  if (
    commTelepathy !== undefined &&
    legacyTelepathy !== undefined &&
    commTelepathy !== legacyTelepathy
  ) {
    throw new LegacyMonsterDocumentConflictError(
      'Conflicting telepathy on communication and legacy languages.',
    )
  }

  const telepathy = commTelepathy ?? legacyTelepathy
  if (telepathy !== undefined) {
    record.communication = { telepathy }
  }
}

function isWeaponGrantSet(value: unknown): value is CreatureWeaponProficiencies {
  return isRecord(value) && Array.isArray(value.categories) && Array.isArray(value.items)
}

function applyWeaponMigration(record: Record<string, unknown>): void {
  const proficiencies = record.proficiencies
  if (!isRecord(proficiencies)) return
  const weapons = proficiencies.weapons
  if (Array.isArray(weapons)) return
  if (!isWeaponGrantSet(weapons)) return

  const proficienciesNext = { ...proficiencies }
  proficienciesNext.weapons = creatureWeaponProficiencyTargetsFromGrantSet(weapons)
  record.proficiencies = proficienciesNext
}

function stripLegacyLanguageKeys(record: Record<string, unknown>): void {
  delete record.languages

  const communication = record.communication
  if (!isRecord(communication)) {
    if (communication === undefined) delete record.communication
    return
  }

  const { languages: _languages, telepathy, ...rest } = communication
  if (telepathy !== undefined) record.communication = { telepathy }
  else if (Object.keys(rest).length > 0) record.communication = rest
  else delete record.communication
}

/** Full-document read normalizer for legacy monster Mongo / draft payloads. Idempotent on canonical docs. */
export function normalizeLegacyMonsterDocument(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) return value as Record<string, unknown>
  const record = { ...value }

  applyLanguageMigration(record)
  applyWeaponMigration(record)
  applyTelepathyMigration(record)
  stripLegacyLanguageKeys(record)

  return record
}

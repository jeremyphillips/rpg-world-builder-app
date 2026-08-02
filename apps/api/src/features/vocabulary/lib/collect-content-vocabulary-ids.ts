import {
  extractSpeciesDamageTypeIds,
  extractSpeciesLanguageIds,
  extractSpeciesSenseTypeIds,
} from './reference-sources/species'
import { extractSpellDamageTypeIds, extractSpellSchoolId } from './reference-sources/spells'

export {
  extractSpeciesDamageTypeIds,
  extractSpeciesLanguageIds,
  extractSpeciesSenseTypeIds,
  extractSpellDamageTypeIds,
  extractSpellSchoolId,
}

/** @deprecated Use {@link extractSpeciesDamageTypeIds}. */
export function collectDamageTypeIdsFromBody(body: Record<string, unknown>): string[] {
  return [...extractSpeciesDamageTypeIds(body)]
}

/** @deprecated Use {@link extractSpeciesSenseTypeIds}. */
export function collectSenseTypeIdsFromBody(body: Record<string, unknown>): string[] {
  return [...extractSpeciesSenseTypeIds(body)]
}

/** @deprecated Use {@link extractSpeciesLanguageIds}. */
export function collectLanguageIdsFromBody(body: Record<string, unknown>): string[] {
  return [...extractSpeciesLanguageIds(body)]
}

/** @deprecated Use {@link extractSpellDamageTypeIds}. */
export function collectDamageTypeIdsFromSpellBody(body: Record<string, unknown>): string[] {
  return [...extractSpellDamageTypeIds(body)]
}

/** @deprecated Use {@link extractSpellSchoolId}. */
export function collectSpellSchoolIdFromSpellBody(body: Record<string, unknown>): string[] {
  return [...extractSpellSchoolId(body)]
}

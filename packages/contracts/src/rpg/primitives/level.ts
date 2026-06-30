import { z } from 'zod'

// ---------------------------------------------------------------------------
// Character level bounds
// ---------------------------------------------------------------------------

/** Default ruleset / SRD character level cap. */
export const MAX_CHARACTER_LEVEL = 20

/** Upper bound for campaign overrides and stored content body levels. */
export const ABSOLUTE_MAX_CHARACTER_LEVEL = 100

/** Default offset added to standard max when enabling extended progression. */
export const DEFAULT_EXTENDED_LEVEL_OFFSET = 10

/** System catalog default bound (1–20). */
export const levelSchema = z.number().int().min(1).max(MAX_CHARACTER_LEVEL)

/** Stored content may reference levels up to the absolute campaign ceiling. */
export const absoluteLevelSchema = z.number().int().min(1).max(ABSOLUTE_MAX_CHARACTER_LEVEL)

/** Campaign-scoped level bound for forms and runtime validation. */
export function campaignLevelSchema(maxLevel: number) {
  return z.number().int().min(1).max(maxLevel)
}

/** A number bounded by Zod (1–20); not a TS literal union. */
export type Level = z.infer<typeof levelSchema>

/** Standard D&D proficiency bonus: +2 at L1, increases by +1 every 4 levels. */
export function proficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2
}

/** Level select options for forms (1 through `maxLevel`). Labels are numeric (`"1"`, `"2"`, …). */
export function buildLevelOptions(maxLevel: number): { value: string; label: string }[] {
  return Array.from({ length: maxLevel }, (_, index) => {
    const level = index + 1
    return { value: String(level), label: String(level) }
  })
}

export type LevelOptionGroup = {
  label: string
  options: { value: string; label: string }[]
}

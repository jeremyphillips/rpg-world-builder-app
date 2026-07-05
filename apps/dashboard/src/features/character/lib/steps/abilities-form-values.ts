import { ABILITY_IDS, type CharacterBuilderDraftAbilities } from '@rpg/contracts'

import type { AbilitiesFormValues } from './abilities-form-fields'

function toAbilityScore(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return undefined
}

export function abilitiesDraftToFormValues(
  abilities: CharacterBuilderDraftAbilities,
): AbilitiesFormValues {
  const scores = abilities.scores ?? {}

  return {
    method: abilities.method ?? 'standard-array',
    str: scores.str,
    dex: scores.dex,
    con: scores.con,
    int: scores.int,
    wis: scores.wis,
    cha: scores.cha,
  }
}

export function abilitiesFormValuesToDraft(
  values: AbilitiesFormValues,
): CharacterBuilderDraftAbilities {
  const scores = Object.fromEntries(
    ABILITY_IDS.map((ability) => {
      const score = toAbilityScore(values[ability])
      return score !== undefined ? [ability, score] : null
    }).filter((entry): entry is [(typeof ABILITY_IDS)[number], number] => entry !== null),
  )

  return {
    method: values.method,
    scores,
  }
}

function abilitiesDraftFingerprint(abilities: CharacterBuilderDraftAbilities): string {
  const method = abilities.method ?? ''
  const scores = abilities.scores ?? {}
  const scorePart = ABILITY_IDS.map((ability) => `${ability}:${scores[ability] ?? ''}`).join(',')
  return `${method}\0${scorePart}`
}

/** Compares normalized abilities slices — avoids redundant draft writes during live sync. */
export function areAbilitiesDraftsEqual(
  left: CharacterBuilderDraftAbilities,
  right: CharacterBuilderDraftAbilities,
): boolean {
  return abilitiesDraftFingerprint(left) === abilitiesDraftFingerprint(right)
}

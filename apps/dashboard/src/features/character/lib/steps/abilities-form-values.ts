import { ABILITY_IDS, type CharacterBuilderDraftAbilities } from '@rpg/contracts'

import type { AbilitiesFormValues } from './abilities-form-fields'

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
      const score = values[ability]
      return typeof score === 'number' ? [ability, score] : null
    }).filter((entry): entry is [(typeof ABILITY_IDS)[number], number] => entry !== null),
  )

  return {
    method: values.method,
    scores,
  }
}

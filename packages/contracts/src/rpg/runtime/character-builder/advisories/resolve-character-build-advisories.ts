import {
  CHARACTER_BUILD_ADVISORY_CODE_ORDER,
  characterBuildAdvisoryKey,
  type CharacterBuildAdvisory,
  type CharacterBuildAdvisoryCode,
  type CharacterBuildAdvisoryOfCode,
} from '../../../character-builder/build-advisory'
import { resolveCharacterBuildLoadout } from '../assembly/resolve-character-build-loadout'
import type { CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import type { CharacterBuildEngineOptions } from '../engine-options'
import type { CharacterBuildAdvisoryFacts } from './character-build-advisory-facts'
import {
  compareEquipmentProficiencyAdvisories,
  resolveEquipmentProficiencyAdvisories,
} from './resolve-equipment-proficiency-advisories'

export type { CharacterBuildAdvisoryFacts } from './character-build-advisory-facts'

type AdvisoryRule<C extends CharacterBuildAdvisoryCode> = {
  resolve: (facts: CharacterBuildAdvisoryFacts) => CharacterBuildAdvisoryOfCode<C>[]
  compare: (a: CharacterBuildAdvisoryOfCode<C>, b: CharacterBuildAdvisoryOfCode<C>) => number
}

const ADVISORY_RULES: { [C in CharacterBuildAdvisoryCode]: AdvisoryRule<C> } = {
  equipment_not_proficient: {
    resolve: resolveEquipmentProficiencyAdvisories,
    compare: compareEquipmentProficiencyAdvisories,
  },
}

function resolveRuleAdvisories<C extends CharacterBuildAdvisoryCode>(
  code: C,
  facts: CharacterBuildAdvisoryFacts,
): CharacterBuildAdvisory[] {
  const rule = ADVISORY_RULES[code] as AdvisoryRule<C>
  const seen = new Set<string>()
  const unique = rule.resolve(facts).filter((advisory) => {
    const key = characterBuildAdvisoryKey(advisory)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return unique.sort(rule.compare)
}

/** Deduped advisories ordered by code, then per-code comparator. */
export function resolveCharacterBuildAdvisories(
  facts: CharacterBuildAdvisoryFacts,
): CharacterBuildAdvisory[] {
  return CHARACTER_BUILD_ADVISORY_CODE_ORDER.flatMap((code) => resolveRuleAdvisories(code, facts))
}

/** Advisories for the loadout finalize would persist; `[]` when the loadout cannot resolve. */
export function resolveCharacterBuildAdvisoriesForDraft(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  options: CharacterBuildEngineOptions = {},
): CharacterBuildAdvisory[] {
  const result = resolveCharacterBuildLoadout(draft, context, options.resolvedChoiceSets ?? [])
  if (!result.ok) return []
  return resolveCharacterBuildAdvisories(result.loadout)
}

import type { ResolvedCampaignLevelZeroNpcsPatch } from '../../../campaign/patches/campaign-level-zero-npcs-patch'
import type { Species } from '../../../content/species'
import { resolveLanguageIdsFromGrantSet } from '../../creature/languages'
import type { LanguageSeedOption } from '../../../vocab/language'
import type {
  CharacterArmorProficiencyEntry,
  CharacterWeaponProficiencyEntry,
} from '../../character/sheet/proficiencies'
import type { CharacterSelectionSource } from '../../character/sheet/selection-sources'

export const LEVEL_ZERO_BASELINE_PROFICIENCY_SOURCE: CharacterSelectionSource[] = [
  { kind: 'characterCreation', sourceId: 'levelZeroNpcs', grantId: 'baseline' },
]

export function levelZeroBaselineArmorEntries(
  rules: ResolvedCampaignLevelZeroNpcsPatch,
): CharacterArmorProficiencyEntry[] {
  return rules.armorProficiencies.categories.map((armorCategory) => ({
    armorCategory,
    sources: LEVEL_ZERO_BASELINE_PROFICIENCY_SOURCE,
  }))
}

export function levelZeroBaselineWeaponEntries(
  rules: ResolvedCampaignLevelZeroNpcsPatch,
): CharacterWeaponProficiencyEntry[] {
  const entries: CharacterWeaponProficiencyEntry[] = []

  for (const weaponCategory of rules.weaponProficiencies.categories) {
    entries.push({
      weaponCategory,
      rank: 'proficient',
      sources: LEVEL_ZERO_BASELINE_PROFICIENCY_SOURCE,
    })
  }

  for (const weaponId of rules.weaponProficiencies.items) {
    entries.push({
      weaponId,
      rank: 'proficient',
      sources: LEVEL_ZERO_BASELINE_PROFICIENCY_SOURCE,
    })
  }

  return entries
}

export function levelZeroBaselineLanguageIds(
  rules: ResolvedCampaignLevelZeroNpcsPatch,
  languages: readonly LanguageSeedOption[],
): string[] {
  return resolveLanguageIdsFromGrantSet({
    grantSet: rules.languageProficiencies,
    languages,
  })
}

export function levelZeroSpeciesLanguageIds(
  species: Species | undefined,
  rules: ResolvedCampaignLevelZeroNpcsPatch,
): string[] {
  if (!species || !rules.retainSpeciesLanguages) return []
  return [...(species.languageAffinities ?? [])]
}

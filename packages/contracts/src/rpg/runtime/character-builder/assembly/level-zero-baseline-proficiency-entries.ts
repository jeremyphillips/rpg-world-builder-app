import type { ResolvedCampaignLevelZeroNpcsPatch } from '../../../campaign/patches/campaign-level-zero-npcs-patch'
import type { ArmorCategory } from '../../../vocab/armor/category'
import { getNpcTemplateEntry } from '../../../vocab/npc/npc-template'
import type { CharacterBuilderDraft } from '../draft/draft'
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

/** Retained species languages are attributed to the species, not the level-0 baseline. */
export const LEVEL_ZERO_SPECIES_LANGUAGE_GRANT_ID = 'language-affinities'

export function levelZeroSpeciesLanguageSource(speciesId: string): CharacterSelectionSource[] {
  return [
    {
      kind: 'speciesTrait',
      sourceId: speciesId,
      grantId: LEVEL_ZERO_SPECIES_LANGUAGE_GRANT_ID,
    },
  ]
}

/** Template training layered onto the campaign baseline. Classless drafts only. */
export function levelZeroTemplateTraining(draft: CharacterBuilderDraft) {
  const templateId = draft.npcTemplateId
  if (!templateId) return undefined
  return getNpcTemplateEntry(templateId)?.levelZero?.training
}

export function levelZeroBaselineArmorEntries(
  rules: Pick<ResolvedCampaignLevelZeroNpcsPatch, 'armorProficiencies'>,
  resolveItemCategory?: (item: string) => ArmorCategory | undefined,
): CharacterArmorProficiencyEntry[] {
  const categories = [...rules.armorProficiencies.categories]
  for (const item of rules.armorProficiencies.items) {
    const category = resolveItemCategory?.(item)
    if (category && !categories.includes(category)) categories.push(category)
  }

  return categories.map((armorCategory) => ({
    armorCategory,
    sources: LEVEL_ZERO_BASELINE_PROFICIENCY_SOURCE,
  }))
}

export function levelZeroBaselineWeaponEntries(
  rules: Pick<ResolvedCampaignLevelZeroNpcsPatch, 'weaponProficiencies'>,
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

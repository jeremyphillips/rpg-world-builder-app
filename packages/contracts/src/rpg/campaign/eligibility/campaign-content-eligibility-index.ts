import type { ResolvedContentCampaignAccess } from '../../content/lib/campaign-access'
import type { CharacterCampaignContentReferenceType } from './character-campaign-content-reference-types'

export type CampaignContentEligibilityEntry = {
  access: ResolvedContentCampaignAccess
  label: string
}

export type CampaignLanguageEligibilityEntry = {
  label: string
}

export type CampaignHeritageEligibilityEntry = {
  label: string
  speciesId: string
}

/**
 * Authoritative campaign content index for eligibility checks. Keys content rows
 * by id and by slug where the character sheet stores slugs (skills, tools).
 */
export type CampaignContentEligibilityIndex = {
  contentById: ReadonlyMap<string, CampaignContentEligibilityEntry>
  skillsBySlug: ReadonlyMap<string, CampaignContentEligibilityEntry>
  equipmentBySlug: ReadonlyMap<string, CampaignContentEligibilityEntry>
  languagesBySlug: ReadonlyMap<string, CampaignLanguageEligibilityEntry>
  heritageBySpeciesId: ReadonlyMap<string, ReadonlyMap<string, CampaignHeritageEligibilityEntry>>
}

export function createCampaignContentEligibilityIndex(
  contentById: ReadonlyMap<string, CampaignContentEligibilityEntry>,
  options: {
    skillsBySlug?: ReadonlyMap<string, CampaignContentEligibilityEntry>
    equipmentBySlug?: ReadonlyMap<string, CampaignContentEligibilityEntry>
    languagesBySlug?: ReadonlyMap<string, CampaignLanguageEligibilityEntry>
    heritageBySpeciesId?: ReadonlyMap<string, ReadonlyMap<string, CampaignHeritageEligibilityEntry>>
  } = {},
): CampaignContentEligibilityIndex {
  return {
    contentById,
    skillsBySlug: options.skillsBySlug ?? new Map(),
    equipmentBySlug: options.equipmentBySlug ?? new Map(),
    languagesBySlug: options.languagesBySlug ?? new Map(),
    heritageBySpeciesId: options.heritageBySpeciesId ?? new Map(),
  }
}

export function lookupCampaignContentEntry(
  index: CampaignContentEligibilityIndex,
  contentType: CharacterCampaignContentReferenceType,
  contentId: string,
  speciesId?: string,
): CampaignContentEligibilityEntry | null {
  const byId = index.contentById.get(contentId)
  if (byId) return byId

  if (contentType === 'proficiencies') {
    return index.skillsBySlug.get(contentId) ?? null
  }

  if (contentType === 'tools' || contentType === 'equipment') {
    return index.equipmentBySlug.get(contentId) ?? null
  }

  if (contentType === 'heritage' && speciesId) {
    const heritageEntry = index.heritageBySpeciesId.get(speciesId)?.get(contentId)
    if (!heritageEntry) return null
    const speciesEntry = index.contentById.get(speciesId)
    if (!speciesEntry) return null
    return { access: speciesEntry.access, label: heritageEntry.label }
  }

  return null
}

export function lookupCampaignLanguageEntry(
  index: CampaignContentEligibilityIndex,
  languageSlug: string,
): CampaignLanguageEligibilityEntry | null {
  return index.languagesBySlug.get(languageSlug) ?? null
}

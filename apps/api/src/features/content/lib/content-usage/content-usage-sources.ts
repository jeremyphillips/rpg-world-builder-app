import {
  CLASS_CHARACTER_REFERENCE,
  FEAT_CHARACTER_REFERENCE,
  ORGANIZATION_CHARACTER_REFERENCE,
  SKILL_PROFICIENCY_CHARACTER_REFERENCE,
  SPECIES_CHARACTER_REFERENCE,
  SPELL_CHARACTER_REFERENCE,
  SUBCLASS_CHARACTER_REFERENCE,
  type CharacterContentReferenceDescriptor,
} from '@rpg/contracts'

import {
  indexCharacterBlockersByContentId,
  indexCharacterEquipmentBlockersByContentId,
} from './reference-sources/characters'
import { indexLocationParentBlockersByContentId } from './reference-sources/locations'
import { indexLocationPartyBlockersByContentId } from './reference-sources/location-party-associations'
import { indexCampaignPrimaryWorldBlockersByContentId } from './reference-sources/campaign-settings'
import type { ContentUsageSource } from './content-usage-source'

function characterDescriptorSource(
  descriptor: CharacterContentReferenceDescriptor,
): ContentUsageSource {
  return {
    characterReference: descriptor,
    loadBlockerIndex: (ctx) =>
      indexCharacterBlockersByContentId({
        campaignId: ctx.campaignId,
        purpose: ctx.purpose,
        viewer: ctx.viewer,
        descriptor,
      }),
  }
}

export const characterClassSource = characterDescriptorSource(CLASS_CHARACTER_REFERENCE)
export const characterSubclassSource = characterDescriptorSource(SUBCLASS_CHARACTER_REFERENCE)
export const characterSpeciesSource = characterDescriptorSource(SPECIES_CHARACTER_REFERENCE)
export const characterSpellSource = characterDescriptorSource(SPELL_CHARACTER_REFERENCE)
export const characterFeatSource = characterDescriptorSource(FEAT_CHARACTER_REFERENCE)
export const characterOrganizationSource = characterDescriptorSource(
  ORGANIZATION_CHARACTER_REFERENCE,
)
export const characterSkillProficiencySource = characterDescriptorSource(
  SKILL_PROFICIENCY_CHARACTER_REFERENCE,
)

export const characterEquipmentSource: ContentUsageSource = {
  characterReference: 'equipment',
  loadBlockerIndex: (ctx) =>
    indexCharacterEquipmentBlockersByContentId({
      campaignId: ctx.campaignId,
      purpose: ctx.purpose,
      viewer: ctx.viewer,
    }),
}

export const locationParentReferenceSource: ContentUsageSource = {
  loadBlockerIndex: (ctx) => indexLocationParentBlockersByContentId(ctx),
}

export const locationPartyReferenceSource: ContentUsageSource = {
  loadBlockerIndex: (ctx) => indexLocationPartyBlockersByContentId(ctx),
}

export const campaignPrimaryWorldReferenceSource: ContentUsageSource = {
  loadBlockerIndex: (ctx) => indexCampaignPrimaryWorldBlockersByContentId(ctx),
}

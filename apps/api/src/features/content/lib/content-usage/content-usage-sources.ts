import {
  CLASS_CHARACTER_REFERENCE,
  FEAT_CHARACTER_REFERENCE,
  SKILL_PROFICIENCY_CHARACTER_REFERENCE,
  SPECIES_CHARACTER_REFERENCE,
  SPELL_CHARACTER_REFERENCE,
  SUBCLASS_CHARACTER_REFERENCE,
  type CharacterContentReferenceDescriptor,
} from '@rpg/contracts'

import {
  indexCharacterRelationshipCharacterBlockersByContentId,
  indexCharacterRelationshipLocationBlockersByContentId,
  indexCharacterRelationshipOrganizationBlockersByContentId,
} from '../../../character-relationships/lib/content-usage/character-relationship-usage'
import {
  indexCharacterBlockersByContentId,
  indexCharacterEquipmentBlockersByContentId,
} from './reference-sources/characters'
import { indexLocationParentBlockersByContentId } from './reference-sources/locations'
import {
  indexOrganizationLocationBlockersByContentId,
  indexOrganizationMemberClassAffinityBlockersByContentId,
  indexOrganizationMemberSpeciesAffinityBlockersByContentId,
} from './reference-sources/organizations'
import { indexCampaignPrimaryWorldBlockersByContentId } from './reference-sources/campaign-settings'
import {
  indexMonsterEquipmentBlockersByContentId,
  indexMonsterSkillProficiencyBlockersByContentId,
} from './reference-sources/monsters'
import { indexContentSpellReferenceBlockersByContentId } from './reference-sources/spell-references'
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
export const contentSpellReferenceSource: ContentUsageSource = {
  loadBlockerIndex: (ctx) => indexContentSpellReferenceBlockersByContentId(ctx),
}
export const characterFeatSource = characterDescriptorSource(FEAT_CHARACTER_REFERENCE)
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

export const organizationLocationSource: ContentUsageSource = {
  loadBlockerIndex: (ctx) => indexOrganizationLocationBlockersByContentId(ctx),
}

export const organizationMemberClassAffinitySource: ContentUsageSource = {
  loadBlockerIndex: (ctx) => indexOrganizationMemberClassAffinityBlockersByContentId(ctx),
}

export const organizationMemberSpeciesAffinitySource: ContentUsageSource = {
  loadBlockerIndex: (ctx) => indexOrganizationMemberSpeciesAffinityBlockersByContentId(ctx),
}

export const locationParentReferenceSource: ContentUsageSource = {
  loadBlockerIndex: (ctx) => indexLocationParentBlockersByContentId(ctx),
}

export const campaignPrimaryWorldReferenceSource: ContentUsageSource = {
  loadBlockerIndex: (ctx) => indexCampaignPrimaryWorldBlockersByContentId(ctx),
}

export const characterRelationshipOrganizationSource: ContentUsageSource = {
  loadBlockerIndex: (ctx) => indexCharacterRelationshipOrganizationBlockersByContentId(ctx),
}

export const characterRelationshipLocationSource: ContentUsageSource = {
  loadBlockerIndex: (ctx) => indexCharacterRelationshipLocationBlockersByContentId(ctx),
}

export const characterRelationshipCharacterSource: ContentUsageSource = {
  loadBlockerIndex: (ctx) => indexCharacterRelationshipCharacterBlockersByContentId(ctx),
}

export const monsterEquipmentSource: ContentUsageSource = {
  loadBlockerIndex: (ctx) => indexMonsterEquipmentBlockersByContentId(ctx),
}

export const monsterSkillProficiencySource: ContentUsageSource = {
  loadBlockerIndex: (ctx) => indexMonsterSkillProficiencyBlockersByContentId(ctx),
}

/** Placeholder until encounter surfaces reference monsters in usage reads. */
export const emptyContentUsageSource: ContentUsageSource = {
  loadBlockerIndex: async () => new Map(),
}

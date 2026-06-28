import type { RulesetPatchRead, UpdateCampaignCharacterCreationInput } from '@rpg/contracts'

import { patchJson, request } from '@/lib/api-client'

function rulesetPatchPath(campaignId: string) {
  return `/api/campaigns/${campaignId}/ruleset-patch`
}

/** Load resolved campaign ruleset patch data for a campaign. */
export async function fetchRulesetPatch(campaignId: string): Promise<RulesetPatchRead> {
  const { patch } = await request<{ patch: RulesetPatchRead }>(
    rulesetPatchPath(campaignId),
    undefined,
    'Could not load ruleset patch.',
  )
  return patch
}

/** Patch character-creation rules on the campaign ruleset patch document. */
export async function patchCharacterCreation(
  campaignId: string,
  input: UpdateCampaignCharacterCreationInput,
): Promise<RulesetPatchRead> {
  const { patch } = await patchJson<{ patch: RulesetPatchRead }>(
    `${rulesetPatchPath(campaignId)}/character-creation`,
    input,
    'Could not update character creation rules.',
  )
  return patch
}

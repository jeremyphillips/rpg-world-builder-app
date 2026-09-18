import type {
  CampaignCharacterCreationPatch,
  UpdateCampaignCharacterCreationInput,
} from '@rpg/contracts'

/** Shallow-merges progression patch fields; `extendedProgression: null` clears extended tiers. */
export function mergeProgressionPatch(
  existing: CampaignCharacterCreationPatch['progression'] | undefined,
  input: NonNullable<UpdateCampaignCharacterCreationInput['progression']>,
): NonNullable<CampaignCharacterCreationPatch['progression']> {
  const merged = {
    ...(existing ?? {}),
    ...input,
  }

  if ('extendedProgression' in input && input.extendedProgression === null) {
    const { extendedProgression: _removed, ...withoutExtended } = merged
    return withoutExtended
  }

  return merged
}

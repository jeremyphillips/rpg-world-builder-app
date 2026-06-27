import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateCampaignCharacterCreationInput } from '@rpg/contracts'

import { patchCharacterCreation } from '../api/ruleset-patch-api'
import { rulesetPatchQueryKey } from './use-ruleset-patch'

/** Patch character-creation rules and refresh the ruleset-patch query cache. */
export function usePatchCharacterCreationMutation(campaignId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateCampaignCharacterCreationInput) =>
      patchCharacterCreation(campaignId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rulesetPatchQueryKey(campaignId) })
    },
  })
}

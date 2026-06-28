import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateCampaignMechanicsInput } from '@rpg/contracts'

import { patchMechanics } from '../api/ruleset-patch-api'
import { rulesetPatchQueryKey } from './use-ruleset-patch'

/** Patch mechanics rules and refresh the ruleset-patch query cache. */
export function usePatchMechanicsMutation(campaignId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateCampaignMechanicsInput) => patchMechanics(campaignId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rulesetPatchQueryKey(campaignId) })
    },
  })
}

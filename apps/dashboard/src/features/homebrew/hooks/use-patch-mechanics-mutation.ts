import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateCampaignMechanicsInput } from '@rpg/contracts'

import { globalSearchCatalogQueryKey } from '@/lib/query-keys/global-search-catalog'

import { patchMechanics } from '../api/ruleset-patch-api'
import { rulesetPatchQueryKey } from './use-ruleset-patch'

/** Patch mechanics and invalidate cached readers of derived Armor Class. */
export function usePatchMechanicsMutation(campaignId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateCampaignMechanicsInput) => patchMechanics(campaignId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rulesetPatchQueryKey(campaignId) })
      void queryClient.invalidateQueries({ queryKey: globalSearchCatalogQueryKey(campaignId) })
    },
  })
}

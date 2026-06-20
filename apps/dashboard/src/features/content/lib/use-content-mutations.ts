import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createContent, updateContent } from './content-client'

/**
 * Factory that produces `useCreateContent` and `useUpdateContent` hooks for a
 * given content type. Call it once at module level to produce stable hook
 * references — never call it inside a component.
 *
 * Both hooks hit the stubbed endpoints (`POST`/`PATCH
 * `/api/campaigns/:id/content/:routeKey`) and invalidate the list query on
 * success.
 *
 * @example
 * // In a content type's hooks file:
 * export const {
 *   useCreateContent: useCreateSpecies,
 *   useUpdateContent: useUpdateSpecies,
 * } = createContentMutationHooks('species', speciesQueryKey)
 */
export function createContentMutationHooks(
  routeKey: string,
  queryKeyFn: (campaignId: string) => readonly unknown[],
) {
  function useCreateContent(campaignId: string) {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (input: unknown) => createContent(campaignId, routeKey, input),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeyFn(campaignId) })
      },
    })
  }

  function useUpdateContent(campaignId: string, entityId: string) {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (input: unknown) => updateContent(campaignId, routeKey, entityId, input),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeyFn(campaignId) })
      },
    })
  }

  return { useCreateContent, useUpdateContent }
}

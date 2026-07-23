import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'

import type { AnyContentFormDef } from '../forms/content-form-registry'
import {
  createContent,
  deleteContent,
  demoteContent,
  getContentDeletionAvailability,
  getContentDemotionAvailability,
  publishContent,
  updateContent,
} from './content-client'
import { homebrewSummaryQueryKey } from '../../../homebrew/hooks/use-homebrew-summary'

export type ContentMutationHooksOptions = {
  /** Additional query keys to invalidate after a successful write. */
  invalidateQueryKeys?: (campaignId: string) => readonly (readonly unknown[])[]
}

export function invalidateContentWriteQueries(
  queryClient: QueryClient,
  campaignId: string,
  queryKeyFn: (campaignId: string) => readonly unknown[],
  extraInvalidationKeys?: ContentMutationHooksOptions['invalidateQueryKeys'],
) {
  void queryClient.invalidateQueries({ queryKey: queryKeyFn(campaignId) })
  for (const queryKey of extraInvalidationKeys?.(campaignId) ?? []) {
    void queryClient.invalidateQueries({ queryKey })
  }
}

export function invalidateContentFormDefQueries(
  queryClient: QueryClient,
  campaignId: string,
  def: Pick<AnyContentFormDef, 'queryKey' | 'invalidateQueryKeys'>,
) {
  invalidateContentWriteQueries(queryClient, campaignId, def.queryKey, def.invalidateQueryKeys)
}

/**
 * Factory that produces `useCreateContent` and `useUpdateContent` hooks for a
 * given content type. Call it once at module level to produce stable hook
 * references — never call it inside a component.
 *
 * Both hooks hit the content write endpoints (`POST`/`PATCH
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
  options?: ContentMutationHooksOptions,
) {
  function useCreateContent(campaignId: string) {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (input: unknown) => createContent(campaignId, routeKey, input),
      onSuccess: () => {
        invalidateContentWriteQueries(
          queryClient,
          campaignId,
          queryKeyFn,
          options?.invalidateQueryKeys,
        )
      },
    })
  }

  function useUpdateContent(campaignId: string, entityId: string) {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (input: unknown) => updateContent(campaignId, routeKey, entityId, input),
      onSuccess: () => {
        invalidateContentWriteQueries(
          queryClient,
          campaignId,
          queryKeyFn,
          options?.invalidateQueryKeys,
        )
      },
    })
  }

  return { useCreateContent, useUpdateContent }
}

/**
 * Generic create/update mutation for schema-driven shells. Uses the form def's
 * `routeKey`, `queryKey`, and optional `invalidateQueryKeys`.
 */
export function useContentWriteMutation(
  def: Pick<AnyContentFormDef, 'routeKey' | 'queryKey' | 'invalidateQueryKeys'>,
  campaignId: string,
  entityId?: string,
) {
  const queryClient = useQueryClient()
  const isUpdate = entityId != null

  return useMutation({
    mutationFn: (input: unknown) =>
      isUpdate
        ? updateContent(campaignId, def.routeKey, entityId, input)
        : createContent(campaignId, def.routeKey, input),
    onSuccess: () => {
      invalidateContentFormDefQueries(queryClient, campaignId, def)
    },
  })
}

export function fetchContentDeletionAvailability(
  campaignId: string,
  routeKey: string,
  entityId: string,
) {
  return getContentDeletionAvailability(campaignId, routeKey, entityId)
}

export function fetchContentDemotionAvailability(
  campaignId: string,
  routeKey: string,
  entityId: string,
) {
  return getContentDemotionAvailability(campaignId, routeKey, entityId)
}

export function usePublishContent(
  def: Pick<AnyContentFormDef, 'routeKey' | 'queryKey' | 'invalidateQueryKeys'>,
  campaignId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (entityId: string) => publishContent(campaignId, def.routeKey, entityId),
    onSuccess: () => {
      invalidateContentFormDefQueries(queryClient, campaignId, def)
    },
  })
}

export function useDemoteContent(
  def: Pick<AnyContentFormDef, 'routeKey' | 'queryKey' | 'invalidateQueryKeys'>,
  campaignId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (entityId: string) => demoteContent(campaignId, def.routeKey, entityId),
    onSuccess: (result) => {
      if (result.status !== 'demoted') return
      invalidateContentFormDefQueries(queryClient, campaignId, def)
    },
  })
}

export function useDeleteContent(
  def: Pick<AnyContentFormDef, 'routeKey' | 'queryKey' | 'invalidateQueryKeys'>,
  campaignId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (entityId: string) => deleteContent(campaignId, def.routeKey, entityId),
    onSuccess: (result) => {
      if (result.status !== 'deleted') return
      invalidateContentFormDefQueries(queryClient, campaignId, def)
      void queryClient.invalidateQueries({ queryKey: homebrewSummaryQueryKey(campaignId) })
    },
  })
}

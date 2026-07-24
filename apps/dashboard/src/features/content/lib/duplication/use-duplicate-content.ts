import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { ContentTypeKey } from '@rpg/contracts'

import {
  invalidateContentWriteQueries,
  type ContentMutationHooksOptions,
} from '../list/use-content-mutations'
import { duplicateContent } from './duplicate-content-api'
import { DUPLICATE_CONTENT_FALLBACK_ERROR } from './duplicate-content-labels'

export type DuplicateContentInput = {
  entityId: string
  name: string
}

/** TanStack mutation for content duplication — invalidates the type list query on success. */
export function useDuplicateContent(
  campaignId: string,
  contentTypeKey: ContentTypeKey,
  queryKeyFn: (campaignId: string) => readonly unknown[],
  options?: ContentMutationHooksOptions,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ entityId, name }: DuplicateContentInput) =>
      duplicateContent(
        campaignId,
        contentTypeKey,
        entityId,
        { name },
        DUPLICATE_CONTENT_FALLBACK_ERROR,
      ),
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

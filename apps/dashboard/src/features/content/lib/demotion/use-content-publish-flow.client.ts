'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ContentSource } from '@rpg/contracts'
import { getErrorMessage } from '@rpg/contracts'

import type { AnyContentFormDef } from '../forms/content-form-registry'
import { usePublishContent } from '../list/use-content-mutations'
import { useContentEditPublishRequest } from '../forms/shells/content-edit-publish-context.client'

type UseContentPublishFlowOptions = {
  def: Pick<AnyContentFormDef, 'routeKey' | 'queryKey' | 'invalidateQueryKeys'>
  campaignId: string
  entityId: string
  entitySource: ContentSource
  entityStatus: 'draft' | 'published'
}

export function useContentPublishFlow({
  def,
  campaignId,
  entityId,
  entitySource,
  entityStatus,
}: UseContentPublishFlowOptions) {
  const publishMutation = usePublishContent(def, campaignId)
  const publishRequest = useContentEditPublishRequest()
  const [publishError, setPublishError] = useState<string | null>(null)
  const [publishSuccess, setPublishSuccess] = useState(false)

  useEffect(() => {
    setPublishError(null)
    setPublishSuccess(false)
  }, [entityId])

  const runPublishMutation = useCallback(async () => {
    await publishMutation.mutateAsync(entityId)
    setPublishSuccess(true)
  }, [entityId, publishMutation])

  const handlePublishClick = useCallback(async () => {
    if (entitySource !== 'homebrew' || entityStatus !== 'draft' || publishMutation.isPending) {
      return
    }

    setPublishError(null)
    setPublishSuccess(false)

    if (publishRequest) {
      publishRequest.requestPublish()
      return
    }

    try {
      await runPublishMutation()
    } catch (err) {
      setPublishError(getErrorMessage(err, 'Could not publish this item.'))
    }
  }, [entitySource, entityStatus, publishMutation.isPending, publishRequest, runPublishMutation])

  const canPublish = entitySource === 'homebrew' && entityStatus === 'draft'

  return {
    canPublish,
    publishPending: publishMutation.isPending,
    publishError,
    publishSuccess,
    handlePublishClick,
    runPublishMutation,
    setPublishError,
  }
}

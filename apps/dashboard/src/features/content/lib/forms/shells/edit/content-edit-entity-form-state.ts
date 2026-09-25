import type { ContentSource, ContentStatus, ContentTypeKey } from '@rpg/contracts'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS, getErrorMessage } from '@rpg/contracts'
import { useCallback, useState } from 'react'

import { notifyCoordinatedContentSaveSuccess } from '@/lib/notify'
import { useContentDeleteFlow } from '../../../delete/use-content-delete-flow'
import { useContentDemoteFlow } from '../../../demotion/use-content-demote-flow'
import { useContentPublishFlow } from '../../../demotion/use-content-publish-flow'
import { resolveContentPublishSchema } from './content-edit-load'
import type { AnyContentFormDef, ContentFormCtx } from '../../registry/content-form-registry'

export function useContentEditEntityFormState<
  TEntity extends {
    id: string
    name: string
    source: ContentSource
    status: ContentStatus
    campaignAccess?: typeof DEFAULT_CONTENT_CAMPAIGN_ACCESS
  },
>(input: {
  entity: TEntity
  campaignId: string
  overviewHref: string
  contentTypeKey: ContentTypeKey
  def: AnyContentFormDef
  layoutCtx: ContentFormCtx
  formError: string | null
}) {
  const [campaignAccess, setCampaignAccess] = useState(
    () => input.entity.campaignAccess ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  )
  const publishSchema = resolveContentPublishSchema(input.def, input.layoutCtx)
  const deleteFlow = useContentDeleteFlow({
    def: input.def,
    campaignId: input.campaignId,
    entityId: input.entity.id,
    entityName: input.entity.name,
    entitySource: input.entity.source,
    contentTypeKey: input.contentTypeKey,
    overviewHref: input.overviewHref,
  })
  const publishFlow = useContentPublishFlow({
    def: input.def,
    campaignId: input.campaignId,
    entityId: input.entity.id,
    entitySource: input.entity.source,
    entityStatus: input.entity.status,
  })
  const demoteFlow = useContentDemoteFlow({
    def: input.def,
    campaignId: input.campaignId,
    entityId: input.entity.id,
    entityName: input.entity.name,
    entitySource: input.entity.source,
    entityStatus: input.entity.status,
  })

  const handlePublish = useCallback(async () => {
    try {
      await publishFlow.runPublishMutation()
    } catch (err) {
      publishFlow.setPublishError(getErrorMessage(err, 'Could not publish this item.'))
    }
  }, [publishFlow.runPublishMutation, publishFlow.setPublishError])

  const handleCoordinatedSaveSuccess = useCallback(
    (event: Parameters<typeof notifyCoordinatedContentSaveSuccess>[0]) => {
      notifyCoordinatedContentSaveSuccess(event, input.entity.name)
    },
    [input.entity.name],
  )

  const headerError =
    deleteFlow.deleteError ?? publishFlow.publishError ?? demoteFlow.demoteError ?? input.formError

  return {
    campaignAccess,
    setCampaignAccess,
    publishSchema,
    deleteFlow,
    publishFlow,
    demoteFlow,
    handlePublish,
    handleCoordinatedSaveSuccess,
    headerError,
    showLifecycleActions: input.entity.source === 'homebrew',
  }
}

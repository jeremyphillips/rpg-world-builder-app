'use client'

import { Button } from '@rpg/ui'

import type { useContentDeleteFlow } from '../../delete/use-content-delete-flow.client'
import type { useContentDemoteFlow } from '../../demotion/use-content-demote-flow.client'
import type { useContentPublishFlow } from '../../demotion/use-content-publish-flow.client'

type ContentEditLifecycleActionsProps = {
  publishFlow: ReturnType<typeof useContentPublishFlow>
  demoteFlow: ReturnType<typeof useContentDemoteFlow>
  deleteFlow: ReturnType<typeof useContentDeleteFlow>
}

export function ContentEditLifecycleActions({
  publishFlow,
  demoteFlow,
  deleteFlow,
}: ContentEditLifecycleActionsProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
      {publishFlow.canPublish ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={publishFlow.publishPending}
            onClick={() => void publishFlow.handlePublishClick()}
          >
            {publishFlow.publishPending ? 'Publishing…' : 'Publish'}
          </Button>
        </>
      ) : null}
      {demoteFlow.canDemote ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={demoteFlow.demotePending}
          onClick={() => void demoteFlow.handleDemoteClick()}
        >
          {demoteFlow.checkingAvailability ? 'Checking…' : 'Move to draft'}
        </Button>
      ) : null}
      {deleteFlow.canDelete ? (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={deleteFlow.deletePending}
          onClick={() => void deleteFlow.handleDeleteClick()}
        >
          {deleteFlow.checkingAvailability ? 'Checking…' : 'Delete'}
        </Button>
      ) : null}
    </div>
  )
}

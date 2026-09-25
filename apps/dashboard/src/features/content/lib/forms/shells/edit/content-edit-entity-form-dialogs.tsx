import type { ContentTypeKey } from '@rpg/contracts'

import { ContentDeletionBlockedDialog } from '../../../delete/content-deletion-blocked-dialog'
import { ContentDeletionConfirmDialog } from '../../../delete/content-deletion-confirm-dialog'
import { ContentDemotionBlockedDialog } from '../../../demotion/content-demotion-blocked-dialog'
import { ContentDemotionConfirmDialog } from '../../../demotion/content-demotion-confirm-dialog'
import type { useContentDeleteFlow } from '../../../delete/use-content-delete-flow'
import type { useContentDemoteFlow } from '../../../demotion/use-content-demote-flow'

type DeleteFlow = ReturnType<typeof useContentDeleteFlow>
type DemoteFlow = ReturnType<typeof useContentDemoteFlow>

export function ContentEditEntityFormDialogs({
  contentTypeKey,
  entityName,
  deleteFlow,
  demoteFlow,
}: {
  contentTypeKey: ContentTypeKey
  entityName: string
  deleteFlow: DeleteFlow
  demoteFlow: DemoteFlow
}) {
  return (
    <>
      <ContentDeletionConfirmDialog
        open={deleteFlow.confirmOpen}
        onOpenChange={deleteFlow.setConfirmOpen}
        contentTypeKey={contentTypeKey}
        entityName={entityName}
        onConfirm={() => void deleteFlow.handleConfirmDelete()}
      />

      <ContentDeletionBlockedDialog
        open={deleteFlow.blockedOpen}
        onOpenChange={deleteFlow.setBlockedOpen}
        entityName={entityName}
        blockers={deleteFlow.blockers}
      />

      <ContentDemotionConfirmDialog
        open={demoteFlow.confirmOpen}
        onOpenChange={demoteFlow.setConfirmOpen}
        entityName={entityName}
        onConfirm={() => void demoteFlow.handleConfirmDemote()}
      />

      <ContentDemotionBlockedDialog
        open={demoteFlow.blockedOpen}
        onOpenChange={demoteFlow.setBlockedOpen}
        blockers={demoteFlow.blockers}
      />
    </>
  )
}

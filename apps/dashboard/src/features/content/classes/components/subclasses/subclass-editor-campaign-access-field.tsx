import type { RefObject } from 'react'
import type { ContentCampaignAccessPatch, ResolvedContentCampaignAccess } from '@rpg/contracts'

import { CampaignAvailabilityField } from '../../../lib/campaign-access/campaign-availability-field'

export function SubclassEditorCampaignAccessField({
  dialogRef,
  campaignId,
  classId,
  subclassId,
  isDraft,
  campaignAccess,
  onDraftChange,
  onPersistedChange,
}: {
  dialogRef: RefObject<HTMLDivElement | null>
  campaignId: string
  classId: string
  subclassId: string
  isDraft: boolean
  campaignAccess: ResolvedContentCampaignAccess
  onDraftChange: (patch: ContentCampaignAccessPatch) => void
  onPersistedChange: (access: ResolvedContentCampaignAccess) => void
}) {
  return (
    <div ref={dialogRef} className="sr-only" aria-hidden={false}>
      <CampaignAvailabilityField
        campaignId={campaignId}
        targetType="subclasses"
        classId={classId}
        entityId={isDraft ? undefined : subclassId}
        presentation="dialog"
        initialAccess={campaignAccess}
        onDraftChange={onDraftChange}
        onPersistedChange={onPersistedChange}
      />
    </div>
  )
}

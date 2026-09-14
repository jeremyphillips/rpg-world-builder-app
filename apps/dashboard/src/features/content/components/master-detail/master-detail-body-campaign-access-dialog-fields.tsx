import { useMemo, type RefObject } from 'react'
import { FormItems } from '@rpg/ui/form'

import { buildBodyCampaignAccessFormFields } from '../../lib/campaign-access/body-campaign-access-form-fields'
import { formatCampaignAccessParticipantOptionLabel } from '../../lib/campaign-access/campaign-access-labels'
import { useCampaignAccessParticipantRoster } from '../../lib/campaign-access/use-campaign-access-participant-roster'
import type { FormEmbeddedMasterDetailAccessConfig } from '../../lib/master-detail/master-detail-access.types'
import { resolveMasterDetailInheritedRestrictionHint } from '../../lib/master-detail/master-detail-effective-access.lib'
import type { EmbeddedMasterDetailRow } from '../../lib/master-detail/build-embedded-master-detail-rows'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'

type MasterDetailBodyCampaignAccessDialogFieldsProps = {
  access: Extract<FormEmbeddedMasterDetailAccessConfig, { kind: 'campaignAccess' }>
  formCtx: ContentFormCtx
  fieldName: string
  idPrefix: string
  selectedRow: EmbeddedMasterDetailRow
  dialogRef: RefObject<HTMLDivElement | null>
}

export function MasterDetailBodyCampaignAccessDialogFields({
  access,
  formCtx,
  fieldName,
  idPrefix,
  selectedRow,
  dialogRef,
}: MasterDetailBodyCampaignAccessDialogFieldsProps) {
  const { data: participantRoster = [] } = useCampaignAccessParticipantRoster(formCtx.campaignId)
  const participantOptions = useMemo(
    () =>
      participantRoster.map((participant) => ({
        value: participant.id,
        label: formatCampaignAccessParticipantOptionLabel(
          participant.name,
          participant.playerDisplayName,
        ),
      })),
    [participantRoster],
  )

  const parentAccess = access.resolveParentAccess({ formCtx })
  const localAccess = selectedRow.localCampaignAccess
  const inheritedRestrictionHint =
    localAccess !== undefined
      ? resolveMasterDetailInheritedRestrictionHint(parentAccess, localAccess)
      : undefined

  const formItems = buildBodyCampaignAccessFormFields({
    targetType: 'species',
    groupId: `md-campaign-access-${selectedRow.fieldId}`,
    parentAccess,
    participantOptions,
    presentation: 'dialog',
    inheritedRestrictionHint,
  })

  return (
    <div ref={dialogRef} className="sr-only" aria-hidden={false}>
      <FormItems
        items={formItems}
        idPrefix={`${idPrefix}-${selectedRow.fieldId}-availability`}
        namePrefix={`${fieldName}.${selectedRow.formIndex}.${access.fieldName}`}
      />
    </div>
  )
}

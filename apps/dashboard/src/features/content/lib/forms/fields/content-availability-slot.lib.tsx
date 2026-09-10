import type {
  ContentAccessTargetType,
  ContentCampaignAccessPatch,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import type { FormDensity, FormItem } from '@rpg/ui/form'

import type { CampaignAvailabilityPresentation } from '@/lib/campaign-availability/campaign-availability-form-fields'

import { CampaignAvailabilityField } from '../../campaign-access/campaign-availability-field'
import { CONTENT_IDENTITY_AVAILABILITY_SLOT_NAME } from './content-identity-form-fields'

export type ContentAvailabilitySlotOptions = {
  campaignId: string
  targetType: ContentAccessTargetType
  entityId?: string
  classId?: string
  density?: FormDensity
  presentation: CampaignAvailabilityPresentation
  initialAccess?: ResolvedContentCampaignAccess
  onDraftChange?: (patch: ContentCampaignAccessPatch) => void
  onPersistedChange?: (access: ResolvedContentCampaignAccess) => void
}

/** Shared campaign availability slot for content identity rows and overlays. */
export function buildContentAvailabilitySlotItem(
  options: ContentAvailabilitySlotOptions,
): FormItem {
  return {
    kind: 'slot',
    name: CONTENT_IDENTITY_AVAILABILITY_SLOT_NAME,
    render: () => (
      <CampaignAvailabilityField
        campaignId={options.campaignId}
        targetType={options.targetType}
        classId={options.classId}
        entityId={options.entityId}
        density={options.density}
        presentation={options.presentation}
        initialAccess={options.initialAccess}
        onDraftChange={options.onDraftChange}
        onPersistedChange={options.onPersistedChange}
      />
    ),
  }
}

import { useRef } from 'react'
import { FormProvider } from 'react-hook-form'
import { Button } from '@rpg/ui'
import { FormItems } from '@rpg/ui/form'
import type { ContentCampaignAccessPatch, ResolvedSubclass } from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { openCampaignAvailabilityDialog } from '../../../lib/campaign-access/open-campaign-availability-dialog.lib'
import type { MasterDetailAvailabilityPresentation } from '../../../lib/master-detail/master-detail-availability.types'
import { useSubclassEditorPanel } from '../../hooks/use-subclass-editor-panel'
import {
  isDraftSubclassId,
  isSubclassDeletable,
  UNTITLED_SUBCLASS_LABEL,
} from '../../lib/subclasses/subclass-editor-constants'
import type { SubclassFormValues } from '../../lib/subclasses/subclass-form-fields'
import { SubclassEditorCampaignAccessField } from './subclass-editor-campaign-access-field'
import { SubclassEditorPanelHeader } from './subclass-editor-panel-header'
import { SubclassUsageReferencesSection } from './subclass-usage-references-section'

export interface SubclassEditorPanelProps {
  subclassId: string
  classId: string
  campaignId: string
  entity?: ResolvedSubclass
  availability: MasterDetailAvailabilityPresentation
  defaultValues: SubclassFormValues
  defaultFeatureLevel?: number
  formCtx: ContentFormCtx
  savePending?: boolean
  isBodyDirty?: boolean
  isAccessDirty?: boolean
  onValuesChange: (values: SubclassFormValues) => void
  onAvailabilityChange: (subclassId: string, isAvailable: boolean) => void
  onSave: (
    values: SubclassFormValues,
    options?: { campaignAccessDraft?: ContentCampaignAccessPatch | null; accessOnly?: boolean },
  ) => Promise<void>
  onDeleteRequest: () => void
}

export function SubclassEditorPanel(props: SubclassEditorPanelProps) {
  const {
    subclassId,
    classId,
    campaignId,
    entity,
    availability,
    savePending = false,
    onDeleteRequest,
  } = props
  const campaignAccessDialogRef = useRef<HTMLDivElement>(null)
  const source = entity?.source ?? (isDraftSubclassId(subclassId) ? 'homebrew' : 'system')
  const status = entity?.status ?? (isDraftSubclassId(subclassId) ? 'draft' : 'published')
  const deletable = isSubclassDeletable(source, subclassId)
  const panel = useSubclassEditorPanel(props)
  const displayName = panel.watchedName?.trim() || entity?.name || UNTITLED_SUBCLASS_LABEL

  return (
    <FormProvider {...panel.form}>
      <div className="space-y-6">
        <SubclassEditorPanelHeader
          displayName={displayName}
          subclassId={subclassId}
          source={source}
          status={status}
          availability={availability}
          savePending={savePending}
          onAvailabilityChange={() =>
            openCampaignAvailabilityDialog(campaignAccessDialogRef.current)
          }
        />

        <SubclassEditorCampaignAccessField
          dialogRef={campaignAccessDialogRef}
          campaignId={campaignId}
          classId={classId}
          subclassId={subclassId}
          isDraft={isDraftSubclassId(subclassId)}
          campaignAccess={panel.campaignAccess}
          onDraftChange={panel.handleCampaignAccessDraft}
          onPersistedChange={panel.handleCampaignAccessPersisted}
        />

        <FormItems
          items={[panel.nameFieldItem]}
          idPrefix={`subclass-editor-${subclassId}-identity`}
        />

        <FormItems items={panel.bodyFields} idPrefix={`subclass-editor-${subclassId}`} />

        <SubclassUsageReferencesSection
          campaignId={campaignId}
          classId={classId}
          subclassId={subclassId}
        />

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
          {deletable ? (
            <Button
              type="button"
              variant="outline"
              disabled={savePending}
              onClick={onDeleteRequest}
            >
              Delete subclass
            </Button>
          ) : null}
          <Button type="button" disabled={savePending} onClick={panel.handleSave}>
            Save subclass
          </Button>
        </div>
      </div>
    </FormProvider>
  )
}

import type { RefObject } from 'react'
import { FormProvider } from 'react-hook-form'
import { Button } from '@rpg/ui'
import { FormItems } from '@rpg/ui/form'
import type { ContentCampaignAccessPatch, ResolvedSubclass } from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { wrapMasterDetailDetailFields } from '../../../lib/master-detail/wrap-master-detail-detail-fields'
import { useSubclassDetailEditor } from '../../hooks/use-subclass-detail-editor'
import type { SubclassFormValues } from '../../lib/subclasses/subclass-form-fields'
import { isDraftSubclassId } from '../../lib/subclasses/subclass-editor-constants'
import { SubclassEditorCampaignAccessField } from './subclass-editor-campaign-access-field'
import { SubclassUsageReferencesSection } from './subclass-usage-references-section'

export interface SubclassDetailEditorProps {
  subclassId: string
  classId: string
  campaignId: string
  entity?: ResolvedSubclass
  defaultValues: SubclassFormValues
  defaultFeatureLevel?: number
  formCtx: ContentFormCtx
  savePending?: boolean
  isBodyDirty?: boolean
  isAccessDirty?: boolean
  campaignAccessDialogRef: RefObject<HTMLDivElement | null>
  onValuesChange: (values: SubclassFormValues) => void
  onAvailabilityChange: (subclassId: string, isAvailable: boolean) => void
  onSave: (
    values: SubclassFormValues,
    options?: { campaignAccessDraft?: ContentCampaignAccessPatch | null; accessOnly?: boolean },
  ) => Promise<void>
}

export function SubclassDetailEditor(props: SubclassDetailEditorProps) {
  const { subclassId, classId, campaignId, savePending = false, campaignAccessDialogRef } = props
  const panel = useSubclassDetailEditor(props)

  return (
    <FormProvider {...panel.form}>
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
        items={wrapMasterDetailDetailFields(panel.fields)}
        idPrefix={`subclass-editor-${subclassId}`}
      />

      <SubclassUsageReferencesSection
        campaignId={campaignId}
        classId={classId}
        subclassId={subclassId}
      />

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
        <Button type="button" disabled={savePending} onClick={panel.handleSave}>
          Save subclass
        </Button>
      </div>
    </FormProvider>
  )
}

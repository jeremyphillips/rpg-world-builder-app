'use client'

import { useEffect, useMemo, useRef } from 'react'
import { FormProvider, useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Badge, Button, InfoTooltip, Switch, Text } from '@rpg/ui'
import { FormItems } from '@rpg/ui/form'
import type { Subclass } from '@rpg/contracts'

import type { ContentFormCtx } from '../../lib/content-form-registry'
import {
  ACTIVE_IN_CAMPAIGN_LABEL,
  ACTIVE_IN_CAMPAIGN_TOOLTIP,
  isDraftSubclassId,
  isSubclassDeletable,
} from '../lib/subclasses/subclass-editor-constants'
import {
  buildSubclassFields,
  type SubclassFormValues,
} from '../lib/subclasses/subclass-form-fields'
import { subclassFormDef } from '../lib/subclasses/subclass-form-values'

export interface SubclassEditorPanelProps {
  subclassId: string
  classId: string
  entity?: Subclass
  defaultValues: SubclassFormValues
  activeInCampaign: boolean
  defaultFeatureLevel?: number
  formCtx: ContentFormCtx
  onActiveChange: (active: boolean) => void
  onValuesChange: (values: SubclassFormValues) => void
  onDeleteRequest: () => void
}

export function SubclassEditorPanel({
  subclassId,
  classId,
  entity,
  defaultValues,
  activeInCampaign,
  defaultFeatureLevel,
  formCtx,
  onActiveChange,
  onValuesChange,
  onDeleteRequest,
}: SubclassEditorPanelProps) {
  const source = entity?.source ?? (isDraftSubclassId(subclassId) ? 'homebrew' : 'system')
  const deletable = isSubclassDeletable(source, subclassId)
  const fields = useMemo(
    () => buildSubclassFields(formCtx, { defaultFeatureLevel }),
    [formCtx, defaultFeatureLevel],
  )
  const onValuesChangeRef = useRef(onValuesChange)

  useEffect(() => {
    onValuesChangeRef.current = onValuesChange
  }, [onValuesChange])

  const form = useForm<SubclassFormValues>({
    resolver: zodResolver(subclassFormDef.schema) as Resolver<SubclassFormValues>,
    defaultValues,
    mode: 'onSubmit',
  })

  const watchedValues = useWatch({ control: form.control }) as SubclassFormValues

  // Remount via `key={subclassId}` on the parent handles selection changes — do not
  // reset when parent re-renders from local edit state (that caused an update loop).
  useEffect(() => {
    onValuesChangeRef.current(watchedValues)
  }, [watchedValues])

  const handleSaveStub = () => {
    void form.handleSubmit((values: SubclassFormValues) => {
      subclassFormDef.toInput(values, classId, entity ? { entity } : undefined)
    })()
  }

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor={`subclass-active-${subclassId}`} className="text-sm font-medium">
              {ACTIVE_IN_CAMPAIGN_LABEL}
            </label>
            <InfoTooltip aria-label={`About: ${ACTIVE_IN_CAMPAIGN_LABEL}`}>
              {ACTIVE_IN_CAMPAIGN_TOOLTIP}
            </InfoTooltip>
            <Switch
              id={`subclass-active-${subclassId}`}
              checked={activeInCampaign}
              onCheckedChange={onActiveChange}
              aria-label={ACTIVE_IN_CAMPAIGN_LABEL}
            />
          </div>
          {entity?.source === 'system' ? <Badge variant="secondary">System</Badge> : null}
        </div>

        <FormItems items={fields} idPrefix={`subclass-editor-${subclassId}`} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <Text variant="muted" className="text-sm">
            Saving coming soon — changes are kept locally until persistence is wired.
          </Text>
          <div className="flex gap-2">
            {deletable ? (
              <Button type="button" variant="outline" onClick={onDeleteRequest}>
                Delete subclass
              </Button>
            ) : null}
            <Button type="button" disabled onClick={handleSaveStub}>
              Save subclass
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  )
}

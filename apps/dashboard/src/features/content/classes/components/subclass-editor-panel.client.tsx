'use client'

import { useEffect, useRef } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Badge, Button, InfoTooltip, Switch } from '@rpg/ui'
import { FormItems, makeResolver } from '@rpg/ui/form'
import type { Subclass } from '@rpg/contracts'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
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
import { isSubclassFormValuesLike } from '../lib/subclasses/subclass-form-value-snapshot'
import { subclassFormDef } from '../lib/subclasses/subclass-form-values'

export interface SubclassEditorPanelProps {
  subclassId: string
  classId: string
  entity?: Subclass
  defaultValues: SubclassFormValues
  activeInCampaign: boolean
  defaultFeatureLevel?: number
  formCtx: ContentFormCtx
  savePending?: boolean
  onActiveChange: (active: boolean) => void
  onValuesChange: (values: SubclassFormValues) => void
  onSave: (values: SubclassFormValues) => Promise<void>
  onDeleteRequest: () => void
}

export function SubclassEditorPanel({
  subclassId,
  entity,
  defaultValues,
  activeInCampaign,
  defaultFeatureLevel,
  formCtx,
  savePending = false,
  onActiveChange,
  onValuesChange,
  onSave,
  onDeleteRequest,
}: SubclassEditorPanelProps) {
  const source = entity?.source ?? (isDraftSubclassId(subclassId) ? 'homebrew' : 'system')
  const deletable = isSubclassDeletable(source, subclassId)
  const fields = buildSubclassFields(formCtx, { defaultFeatureLevel })
  const onSaveRef = useRef(onSave)
  const onValuesChangeRef = useRef(onValuesChange)

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  useEffect(() => {
    onValuesChangeRef.current = onValuesChange
  }, [onValuesChange])

  const resolver = makeResolver<SubclassFormValues>(subclassFormDef.schema, fields)

  const form = useForm<SubclassFormValues>({
    resolver,
    defaultValues,
    mode: 'onSubmit',
  })

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!isSubclassFormValuesLike(values)) return
      onValuesChangeRef.current(values)
    })
    return () => subscription.unsubscribe()
  }, [form])

  const handleSave = () => {
    void form.handleSubmit((values: SubclassFormValues) => onSaveRef.current(values))()
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
              disabled={savePending}
              onCheckedChange={onActiveChange}
              aria-label={ACTIVE_IN_CAMPAIGN_LABEL}
            />
          </div>
          {entity?.source === 'system' ? (
            <Badge appearance="neutral" tone="neutral">
              System
            </Badge>
          ) : null}
        </div>

        <FormItems items={fields} idPrefix={`subclass-editor-${subclassId}`} />

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
          <Button type="button" disabled={savePending} onClick={handleSave}>
            Save subclass
          </Button>
        </div>
      </div>
    </FormProvider>
  )
}

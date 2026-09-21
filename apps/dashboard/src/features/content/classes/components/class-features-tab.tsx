import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { ConfirmDialog } from '@rpg/ui'
import { buildItemDefaultValues } from '@rpg/ui/form'

import { FormEmbeddedMasterDetailEditor } from '../../components/master-detail/form-embedded-master-detail-editor'
import { campaignRulesFromCtx } from '../../lib/form-options/content-campaign-rules'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { useMasterDetailArray } from '../../lib/master-detail/use-master-detail-array'
import { CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN } from '../lib/class-feature-form-labels'
import {
  classFeatureItemFields,
  featureItemEyebrow,
  featureItemTitle,
  type FeatureRowForm,
} from '../lib/class-feature-form-fields'
import { isSubclassChoiceFeatureRow } from '../lib/class-subclass-choice-features'
import type { ClassFormValues } from '../lib/class-form-fields'
import {
  isSpellcastingGrantingFeatureRow,
  removeSpellcastingFromFormValues,
} from '../lib/class-spellcasting-lifecycle'
import { buildSpellcastingFeatureAvailabilityFormFields } from '../lib/class-spellcasting-feature-availability-form-fields'

const FEATURES_FIELD_NAME = 'features'

function compareFeaturesByLevel(left: unknown, right: unknown): number {
  const readLevel = (row: unknown) => {
    const level = (row as FeatureRowForm | undefined)?.level
    return typeof level === 'number' && Number.isFinite(level) ? level : Number.POSITIVE_INFINITY
  }

  return readLevel(left) - readLevel(right)
}

export interface ClassFeaturesTabProps {
  formCtx: ContentFormCtx
}

/** Master-detail editor for the class `features` field array. */
export function ClassFeaturesTab({ formCtx }: ClassFeaturesTabProps) {
  const { getValues, setValue } = useFormContext<ClassFormValues>()
  const fields = useMemo(() => classFeatureItemFields(formCtx), [formCtx])
  const campaignRules = campaignRulesFromCtx(formCtx)
  const makeItemDefaults = useCallback(
    () => ({ ...buildItemDefaultValues(fields), available: true }),
    [fields],
  )
  const baseEditor = useMasterDetailArray(FEATURES_FIELD_NAME, makeItemDefaults)
  const [spellcastingRemoveOpen, setSpellcastingRemoveOpen] = useState(false)

  const features = useWatch({ name: FEATURES_FIELD_NAME }) as FeatureRowForm[] | undefined

  const handleRequestRemove = useCallback(
    (index: number) => {
      const row = (features ?? getValues(FEATURES_FIELD_NAME))?.[index]
      if (isSpellcastingGrantingFeatureRow(row)) {
        setSpellcastingRemoveOpen(true)
        return
      }
      baseEditor.requestRemove(index)
    },
    [baseEditor, features, getValues],
  )

  const editor = useMemo(
    () => ({
      ...baseEditor,
      requestRemove: handleRequestRemove,
    }),
    [baseEditor, handleRequestRemove],
  )

  const previousFieldsLengthRef = useRef(editor.fields.length)
  const levelByFieldIdRef = useRef<Map<string, number | string>>(new Map())

  const selectedIndex = editor.selectedIndex
  const selectedFieldId = editor.selectedFieldId
  const selectedLevel = useWatch({
    name: `${FEATURES_FIELD_NAME}.${selectedIndex ?? 0}.level`,
  }) as number | string | undefined

  useEffect(() => {
    if (editor.fields.length <= previousFieldsLengthRef.current) {
      previousFieldsLengthRef.current = editor.fields.length
      return
    }

    const addedField = editor.fields[editor.fields.length - 1]
    if (addedField) {
      editor.normalizeOrder(compareFeaturesByLevel, { appendFieldId: addedField.id })
    }
    previousFieldsLengthRef.current = editor.fields.length
  }, [editor, editor.fields])

  useEffect(() => {
    if (selectedIndex === null || !selectedFieldId || selectedLevel === undefined) return

    const previousLevel = levelByFieldIdRef.current.get(selectedFieldId)
    if (previousLevel !== undefined && selectedLevel !== previousLevel) {
      editor.normalizeOrder(compareFeaturesByLevel, { appendFieldId: selectedFieldId })
    }

    levelByFieldIdRef.current.set(selectedFieldId, selectedLevel)
  }, [editor, selectedFieldId, selectedIndex, selectedLevel])

  const resolveRowReasons = useCallback(
    ({ row }: { row: unknown }) => {
      if (
        isSubclassChoiceFeatureRow(row as FeatureRowForm | undefined) &&
        !campaignRules.subclassing.enabled
      ) {
        return [
          {
            code: 'subclasses-disabled' as const,
            settingId: 'characterCreation.subclasses.enabled' as const,
          },
        ]
      }
      return []
    },
    [campaignRules.subclassing.enabled],
  )

  const resolveAvailabilityFormItems = useCallback(
    ({ row, fieldId, namePrefix }: { row: unknown; fieldId: string; namePrefix: string }) => {
      if (!isSpellcastingGrantingFeatureRow(row as FeatureRowForm | undefined)) return undefined
      return buildSpellcastingFeatureAvailabilityFormFields(fieldId, namePrefix)
    },
    [],
  )

  const handleConfirmSpellcastingRemove = useCallback(() => {
    const patch = removeSpellcastingFromFormValues(getValues())
    for (const [key, value] of Object.entries(patch)) {
      setValue(key as keyof ClassFormValues, value as ClassFormValues[keyof ClassFormValues], {
        shouldDirty: true,
      })
    }
    baseEditor.cancelRemove()
    setSpellcastingRemoveOpen(false)
  }, [baseEditor, getValues, setValue])

  return (
    <>
      <FormEmbeddedMasterDetailEditor
        formCtx={formCtx}
        fieldName={FEATURES_FIELD_NAME}
        itemFields={fields}
        itemNoun={CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN}
        listTitle="Features"
        ariaLabel="Features"
        addLabel="Add feature"
        idPrefix="class-feature"
        editor={editor}
        mapListItem={({ row }) => ({
          title: featureItemTitle(row as FeatureRowForm | undefined),
          eyebrow: featureItemEyebrow(row as FeatureRowForm | undefined),
        })}
        resolveRowReasons={resolveRowReasons}
        resolveAvailabilityFormItems={resolveAvailabilityFormItems}
        access={{ kind: 'availability', fieldName: 'available' }}
      />
      <ConfirmDialog
        open={spellcastingRemoveOpen}
        onOpenChange={setSpellcastingRemoveOpen}
        headline="Remove spellcasting?"
        description="This will remove the Spellcasting feature and this class's spellcasting configuration, including spell progression, spell selection rules, recommendations, and related settings. This action will take effect when you save the class."
        confirmLabel="Remove spellcasting"
        confirmVariant="destructive"
        onConfirm={handleConfirmSpellcastingRemove}
      />
    </>
  )
}

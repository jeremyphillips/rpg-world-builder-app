import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useWatch } from 'react-hook-form'
import { buildItemDefaultValues } from '@rpg/ui/form'

import { FormEmbeddedMasterDetailEditor } from '../../components/master-detail/form-embedded-master-detail-editor'
import { campaignRulesFromCtx } from '../../lib/form-options/content-campaign-rules'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { masterDetailEmptyListLabel } from '../../lib/master-detail/master-detail-constants'
import { useMasterDetailArray } from '../../lib/master-detail/use-master-detail-array'
import {
  classFeatureItemFields,
  featureItemEyebrow,
  featureItemTitle,
  type FeatureRowForm,
} from '../lib/class-feature-form-fields'
import { isSubclassChoiceFeatureRow } from '../lib/class-subclass-choice-features'

const FEATURES_FIELD_NAME = 'features'
const FEATURE_NOUN = 'feature'

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
  const fields = useMemo(() => classFeatureItemFields(formCtx), [formCtx])
  const campaignRules = campaignRulesFromCtx(formCtx)
  const makeItemDefaults = useCallback(() => buildItemDefaultValues(fields), [fields])
  const editor = useMasterDetailArray(FEATURES_FIELD_NAME, makeItemDefaults)

  const previousFieldsLengthRef = useRef(editor.fields.length)
  const previousSelectedLevelRef = useRef<number | string | undefined>(undefined)

  const selectedIndex = editor.selectedIndex
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
    if (selectedIndex === null) {
      previousSelectedLevelRef.current = undefined
      return
    }

    const selectedFieldId = editor.selectedFieldId
    if (
      previousSelectedLevelRef.current !== undefined &&
      selectedLevel !== previousSelectedLevelRef.current &&
      selectedFieldId
    ) {
      editor.normalizeOrder(compareFeaturesByLevel, { appendFieldId: selectedFieldId })
    }

    previousSelectedLevelRef.current = selectedLevel
  }, [editor, selectedIndex, selectedLevel])

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

  return (
    <FormEmbeddedMasterDetailEditor
      formCtx={formCtx}
      fieldName={FEATURES_FIELD_NAME}
      itemFields={fields}
      itemNoun={FEATURE_NOUN}
      listTitle="Features"
      ariaLabel="Features"
      addLabel="Add feature"
      emptyListLabel={masterDetailEmptyListLabel(
        'features',
        'Add a feature to configure its level, grants, and description.',
      )}
      idPrefix="class-feature"
      editor={editor}
      mapListItem={({ row, index }) => ({
        title: featureItemTitle(row as FeatureRowForm | undefined, index),
        eyebrow: featureItemEyebrow(row as FeatureRowForm | undefined),
      })}
      resolveRowReasons={resolveRowReasons}
    />
  )
}

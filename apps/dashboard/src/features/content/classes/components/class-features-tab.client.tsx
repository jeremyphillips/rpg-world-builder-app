'use client'

import { useCallback, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { Text } from '@rpg/ui'
import { buildItemDefaultValues, FormItems } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/content-form-registry'
import { classFeatureItemFields } from '../lib/class-feature-form-fields'
import { useMasterDetailArray } from '../lib/use-master-detail-array'
import { MasterDetailListPanel } from './master-detail-list-panel.client'

const FEATURES_FIELD_NAME = 'features'

function featureTitle(values: Record<string, unknown> | undefined, index: number): string {
  const name = values?.['name']
  return (typeof name === 'string' && name.trim()) || `Feature ${index + 1}`
}

export interface ClassFeaturesTabProps {
  formCtx: ContentFormCtx
}

/**
 * Master-detail editor for the class `features` field array: a selectable list
 * on the left, the selected feature's form on the right. Renders directly into
 * the parent form via `useFieldArray`, so global save and validation are
 * unchanged from the previous inline array.
 */
export function ClassFeaturesTab({ formCtx }: ClassFeaturesTabProps) {
  const fields = useMemo(() => classFeatureItemFields(formCtx), [formCtx])
  const makeItemDefaults = useCallback(() => buildItemDefaultValues(fields), [fields])
  const editor = useMasterDetailArray(FEATURES_FIELD_NAME, makeItemDefaults)

  const watched = useWatch({ name: FEATURES_FIELD_NAME }) as
    | Array<Record<string, unknown>>
    | undefined

  const items = editor.fields.map((field, index) => ({
    id: field.id,
    title: featureTitle(watched?.[index], index),
  }))

  const selectedFieldId =
    editor.selectedIndex !== null ? editor.fields[editor.selectedIndex]?.id : undefined

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <MasterDetailListPanel
        items={items}
        selectedIndex={editor.selectedIndex}
        ariaLabel="Features"
        addLabel="Add feature"
        emptyLabel="No features yet. Add one to get started."
        onAdd={editor.handleAdd}
        onSelect={editor.select}
        onRemove={editor.handleRemove}
      />

      <div className="md:col-span-2">
        {editor.selectedIndex !== null && selectedFieldId ? (
          <FormItems
            key={selectedFieldId}
            items={fields}
            idPrefix={`class-feature-${selectedFieldId}`}
            namePrefix={`${FEATURES_FIELD_NAME}.${editor.selectedIndex}`}
          />
        ) : (
          <Text variant="muted" className="text-sm">
            Select a feature to edit, or add one to get started.
          </Text>
        )}
      </div>
    </div>
  )
}

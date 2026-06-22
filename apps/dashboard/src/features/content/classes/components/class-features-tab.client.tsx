'use client'

import { useCallback, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Text } from '@rpg/ui'
import { buildItemDefaultValues, FormItems } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/content-form-registry'
import { showMasterDetailUnselectedRowErrors } from '../../lib/master-detail-validation'
import { useMasterDetailArray } from '../../lib/use-master-detail-array'
import {
  MasterDetailListPanel,
  type MasterDetailListItem,
} from '../../components/master-detail-list-panel.client'
import { MasterDetailDeleteDialog } from '../../components/master-detail-delete-dialog.client'
import { MasterDetailValidationBanner } from '../../components/master-detail-validation-banner.client'
import { isEmbeddedRowSystemLocked } from '../../lib/is-embedded-row-system-locked'
import { classFeatureItemFields } from '../lib/class-feature-form-fields'

const FEATURES_FIELD_NAME = 'features'
const FEATURE_NOUN = 'feature'

type FeatureRow = { id?: string; name?: string; level?: number | string }

function featureTitle(row: FeatureRow | undefined, index: number): string {
  return (typeof row?.name === 'string' && row.name.trim()) || `Feature ${index + 1}`
}

function featureEyebrow(row: FeatureRow | undefined): string | undefined {
  const level = row?.level
  if (level === undefined || level === null || level === '') return undefined
  return `Level ${level}`
}

export interface ClassFeaturesTabProps {
  formCtx: ContentFormCtx
}

/**
 * Master-detail editor for the class `features` field array: a selectable list
 * on the left, the selected feature's form on the right. Renders directly into
 * the parent form via `useFieldArray`, so global save and validation are
 * unchanged from the previous inline array.
 *
 * Deferred: an "Active in campaign" toggle (like subclasses) is intentionally
 * not shown here — class features have no per-feature availability contract or
 * persistence target yet. When that lands, the toggle attaches to the detail
 * panel below and an "Inactive" badge surfaces via the list item's `badge`.
 */
export function ClassFeaturesTab({ formCtx }: ClassFeaturesTabProps) {
  const {
    formState: { submitCount },
  } = useFormContext()
  const fields = useMemo(() => classFeatureItemFields(formCtx), [formCtx])
  const makeItemDefaults = useCallback(() => buildItemDefaultValues(fields), [fields])
  const editor = useMasterDetailArray(FEATURES_FIELD_NAME, makeItemDefaults)

  const watched = useWatch({ name: FEATURES_FIELD_NAME }) as Array<FeatureRow> | undefined

  const items: MasterDetailListItem[] = editor.fields.map((field, index) => {
    const row = watched?.[index]
    const locked = isEmbeddedRowSystemLocked(row, formCtx.entitySource)
    return {
      id: field.id,
      title: featureTitle(row, index),
      eyebrow: featureEyebrow(row),
      deletable: !locked,
      hasError: editor.hasRowError(index),
      ...(locked ? { badge: { label: 'System', variant: 'secondary' as const } } : {}),
    }
  })

  const showValidationBanner = showMasterDetailUnselectedRowErrors(editor, submitCount)

  const selectedFieldId =
    editor.selectedIndex !== null ? editor.fields[editor.selectedIndex]?.id : undefined

  const deleteName =
    editor.deleteIndex !== null
      ? featureTitle(watched?.[editor.deleteIndex], editor.deleteIndex)
      : ''

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MasterDetailListPanel
          items={items}
          selectedIndex={editor.selectedIndex}
          ariaLabel="Features"
          addLabel="Add feature"
          emptyLabel="No features yet. Add one to get started."
          onAdd={editor.handleAdd}
          onSelect={editor.select}
          onRemove={editor.requestRemove}
          onMoveUp={editor.moveUp}
          onMoveDown={editor.moveDown}
        />

        <div className="space-y-3 md:col-span-2">
          <MasterDetailValidationBanner visible={showValidationBanner} />
          {editor.selectedIndex !== null && selectedFieldId ? (
            <FormItems
              key={selectedFieldId}
              items={fields}
              idPrefix={`class-feature-${selectedFieldId}`}
              namePrefix={`${FEATURES_FIELD_NAME}.${editor.selectedIndex}`}
            />
          ) : !showValidationBanner ? (
            <Text variant="muted" className="text-sm">
              Select a feature to edit, or add one to get started.
            </Text>
          ) : null}
        </div>
      </div>

      <MasterDetailDeleteDialog
        open={editor.deleteIndex !== null}
        itemNoun={FEATURE_NOUN}
        itemName={deleteName}
        onOpenChange={(open) => {
          if (!open) editor.cancelRemove()
        }}
        onConfirm={editor.confirmRemove}
      />
    </>
  )
}

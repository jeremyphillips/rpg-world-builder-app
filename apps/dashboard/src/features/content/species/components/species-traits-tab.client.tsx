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
import {
  traitItemFields,
  traitItemTitle,
  type TraitRowForm,
} from '../lib/species-trait-form-fields'

const TRAITS_FIELD_NAME = 'traits'
const TRAIT_NOUN = 'trait'

function traitEyebrow(row: TraitRowForm | undefined): string | undefined {
  if (!row?.kind) return undefined
  return row.kind === 'grant' ? 'Grant' : 'Custom'
}

export interface SpeciesTraitsTabProps {
  formCtx: ContentFormCtx
}

/**
 * Master-detail editor for the species `traits` field array: a selectable list
 * on the left, the selected trait's form on the right. Renders directly into
 * the parent form via `useFieldArray`, so global save and validation are
 * unchanged from the previous inline array.
 */
export function SpeciesTraitsTab({ formCtx }: SpeciesTraitsTabProps) {
  const {
    formState: { submitCount },
  } = useFormContext()
  const fields = useMemo(() => traitItemFields(formCtx), [formCtx])
  const makeItemDefaults = useCallback(() => buildItemDefaultValues(fields), [fields])
  const editor = useMasterDetailArray(TRAITS_FIELD_NAME, makeItemDefaults)

  const watched = useWatch({ name: TRAITS_FIELD_NAME }) as Array<TraitRowForm> | undefined

  const items: MasterDetailListItem[] = editor.fields.map((field, index) => {
    const row = watched?.[index]
    const locked = isEmbeddedRowSystemLocked(row, formCtx.entitySource)
    return {
      id: field.id,
      title: traitItemTitle(row ?? {}, index),
      eyebrow: traitEyebrow(row),
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
      ? traitItemTitle(watched?.[editor.deleteIndex] ?? {}, editor.deleteIndex)
      : ''

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MasterDetailListPanel
          items={items}
          selectedIndex={editor.selectedIndex}
          ariaLabel="Traits"
          addLabel="Add trait"
          emptyLabel="No traits yet. Add one to get started."
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
              idPrefix={`species-trait-${selectedFieldId}`}
              namePrefix={`${TRAITS_FIELD_NAME}.${editor.selectedIndex}`}
            />
          ) : !showValidationBanner ? (
            <Text variant="muted" className="text-sm">
              Select a trait to edit, or add one to get started.
            </Text>
          ) : null}
        </div>
      </div>

      <MasterDetailDeleteDialog
        open={editor.deleteIndex !== null}
        itemNoun={TRAIT_NOUN}
        itemName={deleteName}
        onOpenChange={(open) => {
          if (!open) editor.cancelRemove()
        }}
        onConfirm={editor.confirmRemove}
      />
    </>
  )
}

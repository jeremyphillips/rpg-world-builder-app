'use client'

import { useCallback, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { Text } from '@rpg/ui'
import { buildItemDefaultValues, FormItems } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/content-form-registry'
import { useMasterDetailArray } from '../../lib/use-master-detail-array'
import {
  MasterDetailListPanel,
  type MasterDetailListItem,
} from '../../components/master-detail-list-panel.client'
import { MasterDetailDeleteDialog } from '../../components/master-detail-delete-dialog.client'
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

/**
 * A trait is delete-locked only when it is system content: an existing row
 * (already has an `id`) on a species whose `source` is `'system'`. Newly added
 * rows (no id yet) and homebrew species are always removable. Species traits
 * have no per-trait `source` in the contract, so it is derived here.
 */
function isSystemLocked(
  row: TraitRowForm | undefined,
  entitySource: ContentFormCtx['entitySource'],
) {
  return entitySource === 'system' && typeof row?.id === 'string' && row.id.length > 0
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
  const fields = useMemo(() => traitItemFields(formCtx), [formCtx])
  const makeItemDefaults = useCallback(() => buildItemDefaultValues(fields), [fields])
  const editor = useMasterDetailArray(TRAITS_FIELD_NAME, makeItemDefaults)

  const watched = useWatch({ name: TRAITS_FIELD_NAME }) as Array<TraitRowForm> | undefined

  const items: MasterDetailListItem[] = editor.fields.map((field, index) => {
    const row = watched?.[index]
    const locked = isSystemLocked(row, formCtx.entitySource)
    return {
      id: field.id,
      title: traitItemTitle(row ?? {}, index),
      eyebrow: traitEyebrow(row),
      deletable: !locked,
      ...(locked ? { badge: { label: 'System', variant: 'secondary' as const } } : {}),
    }
  })

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
        />

        <div className="md:col-span-2">
          {editor.selectedIndex !== null && selectedFieldId ? (
            <FormItems
              key={selectedFieldId}
              items={fields}
              idPrefix={`species-trait-${selectedFieldId}`}
              namePrefix={`${TRAITS_FIELD_NAME}.${editor.selectedIndex}`}
            />
          ) : (
            <Text variant="muted" className="text-sm">
              Select a trait to edit, or add one to get started.
            </Text>
          )}
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

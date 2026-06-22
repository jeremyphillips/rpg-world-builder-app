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
import { isSpeciesRowSystemLocked } from '../lib/species-master-detail-helpers'
import {
  traitItemFields,
  traitItemTitle,
  type TraitRowForm,
} from '../lib/species-trait-form-fields'

const OPTION_NOUN = 'option'

function traitEyebrow(row: TraitRowForm | undefined): string | undefined {
  if (!row?.kind) return undefined
  return row.kind === 'grant' ? 'Grant' : 'Custom'
}

export interface SpeciesHeritageOptionsEditorProps {
  formCtx: ContentFormCtx
  /** RHF field-array path, e.g. `heritageChoices.0.options`. */
  optionsFieldName: string
}

/**
 * Nested master-detail editor for trait options within a heritage choice row.
 * Binds to a dot-path field array on the parent species form.
 */
export function SpeciesHeritageOptionsEditor({
  formCtx,
  optionsFieldName,
}: SpeciesHeritageOptionsEditorProps) {
  const {
    formState: { submitCount },
  } = useFormContext()
  const fields = useMemo(() => traitItemFields(formCtx), [formCtx])
  const makeItemDefaults = useCallback(() => buildItemDefaultValues(fields), [fields])
  const editor = useMasterDetailArray(optionsFieldName, makeItemDefaults)

  const watched = useWatch({ name: optionsFieldName }) as Array<TraitRowForm> | undefined

  const items: MasterDetailListItem[] = editor.fields.map((field, index) => {
    const row = watched?.[index]
    const locked = isSpeciesRowSystemLocked(row, formCtx.entitySource)
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

  const idPrefixBase = optionsFieldName.replace(/\./g, '-')

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MasterDetailListPanel
          items={items}
          selectedIndex={editor.selectedIndex}
          ariaLabel="Options"
          addLabel="Add option"
          emptyLabel="No options yet. Add one to get started."
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
              idPrefix={`species-heritage-option-${idPrefixBase}-${selectedFieldId}`}
              namePrefix={`${optionsFieldName}.${editor.selectedIndex}`}
            />
          ) : !showValidationBanner ? (
            <Text variant="muted" className="text-sm">
              Select an option to edit, or add one to get started.
            </Text>
          ) : null}
        </div>
      </div>

      <MasterDetailDeleteDialog
        open={editor.deleteIndex !== null}
        itemNoun={OPTION_NOUN}
        itemName={deleteName}
        onOpenChange={(open) => {
          if (!open) editor.cancelRemove()
        }}
        onConfirm={editor.confirmRemove}
      />
    </>
  )
}

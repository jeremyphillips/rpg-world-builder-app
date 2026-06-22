'use client'

import { useCallback, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Button, Text } from '@rpg/ui'
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
import {
  addHeritageLabel,
  heritageDefaultValues,
  heritageScalarFields,
  type HeritageForm,
} from '../lib/species-heritage-form-fields'
import { isSpeciesRowSystemLocked } from '../lib/species-master-detail-helpers'
import {
  traitItemFields,
  traitItemTitle,
  type TraitRowForm,
} from '../lib/species-trait-form-fields'

const HERITAGE_FIELD_NAME = 'heritage'
const OPTIONS_FIELD_NAME = 'heritage.options'
const OPTION_NOUN = 'option'

export interface SpeciesHeritageTabProps {
  formCtx: ContentFormCtx
}

function HeritageEmptyState({ formCtx }: { formCtx: ContentFormCtx }) {
  const { setValue } = useFormContext()

  return (
    <div className="space-y-3">
      <Text variant="muted" className="text-sm">
        No lineage or ancestry yet. Add one to define player choices at character creation.
      </Text>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setValue(HERITAGE_FIELD_NAME, heritageDefaultValues(formCtx), { shouldDirty: true })
        }}
      >
        {addHeritageLabel()}
      </Button>
    </div>
  )
}

function HeritageEditor({ formCtx }: { formCtx: ContentFormCtx }) {
  const {
    setValue,
    formState: { submitCount },
  } = useFormContext()

  const scalarFields = useMemo(() => heritageScalarFields(formCtx), [formCtx])
  const traitFields = useMemo(() => traitItemFields(formCtx), [formCtx])
  const makeOptionDefaults = useCallback(() => buildItemDefaultValues(traitFields), [traitFields])
  const editor = useMasterDetailArray(OPTIONS_FIELD_NAME, makeOptionDefaults)

  const heritage = useWatch({ name: HERITAGE_FIELD_NAME }) as HeritageForm | undefined
  const watchedOptions = useWatch({ name: OPTIONS_FIELD_NAME }) as Array<TraitRowForm> | undefined

  const heritageLocked = isSpeciesRowSystemLocked(heritage, formCtx.entitySource)

  const handleRemoveHeritage = () => {
    setValue(HERITAGE_FIELD_NAME, undefined, { shouldDirty: true })
    editor.cancelRemove()
  }

  const items: MasterDetailListItem[] = editor.fields.map((field, index) => {
    const row = watchedOptions?.[index]
    const locked = isSpeciesRowSystemLocked(row, formCtx.entitySource)
    return {
      id: field.id,
      title: traitItemTitle(row ?? {}, index),
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
      ? traitItemTitle(watchedOptions?.[editor.deleteIndex] ?? {}, editor.deleteIndex)
      : ''

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <FormItems
            items={scalarFields}
            idPrefix="species-heritage"
            namePrefix={HERITAGE_FIELD_NAME}
          />
          {!heritageLocked ? (
            <Button type="button" variant="ghost" size="sm" onClick={handleRemoveHeritage}>
              Remove heritage
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <MasterDetailListPanel
            items={items}
            selectedIndex={editor.selectedIndex}
            ariaLabel="Heritage options"
            addLabel={`Add ${heritage?.kind ?? 'option'}`}
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
                items={traitFields}
                idPrefix={`species-heritage-option-${selectedFieldId}`}
                namePrefix={`${OPTIONS_FIELD_NAME}.${editor.selectedIndex}`}
              />
            ) : !showValidationBanner ? (
              <Text variant="muted" className="text-sm">
                Select an option to edit, or add one to get started.
              </Text>
            ) : null}
          </div>
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

/**
 * Heritage tab: scalar name/kind/description at the top, master-detail over
 * `heritage.options` below. Empty state offers a single "Add lineage/ancestry"
 * control; once present, options use the same trait editor as the Traits tab.
 */
export function SpeciesHeritageTab({ formCtx }: SpeciesHeritageTabProps) {
  const heritage = useWatch({ name: HERITAGE_FIELD_NAME }) as HeritageForm | undefined
  const hasHeritage = heritage != null && typeof heritage === 'object'

  if (!hasHeritage) {
    return <HeritageEmptyState formCtx={formCtx} />
  }

  return <HeritageEditor formCtx={formCtx} />
}

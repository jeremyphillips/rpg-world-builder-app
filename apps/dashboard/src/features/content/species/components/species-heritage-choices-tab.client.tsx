'use client'

import { useCallback } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Text } from '@rpg/ui'
import { FormItems } from '@rpg/ui/form'

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
  heritageChoiceDefaultValues,
  heritageChoiceEyebrow,
  heritageChoiceItemTitle,
  heritageChoiceScalarFields,
  type HeritageChoiceRowForm,
} from '../lib/species-heritage-choice-form-fields'
import { isSpeciesRowSystemLocked } from '../lib/species-master-detail-helpers'
import { SpeciesHeritageOptionsEditor } from './species-heritage-options-editor.client'

const HERITAGE_CHOICES_FIELD_NAME = 'heritageChoices'
const HERITAGE_CHOICE_NOUN = 'heritage choice'

export interface SpeciesHeritageChoicesTabProps {
  formCtx: ContentFormCtx
}

/**
 * Master-detail editor for the species `heritageChoices` field array. Each
 * choice's detail panel stacks scalar fields and a nested options editor.
 */
export function SpeciesHeritageChoicesTab({ formCtx }: SpeciesHeritageChoicesTabProps) {
  const {
    formState: { submitCount },
  } = useFormContext()
  const scalarFields = heritageChoiceScalarFields(formCtx)
  const makeItemDefaults = useCallback(() => heritageChoiceDefaultValues(formCtx), [formCtx])
  const editor = useMasterDetailArray(HERITAGE_CHOICES_FIELD_NAME, makeItemDefaults)

  const watched = useWatch({ name: HERITAGE_CHOICES_FIELD_NAME }) as
    | Array<HeritageChoiceRowForm>
    | undefined

  const items: MasterDetailListItem[] = editor.fields.map((field, index) => {
    const row = watched?.[index]
    const locked = isSpeciesRowSystemLocked(row, formCtx.entitySource)
    return {
      id: field.id,
      title: heritageChoiceItemTitle(row ?? {}, index),
      eyebrow: heritageChoiceEyebrow(row?.kind),
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
      ? heritageChoiceItemTitle(watched?.[editor.deleteIndex] ?? {}, editor.deleteIndex)
      : ''

  const outerIndex = editor.selectedIndex

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MasterDetailListPanel
          items={items}
          selectedIndex={editor.selectedIndex}
          ariaLabel="Heritage choices"
          addLabel="Add heritage choice"
          emptyLabel="No heritage choices yet. Add one to get started."
          onAdd={editor.handleAdd}
          onSelect={editor.select}
          onRemove={editor.requestRemove}
          onMoveUp={editor.moveUp}
          onMoveDown={editor.moveDown}
        />

        <div className="space-y-6 md:col-span-2">
          <MasterDetailValidationBanner visible={showValidationBanner} />
          {outerIndex !== null && selectedFieldId ? (
            <>
              <FormItems
                key={selectedFieldId}
                items={scalarFields}
                idPrefix={`species-heritage-choice-${selectedFieldId}`}
                namePrefix={`${HERITAGE_CHOICES_FIELD_NAME}.${outerIndex}`}
              />
              <div className="space-y-3">
                <Text as="h3" className="text-sm font-medium">
                  Options
                </Text>
                <SpeciesHeritageOptionsEditor
                  key={selectedFieldId}
                  formCtx={formCtx}
                  optionsFieldName={`${HERITAGE_CHOICES_FIELD_NAME}.${outerIndex}.options`}
                />
              </div>
            </>
          ) : !showValidationBanner ? (
            <Text variant="muted" className="text-sm">
              Select a heritage choice to edit, or add one to get started.
            </Text>
          ) : null}
        </div>
      </div>

      <MasterDetailDeleteDialog
        open={editor.deleteIndex !== null}
        itemNoun={HERITAGE_CHOICE_NOUN}
        itemName={deleteName}
        onOpenChange={(open) => {
          if (!open) editor.cancelRemove()
        }}
        onConfirm={editor.confirmRemove}
      />
    </>
  )
}

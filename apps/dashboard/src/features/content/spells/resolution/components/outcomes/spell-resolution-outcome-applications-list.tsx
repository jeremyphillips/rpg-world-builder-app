import * as React from 'react'
import { useController, useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import { Textarea } from '@rpg/ui'
import {
  ArrayItemActionsRail,
  ArrayItemInlineRow,
  ArrayItemLeadingChromeColumn,
  buildFormSectionChildContext,
  fieldArrayItemListClasses,
  FormSectionContext,
  registerArrayFieldMutators,
  resolveFormDensity,
  useFormSectionContext,
} from '@rpg/ui/form'

import { outcomeApplicationsFieldPath } from '../../lib/form/resolution-outcome-applications-form-fields'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'
import { resolutionFormToSelectionContext } from '../../lib/selection/resolution-selection-context.lib'
import { outcomeApplicationsIdPrefix } from './outcome-applications-id-prefix'
import { SpellResolutionOutcomeApplicationRow } from './spell-resolution-outcome-application-row'

function OutcomeNoteEffectRow({
  fullName,
  index,
  onRemove,
}: {
  fullName: string
  index: number
  onRemove: () => void
}) {
  const { control } = useFormContext()
  const descriptionName = `${fullName}.${index}.description`
  const { field } = useController({ control, name: descriptionName })
  const titleId = `${fullName}-${index}-note-title`

  return (
    <ArrayItemInlineRow
      showLeading
      leading={
        <ArrayItemLeadingChromeColumn>
          <span id={titleId} className="text-style-supporting">
            Note
          </span>
        </ArrayItemLeadingChromeColumn>
      }
      content={<Textarea {...field} value={field.value ?? ''} rows={2} aria-labelledby={titleId} />}
      actions={
        <ArrayItemActionsRail
          removeAriaLabel="Remove note"
          canRemove
          onRemove={onRemove}
          compact
          embedded
        />
      }
    />
  )
}

export type SpellResolutionOutcomeApplicationsListProps = {
  outcomeIndex: number
}

/** Custom field-array list for outcome effect applications with navigation parity. */
export function SpellResolutionOutcomeApplicationsList({
  outcomeIndex,
}: SpellResolutionOutcomeApplicationsListProps) {
  const parentContext = useFormSectionContext()
  const form = useFormContext()
  const fullName = outcomeApplicationsFieldPath(outcomeIndex)
  const idPrefix = outcomeApplicationsIdPrefix(outcomeIndex)
  const { fields, remove } = useFieldArray({ name: fullName })
  const rows = (useWatch({ name: fullName }) ?? []) as Array<{ kind?: string }>
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const effects = resolution?.effects ?? []
  const selectionContext = resolutionFormToSelectionContext(resolution)

  const listContext = React.useMemo(
    () =>
      buildFormSectionChildContext(parentContext, parentContext.depth, {
        density: 'compact',
      }),
    [parentContext],
  )

  React.useEffect(() => {
    return registerArrayFieldMutators(form.control, fullName, {
      getValues: () => fields.map((_, index) => form.getValues(`${fullName}.${index}`)),
      remove,
      append: () => undefined,
      replace: () => undefined,
    })
  }, [form, fullName, fields, remove])

  const { rhythm, size } = resolveFormDensity(listContext.density)
  const listClasses = fieldArrayItemListClasses({
    rhythm,
    size,
  })

  if (fields.length === 0) return null

  return (
    <FormSectionContext.Provider value={listContext}>
      <div className={listClasses}>
        {fields.map((field, index) =>
          rows[index]?.kind === 'note' ? (
            <OutcomeNoteEffectRow
              key={field.id}
              fullName={fullName}
              index={index}
              onRemove={() => remove(index)}
            />
          ) : (
            <SpellResolutionOutcomeApplicationRow
              key={field.id}
              outcomeIndex={outcomeIndex}
              itemId={field.id}
              index={index}
              idPrefix={idPrefix}
              fullName={fullName}
              effects={effects}
              selectionContext={selectionContext}
              onRemove={() => remove(index)}
            />
          ),
        )}
      </div>
    </FormSectionContext.Provider>
  )
}

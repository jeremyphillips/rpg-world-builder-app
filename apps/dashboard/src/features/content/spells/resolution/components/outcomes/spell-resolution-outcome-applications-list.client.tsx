'use client'

import * as React from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import {
  buildFormSectionChildContext,
  fieldArrayItemListClasses,
  FormSectionContext,
  registerArrayFieldMutators,
  useFormSectionContext,
} from '@rpg/ui/form'

import { outcomeApplicationsFieldPath } from '../../lib/form/resolution-outcome-applications-form-fields'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'
import { resolutionFormToSelectionContext } from '../../lib/selection/resolution-selection-context.lib'
import { SpellResolutionOutcomeApplicationRow } from './spell-resolution-outcome-application-row.client'

export type SpellResolutionOutcomeApplicationsListProps = {
  outcomeIndex: number
}

export function outcomeApplicationsIdPrefix(outcomeIndex: number): string {
  return `resolution-outcome-${outcomeIndex}-applications`
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
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const effects = resolution?.effects ?? []
  const selectionContext = resolutionFormToSelectionContext(resolution)

  const listContext = React.useMemo(
    () =>
      buildFormSectionChildContext(parentContext, parentContext.depth, {
        arrayItemSurface: { emphasis: 'subtle' },
        size: 'sm',
      }),
    [parentContext],
  )

  React.useEffect(() => {
    return registerArrayFieldMutators(form.control, fullName, {
      getValues: () => fields.map((_, index) => form.getValues(`${fullName}.${index}`)),
      remove,
      append: () => undefined,
    })
  }, [form, fullName, fields, remove])

  const listClasses = fieldArrayItemListClasses({
    rhythm: listContext.rhythm,
    size: listContext.size,
  })

  if (fields.length === 0) return null

  return (
    <FormSectionContext.Provider value={listContext}>
      <div className={listClasses}>
        {fields.map((field, index) => (
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
        ))}
      </div>
    </FormSectionContext.Provider>
  )
}

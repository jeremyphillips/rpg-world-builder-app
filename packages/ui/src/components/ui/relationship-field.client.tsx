'use client'

import * as React from 'react'

import { CollectionAddControl } from './collection-add-control.client'
import { EmptyPanel } from './empty-panel.client'
import { FormField } from './form-field'
import { arrayFieldStackedAddActionSpacingClasses } from './field.variants'
import type { FieldHintPosition } from './field.variants'
import type { FieldValidationProps } from './field-validation-props'
import type { FieldLabelPresentationProps } from './field-label-props'
import {
  relationshipFieldListVariants,
  relationshipFieldRowVariants,
} from './relationship-field.variants'

export type RelationshipFieldAddAction = {
  label: string
  onSelect: () => void
  disabled?: boolean
  disabledReason?: string
}

export interface RelationshipFieldProps<TItem>
  extends FieldValidationProps, FieldLabelPresentationProps {
  id: string
  hint?: string
  hintPosition?: FieldHintPosition
  required?: boolean
  disabled?: boolean
  itemCount: number
  emptyLabel: string
  addAction: RelationshipFieldAddAction
  items: readonly TItem[]
  getItemKey: (item: TItem) => string
  renderRow: (item: TItem) => React.ReactNode
  picker: React.ReactNode
  listAriaLabel?: string
  supplementary?: React.ReactNode
}

/** Compact list chrome for typed content-entity relationship authoring. */
export function RelationshipField<TItem>({
  id,
  label,
  labelVisibility,
  hint,
  hintPosition,
  required,
  disabled,
  error,
  invalid,
  describedBy,
  itemCount,
  emptyLabel,
  addAction,
  items,
  getItemKey,
  renderRow,
  picker,
  listAriaLabel,
  supplementary,
}: RelationshipFieldProps<TItem>) {
  const addEnabled = !disabled && !addAction.disabled

  return (
    <FormField
      id={id}
      label={label}
      labelVisibility={labelVisibility}
      hint={hint}
      hintPosition={hintPosition}
      required={required}
      error={error}
      invalid={invalid}
      describedBy={describedBy}
    >
      <div className="space-y-3">
        {supplementary}
        <div className="flex flex-col">
          {itemCount === 0 ? (
            <EmptyPanel>{emptyLabel}</EmptyPanel>
          ) : (
            <div className={relationshipFieldListVariants()}>
              <ul aria-label={listAriaLabel}>
                {items.map((item) => (
                  <li key={getItemKey(item)} className={relationshipFieldRowVariants()}>
                    {renderRow(item)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className={arrayFieldStackedAddActionSpacingClasses}>
            <CollectionAddControl
              label={addAction.label}
              onClick={addAction.onSelect}
              enabled={addEnabled}
              disabledReason={addAction.disabledReason}
            />
          </div>
        </div>
        {picker}
      </div>
    </FormField>
  )
}

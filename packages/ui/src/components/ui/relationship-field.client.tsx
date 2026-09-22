'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'

import { Button } from './button.client'
import { FormField } from './form-field'
import { InsetPanel } from './inset-panel.client'
import type { FieldHintPosition } from './field.variants'
import type { FieldValidationProps } from './field-validation-props'
import type { FieldLabelPresentationProps } from './field-label-props'
import {
  relationshipFieldEmptyVariants,
  relationshipFieldFooterVariants,
  relationshipFieldListVariants,
  relationshipFieldRowVariants,
} from './relationship-field.variants'

export type RelationshipFieldAddAction = {
  label: string
  onSelect: () => void
  disabled?: boolean
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
  const addDisabled = disabled || addAction.disabled

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
        {itemCount === 0 ? (
          <InsetPanel
            borderStyle="dashed"
            size="md"
            align="center"
            className={relationshipFieldEmptyVariants()}
          >
            <InsetPanel.PassiveMessage>{emptyLabel}</InsetPanel.PassiveMessage>
          </InsetPanel>
        ) : (
          <div className={relationshipFieldListVariants()}>
            <ul aria-label={listAriaLabel}>
              {items.map((item) => (
                <li key={getItemKey(item)} className={relationshipFieldRowVariants()}>
                  {renderRow(item)}
                </li>
              ))}
            </ul>
            <div className={relationshipFieldFooterVariants()}>
              <Button
                type="button"
                variant="text"
                size="sm"
                density="compact"
                disabled={addDisabled}
                onClick={addAction.onSelect}
              >
                <Plus aria-hidden />
                {addAction.label}
              </Button>
            </div>
          </div>
        )}
        {itemCount === 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={addDisabled}
            onClick={addAction.onSelect}
          >
            <Plus aria-hidden />
            {addAction.label}
          </Button>
        ) : null}
        {picker}
      </div>
    </FormField>
  )
}

'use client'

import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from './button.client'
import type { FieldSize } from './field.client'
import { FieldLabelContent } from './field-label-content'
import { fieldLabelVariants } from './field.variants'
import { cn } from '../../lib/utils'
import {
  optionalFieldDisclosureActionButtonClasses,
  optionalFieldDisclosureHeaderClasses,
  optionalFieldDisclosureStackClasses,
} from './optional-field-disclosure.variants'

export type OptionalFieldDisclosureProps = {
  controlId: string
  fieldLabel: string
  addLabel: string
  removeLabel?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemove: () => void
  size?: FieldSize
  children: ReactNode
}

/** Collapses an optional field behind a compact add control until opened or populated. */
export function OptionalFieldDisclosure({
  controlId,
  fieldLabel,
  addLabel,
  removeLabel = 'Remove',
  open,
  onOpenChange,
  onRemove,
  size = 'md',
  children,
}: OptionalFieldDisclosureProps) {
  if (!open) {
    return (
      <Button
        type="button"
        variant="text"
        size="sm"
        className={cn(optionalFieldDisclosureActionButtonClasses, 'w-fit justify-start')}
        aria-controls={controlId}
        aria-expanded={false}
        onClick={() => onOpenChange(true)}
      >
        <Plus aria-hidden />
        {addLabel}
      </Button>
    )
  }

  return (
    <div className={optionalFieldDisclosureStackClasses}>
      <div className={optionalFieldDisclosureHeaderClasses}>
        <label htmlFor={controlId} className={cn(fieldLabelVariants({ size }))}>
          <FieldLabelContent label={fieldLabel} />
        </label>
        <Button
          type="button"
          variant="text"
          size="sm"
          className={optionalFieldDisclosureActionButtonClasses}
          aria-label={`${removeLabel} ${fieldLabel}`}
          onClick={onRemove}
        >
          {removeLabel}
        </Button>
      </div>
      {children}
    </div>
  )
}

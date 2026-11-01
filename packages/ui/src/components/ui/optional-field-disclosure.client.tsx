'use client'

import type { ReactNode } from 'react'

import { formMicroActionButtonProps } from '../../form/form-micro-action'
import { Button } from './button.client'
import { ActionIcon } from './action-icon.client'
import type { FieldSize } from './field.client'
import { FieldLabelContent } from './field-label-content'
import { fieldAnatomyStackVariants, fieldLabelVariants } from './field.variants'
import { cn } from '../../lib/utils'

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
        className={cn('font-normal', 'w-fit justify-start')}
        aria-controls={controlId}
        aria-expanded={false}
        onClick={() => onOpenChange(true)}
      >
        <ActionIcon action="add" size="lg" />
        {addLabel}
      </Button>
    )
  }

  return (
    <div className={fieldAnatomyStackVariants({ size })}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={controlId} className={cn(fieldLabelVariants({ size }))}>
          <FieldLabelContent label={fieldLabel} />
        </label>
        <Button
          {...formMicroActionButtonProps}
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

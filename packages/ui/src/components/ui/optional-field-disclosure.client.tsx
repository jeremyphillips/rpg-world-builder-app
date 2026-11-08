'use client'

import type { ReactNode } from 'react'

import { formMicroActionButtonProps } from '../../form/form-micro-action'
import { Button } from './button.client'
import { ActionIcon } from './action-icon.client'
import type { FieldSize } from './field.client'
import { FieldLabelContent } from './field-label-content'
import { fieldAnatomyStackVariants, fieldLabelVariants } from './field.variants'
import { cn } from '../../lib/utils'
import { Text } from './text'

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
  /** Persistent label row instead of an add-only button. */
  labeled?: boolean
  /** Supporting line under the label row, or under the control when open. */
  summary?: string
  /** Disables the add action while the disclosure is collapsed. */
  addDisabled?: boolean
}

/** Collapses an optional field behind a compact add control until opened or populated. */
function DisclosureSummary({ id, summary }: { id: string; summary?: string }) {
  if (!summary) return null
  return (
    <Text id={id} as="p" variant="caption">
      {summary}
    </Text>
  )
}

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
  labeled = false,
  summary,
  addDisabled = false,
}: OptionalFieldDisclosureProps) {
  const summaryId = `${controlId}-summary`

  if (!open) {
    if (!labeled) {
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
          <span className={cn(fieldLabelVariants({ size }))}>
            <FieldLabelContent label={fieldLabel} />
          </span>
          <Button
            {...formMicroActionButtonProps}
            aria-controls={controlId}
            aria-expanded={false}
            aria-describedby={summary ? summaryId : undefined}
            disabled={addDisabled}
            onClick={() => onOpenChange(true)}
          >
            <ActionIcon action="add" size="sm" />
            {addLabel}
          </Button>
        </div>
        <DisclosureSummary id={summaryId} summary={summary} />
      </div>
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
      {labeled ? <DisclosureSummary id={summaryId} summary={summary} /> : null}
    </div>
  )
}

'use client'

import type { ReactNode } from 'react'

import { formMicroActionButtonProps } from '../../form/form-micro-action'
import {
  FieldRowParticipationProvider,
  useFieldRowParticipation,
} from './field-row-anatomy.context'
import { Button } from './button.client'
import { ActionIcon } from './action-icon.client'
import type { FieldSize } from './field.client'
import { fieldRowParticipationClasses } from './field-root.lib'
import { FieldControlRegion, FieldLabelRegion, FieldMessageRegion } from './field-anatomy-regions'
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

/** `fieldLabelVariants` pins `self-start`, which lifts the label above the action. */
function disclosureLabelClass(size: FieldSize): string {
  return cn(fieldLabelVariants({ size }), 'self-center')
}

function DisclosureHeaderRow({ children }: { children: ReactNode }) {
  return <div className="flex w-full items-center justify-between gap-2">{children}</div>
}

/**
 * Joins a parent anatomy-grid row. The header stays in the label track and the
 * control stays in the control track, so sibling fields share one baseline.
 * Descendants must not also span that grid.
 */
function DisclosureAnatomy({
  size,
  label,
  control,
  message,
}: {
  size: FieldSize
  label: ReactNode
  control: ReactNode
  message?: ReactNode
}) {
  return (
    <div className={fieldRowParticipationClasses} data-field-row-participant="">
      <FieldLabelRegion size={size}>{label}</FieldLabelRegion>
      <FieldControlRegion>
        <FieldRowParticipationProvider participates={false}>
          {control}
        </FieldRowParticipationProvider>
      </FieldControlRegion>
      <FieldMessageRegion size={size}>{message}</FieldMessageRegion>
    </div>
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
  const inAnatomyRow = useFieldRowParticipation()
  const summaryNode = <DisclosureSummary id={summaryId} summary={summary} />
  const addButton = (
    <Button
      type="button"
      variant="text"
      size={labeled ? undefined : 'sm'}
      className={cn('font-normal', labeled ? undefined : 'w-fit justify-start')}
      {...(labeled ? formMicroActionButtonProps : {})}
      aria-controls={controlId}
      aria-expanded={false}
      aria-describedby={summary && labeled ? summaryId : undefined}
      disabled={labeled ? addDisabled : undefined}
      onClick={() => onOpenChange(true)}
    >
      <ActionIcon action="add" size={labeled ? 'sm' : 'lg'} />
      {addLabel}
    </Button>
  )
  const removeButton = (
    <Button
      {...formMicroActionButtonProps}
      aria-label={`${removeLabel} ${fieldLabel}`}
      onClick={onRemove}
    >
      {removeLabel}
    </Button>
  )
  const fieldLabelNode = (
    <label htmlFor={controlId} className={disclosureLabelClass(size)}>
      <FieldLabelContent label={fieldLabel} />
    </label>
  )

  if (!open) {
    if (inAnatomyRow) {
      return (
        <DisclosureAnatomy
          size={size}
          label={
            labeled ? (
              <DisclosureHeaderRow>
                <span className={disclosureLabelClass(size)}>
                  <FieldLabelContent label={fieldLabel} />
                </span>
                {addButton}
              </DisclosureHeaderRow>
            ) : null
          }
          control={labeled ? null : addButton}
          message={labeled ? summaryNode : null}
        />
      )
    }

    if (!labeled) return addButton

    return (
      <div className={fieldAnatomyStackVariants({ size })}>
        <DisclosureHeaderRow>
          <span className={disclosureLabelClass(size)}>
            <FieldLabelContent label={fieldLabel} />
          </span>
          {addButton}
        </DisclosureHeaderRow>
        {summaryNode}
      </div>
    )
  }

  const header = (
    <DisclosureHeaderRow>
      {fieldLabelNode}
      {removeButton}
    </DisclosureHeaderRow>
  )

  if (inAnatomyRow) {
    return (
      <DisclosureAnatomy
        size={size}
        label={header}
        control={children}
        message={labeled ? summaryNode : null}
      />
    )
  }

  return (
    <div className={fieldAnatomyStackVariants({ size })}>
      {header}
      {children}
      {labeled ? summaryNode : null}
    </div>
  )
}

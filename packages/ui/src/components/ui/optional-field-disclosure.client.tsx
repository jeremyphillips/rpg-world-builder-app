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
  /** Hint, validation, or summary rendered in the anatomy-row message track when open. */
  message?: ReactNode
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

function DisclosureHeaderRow({ label, action }: { label: ReactNode; action: ReactNode }) {
  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-2">
      <span className="min-w-0">{label}</span>
      <span className="shrink-0">{action}</span>
    </div>
  )
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
    <div className={cn(fieldRowParticipationClasses, 'min-w-0')} data-field-row-participant="">
      <FieldLabelRegion size={size}>{label}</FieldLabelRegion>
      <FieldControlRegion>
        <FieldRowParticipationProvider participates={false}>
          {control}
        </FieldRowParticipationProvider>
      </FieldControlRegion>
      <FieldMessageRegion size={size}>
        {message ? <div className="min-w-0 max-w-full">{message}</div> : null}
      </FieldMessageRegion>
    </div>
  )
}

function collapsedScalarAddControl(addButton: ReactNode, summaryNode: ReactNode, summary?: string) {
  if (!summary) return addButton
  return (
    <div className="flex min-w-0 flex-col gap-1">
      {addButton}
      {summaryNode}
    </div>
  )
}

function showCollapsedAdd(addDisabled: boolean, summary?: string): boolean {
  return !addDisabled || Boolean(summary)
}

function collapsedAddControl(
  addButton: ReactNode,
  summaryNode: ReactNode,
  summary: string | undefined,
  addDisabled: boolean,
): ReactNode {
  if (!showCollapsedAdd(addDisabled, summary)) return null
  return collapsedScalarAddControl(addButton, summaryNode, summary)
}

function CollapsedLabeledAddHeader({
  size,
  fieldLabel,
  addButton,
  showAdd,
}: {
  size: FieldSize
  fieldLabel: string
  addButton: ReactNode
  showAdd: boolean
}) {
  return (
    <DisclosureHeaderRow
      label={
        <span className={disclosureLabelClass(size)}>
          <FieldLabelContent label={fieldLabel} />
        </span>
      }
      action={showAdd ? addButton : null}
    />
  )
}

function CollapsedDisclosureInAnatomyRow({
  size,
  fieldLabel,
  labeled,
  addButton,
  summaryNode,
  collapsedAdd,
  showAdd,
}: {
  size: FieldSize
  fieldLabel: string
  labeled: boolean
  addButton: ReactNode
  summaryNode: ReactNode
  collapsedAdd: ReactNode
  showAdd: boolean
}) {
  if (!labeled && collapsedAdd === null) return null
  return (
    <DisclosureAnatomy
      size={size}
      label={
        labeled ? (
          <CollapsedLabeledAddHeader
            size={size}
            fieldLabel={fieldLabel}
            addButton={addButton}
            showAdd={showAdd}
          />
        ) : null
      }
      control={labeled ? null : collapsedAdd}
      message={labeled ? summaryNode : null}
    />
  )
}

function CollapsedDisclosureStack({
  size,
  fieldLabel,
  labeled,
  addButton,
  summaryNode,
  collapsedAdd,
  showAdd,
}: {
  size: FieldSize
  fieldLabel: string
  labeled: boolean
  addButton: ReactNode
  summaryNode: ReactNode
  collapsedAdd: ReactNode
  showAdd: boolean
}) {
  if (!labeled) return collapsedAdd

  return (
    <div className={fieldAnatomyStackVariants({ size })}>
      <CollapsedLabeledAddHeader
        size={size}
        fieldLabel={fieldLabel}
        addButton={addButton}
        showAdd={showAdd}
      />
      {summaryNode}
    </div>
  )
}

function CollapsedOptionalFieldDisclosure({
  size,
  fieldLabel,
  labeled,
  inAnatomyRow,
  addButton,
  summaryNode,
  summary,
  addDisabled,
}: {
  size: FieldSize
  fieldLabel: string
  labeled: boolean
  inAnatomyRow: boolean
  addButton: ReactNode
  summaryNode: ReactNode
  summary?: string
  addDisabled: boolean
}) {
  const showAdd = showCollapsedAdd(addDisabled, summary)
  const collapsedAdd = collapsedAddControl(addButton, summaryNode, summary, addDisabled)
  const layoutProps = {
    size,
    fieldLabel,
    labeled,
    addButton,
    summaryNode,
    collapsedAdd,
    showAdd,
  }

  if (inAnatomyRow) {
    return <CollapsedDisclosureInAnatomyRow {...layoutProps} />
  }

  return <CollapsedDisclosureStack {...layoutProps} />
}

function DisclosureAddButton({
  controlId,
  addLabel,
  labeled,
  summaryId,
  addDisabled,
  onOpenChange,
}: {
  controlId: string
  addLabel: string
  labeled: boolean
  summaryId?: string
  addDisabled: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Button
      type="button"
      variant="text"
      size={labeled ? undefined : 'sm'}
      className={cn('font-normal', labeled ? undefined : 'w-fit justify-start')}
      {...(labeled ? formMicroActionButtonProps : {})}
      aria-controls={controlId}
      aria-expanded={false}
      aria-describedby={summaryId}
      disabled={addDisabled || undefined}
      onClick={() => {
        if (addDisabled) return
        onOpenChange(true)
      }}
    >
      <ActionIcon action="add" size={labeled ? 'sm' : 'lg'} />
      {addLabel}
    </Button>
  )
}

function OpenOptionalFieldDisclosure({
  size,
  controlId,
  fieldLabel,
  removeLabel,
  inAnatomyRow,
  labeled,
  message,
  summaryNode,
  onRemove,
  children,
}: {
  size: FieldSize
  controlId: string
  fieldLabel: string
  removeLabel: string
  inAnatomyRow: boolean
  labeled: boolean
  message?: ReactNode
  summaryNode: ReactNode
  onRemove: () => void
  children: ReactNode
}) {
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
  const header = <DisclosureHeaderRow label={fieldLabelNode} action={removeButton} />

  if (inAnatomyRow) {
    const showMessageTrack = message != null || labeled
    const messageTrack = showMessageTrack ? (
      <>
        {labeled ? summaryNode : null}
        {message}
      </>
    ) : null

    return (
      <DisclosureAnatomy size={size} label={header} control={children} message={messageTrack} />
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
  message,
}: OptionalFieldDisclosureProps) {
  const summaryId = `${controlId}-summary`
  const inAnatomyRow = useFieldRowParticipation()
  const summaryNode = <DisclosureSummary id={summaryId} summary={summary} />
  const addButton = (
    <DisclosureAddButton
      controlId={controlId}
      addLabel={addLabel}
      labeled={labeled}
      summaryId={summary ? summaryId : undefined}
      addDisabled={addDisabled}
      onOpenChange={onOpenChange}
    />
  )

  if (!open) {
    return (
      <CollapsedOptionalFieldDisclosure
        size={size}
        fieldLabel={fieldLabel}
        labeled={labeled}
        inAnatomyRow={inAnatomyRow}
        addButton={addButton}
        summaryNode={summaryNode}
        summary={summary}
        addDisabled={addDisabled}
      />
    )
  }

  return (
    <OpenOptionalFieldDisclosure
      size={size}
      controlId={controlId}
      fieldLabel={fieldLabel}
      removeLabel={removeLabel}
      inAnatomyRow={inAnatomyRow}
      labeled={labeled}
      message={message}
      summaryNode={summaryNode}
      onRemove={onRemove}
    >
      {children}
    </OpenOptionalFieldDisclosure>
  )
}

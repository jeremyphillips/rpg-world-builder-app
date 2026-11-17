'use client'

import type { ReactNode } from 'react'

import {
  FieldRowParticipationProvider,
  useFieldRowParticipation,
} from './field-row-anatomy.context'
import type { ComponentProps } from 'react'

import { Button } from './button.client'
import { ActionIcon } from './action-icon.client'
import type { FieldSize } from './field.client'
import { fieldRowParticipationClasses } from './field-root.lib'
import { FieldControlRegion, FieldLabelRegion, FieldMessageRegion } from './field-anatomy-regions'
import { FieldLabelContent } from './field-label-content'
import {
  fieldAnatomyStackVariants,
  fieldLabelVariants,
  optionalDisclosureSummaryTypographyVariants,
} from './field.variants'
import { cn } from '../../lib/utils'
import { formMicroActionButtonProps } from '../../form/form-micro-action'
import type { OptionalDisclosureActionVerb } from '../../form/config/optional-disclosure-actions.lib'
import {
  OptionalDisclosureSourcePreview,
  type OptionalDisclosureSourcePreviewContent,
} from './optional-disclosure-source-preview.client'

export type OptionalFieldDisclosureProps = {
  controlId: string
  fieldLabel: string
  addLabel: string
  addAccessibleName: string
  addAction?: Extract<OptionalDisclosureActionVerb, 'add' | 'edit'>
  removeLabel?: string
  removeAccessibleName: string
  removeAction?: Extract<OptionalDisclosureActionVerb, 'clear'>
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
  /** Inherited source context shown only while open. */
  sourcePreview?: OptionalDisclosureSourcePreviewContent
}

type OptionalDisclosureMicroActionProps = Omit<
  ComponentProps<typeof Button>,
  'variant' | 'size'
> & {
  action: OptionalDisclosureActionVerb
  children: ReactNode
}

/** Shared xs text action for optional disclosure add/clear controls. */
export function OptionalDisclosureMicroAction({
  action,
  children,
  className,
  ...props
}: OptionalDisclosureMicroActionProps) {
  return (
    <Button {...formMicroActionButtonProps} className={cn('shrink-0', className)} {...props}>
      <ActionIcon action={action} size="owner" />
      {children}
    </Button>
  )
}

/** Collapses an optional field behind a compact add control until opened or populated. */
function DisclosureSummary({
  id,
  summary,
  size,
}: {
  id: string
  summary?: string
  size: FieldSize
}) {
  if (!summary) return null
  return (
    <p id={id} className={optionalDisclosureSummaryTypographyVariants({ size })}>
      {summary}
    </p>
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
  addAccessibleName,
  addAction,
  labeled,
  summaryId,
  addDisabled,
  onOpenChange,
}: {
  controlId: string
  addLabel: string
  addAccessibleName: string
  addAction: 'add' | 'edit'
  labeled: boolean
  summaryId?: string
  addDisabled: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <OptionalDisclosureMicroAction
      action={addAction}
      className={labeled ? undefined : 'w-fit justify-start'}
      aria-label={addAccessibleName}
      aria-controls={controlId}
      aria-expanded={false}
      aria-describedby={summaryId}
      disabled={addDisabled || undefined}
      onClick={() => {
        if (addDisabled) return
        onOpenChange(true)
      }}
    >
      {addLabel}
    </OptionalDisclosureMicroAction>
  )
}

function OpenOptionalFieldDisclosure({
  size,
  controlId,
  fieldLabel,
  removeLabel,
  removeAccessibleName,
  removeAction,
  inAnatomyRow,
  labeled,
  message,
  summaryNode,
  sourcePreview,
  onRemove,
  children,
}: {
  size: FieldSize
  controlId: string
  fieldLabel: string
  removeLabel: string
  removeAccessibleName: string
  removeAction: 'clear'
  inAnatomyRow: boolean
  labeled: boolean
  message?: ReactNode
  summaryNode: ReactNode
  sourcePreview?: OptionalDisclosureSourcePreviewContent
  onRemove: () => void
  children: ReactNode
}) {
  const removeButton = (
    <OptionalDisclosureMicroAction
      action={removeAction}
      aria-label={removeAccessibleName}
      onClick={onRemove}
    >
      {removeLabel}
    </OptionalDisclosureMicroAction>
  )
  const fieldLabelNode = (
    <label htmlFor={controlId} className={disclosureLabelClass(size)}>
      <FieldLabelContent label={fieldLabel} />
    </label>
  )
  const header = <DisclosureHeaderRow label={fieldLabelNode} action={removeButton} />
  const sourcePreviewNode = (
    <OptionalDisclosureSourcePreview
      id={sourcePreview ? `${controlId}-source-preview` : undefined}
      preview={sourcePreview}
    />
  )
  const control = (
    <div className={fieldAnatomyStackVariants({ size })}>
      {sourcePreviewNode}
      {children}
    </div>
  )

  if (inAnatomyRow) {
    const showMessageTrack = message != null || labeled
    const messageTrack = showMessageTrack ? (
      <>
        {labeled ? summaryNode : null}
        {message}
      </>
    ) : null

    return <DisclosureAnatomy size={size} label={header} control={control} message={messageTrack} />
  }

  return (
    <div className={fieldAnatomyStackVariants({ size })}>
      {header}
      {sourcePreviewNode}
      {children}
      {labeled ? summaryNode : null}
    </div>
  )
}

export function OptionalFieldDisclosure({
  controlId,
  fieldLabel,
  addLabel,
  addAccessibleName,
  addAction = 'add',
  removeLabel = 'Remove',
  removeAccessibleName,
  removeAction = 'clear',
  open,
  onOpenChange,
  onRemove,
  size = 'md',
  children,
  labeled = false,
  summary,
  addDisabled = false,
  message,
  sourcePreview,
}: OptionalFieldDisclosureProps) {
  const summaryId = `${controlId}-summary`
  const inAnatomyRow = useFieldRowParticipation()
  const summaryNode = <DisclosureSummary id={summaryId} summary={summary} size={size} />
  const addButton = (
    <DisclosureAddButton
      controlId={controlId}
      addLabel={addLabel}
      addAccessibleName={addAccessibleName}
      addAction={addAction}
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
      removeAccessibleName={removeAccessibleName}
      removeAction={removeAction}
      inAnatomyRow={inAnatomyRow}
      labeled={labeled}
      message={message}
      summaryNode={summaryNode}
      sourcePreview={sourcePreview}
      onRemove={onRemove}
    >
      {children}
    </OpenOptionalFieldDisclosure>
  )
}

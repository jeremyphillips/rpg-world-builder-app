'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Text } from '@rpg/ui'
import {
  ArrayFieldContext,
  ArrayItemActionsRail,
  ArrayItemInlineRow,
  ArrayItemIssueSummary,
  ArrayItemLeadingChromeColumn,
  ArrayItemPresentationContext,
  ArrayItemRowShell,
  buildFieldRendererIds,
  useFieldErrorPresentation,
  useFormSectionContext,
  useArrayItemRowState,
  type ArrayItemIssueSummaryProps,
} from '@rpg/ui/form'
import { useController, useFormContext } from 'react-hook-form'

import {
  buildOutcomeApplicationDescribedByIds,
  buildOutcomeApplicationRowPresentation,
} from '../../lib/form/resolution-outcome-application-row.lib'
import {
  amountOptionsForEffect,
  outcomeApplicationAmountField,
  outcomeApplicationAmountOptions,
} from '../../lib/form/resolution-outcome-applications-form-fields'
import type { ResolutionEffectFormItem } from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'
import { ResolutionEffectReferenceTitle } from '../shared/resolution-effect-reference-title.client'
import type { EffectReferenceState } from '../../lib/form/resolution-effect-reference.lib'

const RESOLUTION_EFFECTS_FIELD = `${RESOLUTION_FIELD_NAME}.effects` as const
const RELATIONSHIP_MARKER = '↳'

function HiddenEffectIdField({ itemPrefix }: { itemPrefix: string }) {
  const { control } = useFormContext()
  const { field } = useController({
    control,
    name: `${itemPrefix}.effectId`,
  })

  return <input type="hidden" {...field} value={field.value ?? ''} />
}

function ReadOnlyAmountLabel({ label }: { label: string }) {
  const { size } = useFormSectionContext()

  return (
    <Text variant="muted" className={size === 'sm' ? 'text-sm' : undefined}>
      {label}
    </Text>
  )
}

function OutcomeApplicationAmountSelect({
  idPrefix,
  itemPrefix,
  titleId,
  describedBy,
  disabled,
  options,
}: {
  idPrefix: string
  itemPrefix: string
  titleId: string
  describedBy?: string
  disabled?: boolean
  options: ReturnType<typeof amountOptionsForEffect>
}) {
  const { control } = useFormContext()
  const { size } = useFormSectionContext()
  const { fullName, id } = buildFieldRendererIds(
    outcomeApplicationAmountField,
    idPrefix,
    itemPrefix,
  )
  const { field, fieldState } = useController({
    control,
    name: fullName,
  })
  const validation = useFieldErrorPresentation(fieldState.error?.message, fullName)

  return (
    <Select
      value={field.value ?? 'full'}
      onValueChange={field.onChange}
      name={field.name}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        size={size}
        aria-labelledby={titleId}
        aria-describedby={describedBy ?? validation.describedBy}
        aria-invalid={validation.invalid}
        onBlur={field.onBlur}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function OutcomeApplicationRowSummary({
  issueSummary,
  statusDescription,
  rowSummaryId,
}: {
  issueSummary?: ArrayItemIssueSummaryProps
  statusDescription?: string
  rowSummaryId: string
}) {
  if (issueSummary?.placement === 'compactSummary') {
    return <ArrayItemIssueSummary {...issueSummary} />
  }

  if (!statusDescription) return null

  return (
    <p id={rowSummaryId} className="text-sm text-muted-foreground" aria-live="polite">
      {statusDescription}
    </p>
  )
}

export type SpellResolutionOutcomeApplicationRowProps = {
  outcomeIndex: number
  index: number
  itemId: string
  idPrefix: string
  fullName: string
  effects: readonly ResolutionEffectFormItem[]
  onRemove: () => void
}

/** One applied-effect row — reference title, amount control, and remove actions. */
export function SpellResolutionOutcomeApplicationRow({
  index,
  itemId,
  idPrefix,
  fullName,
  effects,
  onRemove,
}: SpellResolutionOutcomeApplicationRowProps) {
  const rowState = useArrayItemRowState({
    idPrefix,
    fullName,
    index,
    itemId,
    variant: 'compact',
    filterSelectDependsOn: [RESOLUTION_EFFECTS_FIELD],
    filterSelectOptions: outcomeApplicationAmountOptions,
    onRemoveItem: onRemove,
  })

  const application = rowState.itemValues as { effectId?: string; amount?: string }
  const presentation = buildOutcomeApplicationRowPresentation(effects, application, index)
  const describedByIds = buildOutcomeApplicationDescribedByIds(
    presentation.statusDescription,
    rowState.rowSummaryId,
    rowState.issueSummary?.placement === 'compactSummary',
  )

  return (
    <ArrayItemPresentationContext.Provider
      value={{
        suppressFieldErrorText: true,
        rowSummaryId: rowState.rowSummaryId,
      }}
    >
      <ArrayFieldContext.Provider value={rowState.arrayContext}>
        <ArrayItemRowShell titleId={rowState.titleId} itemPrefix={rowState.itemPrefix}>
          <OutcomeApplicationRowBody
            idPrefix={idPrefix}
            index={index}
            reference={presentation.reference}
            rowState={rowState}
            presentation={presentation}
            describedByIds={describedByIds}
            onRemove={onRemove}
          />
          <HiddenEffectIdField itemPrefix={rowState.itemPrefix} />
        </ArrayItemRowShell>
      </ArrayFieldContext.Provider>
    </ArrayItemPresentationContext.Provider>
  )
}

function OutcomeApplicationRowBody({
  idPrefix,
  index,
  reference,
  rowState,
  presentation,
  describedByIds,
  onRemove,
}: {
  idPrefix: string
  index: number
  reference: EffectReferenceState
  rowState: ReturnType<typeof useArrayItemRowState>
  presentation: ReturnType<typeof buildOutcomeApplicationRowPresentation>
  describedByIds?: string
  onRemove: () => void
}) {
  return (
    <ArrayItemInlineRow
      showLeading
      leading={
        <ArrayItemLeadingChromeColumn>
          <span className="text-sm text-muted-foreground">{RELATIONSHIP_MARKER}</span>
        </ArrayItemLeadingChromeColumn>
      }
      content={
        <ResolutionEffectReferenceTitle
          id={rowState.titleId}
          reference={reference}
          resolveOptions={{ index }}
        />
      }
      controls={
        <OutcomeApplicationRowAmountControl
          idPrefix={idPrefix}
          itemPrefix={rowState.itemPrefix}
          titleId={rowState.titleId}
          describedByIds={describedByIds}
          presentation={presentation}
        />
      }
      actions={
        <ArrayItemActionsRail
          removeAriaLabel={`Remove ${presentation.rowAriaLabel}`}
          canRemove
          onRemove={onRemove}
          issueCount={rowState.showIssueChrome ? rowState.issueGroup.totalCount : 0}
          issueRowLabel={rowState.rowLabel}
          onIssuePress={rowState.focusIssue}
          badgeProminence={rowState.badgeProminence}
          compact
          embedded
        />
      }
      summary={
        <OutcomeApplicationRowSummary
          issueSummary={rowState.issueSummary}
          statusDescription={presentation.statusDescription}
          rowSummaryId={rowState.rowSummaryId}
        />
      }
    />
  )
}

function OutcomeApplicationRowAmountControl({
  idPrefix,
  itemPrefix,
  titleId,
  describedByIds,
  presentation,
}: {
  idPrefix: string
  itemPrefix: string
  titleId: string
  describedByIds?: string
  presentation: ReturnType<typeof buildOutcomeApplicationRowPresentation>
}) {
  if (!presentation.showAmountControl) return null
  if (presentation.singleAmountOption) {
    return <ReadOnlyAmountLabel label={presentation.singleAmountOption.label} />
  }

  return (
    <OutcomeApplicationAmountSelect
      idPrefix={idPrefix}
      itemPrefix={itemPrefix}
      titleId={titleId}
      describedBy={describedByIds}
      disabled={!presentation.amountEnabled}
      options={presentation.amountOptions}
    />
  )
}

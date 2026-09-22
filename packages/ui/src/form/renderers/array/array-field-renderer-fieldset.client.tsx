'use client'

import {
  arrayFieldStackedAddActionSpacingClasses,
  fieldGroupBottomMarginClasses,
  fieldGroupSectionOuterMarginResetClasses,
  fieldSetChromeContainClasses,
  fieldSetResetClasses,
} from '../../../components/ui/field.variants'
import { cn } from '../../../lib/utils'
import type { ArrayConfig } from '../../field-config'
import { ArrayFieldAddControl } from './array-field-add-control.client'
import { ArrayFieldContainerError } from './array-field-container-error.client'
import { ArrayFieldEmptyState } from './array-field-empty-state.client'
import { ArrayFieldLegend } from './array-field-legend.client'
import { ArrayFieldItemList } from './array-field-item-list.client'
import type { ArrayFieldSectionLayout } from './array-field-renderer.client'
import type { useArrayFieldRendererState } from './use-array-field-renderer-state.client'

type ArrayFieldRendererState = ReturnType<typeof useArrayFieldRendererState>

export function resolveArrayFieldsetClassName({
  config,
  sectionLayout,
  omitSectionBottomMargin,
}: {
  config: ArrayConfig
  sectionLayout?: ArrayFieldSectionLayout
  omitSectionBottomMargin: boolean
}): string {
  return cn(
    fieldSetResetClasses,
    !omitSectionBottomMargin && fieldGroupBottomMarginClasses,
    sectionLayout?.wrapSectionChrome && fieldSetChromeContainClasses,
    sectionLayout &&
      (sectionLayout.inParentRhythm || sectionLayout.wrapSectionChrome) &&
      fieldGroupSectionOuterMarginResetClasses,
    config.className,
  )
}

interface ArrayFieldRendererFieldsetProps {
  config: ArrayConfig
  sectionLayout?: ArrayFieldSectionLayout
  state: ArrayFieldRendererState
  fields: Array<{ id: string }>
  onMove: (from: number, to: number) => void
}

export function ArrayFieldRendererFieldset({
  config,
  sectionLayout,
  state,
  fields,
  onMove,
}: ArrayFieldRendererFieldsetProps) {
  const inlineAddInLegend = state.addActionLayout === 'inline' && state.showLegend
  const containerErrorId = `${state.idPrefix}-${state.fullName.replaceAll('.', '-')}-error`

  const addControl = (
    <ArrayFieldAddControl
      showAddControl={state.showAddControl}
      addEnabled={state.addEnabled}
      addDisabledReason={state.addDisabledReason}
      addActionLabel={state.addActionLabel}
      addActionVariant={state.addActionVariant}
      addActionLayout={state.addActionLayout}
      addActionSize={state.addActionSize}
      showAddIcon={state.showAddIcon}
      addActionMenu={state.addActionMenu}
      addActionMenuItems={state.addActionMenuItems}
      onAppendItem={state.onAppendItem}
      onAppendFromMenu={state.appendFromAddMenu}
    />
  )

  return (
    <fieldset
      id={config.id}
      className={resolveArrayFieldsetClassName({
        config,
        sectionLayout,
        omitSectionBottomMargin: state.omitSectionBottomMargin,
      })}
      aria-describedby={state.hasContainerIssue ? containerErrorId : undefined}
      aria-invalid={state.hasContainerIssue ? true : undefined}
    >
      {state.showLegend ? (
        <ArrayFieldLegend
          legend={state.legend}
          headingHint={state.headingHint}
          legendFieldSize={state.legendFieldSize}
          addActionLayout={state.addActionLayout}
          required={state.required}
          arrayIssueCount={state.arrayIssueCount}
          invalidRowCount={state.invalidRowCount}
          hasContainerIssue={state.hasContainerIssue}
          onFocusFirstArrayIssue={state.focusFirstArrayIssue}
          addControl={inlineAddInLegend ? addControl : undefined}
        />
      ) : null}
      <div className={state.itemListClasses}>
        {fields.length === 0 ? (
          <div className="flex flex-col gap-1.5">
            <ArrayFieldEmptyState itemLabel={state.emptyItemLabel} />
            <ArrayFieldContainerError
              fullName={state.fullName}
              errorId={containerErrorId}
              size={state.legendFieldSize}
            />
          </div>
        ) : (
          <>
            <ArrayFieldItemList
              fields={fields}
              sortableEnabled={state.sortableEnabled}
              itemProps={state.itemProps}
              onMove={onMove}
            />
            {state.hasContainerIssue ? (
              <ArrayFieldContainerError
                fullName={state.fullName}
                errorId={containerErrorId}
                size={state.legendFieldSize}
              />
            ) : null}
          </>
        )}
        {!inlineAddInLegend ? (
          <div
            className={
              state.addActionLayout === 'stacked'
                ? arrayFieldStackedAddActionSpacingClasses
                : undefined
            }
          >
            {addControl}
          </div>
        ) : null}
      </div>
    </fieldset>
  )
}

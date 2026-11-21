'use client'

import type { FieldSizeToken } from '../../../components/ui/field-sizing.variants'
import {
  fieldSetChromeContainClasses,
  fieldSetResetClasses,
} from '../../../components/ui/field.variants'
import { cn } from '../../../lib/utils'
import type { ArrayConfig } from '../../field-config'
import { resolveArrayFieldsetHeaderBodyStackClassName } from './resolve-array-fieldset-header-body-stack.lib'
import { ArrayFieldAddControl } from './array-field-add-control.client'
import { ArrayFieldContainerError } from './array-field-container-error.client'
import { ArrayFieldEmptyState } from './array-field-empty-state.client'
import { ArraySectionHeader } from './array-section-header.client'
import { resolveArrayFieldsetDescribedBy } from './resolve-array-fieldset-described-by.lib'
import { ArrayFieldItemList } from './array-field-item-list.client'
import type { ArrayFieldSectionLayout } from './array-field-renderer.client'
import type { useArrayFieldRendererState } from './use-array-field-renderer-state.client'

type ArrayFieldRendererState = ReturnType<typeof useArrayFieldRendererState>

export function resolveArrayFieldsetClassName({
  config,
  sectionLayout,
  showSectionHeader,
  legendFieldSize,
}: {
  config: ArrayConfig
  sectionLayout?: ArrayFieldSectionLayout
  showSectionHeader: boolean
  legendFieldSize: FieldSizeToken
}): string {
  return cn(
    fieldSetResetClasses,
    sectionLayout?.wrapSectionChrome && fieldSetChromeContainClasses,
    resolveArrayFieldsetHeaderBodyStackClassName(showSectionHeader, legendFieldSize),
    config.className,
  )
}

interface ArrayFieldRendererFieldsetProps {
  config: ArrayConfig
  sectionLayout?: ArrayFieldSectionLayout
  state: ArrayFieldRendererState
  fields: ReadonlyArray<Record<string, unknown>>
  onMove: (from: number, to: number) => void
}

// fallow-ignore-next-line complexity
export function ArrayFieldRendererFieldset({
  config,
  sectionLayout,
  state,
  fields,
  onMove,
}: ArrayFieldRendererFieldsetProps) {
  const inlineAddInHeader = state.addActionLayout === 'inline' && state.showSectionHeader
  const descriptionBaseId = `${state.idPrefix}-${state.fullName.replaceAll('.', '-')}`
  const containerErrorId = `${descriptionBaseId}-error`
  const hintId = `${descriptionBaseId}-hint`
  const describedBy = resolveArrayFieldsetDescribedBy({
    hasContainerIssue: state.hasContainerIssue,
    hint: state.sectionHint,
    errorId: containerErrorId,
    hintId,
  })

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
        showSectionHeader: state.showSectionHeader,
        legendFieldSize: state.legendFieldSize,
      })}
      aria-describedby={describedBy}
      aria-invalid={state.hasContainerIssue ? true : undefined}
    >
      {state.showSectionHeader || state.labelMode === 'srOnly' ? (
        <ArraySectionHeader
          labelMode={state.labelMode}
          showSectionHeader={state.showSectionHeader}
          sectionLabel={state.sectionLabel}
          hint={state.sectionHint}
          hintId={hintId}
          legendFieldSize={state.legendFieldSize}
          legendRhythm={state.legendRhythm}
          headingScale={state.headingScale}
          addActionLayout={state.addActionLayout}
          required={state.required}
          arrayIssueCount={state.arrayIssueCount}
          invalidRowCount={state.invalidRowCount}
          hasContainerIssue={state.hasContainerIssue}
          onFocusFirstArrayIssue={state.focusFirstArrayIssue}
          addControl={inlineAddInHeader ? addControl : undefined}
        />
      ) : null}
      <div className={state.itemListClasses}>
        {fields.length === 0 ? (
          <div className="flex flex-col gap-1.5">
            {config.emptyState === 'none' ? null : (
              <ArrayFieldEmptyState
                itemLabel={state.emptyItemLabel}
                primaryMessage={state.emptyStatePrimary}
              />
            )}
            <ArrayFieldContainerError
              fullName={state.fullName}
              errorId={containerErrorId}
              size={state.legendFieldSize}
            />
          </div>
        ) : (
          <>
            <ArrayFieldItemList
              fields={fields as unknown as ReadonlyArray<Record<string, unknown>>}
              keyName={config.keyName}
              sortableEnabled={state.sortableEnabled}
              itemConjunction={config.itemConjunction}
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
        {!inlineAddInHeader && state.showAddControl ? (
          <div className={state.addActionLayout === 'stacked' ? 'mt-4' : undefined}>
            {addControl}
          </div>
        ) : null}
      </div>
    </fieldset>
  )
}

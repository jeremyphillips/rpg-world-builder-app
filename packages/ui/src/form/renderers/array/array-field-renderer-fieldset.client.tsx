'use client'

import {
  fieldGroupBottomMarginClasses,
  fieldGroupSectionOuterMarginResetClasses,
  fieldSetChromeContainClasses,
  fieldSetResetClasses,
} from '../../../components/ui/field.variants'
import { cn } from '../../../lib/utils'
import type { ArrayConfig } from '../../field-config'
import { ArrayFieldAddControl } from './array-field-add-control.client'
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

  const addControl = (
    <ArrayFieldAddControl
      canAdd={state.canAdd && state.addAction !== null}
      addActionLabel={state.addActionLabel}
      addActionVariant={state.addActionVariant}
      addActionLayout={state.addActionLayout}
      addActionSize={state.addActionSize}
      showAddIcon={state.showAddIcon}
      addActionMenu={state.addActionMenu}
      addActionMenuItems={state.addActionMenuItems}
      onAppendItem={state.appendItem}
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
    >
      {state.showLegend ? (
        <ArrayFieldLegend
          legend={state.legend}
          legendFieldSize={state.legendFieldSize}
          addActionLayout={state.addActionLayout}
          arrayIssueCount={state.arrayIssueCount}
          invalidRowCount={state.invalidRowCount}
          onFocusFirstArrayIssue={state.focusFirstArrayIssue}
          addControl={inlineAddInLegend ? addControl : undefined}
        />
      ) : null}
      <div className={state.itemListClasses}>
        <ArrayFieldItemList
          fields={fields}
          sortableEnabled={state.sortableEnabled}
          itemProps={state.itemProps}
          onMove={onMove}
        />
        {!inlineAddInLegend ? addControl : null}
      </div>
    </fieldset>
  )
}

'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { FormRhythmStack, useFormSectionContext } from '../context/form-section.context'
import { resolveFormDensity } from '../form-density'
import {
  columnsNeedBreakpointReorder,
  resolveColumnsCollapseSequence,
} from '../config/form-columns-collapse.lib'
import type { ColumnsConfig } from '../field-config'
import { FieldSeparatorWrapper, useVisibilityValues } from './form-conditional.client'
import type { RenderNestedFormItems } from './form-dependent-section.client'
import {
  FORM_COLUMNS_WIDE_MEDIA_QUERY,
  formColumnsGridVariants,
  resolveFormColumnsGridCount,
} from './form-columns.variants'

function subscribeToColumnsWideLayout(onStoreChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => {}
  const media = window.matchMedia(FORM_COLUMNS_WIDE_MEDIA_QUERY)
  media.addEventListener('change', onStoreChange)
  return () => media.removeEventListener('change', onStoreChange)
}

function getColumnsWideLayoutSnapshot(): boolean {
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia(FORM_COLUMNS_WIDE_MEDIA_QUERY).matches
}

function getColumnsWideLayoutServerSnapshot(): boolean {
  return false
}

function useFormColumnsWideLayout(): boolean {
  return React.useSyncExternalStore(
    subscribeToColumnsWideLayout,
    getColumnsWideLayoutSnapshot,
    getColumnsWideLayoutServerSnapshot,
  )
}

interface ColumnsFieldSectionProps {
  item: ColumnsConfig
  idPrefix: string
  namePrefix?: string
  depth: number
  renderNestedItems: RenderNestedFormItems
}

function ColumnsStacks({
  item,
  idPrefix,
  namePrefix,
  depth,
  renderNestedItems,
}: ColumnsFieldSectionProps) {
  const parentContext = useFormSectionContext()
  const { rhythm } = resolveFormDensity(parentContext.density)
  const count = resolveFormColumnsGridCount(item.columns.length)

  return (
    <div
      id={item.id}
      data-form-columns=""
      data-form-columns-layout="stacks"
      className={cn(formColumnsGridVariants({ count, rhythm }), item.className)}
    >
      {item.columns.map((column, columnIndex) => (
        <FormRhythmStack key={`column-${columnIndex}`} className="min-w-0">
          {renderNestedItems({
            items: column.fields,
            idPrefix,
            namePrefix,
            depth,
          })}
        </FormRhythmStack>
      ))}
    </div>
  )
}

function ColumnsCollapseSequence({
  item,
  idPrefix,
  namePrefix,
  depth,
  renderNestedItems,
}: ColumnsFieldSectionProps) {
  const sequence = resolveColumnsCollapseSequence(item.columns, item.collapseOrder)

  return (
    <div
      id={item.id}
      data-form-columns=""
      data-form-columns-layout="sequence"
      className={item.className}
    >
      <FormRhythmStack>
        {renderNestedItems({
          items: sequence,
          idPrefix,
          namePrefix,
          depth,
        })}
      </FormRhythmStack>
    </div>
  )
}

function ColumnsResponsiveSection(props: ColumnsFieldSectionProps) {
  const isWide = useFormColumnsWideLayout()
  if (isWide) return <ColumnsStacks {...props} />
  return <ColumnsCollapseSequence {...props} />
}

/** Layout-only multi-column field tree — independent stacks at `md+`. */
export function ColumnsFieldSection(props: ColumnsFieldSectionProps) {
  const body = columnsNeedBreakpointReorder(props.item.collapseOrder) ? (
    <ColumnsResponsiveSection {...props} />
  ) : (
    <ColumnsStacks {...props} />
  )

  return <FieldSeparatorWrapper separator={props.item.separator}>{body}</FieldSeparatorWrapper>
}

/** Hides a columns block when its `visibility` predicate is false. */
export function ConditionalColumns({
  item,
  idPrefix,
  namePrefix,
  depth,
  renderNestedItems,
}: ColumnsFieldSectionProps) {
  const values = useVisibilityValues(item.visibility!, namePrefix)
  if (!item.visibility!.visibleWhen(values)) return null
  return (
    <ColumnsFieldSection
      item={item}
      idPrefix={idPrefix}
      namePrefix={namePrefix}
      depth={depth}
      renderNestedItems={renderNestedItems}
    />
  )
}

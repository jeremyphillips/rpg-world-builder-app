'use client'

import * as React from 'react'

import { FormSectionContext } from '../context/form-section.context'
import type { ArrayConfig, FormItem, GroupConfig, RowConfig } from '../field-config'
import { buildAccordionBatchKey } from '../config/form-accordion-state'
import {
  FormAccordionBatch,
  getSectionValue,
  isCollapsibleSection,
} from './form-collapsible-section.client'
import { FormItemNode, NestedFormItems, formItemKey } from './form-item-node.client'

export type { SlotFieldRendererProps } from '../renderers/slot-field-renderer.client'
export { SlotFieldRenderer } from '../renderers/slot-field-renderer.client'

export interface FormItemsProps {
  items: Array<FormItem | RowConfig>
  idPrefix: string
  /**
   * Dotted path prefix for array item fields (e.g. `"traits.0"`). Passed down
   * so leaf renderers and conditional watchers resolve to the correct RHF names.
   */
  namePrefix?: string
  /**
   * When true, groups and arrays render as plain fieldsets instead of accordion
   * sections. Use for embedded editors and other nested surfaces where top-level
   * accordion landmarks would duplicate (axe `landmark-unique`).
   */
  plainSections?: boolean
}

/** Renders an ordered list of fields/rows/groups/arrays, recursing into containers. */
export function FormItems({ items, idPrefix, namePrefix, plainSections }: FormItemsProps) {
  const { collapsibleSections, depth } = React.useContext(FormSectionContext)
  const resolvedCollapsibleSections = plainSections ? false : collapsibleSections

  if (depth === 0) {
    return (
      <TopLevelFormItems
        items={items}
        idPrefix={idPrefix}
        namePrefix={namePrefix}
        collapsibleSections={resolvedCollapsibleSections}
      />
    )
  }

  return <NestedFormItems items={items} idPrefix={idPrefix} namePrefix={namePrefix} depth={depth} />
}

interface TopLevelFormItemsProps {
  items: Array<FormItem | RowConfig>
  idPrefix: string
  namePrefix?: string
  collapsibleSections: boolean
}

function TopLevelFormItems({
  items,
  idPrefix,
  namePrefix,
  collapsibleSections,
}: TopLevelFormItemsProps) {
  const nodes: React.ReactNode[] = []
  let accordionBatch: Array<{ item: GroupConfig | ArrayConfig; index: number }> = []

  const flushAccordion = () => {
    if (accordionBatch.length === 0) return
    const batchKey = buildAccordionBatchKey(idPrefix, accordionBatch, getSectionValue)
    nodes.push(
      <FormAccordionBatch
        key={batchKey}
        batchKey={batchKey}
        sections={accordionBatch}
        idPrefix={idPrefix}
        namePrefix={namePrefix}
      />,
    )
    accordionBatch = []
  }

  items.forEach((item, index) => {
    if (isCollapsibleSection(item, collapsibleSections)) {
      accordionBatch.push({ item, index })
      return
    }
    flushAccordion()
    nodes.push(
      <FormItemNode
        key={formItemKey(item, index, namePrefix)}
        item={item}
        index={index}
        idPrefix={idPrefix}
        namePrefix={namePrefix}
        depth={0}
      />,
    )
  })
  flushAccordion()

  return <>{nodes}</>
}

export { NestedFormItems } from './form-item-node.client'

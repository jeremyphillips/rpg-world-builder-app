'use client'

import * as React from 'react'

import { FormSectionContext } from '../context/form-section.context'
import type { FormItem, RowConfig } from '../field-config'
import { NestedFormItems } from './form-item-node.client'

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
}

/** Renders an ordered list of fields/rows/groups/arrays, recursing into containers. */
export function FormItems({ items, idPrefix, namePrefix }: FormItemsProps) {
  const { depth } = React.useContext(FormSectionContext)

  return <NestedFormItems items={items} idPrefix={idPrefix} namePrefix={namePrefix} depth={depth} />
}

export { NestedFormItems } from './form-item-node.client'

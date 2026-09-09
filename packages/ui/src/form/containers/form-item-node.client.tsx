'use client'

import { isContainer, type FormItem, type RowConfig } from '../field-config'
import { useFormSectionContext } from '../context/form-section.context'
import { FieldNode } from './form-conditional.client'
import { ConditionalGroup, GroupFieldSection } from './form-group-section.client'
import { ConditionalRow, RowFieldSection } from './form-row-section.client'
import { ColumnsFieldSection, ConditionalColumns } from './form-columns-section.client'
import {
  ConditionalDependent,
  DependentSection,
  type RenderNestedFormItemsProps,
} from './form-dependent-section.client'
import { ArrayFormItemSection } from '../renderers/array/array-form-item-section.client'
import { ConditionalArrayField } from '../renderers/array/conditional-array-field.client'
import { SlotFormItemSection } from '../renderers/fields/slot-field-renderer.client'

export interface NestedFormItemsProps {
  items: Array<FormItem | RowConfig>
  idPrefix: string
  namePrefix?: string
  depth: number
}

/** Package-internal: renders nested field lists inside groups, stacks, and array items. */
export function NestedFormItems({ items, idPrefix, namePrefix, depth }: NestedFormItemsProps) {
  return (
    <>
      {items.map((item, index) => (
        <FormItemNode
          key={formItemKey(item, index, namePrefix)}
          item={item}
          index={index}
          idPrefix={idPrefix}
          namePrefix={namePrefix}
          depth={depth}
        />
      ))}
    </>
  )
}

function renderNestedFormItems(props: RenderNestedFormItemsProps) {
  return <NestedFormItems {...props} />
}

interface FormItemNodeProps {
  item: FormItem | RowConfig
  index: number
  idPrefix: string
  namePrefix?: string
  depth: number
}

export function FormItemNode({ item, index, idPrefix, namePrefix, depth }: FormItemNodeProps) {
  const parentContext = useFormSectionContext()

  if (!isContainer(item)) {
    return <FieldNode config={item} idPrefix={idPrefix} namePrefix={namePrefix} />
  }

  if (item.kind === 'row') {
    if (item.visibility) {
      return (
        <ConditionalRow
          item={item}
          index={index}
          idPrefix={idPrefix}
          namePrefix={namePrefix}
          depth={depth}
        />
      )
    }
    return (
      <RowFieldSection
        item={item}
        index={index}
        idPrefix={idPrefix}
        namePrefix={namePrefix}
        depth={depth}
      />
    )
  }

  if (item.kind === 'group') {
    if (item.visibility) {
      return (
        <ConditionalGroup
          item={item}
          idPrefix={idPrefix}
          namePrefix={namePrefix}
          depth={depth}
          renderNestedItems={renderNestedFormItems}
        />
      )
    }
    return (
      <GroupFieldSection
        item={item}
        idPrefix={idPrefix}
        namePrefix={namePrefix}
        depth={depth}
        renderNestedItems={renderNestedFormItems}
      />
    )
  }

  if (item.kind === 'columns') {
    if (item.visibility) {
      return (
        <ConditionalColumns
          item={item}
          idPrefix={idPrefix}
          namePrefix={namePrefix}
          depth={depth}
          renderNestedItems={renderNestedFormItems}
        />
      )
    }
    return (
      <ColumnsFieldSection
        item={item}
        idPrefix={idPrefix}
        namePrefix={namePrefix}
        depth={depth}
        renderNestedItems={renderNestedFormItems}
      />
    )
  }

  if (item.kind === 'dependent') {
    if (item.visibility) {
      return (
        <ConditionalDependent
          item={item}
          idPrefix={idPrefix}
          namePrefix={namePrefix}
          depth={depth}
          renderNestedItems={renderNestedFormItems}
        />
      )
    }
    return (
      <DependentSection
        item={item}
        idPrefix={idPrefix}
        namePrefix={namePrefix}
        depth={depth}
        renderNestedItems={renderNestedFormItems}
      />
    )
  }

  if (item.kind === 'slot') {
    return (
      <SlotFormItemSection
        item={item}
        parentContext={parentContext}
        depth={depth}
        namePrefix={namePrefix}
      />
    )
  }

  if (item.visibility) {
    return (
      <ConditionalArrayField
        config={item}
        idPrefix={idPrefix}
        namePrefix={namePrefix}
        depth={depth}
      />
    )
  }

  return (
    <ArrayFormItemSection
      item={item}
      parentContext={parentContext}
      idPrefix={idPrefix}
      namePrefix={namePrefix}
      depth={depth}
    />
  )
}

function prefixFormItemKey(namePrefix: string | undefined, key: string): string {
  return namePrefix ? `${namePrefix}.${key}` : key
}

const UNNAMED_CONTAINER_KEY_PREFIX = {
  group: true,
  columns: true,
  dependent: true,
  row: true,
} as const

export function formItemKey(
  item: FormItem | RowConfig,
  index: number,
  namePrefix?: string,
): string {
  if ('name' in item && typeof item.name === 'string') {
    const leafType = 'type' in item && typeof item.type === 'string' ? item.type : undefined
    const key = leafType ? `${item.name}-${leafType}-${index}` : `${item.name}-${index}`
    return prefixFormItemKey(namePrefix, key)
  }

  if ('kind' in item && item.kind in UNNAMED_CONTAINER_KEY_PREFIX) {
    return prefixFormItemKey(namePrefix, `${item.kind}-${index}`)
  }

  return String(index)
}

export type { RenderNestedFormItemsProps } from './form-dependent-section.client'

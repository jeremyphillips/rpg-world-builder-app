'use client'

import {
  isContainer,
  type ArrayConfig,
  type ColumnsConfig,
  type DependentConfig,
  type FormItem,
  type GroupConfig,
  type RowConfig,
  type SlotConfig,
} from '../field-config'
import {
  useFormSectionContext,
  type FormSectionContextValue,
} from '../context/form-section.context'
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

type SharedNodeProps = Pick<FormItemNodeProps, 'idPrefix' | 'namePrefix' | 'depth'>

function renderRowNode(item: RowConfig, index: number, shared: SharedNodeProps) {
  if (item.visibility) {
    return <ConditionalRow item={item} index={index} {...shared} />
  }
  return <RowFieldSection item={item} index={index} {...shared} />
}

function renderGroupNode(item: GroupConfig, shared: SharedNodeProps) {
  if (item.visibility) {
    return <ConditionalGroup item={item} renderNestedItems={renderNestedFormItems} {...shared} />
  }
  return <GroupFieldSection item={item} renderNestedItems={renderNestedFormItems} {...shared} />
}

function renderColumnsNode(item: ColumnsConfig, shared: SharedNodeProps) {
  if (item.visibility) {
    return <ConditionalColumns item={item} renderNestedItems={renderNestedFormItems} {...shared} />
  }
  return <ColumnsFieldSection item={item} renderNestedItems={renderNestedFormItems} {...shared} />
}

function renderDependentNode(item: DependentConfig, shared: SharedNodeProps) {
  if (item.visibility) {
    return (
      <ConditionalDependent item={item} renderNestedItems={renderNestedFormItems} {...shared} />
    )
  }
  return <DependentSection item={item} renderNestedItems={renderNestedFormItems} {...shared} />
}

function renderSlotNode(
  item: SlotConfig,
  parentContext: FormSectionContextValue,
  shared: SharedNodeProps,
) {
  return (
    <SlotFormItemSection
      item={item}
      parentContext={parentContext}
      depth={shared.depth}
      namePrefix={shared.namePrefix}
    />
  )
}

function renderArrayNode(
  item: ArrayConfig,
  parentContext: FormSectionContextValue,
  shared: SharedNodeProps,
) {
  if (item.visibility) {
    return <ConditionalArrayField config={item} {...shared} />
  }
  return <ArrayFormItemSection item={item} parentContext={parentContext} {...shared} />
}

export function FormItemNode({ item, index, idPrefix, namePrefix, depth }: FormItemNodeProps) {
  const parentContext = useFormSectionContext()

  if (!isContainer(item)) {
    return <FieldNode config={item} idPrefix={idPrefix} namePrefix={namePrefix} />
  }

  const shared = { idPrefix, namePrefix, depth }

  if (item.kind === 'row') return renderRowNode(item, index, shared)
  if (item.kind === 'group') return renderGroupNode(item, shared)
  if (item.kind === 'columns') return renderColumnsNode(item, shared)
  if (item.kind === 'dependent') return renderDependentNode(item, shared)
  if (item.kind === 'slot') return renderSlotNode(item, parentContext, shared)
  return renderArrayNode(item, parentContext, shared)
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

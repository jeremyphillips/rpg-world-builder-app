'use client'

import * as React from 'react'

import {
  FormSectionContext,
  useFormSectionContext,
  type FormSectionContextValue,
} from '../../context/form-section.context'
import type { SlotConfig } from '../../field-config'
import {
  useVisibilityValues,
  FieldSeparatorWrapper,
} from '../../containers/form-conditional.client'
import { buildSlotSectionChildContext } from '../../containers/form-section-child-context.lib'
import { buildSlotFieldBody, wrapSlotFieldBody } from './slot-field-renderer.lib'

export interface SlotFieldRendererProps {
  config: SlotConfig
  /** Sibling-stack rhythm for trailing separators — slots default child context to compact. */
  stackRhythm?: FormSectionContextValue['rhythm']
  /** Sibling-stack size for field chrome padding — slots default child context to `sm`. */
  stackSize?: FormSectionContextValue['size']
}

/** Renders custom form UI supplied by the field config inside `FormProvider`. */
export function SlotFieldRenderer({ config, stackRhythm, stackSize }: SlotFieldRendererProps) {
  const { rhythm, size } = useFormSectionContext()
  const content = config.render()
  const chromeSize = stackSize ?? size

  const body = buildSlotFieldBody(config, content, rhythm, size)
  if (body == null) return null

  return (
    <FieldSeparatorWrapper separator={config.separator} rhythm={stackRhythm}>
      {wrapSlotFieldBody(body, config, chromeSize)}
    </FieldSeparatorWrapper>
  )
}

interface SlotFormItemSectionProps {
  item: SlotConfig
  parentContext: FormSectionContextValue
  depth: number
  namePrefix?: string
}

function SlotFormItemSectionInner({ item, parentContext, depth }: SlotFormItemSectionProps) {
  const slotChildContext = React.useMemo(
    () => buildSlotSectionChildContext(parentContext, depth, item),
    [parentContext, depth, item],
  )

  return (
    <FormSectionContext.Provider value={slotChildContext}>
      <SlotFieldRenderer
        config={item}
        stackRhythm={parentContext.rhythm}
        stackSize={parentContext.size}
      />
    </FormSectionContext.Provider>
  )
}

/** Hides a slot when its `visibility` predicate is false. */
export function ConditionalSlotFormItemSection(props: SlotFormItemSectionProps) {
  const values = useVisibilityValues(props.item.visibility!, props.namePrefix)
  if (!props.item.visibility!.visibleWhen(values)) return null
  return <SlotFormItemSectionInner {...props} />
}

export function SlotFormItemSection({
  item,
  parentContext,
  depth,
  namePrefix,
}: SlotFormItemSectionProps) {
  if (item.visibility) {
    return (
      <ConditionalSlotFormItemSection
        item={item}
        parentContext={parentContext}
        depth={depth}
        namePrefix={namePrefix}
      />
    )
  }

  return <SlotFormItemSectionInner item={item} parentContext={parentContext} depth={depth} />
}

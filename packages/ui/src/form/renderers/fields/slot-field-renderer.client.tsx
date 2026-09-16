'use client'

import * as React from 'react'

import {
  FormSectionContext,
  useFormSectionContext,
  type FormSectionContextValue,
} from '../../context/form-section.context'
import { useFieldRowParticipation } from '../../../components/ui/field-row-anatomy.context'
import { FieldChromeShell } from '../../../components/ui/field-chrome-shell'
import {
  hasActiveFieldChrome,
  resolveFieldChromeProps,
} from '../../../components/ui/field-chrome.variants'
import { resolveFormDensity } from '../../form-density'
import type { SlotConfig } from '../../field-config'
import {
  useVisibilityValues,
  FieldSeparatorWrapper,
} from '../../containers/form-conditional.client'
import { buildSlotSectionChildContext } from '../../containers/form-section-child-context.lib'
import { buildSlotFieldBody, wrapSlotFieldBody } from './slot-field-renderer.lib'

export interface SlotFieldRendererProps {
  config: SlotConfig
}

/** Renders custom form UI supplied by the field config inside `FormProvider`. */
export function SlotFieldRenderer({ config }: SlotFieldRendererProps) {
  const sectionContext = useFormSectionContext()
  const inAnatomyRow = useFieldRowParticipation()
  const { density } = sectionContext
  const { rhythm, size } = resolveFormDensity(density)
  const { chrome: resolvedChrome } = resolveFieldChromeProps(config, sectionContext)
  const content = config.render()

  if (inAnatomyRow) {
    if (content == null) return null
    const body = hasActiveFieldChrome(resolvedChrome) ? (
      <FieldChromeShell chrome={resolvedChrome} size={size}>
        {content}
      </FieldChromeShell>
    ) : (
      content
    )
    return (
      <FieldSeparatorWrapper separator={config.separator}>
        <div className="contents">{body}</div>
      </FieldSeparatorWrapper>
    )
  }

  const body = buildSlotFieldBody(config, content, rhythm, size)
  if (body == null) return null

  return (
    <FieldSeparatorWrapper separator={config.separator}>
      {wrapSlotFieldBody(body, config, size, resolvedChrome)}
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
    () => buildSlotSectionChildContext(parentContext, depth),
    [parentContext, depth],
  )

  return (
    <FormSectionContext.Provider value={slotChildContext}>
      <SlotFieldRenderer config={item} />
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

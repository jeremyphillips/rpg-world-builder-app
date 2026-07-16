'use client'

import * as React from 'react'

import { FieldGroup } from '../../components/ui/field-group'
import { fieldGroupDescriptionClasses } from '../../components/ui/field.variants'
import { Text } from '../../components/ui/text'
import {
  FormRhythmStack,
  FormSectionContext,
  useFormSectionContext,
  type FormSectionContextValue,
} from '../context/form-section.context'
import type { SlotConfig } from '../field-config'
import { useVisibilityValues } from '../containers/form-conditional.client'
import { buildSlotSectionChildContext } from '../containers/form-section-child-context.lib'

export interface SlotFieldRendererProps {
  config: SlotConfig
}

/** Renders custom form UI supplied by the field config inside `FormProvider`. */
export function SlotFieldRenderer({ config }: SlotFieldRendererProps) {
  const { rhythm, size } = useFormSectionContext()
  const content = config.render()

  if (config.label) {
    return (
      <FieldGroup
        legend={config.label}
        description={config.hint}
        rhythm={rhythm}
        size={size}
        className={config.className}
      >
        {content}
      </FieldGroup>
    )
  }

  return (
    <FormRhythmStack className={config.className}>
      {config.hint ? (
        <Text variant="small" className={fieldGroupDescriptionClasses}>
          {config.hint}
        </Text>
      ) : null}
      {content}
    </FormRhythmStack>
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

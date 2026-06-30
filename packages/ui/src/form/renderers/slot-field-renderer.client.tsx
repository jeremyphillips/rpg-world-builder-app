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
}

export function SlotFormItemSection({ item, parentContext, depth }: SlotFormItemSectionProps) {
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

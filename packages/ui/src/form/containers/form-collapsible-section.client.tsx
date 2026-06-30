'use client'

import * as React from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion.client'
import {
  DEFAULT_ARRAY_SECTION_RHYTHM,
  fieldGroupDescriptionClasses,
  fieldSetResetClasses,
  formSectionStackClasses,
  resolveFieldStackRhythm,
} from '../../components/ui/field.variants'
import { Text } from '../../components/ui/text'
import {
  FormRhythmStack,
  FormSectionContext,
  buildFormSectionChildContext,
  useFormSectionContext,
} from '../context/form-section.context'
import type { ArrayConfig, FormItem, GroupConfig } from '../field-config'
import { readAccordionBatchOpen, writeAccordionBatchOpen } from '../config/form-accordion-state'
import { buildArraySectionChildContext } from './form-section-child-context.lib'
import { ArrayFieldRenderer } from '../renderers/array-field-renderer.client'
import { NestedFormItems } from './form-item-node.client'

export function isSectionItem(item: FormItem): item is GroupConfig | ArrayConfig {
  return 'kind' in item && (item.kind === 'group' || item.kind === 'array')
}

export function getSectionValue(item: GroupConfig | ArrayConfig, index: number): string {
  return item.kind === 'array' ? `array-${item.name}` : `group-${index}`
}

export function isCollapsibleSection(
  item: FormItem,
  collapsibleSections: boolean,
): item is GroupConfig | ArrayConfig {
  if (!collapsibleSections || !isSectionItem(item)) return false
  return item.collapsible === true
}

interface FormAccordionBatchProps {
  batchKey: string
  sections: Array<{ item: GroupConfig | ArrayConfig; index: number }>
  idPrefix: string
  namePrefix?: string
}

/** Accordion batch; open state is controlled and persisted to survive remounts. */
export function FormAccordionBatch({
  batchKey,
  sections,
  idPrefix,
  namePrefix,
}: FormAccordionBatchProps) {
  const defaultOpen = React.useMemo(
    () => sections.map(({ item, index }) => getSectionValue(item, index)),
    [sections],
  )

  const [openValues, setOpenValues] = React.useState(() =>
    readAccordionBatchOpen(batchKey, defaultOpen),
  )

  const handleValueChange = React.useCallback(
    (next: string[]) => {
      writeAccordionBatchOpen(batchKey, next)
      setOpenValues(next)
    },
    [batchKey],
  )

  return (
    <Accordion
      type="multiple"
      value={openValues}
      onValueChange={handleValueChange}
      variant="section"
      className={formSectionStackClasses}
    >
      {sections.map(({ item, index }) => (
        <CollapsibleFormSection
          key={getSectionValue(item, index)}
          item={item}
          index={index}
          idPrefix={idPrefix}
          namePrefix={namePrefix}
        />
      ))}
    </Accordion>
  )
}

interface CollapsibleFormSectionProps {
  item: GroupConfig | ArrayConfig
  index: number
  idPrefix: string
  namePrefix?: string
}

export function CollapsibleFormSection({
  item,
  index,
  idPrefix,
  namePrefix,
}: CollapsibleFormSectionProps) {
  const parentContext = useFormSectionContext()
  const sectionRhythm =
    item.kind === 'array'
      ? resolveFieldStackRhythm({
          explicit: item.rhythm,
          inherited: parentContext.rhythm,
          sectionDefault: DEFAULT_ARRAY_SECTION_RHYTHM,
        })
      : resolveFieldStackRhythm({ explicit: item.rhythm, inherited: parentContext.rhythm })
  const childContext = React.useMemo(
    () =>
      item.kind === 'array'
        ? buildArraySectionChildContext(parentContext, 0, item)
        : buildFormSectionChildContext(parentContext, 0, { rhythm: sectionRhythm }),
    [parentContext, item, sectionRhythm],
  )
  const sectionValue = getSectionValue(item, index)
  const triggerId = `${idPrefix}-${sectionValue}-trigger`

  return (
    <AccordionItem value={sectionValue} variant="section">
      <AccordionTrigger id={triggerId} variant="section">
        {item.legend}
      </AccordionTrigger>
      <AccordionContent forceMount>
        {'description' in item && item.description ? (
          <Text variant="small" className={fieldGroupDescriptionClasses}>
            {item.description}
          </Text>
        ) : null}
        {item.kind === 'group' ? (
          <fieldset aria-labelledby={triggerId} className={fieldSetResetClasses}>
            <legend className="sr-only">{item.legend}</legend>
            <FormRhythmStack rhythm={sectionRhythm}>
              <FormSectionContext.Provider value={childContext}>
                <NestedFormItems
                  items={item.fields}
                  idPrefix={idPrefix}
                  namePrefix={namePrefix}
                  depth={1}
                />
              </FormSectionContext.Provider>
            </FormRhythmStack>
          </fieldset>
        ) : (
          <FormSectionContext.Provider value={childContext}>
            <ArrayFieldRenderer
              config={item}
              idPrefix={idPrefix}
              fullName={namePrefix ? `${namePrefix}.${item.name}` : item.name}
              labelledBy={triggerId}
              hideLegend
            />
          </FormSectionContext.Provider>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

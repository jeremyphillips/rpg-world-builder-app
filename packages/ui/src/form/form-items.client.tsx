'use client'

import * as React from 'react'
import { useFieldArray, useWatch } from 'react-hook-form'

import { cn } from '../lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion.client'
import { Button } from '../components/ui/button.client'
import { FieldGroup } from '../components/ui/field-group'
import { FieldRow } from '../components/ui/field-row'
import {
  fieldArrayItemActionsClasses,
  fieldGroupDescriptionClasses,
  fieldGroupLegendVariants,
  fieldGroupStackClasses,
  formSectionStackClasses,
} from '../components/ui/field.variants'
import { Text } from '../components/ui/text'
import { FieldRenderer } from './field-renderer.client'
import { FormSectionContext } from './form-section-context.client'
import {
  buildItemDefaultValues,
  isContainer,
  type ArrayConfig,
  type FormItem,
  type GroupConfig,
  type RowConfig,
  type FieldConfig,
} from './field-config'
import {
  buildAccordionBatchKey,
  readAccordionBatchOpen,
  writeAccordionBatchOpen,
} from './form-accordion-state'

export interface FormItemsProps {
  items: Array<FormItem | RowConfig>
  idPrefix: string
  /**
   * Dotted path prefix for array item fields (e.g. `"traits.0"`). Passed down
   * so leaf renderers and conditional watchers resolve to the correct RHF names.
   */
  namePrefix?: string
}

function isSectionItem(item: FormItem): item is GroupConfig | ArrayConfig {
  return 'kind' in item && (item.kind === 'group' || item.kind === 'array')
}

function getSectionValue(item: GroupConfig | ArrayConfig, index: number): string {
  return item.kind === 'array' ? `array-${item.name}` : `group-${index}`
}

function isCollapsibleSection(
  item: FormItem,
  collapsibleSections: boolean,
): item is GroupConfig | ArrayConfig {
  if (!collapsibleSections || !isSectionItem(item)) return false
  return item.collapsible !== false
}

/** Renders an ordered list of fields/rows/groups/arrays, recursing into containers. */
export function FormItems({ items, idPrefix, namePrefix }: FormItemsProps) {
  const { collapsibleSections, depth } = React.useContext(FormSectionContext)

  if (depth === 0) {
    return (
      <TopLevelFormItems
        items={items}
        idPrefix={idPrefix}
        namePrefix={namePrefix}
        collapsibleSections={collapsibleSections}
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

interface FormAccordionBatchProps {
  batchKey: string
  sections: Array<{ item: GroupConfig | ArrayConfig; index: number }>
  idPrefix: string
  namePrefix?: string
}

/** Accordion batch; open state is controlled and persisted to survive remounts. */
function FormAccordionBatch({ batchKey, sections, idPrefix, namePrefix }: FormAccordionBatchProps) {
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

interface NestedFormItemsProps {
  items: Array<FormItem | RowConfig>
  idPrefix: string
  namePrefix?: string
  depth: number
}

function NestedFormItems({ items, idPrefix, namePrefix, depth }: NestedFormItemsProps) {
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

function prefixFormItemKey(namePrefix: string | undefined, key: string): string {
  return namePrefix ? `${namePrefix}.${key}` : key
}

function formItemKey(item: FormItem | RowConfig, index: number, namePrefix?: string): string {
  if ('name' in item && typeof item.name === 'string') {
    return prefixFormItemKey(namePrefix, item.name)
  }

  if (!('kind' in item)) return String(index)

  switch (item.kind) {
    case 'group':
      return prefixFormItemKey(namePrefix, `group-${index}`)
    case 'row':
      return prefixFormItemKey(namePrefix, `row-${index}`)
    default:
      return String(index)
  }
}

interface FormItemNodeProps {
  item: FormItem | RowConfig
  index: number
  idPrefix: string
  namePrefix?: string
  depth: number
}

function FormItemNode({ item, index, idPrefix, namePrefix, depth }: FormItemNodeProps) {
  const childContext = React.useMemo(
    () => ({ collapsibleSections: false, depth: depth + 1 }),
    [depth],
  )

  if (!isContainer(item)) {
    return <FieldNode config={item} idPrefix={idPrefix} namePrefix={namePrefix} />
  }

  if (item.kind === 'row') {
    return (
      <FieldRow key={`row-${index}`} className={item.className}>
        {item.fields.map((field) => (
          <FieldNode
            key={namePrefix ? `${namePrefix}.${field.name}` : field.name}
            config={field}
            idPrefix={idPrefix}
            namePrefix={namePrefix}
          />
        ))}
      </FieldRow>
    )
  }

  if (item.kind === 'group') {
    return (
      <FieldGroup legend={item.legend} description={item.description} className={item.className}>
        <FormSectionContext.Provider value={childContext}>
          <NestedFormItems
            items={item.fields}
            idPrefix={idPrefix}
            namePrefix={namePrefix}
            depth={depth + 1}
          />
        </FormSectionContext.Provider>
      </FieldGroup>
    )
  }

  const fullArrayName = namePrefix ? `${namePrefix}.${item.name}` : item.name
  return (
    <FormSectionContext.Provider value={childContext}>
      <ArrayFieldRenderer config={item} idPrefix={idPrefix} fullName={fullArrayName} />
    </FormSectionContext.Provider>
  )
}

interface CollapsibleFormSectionProps {
  item: GroupConfig | ArrayConfig
  index: number
  idPrefix: string
  namePrefix?: string
}

function CollapsibleFormSection({
  item,
  index,
  idPrefix,
  namePrefix,
}: CollapsibleFormSectionProps) {
  const sectionValue = getSectionValue(item, index)
  const triggerId = `${idPrefix}-${sectionValue}-trigger`
  const childContext = React.useMemo(() => ({ collapsibleSections: false, depth: 1 }), [])

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
          <fieldset aria-labelledby={triggerId} className="min-w-0 border-0 p-0">
            <legend className="sr-only">{item.legend}</legend>
            <div className={fieldGroupStackClasses}>
              <FormSectionContext.Provider value={childContext}>
                <NestedFormItems
                  items={item.fields}
                  idPrefix={idPrefix}
                  namePrefix={namePrefix}
                  depth={1}
                />
              </FormSectionContext.Provider>
            </div>
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

interface FieldNodeProps {
  config: FieldConfig
  idPrefix: string
  namePrefix?: string
}

/** Routes a field to the conditional wrapper when it declares `visibility`. */
function FieldNode({ config, idPrefix, namePrefix }: FieldNodeProps) {
  if (config.visibility) {
    return <ConditionalField config={config} idPrefix={idPrefix} namePrefix={namePrefix} />
  }
  return <FieldRenderer config={config} idPrefix={idPrefix} namePrefix={namePrefix} />
}

/**
 * Subscribes to *only* the field's `dependsOn` values via `useWatch`, so a change
 * elsewhere never re-renders this field. With the form's `shouldUnregister`, the
 * control unmounts (and its value clears) while hidden.
 *
 * When `namePrefix` is set (inside an array item), `dependsOn` names are resolved
 * relative to the item — e.g. `['type']` watches `traits.0.type` — so the
 * `visibleWhen` predicate still uses simple relative names like `values.type`.
 */
function ConditionalField({ config, idPrefix, namePrefix }: FieldNodeProps) {
  const { dependsOn, visibleWhen } = config.visibility!
  const prefixedDeps = namePrefix ? dependsOn.map((dep) => `${namePrefix}.${dep}`) : dependsOn
  const watched = useWatch({ name: prefixedDeps }) as unknown[]
  const values: Record<string, unknown> = {}
  dependsOn.forEach((name, index) => {
    values[name] = watched[index]
  })
  if (!visibleWhen(values)) return null
  return <FieldRenderer config={config} idPrefix={idPrefix} namePrefix={namePrefix} />
}

export interface ArrayFieldRendererProps {
  config: ArrayConfig
  idPrefix: string
  /** Resolved full RHF field name for the array (e.g. `"traits"` or `"root.0.traits"`). */
  fullName: string
  /** When set, the visible legend is omitted (e.g. accordion trigger labels the section). */
  hideLegend?: boolean
  /** Associates the fieldset with an external heading when `hideLegend` is true. */
  labelledBy?: string
}

/**
 * Renders a repeatable array of field groups backed by RHF's `useFieldArray`.
 * Each item renders as a `<fieldset>` with the item's fields, plus Remove/Move
 * controls. An "Add" button appends a new item with type-appropriate defaults.
 *
 * Must be rendered inside a `FormProvider`.
 */
export function ArrayFieldRenderer({
  config,
  idPrefix,
  fullName,
  hideLegend = false,
  labelledBy,
}: ArrayFieldRendererProps) {
  const { fields, append, remove, move } = useFieldArray({ name: fullName })
  const { addLabel = 'Add item', min = 0, max, legend, itemTitle } = config

  const canRemove = fields.length > min
  const canAdd = max === undefined || fields.length < max

  const itemDefaults = buildItemDefaultValues(config.fields)

  return (
    <fieldset
      className="min-w-0 border-0 p-0"
      aria-labelledby={hideLegend ? labelledBy : undefined}
    >
      {hideLegend ? (
        <legend className="sr-only">{legend}</legend>
      ) : (
        <legend className={fieldGroupLegendVariants()}>{legend}</legend>
      )}
      <div className={fieldGroupStackClasses}>
        {fields.map((rhfField, index) => {
          const itemPrefix = `${fullName}.${index}`
          const title = itemTitle
            ? itemTitle(rhfField as unknown as Record<string, unknown>, index)
            : undefined

          return (
            <fieldset
              key={rhfField.id}
              className="rounded-md border border-border p-4"
              aria-label={title ?? `${legend} item ${index + 1}`}
            >
              {title ? (
                <legend className="px-1 text-xs text-muted-foreground">{title}</legend>
              ) : null}
              <div className={fieldGroupStackClasses}>
                <FormItems items={config.fields} idPrefix={idPrefix} namePrefix={itemPrefix} />
              </div>
              <div className={cn('flex items-center gap-2', fieldArrayItemActionsClasses)}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  aria-label={`Move ${legend} item ${index + 1} up`}
                >
                  ↑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                  aria-label={`Move ${legend} item ${index + 1} down`}
                >
                  ↓
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canRemove}
                  onClick={() => remove(index)}
                  aria-label={`Remove ${legend} item ${index + 1}`}
                >
                  Remove
                </Button>
              </div>
            </fieldset>
          )
        })}
        {canAdd ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => append(itemDefaults)}
            aria-label={addLabel}
          >
            {addLabel}
          </Button>
        ) : null}
      </div>
    </fieldset>
  )
}

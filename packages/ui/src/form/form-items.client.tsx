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
  fieldArrayItemActionRowClasses,
  fieldArrayItemClasses,
  fieldGroupBottomMarginClasses,
  fieldGroupDescriptionClasses,
  fieldGroupLegendVariants,
  fieldGroupStackClasses,
  fieldSeparatorVariants,
  fieldStackRhythmVariants,
  fieldToggleDependentIndentClasses,
  formSectionStackClasses,
  fieldSetResetClasses,
  type FieldSeparator,
  type FieldStackRhythm,
} from '../components/ui/field.variants'
import { fieldStackDependentsChromeVariants } from '../components/ui/field-stack.variants'
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
  type StackConfig,
  type FieldConfig,
  type GroupFieldItem,
  type SlotConfig,
  type SwitchFieldConfig,
  type FieldVisibility,
} from './field-config'
import {
  buildAccordionBatchKey,
  readAccordionBatchOpen,
  writeAccordionBatchOpen,
} from './form-accordion-state'
import { useDependsOnValues } from './form-depends-on.client'

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
  return item.collapsible === true
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
    case 'stack':
      return prefixFormItemKey(namePrefix, `stack-${index}`)
    case 'row':
      return prefixFormItemKey(namePrefix, `row-${index}`)
    case 'slot':
      return prefixFormItemKey(namePrefix, item.name)
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
    if (item.visibility) {
      return (
        <ConditionalRow item={item} index={index} idPrefix={idPrefix} namePrefix={namePrefix} />
      )
    }
    return <RowFieldSection item={item} index={index} idPrefix={idPrefix} namePrefix={namePrefix} />
  }

  if (item.kind === 'group') {
    if (item.visibility) {
      return (
        <ConditionalGroup item={item} idPrefix={idPrefix} namePrefix={namePrefix} depth={depth} />
      )
    }
    return (
      <GroupFieldSection item={item} idPrefix={idPrefix} namePrefix={namePrefix} depth={depth} />
    )
  }

  if (item.kind === 'stack') {
    if (item.visibility) {
      return (
        <ConditionalStack item={item} idPrefix={idPrefix} namePrefix={namePrefix} depth={depth} />
      )
    }
    return <StackSection item={item} idPrefix={idPrefix} namePrefix={namePrefix} depth={depth} />
  }

  if (item.kind === 'slot') {
    return (
      <FormSectionContext.Provider value={childContext}>
        <SlotFieldRenderer config={item} />
      </FormSectionContext.Provider>
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
          <fieldset aria-labelledby={triggerId} className={fieldSetResetClasses}>
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

/** Watches `dependsOn` fields and returns a map keyed by relative field names. */
function useVisibilityValues(
  visibility: FieldVisibility,
  namePrefix?: string,
): Record<string, unknown> {
  return useDependsOnValues(visibility.dependsOn, namePrefix)
}

/** Applies an optional trailing divider wrapper around a leaf field or row. */
function withFieldSeparator(separator: FieldSeparator | undefined, content: React.ReactNode) {
  if (!separator) return content
  return (
    <div data-field-separator="" className={fieldSeparatorVariants({ tone: separator })}>
      {content}
    </div>
  )
}

/** Routes a field to the conditional wrapper when it declares `visibility`. */
function FieldNode({ config, idPrefix, namePrefix }: FieldNodeProps) {
  if (config.visibility) {
    return <ConditionalField config={config} idPrefix={idPrefix} namePrefix={namePrefix} />
  }
  return withFieldSeparator(
    config.separator,
    <FieldRenderer config={config} idPrefix={idPrefix} namePrefix={namePrefix} />,
  )
}

interface GroupFieldSectionProps {
  item: GroupConfig
  idPrefix: string
  namePrefix?: string
  depth: number
}

function GroupFieldSection({ item, idPrefix, namePrefix, depth }: GroupFieldSectionProps) {
  const childContext = React.useMemo(
    () => ({ collapsibleSections: false, depth: depth + 1 }),
    [depth],
  )

  return (
    <FieldGroup
      legend={item.legend}
      legendSize={item.legendSize}
      description={item.description}
      className={item.className}
    >
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

interface ConditionalGroupProps {
  item: GroupConfig
  idPrefix: string
  namePrefix?: string
  depth: number
}

/** Hides a nested group when its `visibility` predicate is false. */
function ConditionalGroup({ item, idPrefix, namePrefix, depth }: ConditionalGroupProps) {
  const values = useVisibilityValues(item.visibility!, namePrefix)
  if (!item.visibility!.visibleWhen(values)) return null
  return <GroupFieldSection item={item} idPrefix={idPrefix} namePrefix={namePrefix} depth={depth} />
}

function isLeafSwitch(item: GroupFieldItem): item is SwitchFieldConfig {
  return !('kind' in item) && item.type === 'switch'
}

function buildFieldControlId(
  idPrefix: string,
  namePrefix: string | undefined,
  fieldName: string,
): string {
  const fullName = namePrefix ? `${namePrefix}.${fieldName}` : fieldName
  return `${idPrefix}-${fullName.replaceAll('.', '-')}`
}

interface RowFieldSectionProps {
  item: RowConfig
  index: number
  idPrefix: string
  namePrefix?: string
}

function RowFieldSection({ item, index, idPrefix, namePrefix }: RowFieldSectionProps) {
  return (
    <React.Fragment key={`row-${index}`}>
      {withFieldSeparator(
        item.separator,
        <FieldRow layout={item.layout} className={item.className}>
          {item.fields.map((field) => (
            <FieldNode
              key={namePrefix ? `${namePrefix}.${field.name}` : field.name}
              config={field}
              idPrefix={idPrefix}
              namePrefix={namePrefix}
            />
          ))}
        </FieldRow>,
      )}
    </React.Fragment>
  )
}

interface ConditionalRowProps {
  item: RowConfig
  index: number
  idPrefix: string
  namePrefix?: string
}

/** Hides a schema row when its `visibility` predicate is false. */
function ConditionalRow({ item, index, idPrefix, namePrefix }: ConditionalRowProps) {
  const values = useVisibilityValues(item.visibility!, namePrefix)
  if (!item.visibility!.visibleWhen(values)) return null
  return <RowFieldSection item={item} index={index} idPrefix={idPrefix} namePrefix={namePrefix} />
}

interface StackSectionProps {
  item: StackConfig
  idPrefix: string
  namePrefix?: string
  depth: number
}

/** Layout-only stack; toggle-dependent preset splits the switch from indented dependents. */
function StackSection({ item, idPrefix, namePrefix, depth }: StackSectionProps) {
  const childContext = React.useMemo(
    () => ({ collapsibleSections: false, depth: depth + 1 }),
    [depth],
  )
  const layout = item.layout ?? 'default'
  const rhythm = item.rhythm ?? 'compact'

  if (layout !== 'toggleDependent') {
    return (
      <div data-field-stack="" className={cn(fieldStackRhythmVariants({ rhythm }), item.className)}>
        <FormSectionContext.Provider value={childContext}>
          <NestedFormItems
            items={item.fields}
            idPrefix={idPrefix}
            namePrefix={namePrefix}
            depth={depth + 1}
          />
        </FormSectionContext.Provider>
      </div>
    )
  }

  const [first, ...dependents] = item.fields
  const toggleSwitch = first && isLeafSwitch(first) ? first : null
  const groupLabelledBy = toggleSwitch
    ? buildFieldControlId(idPrefix, namePrefix, toggleSwitch.name)
    : undefined

  return (
    <div
      data-field-stack=""
      role={groupLabelledBy ? 'group' : undefined}
      aria-labelledby={groupLabelledBy}
      className={cn(fieldStackRhythmVariants({ rhythm }), item.className)}
    >
      <FormSectionContext.Provider value={childContext}>
        {first ? (
          isContainer(first) ? (
            <FormItemNode
              item={first}
              index={0}
              idPrefix={idPrefix}
              namePrefix={namePrefix}
              depth={depth + 1}
            />
          ) : (
            <FieldNode config={first} idPrefix={idPrefix} namePrefix={namePrefix} />
          )
        ) : null}
        <StackDependentsRegion
          toggleSwitch={toggleSwitch}
          dependentsChrome={item.dependentsChrome}
          rhythm={rhythm}
          dependents={dependents}
          idPrefix={idPrefix}
          namePrefix={namePrefix}
          depth={depth}
        />
      </FormSectionContext.Provider>
    </div>
  )
}

interface StackDependentsRegionProps {
  toggleSwitch: SwitchFieldConfig | null
  dependentsChrome?: StackConfig['dependentsChrome']
  rhythm: FieldStackRhythm
  dependents: GroupFieldItem[]
  idPrefix: string
  namePrefix?: string
  depth: number
}

/** Indented dependents region with optional chrome; hidden while the gate switch is off. */
function StackDependentsRegion({
  toggleSwitch,
  dependentsChrome,
  rhythm,
  dependents,
  idPrefix,
  namePrefix,
  depth,
}: StackDependentsRegionProps) {
  const switchFieldName = toggleSwitch
    ? namePrefix
      ? `${namePrefix}.${toggleSwitch.name}`
      : toggleSwitch.name
    : ''
  const switchOn = useWatch({
    name: switchFieldName,
    disabled: !toggleSwitch,
  })

  if (dependents.length === 0) return null
  if (toggleSwitch && !switchOn) return null

  const dependentsContent = (
    <NestedFormItems
      items={dependents}
      idPrefix={idPrefix}
      namePrefix={namePrefix}
      depth={depth + 1}
    />
  )

  return (
    <div className={fieldToggleDependentIndentClasses} data-field-stack-dependents="">
      {dependentsChrome ? (
        <div
          className={cn(
            fieldStackRhythmVariants({ rhythm }),
            fieldStackDependentsChromeVariants({ tone: dependentsChrome }),
          )}
        >
          {dependentsContent}
        </div>
      ) : (
        <div className={fieldStackRhythmVariants({ rhythm })}>{dependentsContent}</div>
      )}
    </div>
  )
}

interface ConditionalStackProps {
  item: StackConfig
  idPrefix: string
  namePrefix?: string
  depth: number
}

/** Hides a stack when its `visibility` predicate is false. */
function ConditionalStack({ item, idPrefix, namePrefix, depth }: ConditionalStackProps) {
  const values = useVisibilityValues(item.visibility!, namePrefix)
  if (!item.visibility!.visibleWhen(values)) return null
  return <StackSection item={item} idPrefix={idPrefix} namePrefix={namePrefix} depth={depth} />
}

interface ConditionalArrayFieldProps {
  config: ArrayConfig
  idPrefix: string
  namePrefix?: string
  depth: number
}

/** Hides a nested array when its `visibility` predicate is false. */
function ConditionalArrayField({
  config,
  idPrefix,
  namePrefix,
  depth,
}: ConditionalArrayFieldProps) {
  const values = useVisibilityValues(config.visibility!, namePrefix)
  const childContext = React.useMemo(
    () => ({ collapsibleSections: false, depth: depth + 1 }),
    [depth],
  )

  if (!config.visibility!.visibleWhen(values)) return null

  const fullArrayName = namePrefix ? `${namePrefix}.${config.name}` : config.name

  return (
    <FormSectionContext.Provider value={childContext}>
      <ArrayFieldRenderer config={config} idPrefix={idPrefix} fullName={fullArrayName} />
    </FormSectionContext.Provider>
  )
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
  const values = useVisibilityValues(config.visibility!, namePrefix)
  if (!config.visibility!.visibleWhen(values)) return null
  return withFieldSeparator(
    config.separator,
    <FieldRenderer config={config} idPrefix={idPrefix} namePrefix={namePrefix} />,
  )
}

export interface SlotFieldRendererProps {
  config: SlotConfig
}

/** Renders custom form UI supplied by the field config inside `FormProvider`. */
export function SlotFieldRenderer({ config }: SlotFieldRendererProps) {
  const content = config.render()

  if (config.label) {
    return (
      <FieldGroup legend={config.label} description={config.hint} className={config.className}>
        {content}
      </FieldGroup>
    )
  }

  return (
    <div className={cn(fieldGroupStackClasses, config.className)}>
      {config.hint ? (
        <Text variant="small" className={fieldGroupDescriptionClasses}>
          {config.hint}
        </Text>
      ) : null}
      {content}
    </div>
  )
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
  const { addLabel = 'Add item', min = 0, max, legend, legendSize = 'array', itemTitle } = config

  const canRemove = fields.length > min
  const canAdd = max === undefined || fields.length < max

  const itemDefaults = buildItemDefaultValues(config.fields)

  return (
    <fieldset
      className={cn(fieldSetResetClasses, fieldGroupBottomMarginClasses)}
      aria-labelledby={hideLegend ? labelledBy : undefined}
    >
      {hideLegend ? (
        <legend className="sr-only">{legend}</legend>
      ) : (
        <legend className={fieldGroupLegendVariants({ size: legendSize })}>{legend}</legend>
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
              className={fieldArrayItemClasses}
              aria-label={title ?? `${legend} item ${index + 1}`}
            >
              {title ? (
                <legend className="px-1 text-xs text-muted-foreground">{title}</legend>
              ) : null}
              <div className={fieldGroupStackClasses}>
                <FormItems
                  items={config.fields}
                  idPrefix={idPrefix}
                  namePrefix={itemPrefix}
                  plainSections
                />
              </div>
              <div className={fieldArrayItemActionRowClasses}>
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

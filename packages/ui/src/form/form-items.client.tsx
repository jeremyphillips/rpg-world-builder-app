'use client'

import { useWatch } from 'react-hook-form'

import { FieldGroup } from '../components/ui/field-group'
import { FieldRow } from '../components/ui/field-row'
import { FieldRenderer } from './field-renderer.client'
import { isContainer, type FieldConfig, type FormItem, type RowConfig } from './field-config'

export interface FormItemsProps {
  items: Array<FormItem | RowConfig>
  idPrefix: string
}

/** Renders an ordered list of fields/rows/groups, recursing into groups. */
export function FormItems({ items, idPrefix }: FormItemsProps) {
  return (
    <>
      {items.map((item, index) => {
        if (!isContainer(item)) {
          return <FieldNode key={item.name} config={item} idPrefix={idPrefix} />
        }
        if (item.kind === 'row') {
          return (
            <FieldRow key={`row-${index}`} className={item.className}>
              {item.fields.map((field) => (
                <FieldNode key={field.name} config={field} idPrefix={idPrefix} />
              ))}
            </FieldRow>
          )
        }
        return (
          <FieldGroup
            key={`group-${index}`}
            legend={item.legend}
            description={item.description}
            className={item.className}
          >
            <FormItems items={item.fields} idPrefix={idPrefix} />
          </FieldGroup>
        )
      })}
    </>
  )
}

interface FieldNodeProps {
  config: FieldConfig
  idPrefix: string
}

/** Routes a field to the conditional wrapper when it declares `visibility`. */
function FieldNode({ config, idPrefix }: FieldNodeProps) {
  if (config.visibility) {
    return <ConditionalField config={config} idPrefix={idPrefix} />
  }
  return <FieldRenderer config={config} idPrefix={idPrefix} />
}

/**
 * Subscribes to *only* the field's `dependsOn` values via `useWatch`, so a change
 * elsewhere never re-renders this field. With the form's `shouldUnregister`, the
 * control unmounts (and its value clears) while hidden.
 */
function ConditionalField({ config, idPrefix }: FieldNodeProps) {
  const { dependsOn, visibleWhen } = config.visibility!
  const watched = useWatch({ name: dependsOn }) as unknown[]
  const values: Record<string, unknown> = {}
  dependsOn.forEach((name, index) => {
    values[name] = watched[index]
  })
  if (!visibleWhen(values)) return null
  return <FieldRenderer config={config} idPrefix={idPrefix} />
}

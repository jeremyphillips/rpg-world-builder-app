import type { FilterCatalogLayoutConfig, FilterFieldId, FilterSchema } from './filter-schema.types'

const warnedKeys = new Set<string>()

function warnOnce(key: string, message: string) {
  if (process.env.NODE_ENV === 'production') return
  if (warnedKeys.has(key)) return
  warnedKeys.add(key)
  console.warn(message)
}

function formatFieldList(fieldIds: readonly string[]): string {
  return fieldIds.join(', ')
}

export function validateCatalogFilterLayout<TData, TState extends Record<string, unknown>>({
  componentName,
  schema,
  layout,
}: {
  componentName: string
  schema: FilterSchema<TData, TState>
  layout: FilterCatalogLayoutConfig<TState>
}) {
  if (process.env.NODE_ENV === 'production') return

  const schemaFieldIds = schema.fields.map((field) => field.id)
  const schemaFieldIdSet = new Set(schemaFieldIds)
  const availableFields = formatFieldList(schemaFieldIds)

  const duplicateSchemaIds = schemaFieldIds.filter(
    (fieldId, index) => schemaFieldIds.indexOf(fieldId) !== index,
  )
  if (duplicateSchemaIds.length > 0) {
    warnOnce(
      `${componentName}:duplicate-schema:${duplicateSchemaIds.join(',')}`,
      `${componentName}: duplicate field IDs in schema: ${formatFieldList([...new Set(duplicateSchemaIds)])}.`,
    )
  }

  const layoutGroups: Array<{
    name: string
    fieldIds: readonly FilterFieldId<TState>[] | undefined
  }> = [
    { name: 'primaryFieldIds', fieldIds: layout.primaryFieldIds },
    { name: 'filterRowFieldIds', fieldIds: layout.filterRowFieldIds },
  ]

  const layoutFieldIds: FilterFieldId<TState>[] = []

  for (const group of layoutGroups) {
    if (!group.fieldIds) continue

    const seenInGroup = new Set<FilterFieldId<TState>>()
    for (const fieldId of group.fieldIds) {
      if (!schemaFieldIdSet.has(fieldId)) {
        warnOnce(
          `${componentName}:unknown:${group.name}:${fieldId}`,
          `${componentName}: layout references "${fieldId}", but the current filter schema does not define it. Layout group: ${group.name}. Available fields: ${availableFields}.`,
        )
      }

      if (seenInGroup.has(fieldId)) {
        warnOnce(
          `${componentName}:duplicate-layout:${group.name}:${fieldId}`,
          `${componentName}: duplicate field ID "${fieldId}" in layout group ${group.name}.`,
        )
      }
      seenInGroup.add(fieldId)

      if (layoutFieldIds.includes(fieldId)) {
        warnOnce(
          `${componentName}:exclusive:${fieldId}`,
          `${componentName}: field "${fieldId}" appears in multiple layout groups. Each field should belong to one layout slot.`,
        )
      }
      layoutFieldIds.push(fieldId)
    }
  }

  if (layout.exhaustive) {
    const omitted = schemaFieldIds.filter((fieldId) => !layoutFieldIds.includes(fieldId))
    if (omitted.length > 0) {
      warnOnce(
        `${componentName}:exhaustive:${formatFieldList(omitted)}`,
        `${componentName}: layout is marked exhaustive but omits schema fields: ${formatFieldList(omitted)}. Available fields: ${availableFields}.`,
      )
    }
  }
}

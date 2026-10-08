import {
  CatalogFilterControls,
  type FilterCatalogLayoutConfig,
  type FilterFieldId,
  type FilterSchema,
} from '@rpg/ui/filters'

export type RelationshipCatalogFilterBandProps<TData, TState extends Record<string, unknown>> = {
  band: 'primary' | 'filterRow'
  schema: FilterSchema<TData, TState>
  layout: FilterCatalogLayoutConfig<TState>
  state: TState
  data: readonly TData[]
  idPrefix: string
  onValueChange: (
    id: FilterFieldId<TState>,
    value: TState[FilterFieldId<TState>] | undefined,
  ) => void
}

export function RelationshipCatalogFilterBand<TData, TState extends Record<string, unknown>>({
  band,
  schema,
  layout,
  state,
  data,
  idPrefix,
  onValueChange,
}: RelationshipCatalogFilterBandProps<TData, TState>) {
  const fieldIds = band === 'primary' ? layout.primaryFieldIds : layout.filterRowFieldIds
  const present = new Set(schema.fields.map((field) => field.id))
  if (!fieldIds?.some((fieldId) => present.has(fieldId))) return null

  const Controls =
    band === 'primary' ? CatalogFilterControls.Primary : CatalogFilterControls.FilterRow

  return (
    <Controls
      schema={schema}
      layout={layout}
      state={state}
      data={data}
      idPrefix={idPrefix}
      onValueChange={onValueChange}
    />
  )
}

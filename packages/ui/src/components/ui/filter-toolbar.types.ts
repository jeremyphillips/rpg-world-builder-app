/** Option for filter toolbar select controls. */
export type FilterToolbarOption = {
  value: string
  label: string
}

export type SelectFilterFieldConfig<TFilters extends Record<string, unknown>> = {
  key: keyof TFilters
  type: 'select'
  label: string
  options: FilterToolbarOption[]
  allowAny?: boolean
  anyLabel?: string
  placeholder?: string
  visible?: boolean
  disabled?: boolean
  required?: boolean
}

export type FilterFieldConfig<TFilters extends Record<string, unknown>> =
  SelectFilterFieldConfig<TFilters>

export type FilterToolbarProps<TFilters extends Record<string, unknown>> = {
  /** Prefix for generated control ids (`${idPrefix}-${key}`). */
  idPrefix: string
  fields: FilterFieldConfig<TFilters>[]
  values: TFilters
  onValueChange: <K extends keyof TFilters>(key: K, value: TFilters[K] | undefined) => void
  onReset?: () => void
  resetLabel?: string
  /** Disables every field and the reset control. */
  disabled?: boolean
  className?: string
}

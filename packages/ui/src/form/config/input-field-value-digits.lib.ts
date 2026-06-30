import type { FieldDigits } from '../../components/ui/field-digit-metrics'

export interface ValueDigitsFieldConfig {
  valueDigits?: FieldDigits
  valueDigitsDependsOn?: string
  valueDigitsLookup?: Record<string, FieldDigits>
}

function maxDigitsFromLookup(lookup: Record<string, FieldDigits>): FieldDigits {
  return Math.max(...Object.values(lookup).map(Number)) as FieldDigits
}

export function resolveValueDigitsFromConfig(
  config: ValueDigitsFieldConfig,
  watchedKind: unknown,
): FieldDigits | undefined {
  if (config.valueDigits != null) return config.valueDigits
  if (!config.valueDigitsLookup) return undefined

  const lookup = config.valueDigitsLookup
  if (watchedKind == null || watchedKind === '') return maxDigitsFromLookup(lookup)

  return lookup[String(watchedKind)] ?? maxDigitsFromLookup(lookup)
}

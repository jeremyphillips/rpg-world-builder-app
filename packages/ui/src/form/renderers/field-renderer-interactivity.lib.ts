import type { FieldConfig } from '../field-config'

/** Merges static and interactivity `disabled` without affecting registration. */
export function mergeFieldConfigWithInteractivity(
  config: FieldConfig,
  resolvedConfig: FieldConfig,
  dynamicValues: Record<string, unknown>,
): FieldConfig {
  const interactivityDisabled = config.interactivity?.disabledWhen(dynamicValues) ?? false
  return {
    ...resolvedConfig,
    disabled: Boolean(config.disabled) || interactivityDisabled,
  } as FieldConfig
}

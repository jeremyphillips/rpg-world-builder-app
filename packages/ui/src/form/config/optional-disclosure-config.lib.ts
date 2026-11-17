import type { FieldWidth } from '../../components/ui/field-control.variants'
import type { FieldLabelVisibility } from '../form-heading.lib'
import {
  OPTIONAL_DISCLOSURE_FIELD_KINDS,
  type FieldConfig,
  type OptionalDisclosureConfig,
  type OptionalDisclosureFieldKind,
  resolveFieldConfigPrimaryName,
} from '../field-config'

type OptionalDisclosureLeafFieldInput = {
  labelVisibility?: FieldLabelVisibility
  width?: FieldWidth
}

/**
 * Leaf field config for optional disclosure: row fractions apply to the
 * disclosure shell, not the nested control (participation is suppressed).
 */
export function optionalDisclosureLeafFieldConfig<T extends OptionalDisclosureLeafFieldInput>(
  config: T,
): T {
  return { ...config, labelVisibility: 'srOnly', width: 'full' }
}

export const OPTIONAL_DISCLOSURE_IMPLEMENTED_KINDS = [
  'text',
  'textarea',
  'select',
  'combobox',
  'textSuggestions',
  'richtext',
  'rollValue',
  'joinedPair',
] as const
export type OptionalDisclosureImplementedKind =
  (typeof OPTIONAL_DISCLOSURE_IMPLEMENTED_KINDS)[number]

function fieldKindSupportsOptionalDisclosure(
  type: FieldConfig['type'],
): type is OptionalDisclosureFieldKind {
  return (OPTIONAL_DISCLOSURE_FIELD_KINDS as readonly string[]).includes(type)
}

function fieldKindImplementsOptionalDisclosure(
  type: FieldConfig['type'],
): type is OptionalDisclosureImplementedKind {
  return (OPTIONAL_DISCLOSURE_IMPLEMENTED_KINDS as readonly string[]).includes(type)
}

function optionalDisclosureFieldPath(field: FieldConfig): string {
  return resolveFieldConfigPrimaryName(field)
}

/** Dev-only guard for `optionalDisclosure` misuse at the form-library boundary. */
export function assertOptionalDisclosureFieldConfig(field: FieldConfig): void {
  if (process.env.NODE_ENV === 'production') return
  if (!('optionalDisclosure' in field) || !field.optionalDisclosure) return

  const path = optionalDisclosureFieldPath(field)

  if (!fieldKindSupportsOptionalDisclosure(field.type)) {
    console.error(
      `[Form] optionalDisclosure on "${path}" is only allowed for ${OPTIONAL_DISCLOSURE_FIELD_KINDS.join(', ')} fields (got "${field.type}").`,
    )
    return
  }

  if (field.required) {
    console.error(
      `[Form] optionalDisclosure on "${path}" is incompatible with required: true. Optional disclosure fields must stay optional in schema and config.`,
    )
  }

  if (!fieldKindImplementsOptionalDisclosure(field.type)) {
    console.error(
      `[Form] optionalDisclosure on "${path}" is not implemented for "${field.type}" yet. TODO(text): single-line fields.`,
    )
  }
}

/** Walks flattened leaf fields and logs dev guard messages for each disclosure config. */
export function assertOptionalDisclosureFieldConfigs(fields: readonly FieldConfig[]): void {
  if (process.env.NODE_ENV === 'production') return
  for (const field of fields) {
    assertOptionalDisclosureFieldConfig(field)
  }
}

/** Union of `summary` and `sourcePreview` watch paths for one `useDependsOnValues` call. */
export function optionalDisclosureDependsOnPaths(
  disclosure: Pick<OptionalDisclosureConfig, 'summary' | 'sourcePreview'>,
): readonly string[] {
  const paths = new Set<string>()
  for (const path of disclosure.summary?.dependsOn ?? []) paths.add(path)
  for (const path of disclosure.sourcePreview?.dependsOn ?? []) paths.add(path)
  return [...paths]
}

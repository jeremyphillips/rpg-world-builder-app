import { normalizeRichTextHtml } from '../../components/ui/rich-text-html'
import type {
  ConfirmBeforeClearConfig,
  FieldConfig,
  FormItem,
  GroupFieldItem,
  RowConfig,
} from '../field-config'
import { flattenFields, resolveFieldConfigPrimaryName } from '../field-config'

export type ConfirmBeforeClearContext = {
  namePrefix?: string
  clearingFieldNames: readonly string[]
}

/** Leaf field configs whose values clear when a dependent section closes. */
export function collectDependentClearingFields(
  dependentFields: readonly GroupFieldItem[],
): FieldConfig[] {
  return flattenFields(dependentFields as Array<FormItem | RowConfig>)
}

/** Relative field names cleared when a dependent section closes. */
export function collectDependentClearingFieldNames(
  dependentFields: readonly GroupFieldItem[],
): string[] {
  return collectDependentClearingFields(dependentFields).map((field) =>
    resolveFieldConfigPrimaryName(field),
  )
}

export function resolveClearingFieldValue(
  values: Record<string, unknown>,
  namePrefix: string | undefined,
  fieldName: string,
): unknown {
  const fullName = namePrefix ? `${namePrefix}.${fieldName}` : fieldName
  return fullName.split('.').reduce<unknown>((current, segment) => {
    if (current == null || typeof current !== 'object') return undefined
    return (current as Record<string, unknown>)[segment]
  }, values)
}

type FieldContentChecker = (value: unknown) => boolean

function richTextValueHasContent(value: unknown): boolean {
  return Boolean(normalizeRichTextHtml(typeof value === 'string' ? value : String(value)))
}

function stringLikeValueHasContent(value: unknown): boolean {
  return Boolean(String(value).trim())
}

const FIELD_CONTENT_CHECKERS: Partial<Record<FieldConfig['type'], FieldContentChecker>> = {
  richtext: richTextValueHasContent,
  markdown: richTextValueHasContent,
  chips: (value) => Array.isArray(value) && value.length > 0,
  checkbox: (value) => value === true,
  switch: (value) => value === true,
  number: (value) => typeof value === 'number' && !Number.isNaN(value),
  json: stringLikeValueHasContent,
  text: stringLikeValueHasContent,
  textarea: stringLikeValueHasContent,
  textSuggestions: stringLikeValueHasContent,
  select: stringLikeValueHasContent,
  radio: stringLikeValueHasContent,
  combobox: stringLikeValueHasContent,
  file: stringLikeValueHasContent,
}

export function fieldValueHasClearableContent(field: FieldConfig, value: unknown): boolean {
  if (value == null) return false

  const checker = FIELD_CONTENT_CHECKERS[field.type]
  return checker ? checker(value) : Boolean(value)
}

export function clearingFieldsHaveContent(
  fields: readonly FieldConfig[],
  values: Record<string, unknown>,
  namePrefix?: string,
): boolean {
  return fields.some((field) => {
    const fieldName = resolveFieldConfigPrimaryName(field)
    const value = resolveClearingFieldValue(values, namePrefix, fieldName)
    return fieldValueHasClearableContent(field, value)
  })
}

export function shouldConfirmBeforeClear(
  config: ConfirmBeforeClearConfig,
  values: Record<string, unknown>,
  context: ConfirmBeforeClearContext,
  fields: readonly FieldConfig[],
): boolean {
  if (config.shouldConfirm) {
    return config.shouldConfirm(values, context)
  }

  return clearingFieldsHaveContent(fields, values, context.namePrefix)
}

export type ResolvedConfirmBeforeClearDialog = {
  headline: string
  description?: string
  confirmLabel: string
  cancelLabel: string
  confirmVariant: NonNullable<ConfirmBeforeClearConfig['confirmVariant']>
}

export function resolveConfirmBeforeClearDialog(
  config: ConfirmBeforeClearConfig,
): ResolvedConfirmBeforeClearDialog {
  return {
    headline: config.headline,
    description: config.description,
    confirmLabel: config.confirmLabel ?? 'Remove',
    cancelLabel: config.cancelLabel ?? 'Cancel',
    confirmVariant: config.confirmVariant ?? 'destructive',
  }
}

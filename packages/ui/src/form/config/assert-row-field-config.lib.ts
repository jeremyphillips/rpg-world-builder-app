import { hasActiveFieldChrome } from '../../components/ui/field-chrome.variants'
import type { FieldConfig, RowConfig, RowFieldItem } from '../field-config'
import { isRowSlotItem, normalizeFieldHint, resolveFieldConfigPrimaryName } from '../field-config'

const UNSUPPORTED_ROW_FIELD_TYPES = new Set<FieldConfig['type']>(['editableGrid', 'json', 'file'])

const FIELDSET_PATH_ROW_FIELD_TYPES = new Set<FieldConfig['type']>([
  'chips',
  'inlineChooseCount',
  'chooseFromChips',
])

function rowFieldPath(rowPath: string, index: number, field: RowFieldItem): string {
  const name = isRowSlotItem(field) ? field.name : resolveFieldConfigPrimaryName(field)
  return `${rowPath}.fields[${index}] (${name})`
}

function warnBelowLabelHintInRow(path: string, field: FieldConfig): void {
  if (field.hint === undefined || typeof field.hint === 'string') return
  const normalized = normalizeFieldHint(field.hint)
  if (normalized.position !== 'below-label') return
  console.warn(
    `[Form] "${path}" sets hint.position: 'below-label' inside a schema row. Row hints render below the control — normalized to 'below-control'.`,
  )
}

function warnUnsupportedRowField(path: string, field: FieldConfig): void {
  if (UNSUPPORTED_ROW_FIELD_TYPES.has(field.type)) {
    console.warn(
      `[Form] "${path}" uses type: '${field.type}' inside a schema row. Rich editors and editable grids are unsupported in anatomy rows — alignment may degrade.`,
    )
    return
  }

  if (FIELDSET_PATH_ROW_FIELD_TYPES.has(field.type)) {
    console.warn(
      `[Form] "${path}" uses type: '${field.type}' inside a schema row. Fieldset-path fields are not verified for mixed-row anatomy alignment — alignment may degrade.`,
    )
  }

  if (hasActiveFieldChrome(field.chrome)) {
    console.warn(
      `[Form] "${path}" sets field-level chrome inside a schema row. Chromed fields are unsupported in anatomy rows — alignment may degrade.`,
    )
  }
}

/** Dev-only guard for invalid or unsupported schema row field combinations. */
export function assertRowFieldConfig(item: RowConfig, legend?: string): void {
  if (process.env.NODE_ENV === 'production') return

  const rowPath = item.id ?? legend ?? 'row'
  item.fields.forEach((field, index) => {
    const path = rowFieldPath(rowPath, index, field)
    if (isRowSlotItem(field)) return
    warnBelowLabelHintInRow(path, field)
    warnUnsupportedRowField(path, field)
  })
}

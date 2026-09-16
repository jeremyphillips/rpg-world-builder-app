import type { ArrayFilterSelectFn, FieldOption } from '../field-config'
import { SELECT_OPTION_ALREADY_USED_LABEL } from '../../components/ui/select-option-copy'

export type DisableOptionsUsedInSiblingRowsConfig = {
  fieldName: string
  disabledReason?: string
  /** Escape hatch for nonstandard row shapes — defaults to `row[fieldName]`. */
  readValue?: (row: Record<string, unknown>) => string | undefined
}

function defaultReadValue(row: Record<string, unknown>, fieldName: string): string | undefined {
  const value = row[fieldName]
  if (value === undefined || value === null || value === '') return undefined
  return String(value)
}

function collectSiblingValues(
  arrayItems: unknown[],
  rowIndex: number,
  readValue: (row: Record<string, unknown>) => string | undefined,
): Set<string> {
  const used = new Set<string>()
  for (const [index, item] of arrayItems.entries()) {
    if (index === rowIndex) continue
    const row = (item ?? {}) as Record<string, unknown>
    const value = readValue(row)
    if (value) used.add(value)
  }
  return used
}

function applyCompositionalDisable(
  option: FieldOption,
  usedBySibling: boolean,
  disabledReason: string,
): FieldOption {
  const disabled = Boolean(option.disabled) || usedBySibling
  const resolvedReason = option.disabledReason ?? (usedBySibling ? disabledReason : undefined)

  if (!disabled) {
    return { ...option, disabled: false, disabledReason: undefined }
  }

  return {
    ...option,
    disabled: true,
    disabledReason: resolvedReason,
  }
}

/** Disables select options already chosen in sibling array rows. */
export function disableOptionsUsedInSiblingRows(
  config: DisableOptionsUsedInSiblingRowsConfig,
): ArrayFilterSelectFn {
  const readValue =
    config.readValue ?? ((row: Record<string, unknown>) => defaultReadValue(row, config.fieldName))
  const disabledReason = config.disabledReason ?? SELECT_OPTION_ALREADY_USED_LABEL

  return ({ arrayItems, rowIndex, fieldName, options }) => {
    if (fieldName !== config.fieldName) return options

    const usedBySibling = collectSiblingValues(arrayItems, rowIndex, readValue)
    const currentRow = (arrayItems[rowIndex] ?? {}) as Record<string, unknown>
    const currentValue = readValue(currentRow)

    return options.map((option) => {
      const usedElsewhere = usedBySibling.has(option.value)
      const isCurrentSelection = currentValue != null && option.value === currentValue
      const usedBySiblingRow = usedElsewhere && !isCurrentSelection

      return applyCompositionalDisable(option, usedBySiblingRow, disabledReason)
    })
  }
}

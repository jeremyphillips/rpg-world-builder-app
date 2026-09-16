/** Radix Select item values are strings — encode typed option values to avoid collisions. */

export type TypedSelectOptionValue = string | number

export type TypedSelectOption<T extends TypedSelectOptionValue = TypedSelectOptionValue> = {
  value: T
  label: string
  disabled?: boolean
}

const NUMBER_PREFIX = 'n:'
const STRING_PREFIX = 's:'

/** Encodes a typed option value for Radix Select `value` props. */
export function encodeSelectOptionValue(value: TypedSelectOptionValue): string {
  if (typeof value === 'number') {
    return `${NUMBER_PREFIX}${value}`
  }
  return `${STRING_PREFIX}${value}`
}

/** Decodes a Radix Select value back to the original typed option value. */
export function decodeSelectOptionValue(encoded: string): TypedSelectOptionValue | undefined {
  if (encoded.startsWith(NUMBER_PREFIX)) {
    const raw = encoded.slice(NUMBER_PREFIX.length)
    if (raw === '') return undefined
    const parsed = Number(raw)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  if (encoded.startsWith(STRING_PREFIX)) {
    return encoded.slice(STRING_PREFIX.length)
  }
  return undefined
}

function findSelectOptionForStoredValue(
  stored: unknown,
  options: readonly TypedSelectOption[],
): TypedSelectOption | undefined {
  const direct = options.find((option) => selectOptionValuesEqual(option.value, stored))
  if (direct) return direct

  // z.coerce.number and legacy defaults can leave numeric state on string options (or vice versa).
  if (typeof stored === 'number' && Number.isFinite(stored)) {
    return options.find(
      (option) => typeof option.value === 'string' && option.value === String(stored),
    )
  }
  if (typeof stored === 'string' && /^\d+$/.test(stored)) {
    const asNumber = Number(stored)
    return options.find((option) => typeof option.value === 'number' && option.value === asNumber)
  }
  return undefined
}

/** Encodes a stored form value when it matches a known option; otherwise undefined. */
export function encodeStoredSelectOptionValue(
  stored: unknown,
  options: readonly TypedSelectOption[],
): string | undefined {
  if (stored === undefined || stored === null || stored === '') return undefined
  const match = findSelectOptionForStoredValue(stored, options)
  return match ? encodeSelectOptionValue(match.value) : undefined
}

/** Resolves the typed option value from a Radix Select change event. */
export function resolveSelectOptionChange(
  encoded: string,
  options: readonly TypedSelectOption[],
): TypedSelectOptionValue | undefined {
  const decoded = decodeSelectOptionValue(encoded)
  if (decoded === undefined) return undefined
  const match = options.find((option) => selectOptionValuesEqual(option.value, decoded))
  return match?.value
}

/** Type-safe equality for select option values (number vs string). */
export function selectOptionValuesEqual(left: TypedSelectOptionValue, right: unknown): boolean {
  if (typeof left === 'number') {
    return typeof right === 'number' && left === right
  }
  return typeof right === 'string' && left === right
}

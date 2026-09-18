import type { FieldDigits } from './field-digit-metrics'

export const SELECT_VALUE_SLOT_DATA_ATTR = 'data-select-value-slot'
export const SELECT_CARET_SLOT_DATA_ATTR = 'data-select-caret-slot'
export const SELECT_SIZING_LABEL_DATA_ATTR = 'data-select-sizing-label'

export type SelectCompactSizingProps = {
  digits?: FieldDigits
  sizingLabel?: string
  sizingLabels?: readonly string[]
}

function hasTextSizing(props: SelectCompactSizingProps): boolean {
  return (
    (props.sizingLabel != null && props.sizingLabel.length > 0) ||
    (props.sizingLabels != null && props.sizingLabels.length > 0)
  )
}

/** `digits`, `sizingLabel`, and `sizingLabels` are mutually exclusive compact sizing modes. */
export function assertSelectCompactSizing(props: SelectCompactSizingProps): void {
  const modes = [
    props.digits != null,
    props.sizingLabel != null && props.sizingLabel.length > 0,
    props.sizingLabels != null && props.sizingLabels.length > 0,
  ].filter(Boolean).length

  if (modes > 1) {
    throw new Error(
      'SelectTrigger: `digits`, `sizingLabel`, and `sizingLabels` are mutually exclusive.',
    )
  }
}

export function isSelectCompactTrigger(props: SelectCompactSizingProps): boolean {
  return props.digits != null || hasTextSizing(props)
}

export function resolveSelectSizingGhostLabels(props: SelectCompactSizingProps): string[] {
  if (props.sizingLabels != null && props.sizingLabels.length > 0) {
    return [...props.sizingLabels]
  }

  if (props.sizingLabel != null && props.sizingLabel.length > 0) {
    return [props.sizingLabel]
  }

  return []
}

import type { FieldDigits } from './field-digit-metrics'
import {
  UI_FIELD_CONTROL_TRIGGER_FILL_CLASS,
  UI_FIELD_CONTROL_TRIGGER_FIT_CLASS,
  UI_FIELD_CONTROL_TRIGGER_SEGMENT_CLASS,
} from './field-control.styles'

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

export function resolveSelectTriggerFlowClass(options: {
  compact: boolean
  grouped: boolean
}): string {
  if (options.compact) {
    return UI_FIELD_CONTROL_TRIGGER_FIT_CLASS
  }

  if (options.grouped) {
    return UI_FIELD_CONTROL_TRIGGER_SEGMENT_CLASS
  }

  return UI_FIELD_CONTROL_TRIGGER_FILL_CLASS
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

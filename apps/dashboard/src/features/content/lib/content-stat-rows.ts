export type ContentStatRowData = {
  label: string
  value: string
  /** Tooltip body for an info icon beside the value (rendered via `InfoTooltip`). */
  info?: string
  /** Accessible name for the info trigger; defaults to `About ${label}`. */
  infoAriaLabel?: string
}

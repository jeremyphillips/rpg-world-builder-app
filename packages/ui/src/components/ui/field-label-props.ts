import type { FieldLabelVisibility } from '../../form/form-heading.lib'

/** Shared leaf label props consumed by FormField-based wrappers. */
export interface FieldLabelPresentationProps {
  label: string
  labelVisibility?: FieldLabelVisibility
}

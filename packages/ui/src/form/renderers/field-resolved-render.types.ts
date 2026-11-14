import type { FieldSize } from '../../components/ui/field.client'
import type { FieldHintPosition } from '../../components/ui/field.variants'
import type { FieldConfig, FieldDerivedMeta } from '../field-config'

/**
 * Configuration resolved once per field. Live RHF values, errors, and refs stay
 * in the binding family that owns registration.
 */
export type ResolvedFieldRender = {
  /** Original config. Registration and `fieldDefaultValue` read this. */
  authored: FieldConfig
  /** Authored config plus resolved chrome, options, and dynamic option lists. */
  config: FieldConfig
  presentationSize: FieldSize
  controlSize: FieldSize
  hint?: string
  hintPosition: FieldHintPosition
  hintIcon?: 'info'
  derivedMeta?: FieldDerivedMeta
  derivedMetaReserveSpace?: boolean
  /** Resolved text-suggestion strings. Absent for every other field type. */
  resolvedSuggestions?: readonly string[]
  fullName: string
  id: string
  namePrefix?: string
}

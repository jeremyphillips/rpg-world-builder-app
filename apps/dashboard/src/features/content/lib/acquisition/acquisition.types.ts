/**
 * Supporting description for an acquisition row.
 * `ready.text` is plain authored or vocabulary prose (no decode).
 * `unresolved.message` may hold validation message transport or plain English until
 * `toAcquisitionDropdownItem` decodes it for UI.
 */
export type AcquisitionDescription =
  | { status: 'ready'; text: string }
  | { status: 'unresolved'; message: string }

export type AcquisitionUnavailableCode = 'occurrence' | 'prerequisite' | 'readiness'

export type AcquisitionUnavailable = {
  status: 'unavailable'
  code: AcquisitionUnavailableCode
  /**
   * Unavailability copy as validation message transport (`defineMessage()` output) or plain
   * English. Only `toAcquisitionDropdownItem` emits display text to UI primitives.
   */
  message: string
}

export type AcquisitionAvailability = { status: 'available' } | AcquisitionUnavailable

export type AcquisitionOption = {
  id: string
  label: string
  description: AcquisitionDescription
  availability: AcquisitionAvailability
  groupId?: string
  classification?: string
  searchTerms?: readonly string[]
  search?: { includeSupporting?: boolean }
}

export type AcquisitionAvailabilityFacts = {
  occurrence?: { message: string; code?: AcquisitionUnavailableCode }
  prerequisite?: { message: string; code?: AcquisitionUnavailableCode }
  readiness?: { message: string; code?: AcquisitionUnavailableCode }
}

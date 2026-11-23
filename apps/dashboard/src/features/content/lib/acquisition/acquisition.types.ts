export type AcquisitionDescription =
  | { status: 'ready'; text: string }
  | { status: 'unresolved'; message: string }

export type AcquisitionUnavailableCode = 'occurrence' | 'prerequisite' | 'readiness'

export type AcquisitionUnavailable = {
  status: 'unavailable'
  code: AcquisitionUnavailableCode
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

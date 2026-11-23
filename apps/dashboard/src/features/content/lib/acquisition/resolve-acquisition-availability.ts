import type {
  AcquisitionAvailability,
  AcquisitionAvailabilityFacts,
  AcquisitionUnavailable,
} from './acquisition.types'

export function resolveAcquisitionAvailability(
  facts: AcquisitionAvailabilityFacts,
): AcquisitionAvailability {
  if (facts.occurrence) {
    return unavailable(facts.occurrence.message, facts.occurrence.code ?? 'occurrence')
  }
  if (facts.prerequisite) {
    return unavailable(facts.prerequisite.message, facts.prerequisite.code ?? 'prerequisite')
  }
  if (facts.readiness) {
    return unavailable(facts.readiness.message, facts.readiness.code ?? 'readiness')
  }
  return { status: 'available' }
}

function unavailable(
  message: string,
  code: AcquisitionUnavailable['code'],
): AcquisitionUnavailable {
  return { status: 'unavailable', code, message }
}

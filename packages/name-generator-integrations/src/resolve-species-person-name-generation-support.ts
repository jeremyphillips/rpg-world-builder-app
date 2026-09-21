import { composeAvailableNamingConventions } from './compose-available-naming-conventions'
import { resolveSpeciesPersonNaming } from './resolve-species-person-naming'
import type { SpeciesCultureInput } from './resolve-campaign-conventions'

export type SpeciesPersonNameGenerationSupport = {
  enabled: boolean
  disabledReason?: string
}

/** Whether species-aware person name generation is available for the given species input. */
export function resolveSpeciesPersonNameGenerationSupport(
  speciesInput: SpeciesCultureInput,
): SpeciesPersonNameGenerationSupport {
  const { conventions } = composeAvailableNamingConventions([speciesInput])
  const resolution = resolveSpeciesPersonNaming({ species: speciesInput, conventions })

  if (!resolution.supported) {
    return { enabled: false, disabledReason: resolution.reason }
  }

  return { enabled: true }
}

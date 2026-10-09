import { progressionFromForm } from '../../lib/form/resolution-progression-values'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'

export function readStoredProgressionFromForm(
  resolutionForm: ResolutionFormValues | undefined,
): ReturnType<typeof progressionFromForm> {
  return progressionFromForm(resolutionForm?.progressionBasis, resolutionForm?.progressionTracks)
}

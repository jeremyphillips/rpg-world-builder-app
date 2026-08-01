import { HttpError } from '../../lib/http-error'
import type { CampaignOnboardingGateResult } from './load-campaign-onboarding-gate.lib'

export function throwFromCampaignOnboardingGate(
  gate: Extract<
    CampaignOnboardingGateResult,
    { kind: 'not_found' | 'forbidden' | 'integrity_error' }
  >,
): never {
  switch (gate.kind) {
    case 'not_found':
      throw new HttpError(404, 'not_found', 'Campaign not found.')
    case 'forbidden':
      if (gate.reason === 'not_player') {
        throw new HttpError(
          403,
          'forbidden',
          'Campaign onboarding is only available to player members.',
        )
      }

      throw new HttpError(
        403,
        'forbidden',
        'Campaign onboarding is not available for this membership.',
      )
    case 'integrity_error':
      throw new HttpError(
        500,
        'integrity_error',
        'Campaign membership is in an inconsistent onboarding state.',
      )
  }
}

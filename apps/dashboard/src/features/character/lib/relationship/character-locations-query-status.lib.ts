import { getErrorMessage } from '@rpg/contracts'

import { formatContentListLoadErrorMessage } from '@/features/content/lib/content-type-labels'

export type CharacterLocationsQueryStatus =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'error'; message: string }
  | { status: 'success' }

export function resolveCharacterLocationsQueryStatus(input: {
  campaignId?: string
  isPending: boolean
  isError: boolean
  error: unknown
  hasData: boolean
}): CharacterLocationsQueryStatus {
  if (!input.campaignId) return { status: 'idle' }
  if (input.isPending && !input.hasData) return { status: 'pending' }
  if (input.isError) {
    return {
      status: 'error',
      message: getErrorMessage(input.error, formatContentListLoadErrorMessage('locations')),
    }
  }
  return { status: 'success' }
}

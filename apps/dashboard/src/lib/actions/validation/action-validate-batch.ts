import {
  getErrorMessage,
  type ActionBatchValidationResult,
  type ActionTargetFailure,
} from '@rpg/contracts'

import { postJson } from '@/lib/api-client'

export async function postActionBatchValidate<TResponse>({
  path,
  body,
  fallbackMessage,
}: {
  path: string
  body: unknown
  fallbackMessage: string
}): Promise<TResponse> {
  return postJson<TResponse>(path, body, fallbackMessage)
}

export function mapBatchValidateTransportError<TBlocker, TFailure extends ActionTargetFailure>(
  requestedIds: readonly string[],
  error: unknown,
  fallbackMessage: string,
): ActionBatchValidationResult<TBlocker, TFailure> {
  const message = getErrorMessage(error, fallbackMessage)

  return {
    validation: { targets: [] },
    failures: requestedIds.map((targetId) => ({
      targetId,
      failure: {
        code: 'request_error',
        message,
      } as TFailure,
    })),
  }
}

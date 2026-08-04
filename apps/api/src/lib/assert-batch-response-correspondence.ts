import { assertBatchResponseCorrespondence } from '@rpg/contracts'

export function assertBatchResponseMatchesRequest(
  requestedIds: readonly string[],
  response: { targets: readonly { targetId: string }[] },
): void {
  const correspondenceError = assertBatchResponseCorrespondence(requestedIds, response.targets)
  if (correspondenceError) {
    throw new Error(correspondenceError.reason)
  }
}

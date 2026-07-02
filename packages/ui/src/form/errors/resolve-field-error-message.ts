import { formatFieldMessage } from '@rpg/contracts'

/** Decodes structured validation payloads for control-level display. */
export function resolveFieldErrorMessage(message?: string): string | undefined {
  if (message === undefined || message.length === 0) return undefined
  return formatFieldMessage(message)
}

/** Returns the first non-empty decoded field error from the given messages. */
export function resolveFirstFieldErrorMessage(
  ...messages: Array<string | undefined>
): string | undefined {
  for (const message of messages) {
    const resolved = resolveFieldErrorMessage(message)
    if (resolved) return resolved
  }
  return undefined
}

import { formatFieldMessage } from '@rpg/contracts'
import type { FieldError, FieldErrors } from 'react-hook-form'

/** Walks a dotted RHF path to read a leaf field error message. */
export function resolveNestedFieldErrorMessage(
  errors: FieldErrors,
  path: string,
): string | undefined {
  const segments = path.split('.')
  let node: unknown = errors
  for (const segment of segments) {
    if (node == null || typeof node !== 'object') return undefined
    node = (node as Record<string, unknown>)[segment]
  }
  if (node && typeof node === 'object' && 'message' in node) {
    const message = (node as FieldError).message
    return typeof message === 'string' ? message : undefined
  }
  return undefined
}

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

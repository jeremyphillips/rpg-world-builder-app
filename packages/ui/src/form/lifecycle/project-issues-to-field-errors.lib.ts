import type { FieldError, FieldErrors } from 'react-hook-form'

import type { FormIssue } from '../errors/form-issue.types'

function appendIssueMessage(existing: FieldError | undefined, message: string): FieldError {
  if (!existing?.message || existing.message === message) {
    return { type: 'validation', message }
  }
  return {
    type: 'validation',
    message: `${existing.message}; ${message}`,
    types: {
      ...(existing.types ?? {}),
      [`reason_${message.length}`]: message,
    },
  }
}

function setAtPath(errors: FieldErrors, segments: string[], message: string): void {
  if (segments.length === 0) return

  let node: FieldErrors = errors
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index]!
    const isLeaf = index === segments.length - 1

    if (isLeaf) {
      const existing = node[segment] as FieldError | undefined
      node[segment] = appendIssueMessage(existing, message)
      return
    }

    const next = node[segment]
    if (typeof next !== 'object' || next === null || 'message' in next) {
      node[segment] = {}
    }
    node = node[segment] as FieldErrors
  }
}

/**
 * Best-effort RHF tree for controller chrome. Canonical issue lists stay authoritative
 * for presentation once the validation session is wired (Phase 3+).
 */
export function projectIssuesToFieldErrors(issues: readonly FormIssue[]): FieldErrors {
  const errors: FieldErrors = {}

  for (const issue of issues) {
    const path = issue.path.trim()
    if (!path) {
      errors.root = appendIssueMessage(errors.root as FieldError | undefined, issue.message)
      continue
    }
    setAtPath(errors, path.split('.').filter(Boolean), issue.message)
  }

  return errors
}

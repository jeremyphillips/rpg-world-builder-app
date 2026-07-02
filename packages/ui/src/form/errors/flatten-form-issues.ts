import type { FieldError, FieldErrors } from 'react-hook-form'

import type { FormIssue } from './form-issue.types'

function isFieldError(value: unknown): value is FieldError & { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as FieldError).message === 'string' &&
    (value as FieldError).message!.length > 0
  )
}

function parseArrayItemContext(
  path: string,
): Pick<FormIssue, 'arrayPath' | 'itemIndex' | 'itemPrefix' | 'relativePath'> {
  const segments = path.split('.')
  for (let index = 0; index < segments.length - 1; index++) {
    const next = segments[index + 1]
    if (next === undefined || !/^\d+$/.test(next)) continue

    const arrayPath = segments.slice(0, index + 1).join('.')
    const itemIndex = Number(next)
    const itemPrefix = `${arrayPath}.${itemIndex}`
    const relativePath = segments.slice(index + 2).join('.') || undefined

    return { arrayPath, itemIndex, itemPrefix, relativePath }
  }

  return {}
}

function walkFieldErrors(node: FieldErrors, pathPrefix: string, issues: FormIssue[]): void {
  if (isFieldError(node)) {
    issues.push({
      path: pathPrefix,
      message: node.message,
      severity: 'field',
      ...parseArrayItemContext(pathPrefix),
    })
    return
  }

  if (Array.isArray(node)) {
    node.forEach((entry, index) => {
      if (entry === undefined || entry === null) return
      walkFieldErrors(entry as FieldErrors, `${pathPrefix}.${index}`, issues)
    })
    return
  }

  if (typeof node !== 'object' || node === null) return

  for (const [key, value] of Object.entries(node)) {
    if (value === undefined || value === null) continue
    const nextPath = pathPrefix ? `${pathPrefix}.${key}` : key
    walkFieldErrors(value as FieldErrors, nextPath, issues)
  }
}

/** Walk nested RHF `FieldErrors` into a flat list of actionable issues. */
export function flattenFormIssues(errors: FieldErrors): FormIssue[] {
  if (!errors || typeof errors !== 'object') return []

  const issues: FormIssue[] = []
  walkFieldErrors(errors, '', issues)
  return issues.filter((issue) => issue.path.length > 0)
}

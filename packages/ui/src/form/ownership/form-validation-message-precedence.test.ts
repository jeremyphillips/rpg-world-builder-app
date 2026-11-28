import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { encodeStructuredMessage, formatFieldMessage } from '@rpg/contracts'

import { makeFieldErrorMap } from '../config/field-error-map'
import type { FormItem } from '../field-config'
import {
  resolveFieldErrorMessage,
  resolveFirstFieldErrorMessage,
} from '../errors/resolve-field-error-message'
import { resolveFieldIssueDisplayMessage } from '../errors/resolve-field-issue.lib'
import type { FormIssue } from '../errors/form-issue.types'

const modesField: FormItem = {
  type: 'chips',
  name: 'movementAlternative.modes',
  label: 'Available modes',
  options: [],
  min: 2,
}

function messageForSchema(
  schema: z.ZodType,
  value: unknown,
  fields: FormItem[],
  path?: (string | number)[],
): string {
  const map = makeFieldErrorMap(fields)
  const result = schema.safeParse(value, { error: map })
  if (result.success) throw new Error('expected failure')
  const issue = path
    ? result.error.issues.find((candidate) => candidate.path.join('.') === path.join('.'))
    : result.error.issues[0]
  if (!issue) throw new Error('missing issue')
  return formatFieldMessage(issue.message)
}

describe('form validation message precedence at the display boundary', () => {
  it('prefers structured domain transport over generic copy', () => {
    const structured = encodeStructuredMessage(
      'Choose at least 2 available modes.',
      'Modes',
      'validation.field.minSelections',
      { label: 'Available modes' },
    )
    expect(resolveFieldErrorMessage(structured)).toBe('Choose at least 2 available modes.')
  })

  it('keeps trusted custom domain copy from refinements', () => {
    const trusted = 'Choose at least 2 available modes.'
    expect(resolveFieldErrorMessage(trusted)).toBe(trusted)
  })

  it('formats generic Zod reasons with the compiled owner label', () => {
    const schema = z.object({
      movementAlternative: z.object({
        modes: z.array(z.string()).min(2),
      }),
    })
    const formatted = messageForSchema(
      schema,
      { movementAlternative: { modes: ['fly'] } },
      [modesField],
      ['movementAlternative', 'modes'],
    )
    expect(formatted).toMatch(/available modes/i)
    expect(formatted).not.toMatch(/invalid_type/i)
    expect(formatted).not.toMatch(/^\[/)
  })

  it('does not surface raw JSON or arbitrary Error.message as field copy', () => {
    const rawZodJson =
      '[{"code":"invalid_type","expected":"object","path":["movementAlternative"]}]'
    const arbitrary = new Error(rawZodJson).message
    expect(resolveFieldErrorMessage(arbitrary)).toBe(rawZodJson)
    expect(resolveFirstFieldErrorMessage(undefined, arbitrary)).toBe(rawZodJson)
    expect(rawZodJson).not.toMatch(/^Available modes /)
  })

  it('joins distinct trusted reasons on one owner for control display', () => {
    const issues: FormIssue[] = [
      {
        path: 'movementAlternative.modes',
        message: 'Choose at least 2 available modes.',
        severity: 'field',
        claim: { kind: 'field', target: 'movementAlternative.modes' },
      },
      {
        path: 'movementAlternative.modes',
        message: 'Choose different movement modes.',
        severity: 'field',
        claim: { kind: 'field', target: 'movementAlternative.modes' },
      },
    ]
    const display = resolveFieldIssueDisplayMessage('movementAlternative.modes', issues)
    expect(display).toContain('Choose at least 2 available modes.')
    expect(display).toContain('Choose different movement modes.')
    expect(display).not.toMatch(/invalid_type/i)
  })
})

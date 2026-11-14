import { describe, expect, it } from 'vitest'

import {
  findRoutedIssueForFieldPath,
  findRoutedIssuesForSlot,
  resolveFieldIssueDisplayMessage,
} from './resolve-field-issue.lib'
import type { FormIssue } from './form-issue.types'

const fieldIssue = (path: string, target: string, message: string): FormIssue => ({
  path,
  message,
  severity: 'field',
  claim: { kind: 'field', target },
  presentationPath: target,
})

describe('resolve-field-issue.lib', () => {
  it('shows only the issue claimed for the control', () => {
    const issues = [fieldIssue('grants.0.language', 'grants.0.language', 'Choose a language.')]
    expect(resolveFieldIssueDisplayMessage('grants.0.language', issues)).toBe('Choose a language.')
    expect(resolveFieldIssueDisplayMessage('grants.0.other', issues)).toBeUndefined()
  })

  it('reads routed issues by claim target', () => {
    const issues = [
      fieldIssue('actions.0.resolution.method', 'actions.0.resolution.method.ability', 'Required.'),
    ]
    expect(
      findRoutedIssueForFieldPath(issues, 'actions.0.resolution.method.ability')?.message,
    ).toBe('Required.')
    expect(resolveFieldIssueDisplayMessage('actions.0.resolution.method.ability', issues)).toBe(
      'Required.',
    )
  })

  it('resolves slot-owned issues by claim or declared paths', () => {
    const issues: FormIssue[] = [
      {
        path: 'actions.0.resolution.outcomes',
        message: 'Add an outcome.',
        severity: 'field',
        claim: { kind: 'slot', target: 'actions.0._saveFailureNote' },
      },
    ]

    expect(
      findRoutedIssuesForSlot(issues, 'actions.0._saveFailureNote', ['resolution.outcomes']),
    ).toHaveLength(1)
    expect(
      findRoutedIssuesForSlot(issues, 'actions.0._saveFailureNote', [
        'actions.0.resolution.outcomes',
      ]),
    ).toHaveLength(1)
  })
})

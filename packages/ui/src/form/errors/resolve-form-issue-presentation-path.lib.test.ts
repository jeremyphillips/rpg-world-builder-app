import { describe, expect, it } from 'vitest'

import type { FormItem } from '../field-config'
import {
  enrichFormIssuesWithPresentationPaths,
  resolveFormIssuePresentationPath,
} from './resolve-form-issue-presentation-path.lib'
import { buildFieldRegistry } from '../config/field-error-map'

const fields: FormItem[] = [
  {
    kind: 'array',
    name: 'grants',
    legend: 'Grants',
    fields: [
      {
        type: 'combobox',
        name: 'weaponProficiencySlugs',
        label: 'Weapons',
        multiple: true,
        options: [],
      },
      {
        type: 'select',
        name: 'language',
        label: 'Language',
        options: [],
      },
    ],
  },
]

describe('resolveFormIssuePresentationPath', () => {
  const registry = buildFieldRegistry(fields)

  it('maps array-valued .root issues onto the leaf control path', () => {
    expect(resolveFormIssuePresentationPath('grants.0.weaponProficiencySlugs.root', registry)).toBe(
      'grants.0.weaponProficiencySlugs',
    )
  })

  it('does not collapse scalar indexed paths', () => {
    expect(resolveFormIssuePresentationPath('grants.0.language.0', registry)).toBe(
      'grants.0.language.0',
    )
  })

  it('leaves scalar leaf paths unchanged', () => {
    expect(resolveFormIssuePresentationPath('grants.0.language', registry)).toBe(
      'grants.0.language',
    )
  })
})

describe('enrichFormIssuesWithPresentationPaths', () => {
  it('adds presentationPath without dropping the original path', () => {
    const issues = enrichFormIssuesWithPresentationPaths(
      [
        {
          path: 'grants.0.weaponProficiencySlugs.root',
          message: 'Required',
          severity: 'field',
        },
      ],
      fields,
    )

    expect(issues[0]?.path).toBe('grants.0.weaponProficiencySlugs.root')
    expect(issues[0]?.presentationPath).toBe('grants.0.weaponProficiencySlugs')
  })
})

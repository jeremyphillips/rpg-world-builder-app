import { describe, expect, it } from 'vitest'
import type { FieldErrors } from 'react-hook-form'

import { classifyFormIssues } from './classify-form-issue'
import { flattenFormIssues } from './flatten-form-issues'
import { sortFormIssues } from './group-form-issues'
import { collectArraySections } from './resolve-field-order'
import {
  prepareFormIssues,
  resolveInvalidSubmitNavigation,
} from './resolve-invalid-submit-navigation'
import {
  collectTabPathPrefixes,
  getFirstInvalidTabId,
  pathOwnsIssue,
  resolveTabValidationState,
  type TabValidationTab,
} from './resolve-tab-validation-state'

const identityTab: TabValidationTab = {
  id: 'identity',
  fields: [
    { type: 'text', name: 'name', label: 'Name', required: true },
    { type: 'text', name: 'className', label: 'Class name', required: true },
  ],
}

const rulesTab: TabValidationTab = {
  id: 'rules',
  fields: [
    { type: 'number', name: 'level', label: 'Level', required: true },
    {
      kind: 'group',
      legend: 'Class',
      fields: [{ type: 'text', name: 'class', label: 'Class', required: true }],
    },
  ],
}

const grantsTab: TabValidationTab = {
  id: 'grants',
  fields: [
    {
      kind: 'array',
      name: 'grants',
      legend: 'Grants',
      fields: [{ type: 'text', name: 'label', label: 'Label', required: true }],
    },
  ],
}

const tabs: TabValidationTab[] = [identityTab, rulesTab, grantsTab]
const allFields = tabs.flatMap((tab) => tab.fields)

function issuesFromErrors(errors: Parameters<typeof flattenFormIssues>[0]) {
  return prepareFormIssues(errors, allFields)
}

describe('pathOwnsIssue', () => {
  it('matches exact paths and nested descendants', () => {
    expect(pathOwnsIssue('class', 'class')).toBe(true)
    expect(pathOwnsIssue('class', 'class.hitDie')).toBe(true)
  })

  it('does not match sibling segment prefixes', () => {
    expect(pathOwnsIssue('class', 'className')).toBe(false)
    expect(pathOwnsIssue('name', 'nameplate')).toBe(false)
  })
})

describe('collectTabPathPrefixes', () => {
  it('collects leaf, container-nested, and array names', () => {
    expect(collectTabPathPrefixes(identityTab)).toEqual(['name', 'className'])
    expect(collectTabPathPrefixes(rulesTab)).toEqual(['level', 'class'])
    expect(collectTabPathPrefixes(grantsTab)).toEqual(['grants'])
  })

  it('merges supplemental errorPaths with inferred prefixes', () => {
    const tab: TabValidationTab = {
      id: 'meta',
      fields: [{ type: 'text', name: 'title', label: 'Title', required: true }],
      errorPaths: ['external.slug'],
    }

    expect(collectTabPathPrefixes(tab)).toEqual(['title', 'external.slug'])
  })
})

describe('resolveTabValidationState', () => {
  it('assigns each issue to exactly one tab using the longest matching prefix', () => {
    const issues = issuesFromErrors({
      name: { type: 'custom', message: 'Required' },
      class: { type: 'custom', message: 'Required' },
      className: { type: 'custom', message: 'Required' },
      level: { type: 'custom', message: 'Required' },
    })

    const states = resolveTabValidationState(issues, tabs, allFields)

    expect(states.find((state) => state.tabId === 'identity')).toMatchObject({
      count: 2,
      firstIssuePath: 'className',
      issues: expect.arrayContaining([
        expect.objectContaining({ path: 'name' }),
        expect.objectContaining({ path: 'className' }),
      ]),
    })
    expect(states.find((state) => state.tabId === 'rules')).toMatchObject({
      count: 2,
      issues: expect.arrayContaining([
        expect.objectContaining({ path: 'class' }),
        expect.objectContaining({ path: 'level' }),
      ]),
    })
    expect(states.find((state) => state.tabId === 'grants')?.count).toBe(0)

    const assignedCount = states.reduce((total, state) => total + state.count, 0)
    expect(assignedCount).toBe(issues.length)
  })

  it('breaks equal-prefix ties by tab order', () => {
    const overlappingTabs: TabValidationTab[] = [
      { id: 'first', fields: [{ type: 'text', name: 'shared', label: 'Shared', required: true }] },
      { id: 'second', fields: [], errorPaths: ['shared'] },
    ]
    const issues = issuesFromErrors({
      shared: { type: 'custom', message: 'Required' },
    })

    const states = resolveTabValidationState(
      issues,
      overlappingTabs,
      overlappingTabs.flatMap((tab) => tab.fields),
    )

    expect(states.find((state) => state.tabId === 'first')?.count).toBe(1)
    expect(states.find((state) => state.tabId === 'second')?.count).toBe(0)
  })

  it('owns nested array item paths via the array prefix', () => {
    const issues = issuesFromErrors({
      grants: [{ label: { type: 'custom', message: 'Required' } }],
    } as unknown as FieldErrors)

    const states = resolveTabValidationState(issues, tabs, allFields)

    expect(states.find((state) => state.tabId === 'grants')).toMatchObject({
      count: 1,
      firstIssuePath: 'grants.0.label',
    })
  })

  it('routes supplemental errorPaths to the configured tab', () => {
    const metaTabs: TabValidationTab[] = [
      identityTab,
      {
        id: 'meta',
        fields: [],
        errorPaths: ['external.slug'],
      },
    ]
    const metaFields = metaTabs.flatMap((tab) => tab.fields)
    const issues = issuesFromErrors({
      external: { slug: { type: 'custom', message: 'Required' } },
    })

    const states = resolveTabValidationState(issues, metaTabs, metaFields)

    expect(states.find((state) => state.tabId === 'meta')?.count).toBe(1)
  })
})

describe('getFirstInvalidTabId', () => {
  it('agrees with resolveInvalidSubmitNavigation for the first issue tab', () => {
    const errors = {
      name: { type: 'custom', message: 'Required' },
      level: { type: 'custom', message: 'Required' },
      grants: [{ label: { type: 'custom', message: 'Required' } }],
    } as unknown as FieldErrors
    const issues = issuesFromErrors(errors)
    const sections = collectArraySections(allFields)
    const sorted = sortFormIssues(
      issues.map((issue) => {
        const section = sections
          .filter(
            (entry) =>
              issue.path.startsWith(`${entry.fullName}.`) || issue.arrayPath === entry.fullName,
          )
          .sort((left, right) => right.fullName.length - left.fullName.length)[0]

        return classifyFormIssues([issue], {
          arrayPattern: section?.config.arrayPattern,
          fieldOrder: section?.fieldOrder,
        })[0]!
      }),
      sections,
    )

    const navigation = resolveInvalidSubmitNavigation({
      errors,
      fields: allFields,
      idPrefix: 'form',
    })

    expect(getFirstInvalidTabId(issues, tabs, allFields)).toBe(
      findTabForIssue(sorted[0]!.path, tabs),
    )
    expect(getFirstInvalidTabId(issues, tabs, allFields)).toBe(
      findTabForIssue(navigation!.firstIssue.path, tabs),
    )
  })
})

function findTabForIssue(path: string, tabList: TabValidationTab[]): string | undefined {
  const states = resolveTabValidationState(
    [{ path, message: 'Required', severity: 'field' }],
    tabList,
    tabList.flatMap((tab) => tab.fields),
  )
  return states.find((state) => state.count > 0)?.tabId
}

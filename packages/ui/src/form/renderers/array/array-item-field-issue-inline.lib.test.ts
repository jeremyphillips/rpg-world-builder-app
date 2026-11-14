import { describe, expect, it } from 'vitest'

import type { FormIssue } from '../../errors/form-issue.types'
import {
  fieldIssueHasRenderableControl,
  fieldIssuesNeedJoinedSummary,
} from './array-item-field-issue-inline.lib'

const itemPrefix = 'requirements.0'

describe('fieldIssueHasRenderableControl', () => {
  const boundIssue: FormIssue = {
    path: 'requirements.0.bound',
    relativePath: 'bound',
    message: 'Choose a size',
    severity: 'field',
    scope: 'field',
    itemPrefix,
    arrayPath: 'requirements',
    itemIndex: 0,
  }

  it('returns true when the issue maps to a registered item field', () => {
    expect(
      fieldIssueHasRenderableControl(boundIssue, {
        itemPrefix,
        fieldOrder: ['bound', 'comparison'],
        inactivePaths: new Set(),
      }),
    ).toBe(true)
  })

  it('returns false for errors on paths not in the item field order', () => {
    const kindIssue: FormIssue = {
      ...boundIssue,
      path: 'requirements.0.kind',
      relativePath: 'kind',
      message: 'Invalid kind',
    }
    expect(
      fieldIssueHasRenderableControl(kindIssue, {
        itemPrefix,
        fieldOrder: ['bound', 'comparison'],
        inactivePaths: new Set(),
      }),
    ).toBe(false)
  })
})

describe('fieldIssuesNeedJoinedSummary', () => {
  const boundIssue: FormIssue = {
    path: 'requirements.0.bound',
    relativePath: 'bound',
    message: 'Choose a size',
    severity: 'field',
    scope: 'field',
    itemPrefix,
    arrayPath: 'requirements',
    itemIndex: 0,
  }

  it('joins when the row is collapsed even if controls exist', () => {
    expect(
      fieldIssuesNeedJoinedSummary([boundIssue], {
        itemPrefix,
        fieldOrder: ['bound'],
        inactivePaths: new Set(),
        hasVisibleBodyFields: true,
        collapsed: true,
      }),
    ).toBe(true)
  })

  it('skips join when expanded and every issue maps to a visible control', () => {
    expect(
      fieldIssuesNeedJoinedSummary([boundIssue], {
        itemPrefix,
        fieldOrder: ['bound'],
        inactivePaths: new Set(),
        hasVisibleBodyFields: true,
        collapsed: false,
      }),
    ).toBe(false)
  })

  it('joins when any issue lacks a renderable control', () => {
    const kindIssue: FormIssue = {
      ...boundIssue,
      path: 'requirements.0.kind',
      relativePath: 'kind',
    }
    expect(
      fieldIssuesNeedJoinedSummary([kindIssue], {
        itemPrefix,
        fieldOrder: ['bound'],
        inactivePaths: new Set(),
        hasVisibleBodyFields: true,
        collapsed: false,
      }),
    ).toBe(true)
  })
})

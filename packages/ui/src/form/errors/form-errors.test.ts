import { describe, expect, it } from 'vitest'
import type { FieldErrors } from 'react-hook-form'

import { encodeStructuredMessage } from '@rpg/contracts'

import { classifyFormIssues } from './classify-form-issue'
import { flattenFormIssues } from './flatten-form-issues'
import {
  countInvalidArrayItems,
  countIssuesForArrayPath,
  groupIssuesForItemPrefix,
  sortFormIssues,
} from './group-form-issues'
import { resolveInvalidSubmitNavigation } from './resolve-invalid-submit-navigation'
import { resolveIssueFocusFieldName } from './resolve-issue-focus-target'
import { collectArraySections } from './resolve-field-order'
import type { FormItem } from '../field-config'

const startingWealthFields: FormItem[] = [
  {
    kind: 'array',
    name: 'startingWealth.tiers',
    legend: 'Wealth tiers',
    arrayPattern: { kind: 'levelRange', levelKeys: { min: 'minLevel', max: 'maxLevel' } },
    fields: [
      { type: 'text', name: 'label', label: 'Tier label', required: true },
      {
        kind: 'array',
        name: 'magicItemGrants',
        legend: 'Grants',
        fields: [{ type: 'select', name: 'rarity', label: 'Rarity', options: [], required: true }],
      },
    ],
  },
]

describe('flattenFormIssues', () => {
  it('flattens nested array field errors', () => {
    const errors = {
      startingWealth: {
        tiers: [
          { label: { type: 'custom', message: 'Required' } },
          { minLevel: { type: 'custom', message: 'This range overlaps with Levels 1–5.' } },
        ],
      },
    } as unknown as FieldErrors

    const issues = flattenFormIssues(errors)
    expect(issues).toEqual([
      expect.objectContaining({
        path: 'startingWealth.tiers.0.label',
        message: 'Required',
        arrayPath: 'startingWealth.tiers',
        itemIndex: 0,
        itemPrefix: 'startingWealth.tiers.0',
        relativePath: 'label',
      }),
      expect.objectContaining({
        path: 'startingWealth.tiers.1.minLevel',
        message: 'This range overlaps with Levels 1–5.',
        arrayPath: 'startingWealth.tiers',
        itemIndex: 1,
        relativePath: 'minLevel',
      }),
    ])
  })

  it('flattens nested grant errors under a tier item', () => {
    const errors = {
      startingWealth: {
        tiers: [
          {
            magicItemGrants: [
              undefined,
              { rarity: { type: 'custom', message: 'Choose at least one rarity.' } },
            ],
          },
        ],
      },
    } as unknown as FieldErrors

    const issues = flattenFormIssues(errors)
    expect(issues[0]).toMatchObject({
      path: 'startingWealth.tiers.0.magicItemGrants.1.rarity',
      relativePath: 'magicItemGrants.1.rarity',
      itemPrefix: 'startingWealth.tiers.0',
    })
  })

  it('decodes structured field and summary messages with messageId and params', () => {
    const structured = encodeStructuredMessage(
      'Choose a rarity.',
      'Missing Rarity',
      'validation.field.requiredSelect',
      { label: 'Rarity' },
    )
    const errors = {
      tiers: [{ rarity: { type: 'custom', message: structured } }],
    } as unknown as FieldErrors

    const issues = classifyFormIssues(flattenFormIssues(errors), {})
    expect(issues[0]).toMatchObject({
      message: 'Choose a rarity.',
      summaryMessage: 'Missing Rarity',
      messageId: 'validation.field.requiredSelect',
      messageParams: { label: 'Rarity' },
      scope: 'field',
    })
  })
})

describe('classifyFormIssues scope', () => {
  it('derives scope from array path context', () => {
    const [labelIssue, overlapIssue, grantIssue] = classifyFormIssues(
      flattenFormIssues({
        startingWealth: {
          tiers: [
            { label: { type: 'custom', message: 'Required' } },
            { minLevel: { type: 'custom', message: 'This range overlaps with Levels 1–5.' } },
          ],
        },
      } as unknown as FieldErrors),
      { arrayPattern: { kind: 'levelRange', levelKeys: { min: 'minLevel', max: 'maxLevel' } } },
    )

    expect(labelIssue?.scope).toBe('field')
    expect(overlapIssue?.scope).toBe('field')
    expect(grantIssue).toBeUndefined()
  })
  it('classifies level range min/max as cross-row for levelRange patterns', () => {
    const [overlap, label] = classifyFormIssues(
      [
        {
          path: 'startingWealth.tiers.1.minLevel',
          message: 'This range overlaps with Levels 1–5.',
          severity: 'field',
          relativePath: 'minLevel',
        },
        {
          path: 'startingWealth.tiers.0.label',
          message: 'Required',
          severity: 'field',
          relativePath: 'label',
        },
      ],
      { arrayPattern: { kind: 'levelRange', levelKeys: { min: 'minLevel', max: 'maxLevel' } } },
    )

    expect(overlap?.severity).toBe('crossRow')
    expect(label?.severity).toBe('field')
  })
})

describe('groupIssuesForItemPrefix', () => {
  it('rolls up nested descendant issues to the parent tier prefix', () => {
    const issues = classifyFormIssues(
      flattenFormIssues({
        startingWealth: {
          tiers: [
            {
              label: { type: 'custom', message: 'Required' },
              magicItemGrants: [
                { rarity: { type: 'custom', message: 'Choose at least one rarity.' } },
              ],
            },
          ],
        },
      } as unknown as FieldErrors),
      { arrayPattern: { kind: 'levelRange' } },
    )

    const group = groupIssuesForItemPrefix(
      issues,
      'startingWealth.tiers.0',
      'startingWealth.tiers',
      0,
      ['minLevel', 'maxLevel', 'label', 'magicItemGrants'],
    )

    expect(group.totalCount).toBe(2)
    expect(group.fieldIssues).toHaveLength(2)
  })

  it('joins field summary labels for compact row chrome', () => {
    const issues = classifyFormIssues(
      [
        {
          path: 'grants.0.rarity',
          message: 'Choose a rarity.',
          summaryMessage: 'Missing Rarity',
          severity: 'field',
          relativePath: 'rarity',
        },
        {
          path: 'grants.0.quantity',
          message: 'Quantity is required.',
          summaryMessage: 'Missing Quantity',
          severity: 'field',
          relativePath: 'quantity',
        },
      ],
      {},
    )

    const group = groupIssuesForItemPrefix(issues, 'grants.0', 'grants', 0, ['rarity', 'quantity'])
    expect(group.fieldSummary).toBe('Missing Rarity · Missing Quantity')
  })
})

describe('resolveInvalidSubmitNavigation', () => {
  it('prioritizes cross-row issues before field errors', () => {
    const navigation = resolveInvalidSubmitNavigation({
      idPrefix: 'form-1',
      fields: startingWealthFields,
      errors: {
        startingWealth: {
          tiers: [
            { label: { type: 'custom', message: 'Required' } },
            { minLevel: { type: 'custom', message: 'This range overlaps with Levels 1–5.' } },
          ],
        },
      } as unknown as FieldErrors,
    })

    expect(navigation?.firstIssue.path).toBe('startingWealth.tiers.1.minLevel')
    expect(navigation?.expandKeys).toContain('startingWealth.tiers:index:1')
    expect(navigation?.focusControlId).toBe('form-1-startingWealth-tiers-1-minLevel')
  })
})

describe('resolveIssueFocusFieldName', () => {
  it('maps end-at messages to maxLevel for levelRange patterns', () => {
    const target = resolveIssueFocusFieldName(
      {
        path: 'startingWealth.tiers.3.maxLevel',
        message: 'Tiers must cover levels 1–20.',
        severity: 'crossRow',
        relativePath: 'maxLevel',
      },
      { kind: 'levelRange', levelKeys: { min: 'minLevel', max: 'maxLevel' } },
      3,
    )

    expect(target).toBe('maxLevel')
  })
})

describe('sortFormIssues', () => {
  it('sorts by severity tier then item index', () => {
    const sections = collectArraySections(startingWealthFields)
    const issues = classifyFormIssues(
      flattenFormIssues({
        startingWealth: {
          tiers: [
            { label: { type: 'custom', message: 'Required' } },
            { minLevel: { type: 'custom', message: 'This range overlaps with Levels 1–5.' } },
          ],
        },
      } as unknown as FieldErrors),
      { arrayPattern: { kind: 'levelRange' } },
    )

    const sorted = sortFormIssues(issues, sections)
    expect(sorted[0]?.severity).toBe('crossRow')
  })
})

describe('countInvalidArrayItems', () => {
  it('counts distinct invalid rows in an array', () => {
    const issues = flattenFormIssues({
      startingWealth: {
        tiers: [
          { label: { type: 'custom', message: 'Required' } },
          { minLevel: { type: 'custom', message: 'This range overlaps with Levels 1–5.' } },
        ],
      },
    } as unknown as FieldErrors)

    expect(countInvalidArrayItems(issues, 'startingWealth.tiers')).toBe(2)
  })
})

describe('countIssuesForArrayPath', () => {
  it('counts all error paths under an array', () => {
    const issues = flattenFormIssues({
      startingWealth: {
        tiers: [
          {
            label: { type: 'custom', message: 'Required' },
            magicItemGrants: [
              { rarity: { type: 'custom', message: 'Missing Rarity' } },
              { rarity: { type: 'custom', message: 'Missing Rarity' } },
            ],
          },
        ],
      },
    } as unknown as FieldErrors)

    expect(countIssuesForArrayPath(issues, 'startingWealth.tiers')).toBe(3)
    expect(countInvalidArrayItems(issues, 'startingWealth.tiers')).toBe(1)
  })
})

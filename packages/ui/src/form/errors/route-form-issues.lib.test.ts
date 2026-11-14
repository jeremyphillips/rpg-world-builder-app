import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import type { FormItem } from '../field-config'
import { collectIssueClaimReport } from '../test-utils/form-validation-test-utils'
import { prepareFormIssues } from './resolve-invalid-submit-navigation'

const saveFields: FormItem[] = [
  {
    type: 'select',
    name: 'resolution.method.ability',
    label: 'Saving throw ability',
    options: [{ value: 'dex', label: 'Dex' }],
    required: true,
  },
  {
    kind: 'array',
    name: 'resolution.effects',
    label: 'Effects',
    fields: [
      {
        type: 'select',
        name: 'damageType',
        label: 'Damage type',
        options: [{ value: 'fire', label: 'Fire' }],
        required: true,
      },
    ],
  },
]

const saveSchema = z.object({
  resolution: z.object({
    method: z.object({
      ability: z.string().min(1),
    }),
    effects: z
      .array(
        z.object({
          damageType: z.string().min(1),
        }),
      )
      .min(1),
  }),
})

describe('routeFormIssues via prepareFormIssues', () => {
  it('claims exact control paths', () => {
    const issues = prepareFormIssues(
      { resolution: { method: { ability: { message: 'Required', type: 'custom' } } } },
      saveFields,
    )
    expect(issues[0]).toMatchObject({
      path: 'resolution.method.ability',
      claim: { kind: 'field', target: 'resolution.method.ability' },
      presentationPath: 'resolution.method.ability',
    })
  })

  it('routes missing object paths to the first descendant control in field order', () => {
    const issues = prepareFormIssues(
      { resolution: { method: { message: 'Required', type: 'custom' } } },
      saveFields,
    )
    expect(issues[0]).toMatchObject({
      path: 'resolution.method',
      claim: { kind: 'field', target: 'resolution.method.ability' },
    })
  })

  it('routes array container issues to the array field', () => {
    const issues = prepareFormIssues(
      { resolution: { effects: { message: 'Add at least one item', type: 'custom' } } },
      saveFields,
    )
    expect(issues[0]).toMatchObject({
      path: 'resolution.effects',
      claim: { kind: 'field', target: 'resolution.effects' },
    })
  })

  it('classifies row claims as header severity', () => {
    const issues = prepareFormIssues(
      { tiers: { message: 'Row constraint', type: 'custom' } } as never,
      [
        {
          kind: 'array',
          name: 'tiers',
          label: 'Tiers',
          fields: [{ type: 'text', name: 'label', label: 'Label', required: true }],
        },
      ],
      { tiers: [{ label: 'a' }] },
    )
    const rowIssue = issues.find((issue) => issue.path === 'tiers' && issue.claim?.kind === 'row')
    if (rowIssue) {
      expect(rowIssue.severity).toBe('row')
    }
  })
})

describe('collectIssueClaimReport', () => {
  it('returns routed claims for invalid publish payloads', () => {
    const report = collectIssueClaimReport({
      schema: saveSchema,
      values: {
        resolution: {
          selectionMode: 'targets',
          target: {},
        },
      },
      fields: saveFields,
    })

    expect(report.length).toBeGreaterThan(0)
    expect(report.every((entry) => entry.claim.kind !== 'fallback')).toBe(true)
    expect(report.find((entry) => entry.path.endsWith('resolution.method'))?.claim.kind).toBe(
      'field',
    )
  })
})

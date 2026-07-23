import { describe, expect, it } from 'vitest'

import {
  resolveFieldGroupCollapseKey,
  validateSummaryDisclosureRequirements,
} from './field-group-collapse.lib'

describe('field-group-collapse.lib', () => {
  it('resolves collapse key from disclosure, then props, then legend slug', () => {
    expect(
      resolveFieldGroupCollapseKey({
        disclosure: {
          variant: 'summary',
          collapseKey: 'access',
          resolveSummary: () => ({ primary: '' }),
        },
        collapseKey: 'group',
        id: 'id',
        legend: 'Campaign availability',
      }),
    ).toBe('access')

    expect(resolveFieldGroupCollapseKey({ collapseKey: 'group', id: 'id' })).toBe('group')
    expect(resolveFieldGroupCollapseKey({ id: 'my-group' })).toBe('my-group')
    expect(resolveFieldGroupCollapseKey({ legend: 'Campaign availability' })).toBe(
      'campaign-availability',
    )
  })

  it('validates summary disclosure requirements', () => {
    expect(() => validateSummaryDisclosureRequirements(undefined, {} as never)).toThrow(/legend/)
    expect(() => validateSummaryDisclosureRequirements('Legend', undefined)).toThrow(/formControl/)
    expect(validateSummaryDisclosureRequirements('Legend', {} as never)).toEqual({
      legend: 'Legend',
      formControl: {},
    })
  })
})

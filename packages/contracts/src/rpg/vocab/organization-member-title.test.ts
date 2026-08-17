import { describe, expect, it } from 'vitest'

import {
  resolveOrganizationMemberTitleEntry,
  resolveOrganizationMemberTitleSuggestions,
} from './organization-member-title'

describe('organization member-title resolution', () => {
  it('interleaves practice, function, form, and domain contributions by local rank', () => {
    const labels = resolveOrganizationMemberTitleSuggestions({
      domain: 'criminal',
      form: 'guild',
      practices: ['smuggling'],
    }).map((entry) => entry.label)

    expect(labels.slice(0, 6)).toEqual([
      'Ringleader',
      'Guildmaster',
      'Boss',
      'Smuggler',
      'Master',
      'Lieutenant',
    ])
  })

  it('composes extortion practice titles without assuming a specific criminal constitution', () => {
    const labels = resolveOrganizationMemberTitleSuggestions({
      domain: 'criminal',
      practices: ['extortion'],
    }).map((entry) => entry.label)

    expect(labels.slice(0, 5)).toEqual(['Chief', 'Boss', 'Enforcer', 'Lieutenant', 'Collector'])
  })

  it('dedupes normalized labels while preserving the first contribution', () => {
    const titles = resolveOrganizationMemberTitleSuggestions({
      domain: 'commercial',
      form: 'company',
      functions: ['finance'],
      practices: ['banking'],
    })
    expect(titles.filter((entry) => entry.label === 'Treasurer')).toEqual([
      { label: 'Treasurer', priority: 50 },
    ])
  })

  it('looks up labels from the complete composition', () => {
    expect(
      resolveOrganizationMemberTitleEntry({
        domain: 'academic',
        form: 'association',
        functions: ['education', 'training', 'research'],
        title: 'Research Director',
      }),
    ).toEqual({ label: 'Research Director', priority: 50 })
  })

  it('prefers Pass A function and form titles over domain defaults', () => {
    const ministryLabels = resolveOrganizationMemberTitleSuggestions({
      domain: 'government',
      form: 'office',
      functions: ['administration'],
    }).map((entry) => entry.label)

    expect(ministryLabels.slice(0, 3)).toEqual(['Registrar', 'Chancellor', 'Ruler'])
    expect(ministryLabels).not.toContain('High Priest')

    const commerceLabels = resolveOrganizationMemberTitleSuggestions({
      domain: 'commercial',
      form: 'company',
      functions: ['trade', 'production'],
    }).map((entry) => entry.label)

    expect(commerceLabels[0]).toBe('Merchant')
    expect(commerceLabels).toContain('Director')
    expect(commerceLabels).toContain('Foreman')
  })
})

import { describe, expect, it } from 'vitest'

import { formatRecommendationSourceLabel } from './format-recommendation-source-label'
import { formatSuggestedBySentence } from './format-suggested-by'
import {
  npcRecommendationSourceKind,
  recommendationSourceRefFromDisplaySourceKind,
  recommendationSourceRefFromNpcRecommendationSource,
  recommendationSourceRefFromOrganizationClassSource,
} from './recommendation-source-adapters'

describe('formatRecommendationSourceLabel', () => {
  it('formats canonical class, role, title, and species phrases', () => {
    expect(formatRecommendationSourceLabel({ kind: 'class' }, { name: 'Fighter' })).toBe(
      'Fighter class',
    )
    expect(formatRecommendationSourceLabel({ kind: 'role' }, { name: 'Guard' })).toBe('Guard role')
    expect(formatRecommendationSourceLabel({ kind: 'title' }, { name: 'Captain' })).toBe(
      'Captain title',
    )
    expect(formatRecommendationSourceLabel({ kind: 'species' }, { name: 'Elf' })).toBe(
      'Elf species',
    )
    expect(formatRecommendationSourceLabel({ kind: 'user' })).toBe('You')
  })

  it('keeps Quick NPC choice-hint and attribute-helper copy', () => {
    expect(
      formatRecommendationSourceLabel({ kind: 'role' }, { name: 'Guard', density: 'choice-hint' }),
    ).toBe('Guard role')
    expect(
      formatRecommendationSourceLabel({ kind: 'species' }, { name: 'Elf', density: 'choice-hint' }),
    ).toBe('Elf species')
    expect(
      formatRecommendationSourceLabel(
        { kind: 'title' },
        { name: 'Captain', density: 'choice-hint' },
      ),
    ).toBe('Captain')
    expect(
      formatRecommendationSourceLabel(
        { kind: 'title' },
        { name: 'Lieutenant', density: 'attribute-helper' },
      ),
    ).toBe('Lieutenant')
    expect(
      formatRecommendationSourceLabel(
        { kind: 'organization' },
        { name: 'City Watch', density: 'attribute-helper' },
      ),
    ).toBe('City Watch')
    expect(formatSuggestedBySentence('Guard role')).toBe('Suggested by Guard role')
    expect(formatSuggestedBySentence('Lieutenant', { trailingPeriod: true })).toBe(
      'Suggested by Lieutenant.',
    )
  })
})

describe('recommendation source adapters', () => {
  it('maps template onto role and leaves campaign unmapped', () => {
    expect(npcRecommendationSourceKind('template')).toBe('role')
    expect(npcRecommendationSourceKind('campaign')).toBeUndefined()
    expect(
      recommendationSourceRefFromNpcRecommendationSource('template', { roleId: 'guard' }),
    ).toEqual({ kind: 'role', id: 'guard' })
    expect(recommendationSourceRefFromNpcRecommendationSource('campaign')).toBeUndefined()
    expect(recommendationSourceRefFromNpcRecommendationSource('user')).toEqual({ kind: 'user' })
  })

  it('adapts display sources and organization class sources', () => {
    expect(
      recommendationSourceRefFromDisplaySourceKind('title', {
        titleOrganizationId: 'org-1',
        titleId: 'omt_captain',
      }),
    ).toEqual({ kind: 'title', organizationId: 'org-1', titleId: 'omt_captain' })
    expect(
      recommendationSourceRefFromOrganizationClassSource('template', { roleId: 'guard' }),
    ).toEqual({ kind: 'role', id: 'guard' })
    expect(
      recommendationSourceRefFromOrganizationClassSource('organization', {
        organizationId: 'org-1',
      }),
    ).toEqual({ kind: 'organization', id: 'org-1' })
  })
})

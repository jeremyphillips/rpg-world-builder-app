import { describe, expect, it } from 'vitest'

import {
  getOrganizationClassificationDiscoveryTerms,
  getOrganizationClassificationDiscoveryText,
} from './classification-discovery'
import { getOrganizationDomainDiscoveryTerms } from './domain'
import { getOrganizationFormDiscoveryTerms } from './form'
import { getOrganizationFunctionDiscoveryTerms } from './function'
import { getOrganizationPracticeDiscoveryTerms } from './practice'

describe('getOrganizationClassificationDiscoveryText', () => {
  it('concatenates domain, form, function, and practice discovery terms', () => {
    const input = {
      organizationDomain: 'commercial' as const,
      organizationForm: 'company' as const,
      functions: ['finance'] as const,
      practices: ['banking'] as const,
    }

    expect(getOrganizationClassificationDiscoveryText(input)).toBe(
      getOrganizationClassificationDiscoveryTerms(input).join(' '),
    )
    expect(getOrganizationClassificationDiscoveryTerms(input)).toEqual([
      ...getOrganizationDomainDiscoveryTerms(input.organizationDomain),
      ...getOrganizationFormDiscoveryTerms(input.organizationForm),
      ...getOrganizationFunctionDiscoveryTerms('finance'),
      ...getOrganizationPracticeDiscoveryTerms('banking'),
    ])
  })

  it('omits form and classification axes when unset or empty', () => {
    expect(
      getOrganizationClassificationDiscoveryText({
        organizationDomain: 'criminal',
        practices: ['smuggling'],
      }),
    ).toBe(
      [
        ...getOrganizationDomainDiscoveryTerms('criminal'),
        ...getOrganizationPracticeDiscoveryTerms('smuggling'),
      ].join(' '),
    )
  })
})

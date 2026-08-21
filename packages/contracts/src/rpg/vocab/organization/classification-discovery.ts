import { getOrganizationFunctionDiscoveryTerms, type OrganizationFunction } from './function'
import { getOrganizationPracticeDiscoveryTerms, type OrganizationPractice } from './practice'
import { getOrganizationDomainDiscoveryTerms, type OrganizationDomain } from './domain'
import { getOrganizationFormDiscoveryTerms, type OrganizationForm } from './form'

export function getOrganizationClassificationDiscoveryText(input: {
  organizationDomain: OrganizationDomain
  organizationForm?: OrganizationForm
  functions?: readonly OrganizationFunction[]
  practices?: readonly OrganizationPractice[]
}): string {
  return [
    ...getOrganizationDomainDiscoveryTerms(input.organizationDomain),
    ...(input.organizationForm ? getOrganizationFormDiscoveryTerms(input.organizationForm) : []),
    ...(input.functions ?? []).flatMap(getOrganizationFunctionDiscoveryTerms),
    ...(input.practices ?? []).flatMap(getOrganizationPracticeDiscoveryTerms),
  ].join(' ')
}

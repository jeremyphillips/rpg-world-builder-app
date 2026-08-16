import {
  getOrganizationFunctionDiscoveryTerms,
  type OrganizationFunction,
} from './organization-function'
import {
  getOrganizationPracticeDiscoveryTerms,
  type OrganizationPractice,
} from './organization-practice'
import { getOrganizationDomainDiscoveryTerms, type OrganizationDomain } from './organization-domain'
import { getOrganizationFormDiscoveryTerms, type OrganizationForm } from './organization-form'

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

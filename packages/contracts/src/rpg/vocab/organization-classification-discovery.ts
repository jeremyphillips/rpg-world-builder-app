import {
  getOrganizationActivityDiscoveryTerms,
  type OrganizationActivity,
} from './organization-activity'
import { getOrganizationDomainDiscoveryTerms, type OrganizationDomain } from './organization-domain'
import { getOrganizationFormDiscoveryTerms, type OrganizationForm } from './organization-form'

export function getOrganizationClassificationDiscoveryText(input: {
  organizationDomain: OrganizationDomain
  organizationForm?: OrganizationForm
  activities?: readonly OrganizationActivity[]
}): string {
  return [
    ...getOrganizationDomainDiscoveryTerms(input.organizationDomain),
    ...(input.organizationForm
      ? getOrganizationFormDiscoveryTerms(input.organizationForm)
      : []),
    ...(input.activities ?? []).flatMap(getOrganizationActivityDiscoveryTerms),
  ].join(' ')
}

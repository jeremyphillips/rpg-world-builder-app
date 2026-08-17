import {
  getOrganizationFunctionLabel,
  getOrganizationPracticeLabel,
  getOrganizationDomainEntry,
  getOrganizationDomainLabel,
  getOrganizationFormEntry,
  getOrganizationFormLabel,
  type Organization,
  type OrganizationLocationConnectionFamily,
  type OrganizationLocationConnectionKind,
} from '@rpg/contracts'

import { formatContentReferenceLabel } from '@/features/character'

import type { ContentStatRowData } from '../../lib/detail/metadata/content-stat-rows'
import type { DrawerContextEntityPresentation } from '../../lib/relationship/drawer-context.types'
import type { LocationEntitySummaryVm } from '../../locations/lib/location-display'
import { CONTENT_REFERENCE_UNRESOLVED_SUFFIX } from './organization-member-class-chip-options.lib'

export const ORGANIZATION_SECTION_LABELS = {
  members: 'Members',
  locationConnections: 'Location connections',
} as const

export const ORGANIZATION_EMPTY_SECTION_TEXT = {
  members: 'No members linked.',
  locationConnections: 'No location connections yet.',
} as const

export const ORGANIZATION_DRAWER_CONTEXT_TYPE_SUFFIX = ' · Organization' as const

export function buildOrganizationDrawerContextEntity(
  organization: Pick<Organization, 'name'>,
): DrawerContextEntityPresentation {
  return {
    heading: organization.name,
    headingSuffix: ORGANIZATION_DRAWER_CONTEXT_TYPE_SUFFIX,
  }
}

export type OrganizationLocationConnectionPreviewItem = {
  connectionId: string
  locationId: string
  kind: OrganizationLocationConnectionKind
  family: OrganizationLocationConnectionFamily
  /** null when the persisted location reference failed to resolve */
  target: LocationEntitySummaryVm | null
}

export type OrganizationLocationConnectionsViewModel = {
  previewItems: OrganizationLocationConnectionPreviewItem[]
  total: number
  emptyText: string
}

export type OrganizationDetailViewModel = {
  statRows: ContentStatRowData[]
  description?: string
  locationConnections: OrganizationLocationConnectionsViewModel
}

export function formatLocationConnectionsCount(total: number): string {
  return `${total} location connection${total === 1 ? '' : 's'}`
}

export function buildOrganizationDetailViewModel(
  organization: Organization,
  locationConnections: OrganizationLocationConnectionsViewModel,
  classLabelById?: ReadonlyMap<string, string>,
): OrganizationDetailViewModel {
  const domainLabel = getOrganizationDomainLabel(organization.organizationDomain)
  const form =
    organization.organizationForm !== undefined
      ? getOrganizationFormEntry(organization.organizationForm)
      : undefined
  const formLabel =
    organization.organizationForm !== undefined
      ? getOrganizationFormLabel(organization.organizationForm)
      : undefined

  return {
    statRows: [
      {
        label: 'Domain',
        value: domainLabel,
        info: getOrganizationDomainEntry(organization.organizationDomain)?.description,
        infoAriaLabel: `About ${domainLabel}`,
      },
      ...(formLabel
        ? [
            {
              label: 'Form',
              value: formLabel,
              info: form?.description,
              infoAriaLabel: `About ${formLabel}`,
            },
          ]
        : []),
      ...(organization.functions.length > 0
        ? [
            {
              label: 'Functions',
              value: organization.functions.map(getOrganizationFunctionLabel).join(' · '),
            },
          ]
        : []),
      ...(organization.practices.length > 0
        ? [
            {
              label: 'Practices',
              value: organization.practices.map(getOrganizationPracticeLabel).join(' · '),
            },
          ]
        : []),
      ...(organization.memberClassAffinityIds.length > 0
        ? [
            {
              label: 'Member class affinities',
              value: organization.memberClassAffinityIds
                .map((classId) => {
                  const label = classLabelById?.get(classId)
                  if (label) return label
                  return `${formatContentReferenceLabel(classId)} ${CONTENT_REFERENCE_UNRESOLVED_SUFFIX}`
                })
                .join(' · '),
            },
          ]
        : []),
    ],
    description: organization.description || undefined,
    locationConnections,
  }
}

import {
  buildContentPurposeSelectors,
  getOrganizationFunctionLabel,
  getOrganizationPracticeLabel,
  getOrganizationDomainEntry,
  getOrganizationDomainLabel,
  getOrganizationFormEntry,
  getOrganizationFormLabel,
  type Organization,
  type OrganizationDomain,
  type OrganizationLocationConnectionFamily,
  type OrganizationLocationConnectionKind,
  type CharacterClass,
  type Species,
} from '@rpg/contracts'

import type { ContentDisplayImage } from '@rpg/contracts'

import { getContentDisplayImage } from '../../lib/detail/page/content-display-image'
import { buildOrganizationContentDisplayImageInput } from '../../lib/detail/page/content-display-image-input'
import type { EntitySurfaceIdentity } from '../../lib/entity/summary/entity-surface-identity.types'
import type { EntitySummaryStatusItem } from '../../lib/entity/summary/entity-summary-status.types'

import type { ContentStatRowData } from '../../lib/detail/metadata/content-stat-rows'
import type { DrawerEntityPresentation } from '../../lib/entity/surfaces/drawer/drawer-entity.types'
import type { LocationEntitySummaryVm } from '../../locations/lib/location-display'
import { resolveOrganizationMemberClassAffinityDisplayLabel } from './members/organization-member-class-chip-options.lib'
import { resolveOrganizationMemberSpeciesAffinityDisplayLabel } from './members/organization-member-species-chip-options.lib'

export const ORGANIZATION_SECTION_LABELS = {
  members: 'Members',
  locationConnections: 'Location connections',
} as const

export const ORGANIZATION_EMPTY_SECTION_TEXT = {
  members: 'No members linked.',
  locationConnections: 'No location connections yet.',
} as const

export const ORGANIZATION_DRAWER_CONTEXT_TYPE_SUFFIX = ' · Organization' as const

export type OrganizationEntitySummaryVm = {
  id: string
  name: string
  organizationDomain: OrganizationDomain
  displayImage?: ContentDisplayImage
}

export function buildOrganizationEntitySummaryVm(
  organization: Pick<
    Organization,
    'id' | 'name' | 'organizationDomain' | 'media' | 'slug' | 'source' | 'rulesetId'
  >,
): OrganizationEntitySummaryVm {
  return {
    id: organization.id,
    name: organization.name,
    organizationDomain: organization.organizationDomain,
    displayImage: getContentDisplayImage(
      buildOrganizationContentDisplayImageInput(
        {
          media: organization.media,
          slug: organization.slug,
          source: organization.source,
          rulesetId: organization.rulesetId,
        },
        'compact',
      ),
    ),
  }
}

export function buildOrganizationEntityCardModel(
  vm: OrganizationEntitySummaryVm,
  options: { metadata?: string; status?: readonly EntitySummaryStatusItem[] } = {},
): EntitySurfaceIdentity {
  return {
    heading: vm.name,
    fallback: 'organization',
    classification: getOrganizationDomainLabel(vm.organizationDomain),
    ...(options.metadata !== undefined
      ? options.metadata
        ? { metadata: options.metadata }
        : {}
      : {}),
    ...(options.status && options.status.length > 0 ? { status: options.status } : {}),
    ...(vm.displayImage ? { displayImage: vm.displayImage } : {}),
  }
}

export function buildOrganizationDrawerEntityPresentation(
  organization: Pick<Organization, 'name'>,
): DrawerEntityPresentation {
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
  catalogClasses: readonly CharacterClass[] = [],
  catalogSpecies: readonly Species[] = [],
): OrganizationDetailViewModel {
  const campaignUseClasses = buildContentPurposeSelectors(catalogClasses).forCampaignUse()
  const campaignUseSpecies = buildContentPurposeSelectors(catalogSpecies).forCampaignUse()
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
      ...(organization.members.classAffinityIds.length > 0
        ? [
            {
              label: 'Member class affinities',
              value: organization.members.classAffinityIds
                .map((classId) =>
                  resolveOrganizationMemberClassAffinityDisplayLabel(classId, {
                    selectableClasses: campaignUseClasses,
                    catalogClasses,
                  }),
                )
                .join(' · '),
            },
          ]
        : []),
      ...(organization.members.speciesAffinityIds.length > 0
        ? [
            {
              label: 'Member species affinities',
              value: organization.members.speciesAffinityIds
                .map((speciesId) =>
                  resolveOrganizationMemberSpeciesAffinityDisplayLabel(speciesId, {
                    selectableSpecies: campaignUseSpecies,
                    catalogSpecies,
                  }),
                )
                .join(' · '),
            },
          ]
        : []),
    ],
    description: organization.description || undefined,
    locationConnections,
  }
}

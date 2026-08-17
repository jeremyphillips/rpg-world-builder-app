import type { Species } from '@rpg/contracts'
import { unionPersistedOptions } from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import { CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_LABEL } from '../../lib/campaign-access/campaign-access-table-labels'
import { formatContentReferenceLabel } from '@/features/character'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import {
  resolveDiscoverableOrganizationMemberSpecies,
  resolveOrganizationMemberSpeciesCatalogSpecies,
} from './organization-member-species-discoverable.lib'

import { CONTENT_REFERENCE_UNRESOLVED_SUFFIX } from './organization-member-class-chip-options.lib'

export const ORGANIZATION_MEMBER_SPECIES_AFFINITY_FIELD_HINT =
  'Species commonly associated with members of this organization. Used to recommend species when adding or creating members.'

const UNAVAILABLE_CHIP_LABEL_SUFFIX = `· ${CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_LABEL}`

export function resolveOrganizationMemberSpeciesAffinityDisplayLabel(
  speciesId: string,
  input: {
    selectableSpecies: readonly Species[]
    catalogSpecies: readonly Species[]
  },
): string {
  const selectableValues = new Set(input.selectableSpecies.map((species) => species.id))
  if (selectableValues.has(speciesId)) {
    const selectableSpecies = input.selectableSpecies.find((species) => species.id === speciesId)
    if (selectableSpecies) return selectableSpecies.name
  }

  const catalogSpecies = input.catalogSpecies.find((species) => species.id === speciesId)
  if (catalogSpecies) {
    return `${catalogSpecies.name} ${UNAVAILABLE_CHIP_LABEL_SUFFIX}`
  }

  return `${formatContentReferenceLabel(speciesId)} ${CONTENT_REFERENCE_UNRESOLVED_SUFFIX}`
}

function buildSelectableMemberSpeciesChipOptions(
  discoverableSpecies: readonly Species[],
): FieldOption[] {
  return [...discoverableSpecies]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((species) => ({
      value: species.id,
      label: species.name,
    }))
}

function buildAuthorizedMemberSpeciesDisplay(input: {
  selectedIds: readonly string[]
  discoverableSpecies: readonly Species[]
  catalogSpecies: readonly Species[]
}): Map<string, { label: string }> {
  const selectableValues = new Set(input.discoverableSpecies.map((species) => species.id))
  const authorizedDisplay = new Map<string, { label: string }>()

  for (const speciesId of input.selectedIds) {
    if (selectableValues.has(speciesId)) continue

    const catalogSpecies = input.catalogSpecies.find((species) => species.id === speciesId)
    if (catalogSpecies) {
      authorizedDisplay.set(speciesId, {
        label: `${catalogSpecies.name} ${UNAVAILABLE_CHIP_LABEL_SUFFIX}`,
      })
    }
  }

  return authorizedDisplay
}

export function buildMemberSpeciesAffinityChipOptions(
  ctx: ContentFormCtx,
  selectedIds: readonly string[] = [],
): FieldOption[] {
  const discoverableSpecies = resolveDiscoverableOrganizationMemberSpecies(ctx)
  const catalogSpecies = resolveOrganizationMemberSpeciesCatalogSpecies(ctx)
  const selectable = buildSelectableMemberSpeciesChipOptions(discoverableSpecies)

  return unionPersistedOptions({
    selectable,
    persistedIds: selectedIds,
    authorizedDisplay: buildAuthorizedMemberSpeciesDisplay({
      selectedIds,
      discoverableSpecies,
      catalogSpecies,
    }),
    formatUnresolvedLabel: (speciesId) =>
      `${formatContentReferenceLabel(speciesId)} ${CONTENT_REFERENCE_UNRESOLVED_SUFFIX}`,
  })
}

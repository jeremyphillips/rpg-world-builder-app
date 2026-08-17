import type { CharacterClass } from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import { CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_LABEL } from '../../lib/campaign-access/campaign-access-table-labels'
import { formatContentReferenceLabel } from '@/features/character'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import {
  resolveDiscoverableOrganizationMemberClasses,
  resolveOrganizationMemberClassCatalogClasses,
} from './organization-member-class-discoverable.lib'

export const ORGANIZATION_MEMBER_CLASS_AFFINITY_FIELD_HINT =
  'Classes commonly associated with members of this organization. Used to recommend classes when adding or creating members.'

export const CONTENT_REFERENCE_UNRESOLVED_SUFFIX = '· Unresolved reference'

const UNAVAILABLE_CHIP_LABEL_SUFFIX = `· ${CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_LABEL}`

function buildSelectableMemberClassChipOptions(
  discoverableClasses: readonly CharacterClass[],
): FieldOption[] {
  return [...discoverableClasses]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((characterClass) => ({
      value: characterClass.id,
      label: characterClass.name,
    }))
}

function buildOrphanMemberClassChipOptions(input: {
  selectedIds: readonly string[]
  discoverableClasses: readonly CharacterClass[]
  catalogClasses: readonly CharacterClass[]
}): FieldOption[] {
  const selectableValues = new Set(
    input.discoverableClasses.map((characterClass) => characterClass.id),
  )
  const catalogById = new Map(
    input.catalogClasses.map((characterClass) => [characterClass.id, characterClass]),
  )
  const orphans: FieldOption[] = []

  for (const classId of input.selectedIds) {
    if (selectableValues.has(classId)) continue

    const catalogClass = catalogById.get(classId)
    if (catalogClass) {
      orphans.push({
        value: classId,
        label: `${catalogClass.name} ${UNAVAILABLE_CHIP_LABEL_SUFFIX}`,
      })
      continue
    }

    orphans.push({
      value: classId,
      label: `${formatContentReferenceLabel(classId)} ${CONTENT_REFERENCE_UNRESOLVED_SUFFIX}`,
    })
  }

  return orphans
}

export function buildMemberClassAffinityChipOptions(
  ctx: ContentFormCtx,
  selectedIds: readonly string[] = [],
): FieldOption[] {
  const discoverableClasses = resolveDiscoverableOrganizationMemberClasses(ctx)
  const catalogClasses = resolveOrganizationMemberClassCatalogClasses(ctx)
  const selectable = buildSelectableMemberClassChipOptions(discoverableClasses)
  const orphanOptions = buildOrphanMemberClassChipOptions({
    selectedIds,
    discoverableClasses,
    catalogClasses,
  })

  if (orphanOptions.length === 0) return selectable

  const selectableValues = new Set(selectable.map((option) => option.value))
  return [...selectable, ...orphanOptions.filter((option) => !selectableValues.has(option.value))]
}

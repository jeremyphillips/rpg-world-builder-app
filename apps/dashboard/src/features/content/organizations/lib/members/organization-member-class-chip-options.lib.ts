import type { CharacterClass } from '@rpg/contracts'
import { unionPersistedOptions } from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'
import type { FieldOption } from '@rpg/ui/form'

import { CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_LABEL } from '../../../lib/campaign-access/campaign-access-table-labels'
import { formatContentReferenceLabel } from '@/features/character'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  resolveDiscoverableOrganizationMemberClasses,
  resolveOrganizationMemberClassCatalogClasses,
} from './organization-member-class-discoverable.lib'

export const ORGANIZATION_MEMBER_NPC_TEMPLATE_FIELD_HINT =
  'Default NPC role when a membership title does not recommend one. Quick create can still override this per member.' as const

export const ORGANIZATION_MEMBER_CLASS_AFFINITY_FIELD_HINT =
  'Classes commonly associated with members.'

const CONTENT_REFERENCE_UNRESOLVED_LABEL = 'Unresolved reference'

export function formatContentReferenceUnresolvedLabel(referenceLabel: string): string {
  return joinInlineMetadata([referenceLabel, CONTENT_REFERENCE_UNRESOLVED_LABEL])
}

export function resolveOrganizationMemberClassAffinityDisplayLabel(
  classId: string,
  input: {
    selectableClasses: readonly CharacterClass[]
    catalogClasses: readonly CharacterClass[]
  },
): string {
  const selectableValues = new Set(
    input.selectableClasses.map((characterClass) => characterClass.id),
  )
  if (selectableValues.has(classId)) {
    const selectableClass = input.selectableClasses.find(
      (characterClass) => characterClass.id === classId,
    )
    if (selectableClass) return selectableClass.name
  }

  const catalogClass = input.catalogClasses.find((characterClass) => characterClass.id === classId)
  if (catalogClass) {
    return joinInlineMetadata([catalogClass.name, CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_LABEL])
  }

  return formatContentReferenceUnresolvedLabel(formatContentReferenceLabel(classId))
}

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

function buildAuthorizedMemberClassDisplay(input: {
  selectedIds: readonly string[]
  discoverableClasses: readonly CharacterClass[]
  catalogClasses: readonly CharacterClass[]
}): Map<string, { label: string }> {
  const selectableValues = new Set(
    input.discoverableClasses.map((characterClass) => characterClass.id),
  )
  const authorizedDisplay = new Map<string, { label: string }>()

  for (const classId of input.selectedIds) {
    if (selectableValues.has(classId)) continue

    const catalogClass = input.catalogClasses.find(
      (characterClass) => characterClass.id === classId,
    )
    if (catalogClass) {
      authorizedDisplay.set(classId, {
        label: joinInlineMetadata([catalogClass.name, CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_LABEL]),
      })
    }
  }

  return authorizedDisplay
}

export function buildMemberClassAffinityChipOptions(
  ctx: ContentFormCtx,
  selectedIds: readonly string[] = [],
): FieldOption[] {
  const discoverableClasses = resolveDiscoverableOrganizationMemberClasses(ctx)
  const catalogClasses = resolveOrganizationMemberClassCatalogClasses(ctx)
  const selectable = buildSelectableMemberClassChipOptions(discoverableClasses)
  const authorizedDisplay = buildAuthorizedMemberClassDisplay({
    selectedIds,
    discoverableClasses,
    catalogClasses,
  })

  return unionPersistedOptions({
    selectable,
    persistedIds: selectedIds,
    authorizedDisplay,
    formatUnresolvedLabel: (classId) =>
      formatContentReferenceUnresolvedLabel(formatContentReferenceLabel(classId)),
  })
}

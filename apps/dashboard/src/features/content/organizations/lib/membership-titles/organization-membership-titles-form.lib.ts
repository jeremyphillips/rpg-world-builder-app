import {
  createDefaultOrganizationMembershipTitleDefinition,
  ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES,
  type OrganizationMembershipTitleDefinition,
  type OrganizationMembershipTitlePriority,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import {
  ORGANIZATION_MEMBERSHIP_TITLES_DESCRIPTION,
  ORGANIZATION_SECTION_LABELS,
} from '../organization-display'

/** RHF `useFieldArray` keyName — must not match persisted catalog row `id` (`omt_*`). */
export const ORGANIZATION_MEMBERSHIP_TITLE_FIELD_ARRAY_KEY = '_fieldArrayKey' as const

export const ORGANIZATION_MEMBERSHIP_TITLE_PRIORITY_LABELS: Record<
  OrganizationMembershipTitlePriority,
  string
> = {
  50: 'Highest (50)',
  40: 'High (40)',
  30: 'Mid (30)',
  20: 'Low (20)',
  10: 'Lowest (10)',
}

export const organizationMembershipTitlePriorityOptions =
  ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES.map((priority) => ({
    value: String(priority),
    label: ORGANIZATION_MEMBERSHIP_TITLE_PRIORITY_LABELS[priority],
  }))

/** Defaults for user-initiated "Add title" — empty label, fresh single-prefix `omt_*`. */
export function createOrganizationMembershipTitleAppendRow(): OrganizationMembershipTitleDefinition {
  const { id } = createDefaultOrganizationMembershipTitleDefinition()
  return {
    id,
    label: '',
    priority: ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES[4],
  }
}

export function parseOrganizationMembershipTitlePriorityValue(
  value: string,
): OrganizationMembershipTitlePriority {
  const parsed = Number.parseInt(value, 10)
  if (
    ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES.includes(parsed as OrganizationMembershipTitlePriority)
  ) {
    return parsed as OrganizationMembershipTitlePriority
  }
  return 10
}

function membershipTitlesFieldName(prefix?: string): string {
  return prefix ? `${prefix}.members.titles` : 'members.titles'
}

/** Coerces select string priorities before contract parse on submit. */
export function normalizeOrganizationMembershipTitleFormRows(
  titles: readonly OrganizationMembershipTitleDefinition[] | undefined,
): OrganizationMembershipTitleDefinition[] | undefined {
  if (!titles) return undefined
  return titles.map((row) => ({
    ...row,
    priority:
      typeof row.priority === 'string'
        ? parseOrganizationMembershipTitlePriorityValue(row.priority)
        : row.priority,
  }))
}

export function buildOrganizationMembershipTitlesArrayField(prefix?: string): FormItem {
  return {
    kind: 'array',
    id: 'organization-membership-titles',
    name: membershipTitlesFieldName(prefix),
    keyName: ORGANIZATION_MEMBERSHIP_TITLE_FIELD_ARRAY_KEY,
    heading: {
      label: ORGANIZATION_SECTION_LABELS.membershipTitles,
      hint: ORGANIZATION_MEMBERSHIP_TITLES_DESCRIPTION,
    },
    min: 1,
    addAction: { label: 'Add title', layout: 'inline' },
    appendDefaults: () => createOrganizationMembershipTitleAppendRow(),
    item: {
      variant: 'compact',
      headerVisibility: 'hidden',
      reorder: false,
      header: {
        fallback: (index) => `Membership title ${index + 1}`,
      },
    },
    fields: [
      {
        kind: 'row',
        fields: [
          {
            type: 'text',
            name: 'label',
            label: 'Label',
            required: true,
            width: 'full',
          },
          {
            type: 'select',
            name: 'priority',
            label: 'Rank',
            required: true,
            width: 'md',
            options: organizationMembershipTitlePriorityOptions,
          },
        ],
      },
    ],
  }
}

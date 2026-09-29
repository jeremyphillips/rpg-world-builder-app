import {
  createDefaultOrganizationMembershipTitleDefinition,
  ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES,
  organizationMembershipTitlePrioritySchema,
  type OrganizationMembershipTitleDefinition,
  type OrganizationMembershipTitlePriority,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { formSelectNumberSchema } from '../../../lib/forms/validation/draft-form-schema-helpers'

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

const membershipTitlePriorityFromFormValue = formSelectNumberSchema(
  organizationMembershipTitlePrioritySchema,
)

function membershipTitlesFieldName(prefix?: string): string {
  return prefix ? `${prefix}.members.titles` : 'members.titles'
}

export type OrganizationMembershipTitleFormRow = Omit<
  OrganizationMembershipTitleDefinition,
  'priority'
> & {
  priority?: OrganizationMembershipTitleDefinition['priority'] | string
}

/** Strict select string → number conversion before contract parse on submit (no default rank). */
export function normalizeOrganizationMembershipTitleFormRows(
  titles: readonly OrganizationMembershipTitleFormRow[] | undefined,
): OrganizationMembershipTitleDefinition[] | undefined {
  if (!titles) return undefined
  return titles.map((row) => {
    if (typeof row.priority !== 'string') {
      return row as OrganizationMembershipTitleDefinition
    }
    const parsed = membershipTitlePriorityFromFormValue.safeParse(row.priority)
    return {
      ...row,
      priority: parsed.success ? parsed.data : row.priority,
    } as OrganizationMembershipTitleDefinition
  })
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

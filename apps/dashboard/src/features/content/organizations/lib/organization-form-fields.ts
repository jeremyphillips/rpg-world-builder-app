import { z } from 'zod'
import {
  ORGANIZATION_ACTIVITY_ENTRIES,
  ORGANIZATION_ACTIVITY_IDS,
  ORGANIZATION_KIND_ENTRIES,
  ORGANIZATION_KIND_IDS,
  getOrganizationKindEntry,
  getOrganizationSubtypeIds,
  getOrganizationSubtypeLabel,
  organizationActivitySchema,
  organizationKindSchema,
  organizationSubtypeSchema,
  slugSchema,
  type OrganizationKind,
} from '@rpg/contracts'
import { toOptions, type FieldOption, type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { descriptionField, nameField } from '../../lib/forms/fields/content-identity-form-fields'
import { draftOptionalSelect } from '../../lib/forms/draft-form-schema-helpers'

const organizationKindOptions = toOptions(
  ORGANIZATION_KIND_IDS,
  Object.fromEntries(
    ORGANIZATION_KIND_IDS.map((id) => [id, ORGANIZATION_KIND_ENTRIES[id].label]),
  ) as Record<(typeof ORGANIZATION_KIND_IDS)[number], string>,
)

const organizationActivityOptions = toOptions(
  ORGANIZATION_ACTIVITY_IDS,
  Object.fromEntries(
    ORGANIZATION_ACTIVITY_IDS.map((id) => [id, ORGANIZATION_ACTIVITY_ENTRIES[id].label]),
  ) as Record<(typeof ORGANIZATION_ACTIVITY_IDS)[number], string>,
)

function resolveOrganizationSubtypeFieldOptions(
  values: Record<string, unknown>,
): readonly FieldOption[] {
  const kind = values.organizationKind
  if (typeof kind !== 'string' || getOrganizationKindEntry(kind) === undefined) return []
  return getOrganizationSubtypeIds(kind as OrganizationKind).map((id) => ({
    value: id,
    label: getOrganizationSubtypeLabel(kind as OrganizationKind, id),
  }))
}

function visibleWhenOrganizationSubtypeAvailable() {
  return {
    dependsOn: ['organizationKind'],
    visibleWhen: (watched: Record<string, unknown>) => {
      const kind = watched.organizationKind
      if (typeof kind !== 'string' || getOrganizationKindEntry(kind) === undefined) return false
      return getOrganizationSubtypeIds(kind as OrganizationKind).length > 0
    },
  }
}

export const organizationFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  organizationKind: organizationKindSchema,
  organizationSubtype: organizationSubtypeSchema.optional(),
  activities: z.array(organizationActivitySchema).default([]),
})

export const organizationDraftFormSchema = z.object({
  name: z.string(),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  organizationKind: draftOptionalSelect(organizationKindSchema),
  organizationSubtype: draftOptionalSelect(organizationSubtypeSchema),
  activities: z.array(organizationActivitySchema).default([]),
})

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>

export { nameField as organizationNameField }

export function buildOrganizationFields(ctx: ContentFormCtx): FormItem[] {
  return [
    descriptionField(ctx),
    {
      type: 'chips',
      name: 'organizationKind',
      label: 'Type',
      options: organizationKindOptions,
      multiple: false,
      required: true,
      chrome: { variant: 'outline' },
    },
    {
      type: 'select',
      name: 'organizationSubtype',
      label: 'Subtype',
      optionsResolve: {
        dependsOn: ['organizationKind'],
        optionsWhen: resolveOrganizationSubtypeFieldOptions,
      },
      placeholder: 'Select subtype…',
      visibility: visibleWhenOrganizationSubtypeAvailable(),
      optionalDisclosure: {
        addLabel: 'Add subtype',
        removeLabel: 'Remove subtype',
      },
    },
    {
      type: 'chips',
      name: 'activities',
      label: 'Activities',
      options: organizationActivityOptions,
      multiple: true,
      chrome: { variant: 'outline' },
    },
  ]
}

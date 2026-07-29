import { z } from 'zod'
import {
  ORGANIZATION_KIND_ENTRIES,
  ORGANIZATION_KIND_IDS,
  organizationKindSchema,
  slugSchema,
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { descriptionField, nameField } from '../../lib/forms/fields/content-identity-form-fields'
import { draftOptionalSelect } from '../../lib/forms/draft-form-schema-helpers'

const organizationKindOptions = toOptions(
  ORGANIZATION_KIND_IDS,
  Object.fromEntries(
    ORGANIZATION_KIND_IDS.map((id) => [id, ORGANIZATION_KIND_ENTRIES[id].label]),
  ) as Record<(typeof ORGANIZATION_KIND_IDS)[number], string>,
)

export const organizationFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  organizationKind: organizationKindSchema,
})

export const organizationDraftFormSchema = z.object({
  name: z.string(),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  organizationKind: draftOptionalSelect(organizationKindSchema),
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
  ]
}

import { z } from 'zod'
import {
  ORGANIZATION_ACTIVITY_ENTRIES,
  ORGANIZATION_ACTIVITY_IDS,
  ORGANIZATION_DOMAIN_ENTRIES,
  ORGANIZATION_DOMAIN_IDS,
  ORGANIZATION_FORM_ENTRIES,
  ORGANIZATION_FORM_IDS,
  createOrganizationDraftInputSchema,
  createOrganizationInputSchema,
  organizationActivitySchema,
  organizationDomainSchema,
  organizationFormSchema as canonicalOrganizationFormSchema,
  slugSchema,
  updateOrganizationDraftInputSchema,
  updateOrganizationInputSchema,
  type ContentValidationIntent,
  type CreateOrganizationInput,
  type Organization,
} from '@rpg/contracts'
import { toOptions, type FormItem, type FormValueSync } from '@rpg/ui/form'

import type { ContentFormCtx, ContentFormInputCtx } from './content-form-registry'
import { draftOptionalSelect } from './draft-form-schema-helpers'
import { descriptionField, nameField } from './fields/content-identity-form-fields'
import { finalizeContentInput, slugForInputParse } from './content-form-key-helpers'

const organizationDomainOptions = toOptions(
  ORGANIZATION_DOMAIN_IDS,
  Object.fromEntries(
    ORGANIZATION_DOMAIN_IDS.map((id) => [id, ORGANIZATION_DOMAIN_ENTRIES[id].label]),
  ) as Record<(typeof ORGANIZATION_DOMAIN_IDS)[number], string>,
)

const organizationFormOptions = toOptions(
  ORGANIZATION_FORM_IDS,
  Object.fromEntries(
    ORGANIZATION_FORM_IDS.map((id) => [id, ORGANIZATION_FORM_ENTRIES[id].label]),
  ) as Record<(typeof ORGANIZATION_FORM_IDS)[number], string>,
)

const organizationActivityOptions = toOptions(
  ORGANIZATION_ACTIVITY_IDS,
  Object.fromEntries(
    ORGANIZATION_ACTIVITY_IDS.map((id) => [id, ORGANIZATION_ACTIVITY_ENTRIES[id].label]),
  ) as Record<(typeof ORGANIZATION_ACTIVITY_IDS)[number], string>,
)

function fieldPath(prefix: string | undefined, name: string): string {
  return prefix ? `${prefix}.${name}` : name
}

export const organizationFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  organizationDomain: organizationDomainSchema,
  organizationForm: canonicalOrganizationFormSchema.optional(),
  activities: z.array(organizationActivitySchema).default([]),
})

export const organizationDraftFormSchema = z.object({
  name: z.string(),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  organizationDomain: draftOptionalSelect(organizationDomainSchema),
  organizationForm: draftOptionalSelect(canonicalOrganizationFormSchema),
  activities: z.array(organizationActivitySchema).default([]),
})

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>

export const organizationCreateDefaultValues: Partial<OrganizationFormValues> = { activities: [] }

export { nameField as organizationNameField }

export function buildOrganizationFields(
  ctx: ContentFormCtx,
  options: { prefix?: string; includeName?: boolean } = {},
): FormItem[] {
  const { prefix, includeName = false } = options
  const domainPath = fieldPath(prefix, 'organizationDomain')
  const fields: FormItem[] = []

  if (includeName) {
    fields.push({ ...nameField(), name: fieldPath(prefix, 'name') })
  }

  fields.push(
    { ...descriptionField(ctx), name: fieldPath(prefix, 'description') },
    {
      type: 'chips',
      name: domainPath,
      label: 'Domain',
      options: organizationDomainOptions,
      multiple: false,
      required: true,
      chrome: { variant: 'outline' },
    },
    {
      type: 'select',
      name: fieldPath(prefix, 'organizationForm'),
      label: 'Form',
      options: organizationFormOptions,
      placeholder: 'Select form…',
      optionalDisclosure: {
        addLabel: 'Add form',
        removeLabel: 'Remove form',
      },
    },
    {
      type: 'chips',
      name: fieldPath(prefix, 'activities'),
      label: 'Activities',
      options: organizationActivityOptions,
      multiple: true,
      chrome: { variant: 'outline' },
    },
  )

  return fields
}

export function organizationToFormValues(entity: Organization): Partial<OrganizationFormValues> {
  return {
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    organizationDomain: entity.organizationDomain,
    organizationForm: entity.organizationForm,
    activities: entity.activities,
  }
}

export function buildOrganizationCreateInput(
  values: OrganizationFormValues,
  ctx?: ContentFormInputCtx<Organization>,
  validationIntent: ContentValidationIntent = 'publish',
): CreateOrganizationInput {
  const isEdit = Boolean(ctx?.entity)
  const schema =
    validationIntent === 'draft'
      ? isEdit
        ? updateOrganizationDraftInputSchema
        : createOrganizationDraftInputSchema
      : isEdit
        ? updateOrganizationInputSchema
        : createOrganizationInputSchema

  const hasForm = typeof values.organizationForm === 'string' && values.organizationForm.length > 0

  const input = schema.parse({
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    activities: values.activities ?? [],
    ...(values.organizationDomain !== undefined
      ? { organizationDomain: values.organizationDomain }
      : {}),
    ...(hasForm
      ? { organizationForm: values.organizationForm }
      : isEdit
        ? { organizationForm: null }
        : {}),
  })
  return finalizeContentInput(input, ctx) as CreateOrganizationInput
}

export function buildOrganizationFormValueSyncs(_prefix?: string): FormValueSync[] {
  return []
}

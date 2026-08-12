import { z } from 'zod'
import {
  ORGANIZATION_ACTIVITY_ENTRIES,
  ORGANIZATION_ACTIVITY_IDS,
  ORGANIZATION_KIND_ENTRIES,
  ORGANIZATION_KIND_IDS,
  createOrganizationDraftInputSchema,
  createOrganizationInputSchema,
  getOrganizationKindEntry,
  getOrganizationSubtypeIds,
  getOrganizationSubtypeLabel,
  isOrganizationSubtypeValidForKind,
  organizationActivitySchema,
  organizationKindSchema,
  organizationSubtypeSchema,
  slugSchema,
  updateOrganizationDraftInputSchema,
  updateOrganizationInputSchema,
  type ContentValidationIntent,
  type CreateOrganizationInput,
  type Organization,
  type OrganizationKind,
} from '@rpg/contracts'
import { toOptions, type FieldOption, type FormItem, type FormValueSync } from '@rpg/ui/form'

import type { ContentFormCtx, ContentFormInputCtx } from './content-form-registry'
import { draftOptionalSelect } from './draft-form-schema-helpers'
import { descriptionField, nameField } from './fields/content-identity-form-fields'
import { finalizeContentInput, slugForInputParse } from './content-form-key-helpers'

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

function fieldPath(prefix: string | undefined, name: string): string {
  return prefix ? `${prefix}.${name}` : name
}

function projectionValues(
  values: Record<string, unknown>,
  prefix?: string,
): Record<string, unknown> {
  if (!prefix) return values
  const nested = values[prefix]
  return nested && typeof nested === 'object' ? (nested as Record<string, unknown>) : {}
}

function resolveOrganizationSubtypeFieldOptions(
  values: Record<string, unknown>,
  prefix?: string,
): readonly FieldOption[] {
  const kind = projectionValues(values, prefix).organizationKind
  if (typeof kind !== 'string' || getOrganizationKindEntry(kind) === undefined) return []
  return getOrganizationSubtypeIds(kind as OrganizationKind).map((id) => ({
    value: id,
    label: getOrganizationSubtypeLabel(kind as OrganizationKind, id),
  }))
}

function visibleWhenOrganizationSubtypeAvailable(prefix?: string) {
  const kindPath = fieldPath(prefix, 'organizationKind')
  return {
    dependsOn: [kindPath],
    visibleWhen: (watched: Record<string, unknown>) => {
      const kind = watched[kindPath]
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

export const organizationCreateDefaultValues: Partial<OrganizationFormValues> = { activities: [] }

export { nameField as organizationNameField }

export function buildOrganizationFields(
  ctx: ContentFormCtx,
  options: { prefix?: string; includeName?: boolean } = {},
): FormItem[] {
  const { prefix, includeName = false } = options
  const kindPath = fieldPath(prefix, 'organizationKind')
  const fields: FormItem[] = []

  if (includeName) {
    fields.push({ ...nameField(), name: fieldPath(prefix, 'name') })
  }

  fields.push(
    { ...descriptionField(ctx), name: fieldPath(prefix, 'description') },
    {
      type: 'chips',
      name: kindPath,
      label: 'Type',
      options: organizationKindOptions,
      multiple: false,
      required: true,
      chrome: { variant: 'outline' },
    },
    {
      type: 'select',
      name: fieldPath(prefix, 'organizationSubtype'),
      label: 'Subtype',
      optionsResolve: {
        dependsOn: [kindPath],
        optionsWhen: (values) => resolveOrganizationSubtypeFieldOptions(values, prefix),
      },
      placeholder: 'Select subtype…',
      visibility: visibleWhenOrganizationSubtypeAvailable(prefix),
      optionalDisclosure: {
        addLabel: 'Add subtype',
        removeLabel: 'Remove subtype',
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
    organizationKind: entity.organizationKind,
    organizationSubtype: entity.organizationSubtype,
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

  const hasSubtype =
    typeof values.organizationSubtype === 'string' && values.organizationSubtype.length > 0

  const input = schema.parse({
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    activities: values.activities ?? [],
    ...(values.organizationKind !== undefined ? { organizationKind: values.organizationKind } : {}),
    ...(hasSubtype
      ? { organizationSubtype: values.organizationSubtype }
      : isEdit
        ? { organizationSubtype: null }
        : {}),
  })
  return finalizeContentInput(input, ctx) as CreateOrganizationInput
}

export function buildOrganizationFormValueSyncs(prefix?: string): FormValueSync[] {
  const kindPath = fieldPath(prefix, 'organizationKind')
  const subtypePath = fieldPath(prefix, 'organizationSubtype')
  return [
    {
      dependsOn: [kindPath],
      apply: (values, changedKeys) => {
        if (!changedKeys.includes(kindPath)) return undefined
        const organizationValues = projectionValues(values, prefix)
        const kind = organizationValues.organizationKind
        const subtype = organizationValues.organizationSubtype
        if (typeof subtype !== 'string' || subtype === '') return undefined
        if (
          typeof kind !== 'string' ||
          kind === '' ||
          !isOrganizationSubtypeValidForKind(kind as OrganizationKind, subtype)
        ) {
          return { [subtypePath]: undefined }
        }
        return undefined
      },
    },
  ]
}

import {
  createOrganizationDraftInputSchema,
  createOrganizationInputSchema,
  type ContentValidationIntent,
  type CreateOrganizationInput,
  type Organization,
} from '@rpg/contracts'

import { finalizeContentInput, slugForInputParse } from '../../lib/forms/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/forms/content-form-registry'
import type { OrganizationFormValues } from './organization-form-fields'

export const organizationCreateDefaultValues: Partial<OrganizationFormValues> = {}

export function organizationToFormValues(entity: Organization): Partial<OrganizationFormValues> {
  return {
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    organizationKind: entity.organizationKind,
  }
}

export function buildOrganizationCreateInput(
  values: OrganizationFormValues,
  ctx?: ContentFormInputCtx<Organization>,
  validationIntent: ContentValidationIntent = 'publish',
): CreateOrganizationInput {
  const schema =
    validationIntent === 'draft'
      ? createOrganizationDraftInputSchema
      : createOrganizationInputSchema
  const input = schema.parse({
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    ...(values.organizationKind !== undefined ? { organizationKind: values.organizationKind } : {}),
  })
  return finalizeContentInput(input, ctx) as CreateOrganizationInput
}

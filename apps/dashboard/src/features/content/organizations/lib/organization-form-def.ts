import type { CreateOrganizationInput, Organization } from '@rpg/contracts'

import { contentFormRegistry, type ContentFormDef } from '../../lib/forms/content-form-registry'
import { organizationsQueryKey, useOrganizations } from '../hooks/use-organizations'
import {
  buildOrganizationFields,
  organizationDraftFormSchema,
  organizationFormSchema,
  organizationNameField,
  type OrganizationFormValues,
} from './organization-form-fields'
import {
  buildOrganizationCreateInput,
  organizationCreateDefaultValues,
  organizationToFormValues,
} from './organization-form-values'

const organizationFormDef: ContentFormDef<
  Organization,
  OrganizationFormValues,
  CreateOrganizationInput
> = {
  routeKey: 'organizations',
  schema: organizationFormSchema,
  draftSchema: organizationDraftFormSchema,
  coverage: 'structural',
  nameField: organizationNameField,
  createDefaultValues: organizationCreateDefaultValues,
  buildFields: buildOrganizationFields,
  toFormValues: organizationToFormValues,
  toInput: buildOrganizationCreateInput,
  useListQuery: useOrganizations,
  queryKey: organizationsQueryKey,
}

contentFormRegistry.organizations = organizationFormDef

export { organizationFormDef, organizationFormSchema, organizationDraftFormSchema }

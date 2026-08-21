import type { CreateOrganizationInput, Organization } from '@rpg/contracts'

import { contentFormRegistry, type ContentFormDef } from '../../lib/forms/registry/content-form-registry'
import {
  buildOrganizationCreateInput,
  buildOrganizationFields,
  buildOrganizationFormValueSyncs,
  organizationCreateDefaultValues,
  organizationDraftFormSchema,
  organizationFormSchema,
  organizationNameField,
  organizationToFormValues,
  type OrganizationFormValues,
} from '../../lib/forms/organization-form-projection'
import { organizationsQueryKey, useOrganizations } from '../hooks/use-organizations'
import { resolveDiscoverableOrganizationMemberClasses } from './members/organization-member-class-discoverable.lib'

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
  valueSyncs: (ctx) =>
    buildOrganizationFormValueSyncs(undefined, resolveDiscoverableOrganizationMemberClasses(ctx)),
  enrichEditLayoutCtx: (ctx, entity) => ({
    ...ctx,
    organizationMemberClassAffinitySeedIds: entity.members.classAffinityIds ?? [],
    organizationMemberSpeciesAffinitySeedIds: entity.members.speciesAffinityIds ?? [],
  }),
  toFormValues: organizationToFormValues,
  toInput: buildOrganizationCreateInput,
  useListQuery: useOrganizations,
  queryKey: organizationsQueryKey,
}

contentFormRegistry.organizations = organizationFormDef

export { organizationFormDef, organizationFormSchema, organizationDraftFormSchema }

import { createElement } from 'react'
import { z } from 'zod'

import { withManagedContentMediaFormSchema } from './fields/content-managed-media-form-schema.lib'
import {
  ORGANIZATION_AUTHORING_PRESET_IDS,
  ORGANIZATION_DOMAIN_ENTRIES,
  ORGANIZATION_DOMAIN_IDS,
  ORGANIZATION_FORM_ENTRIES,
  ORGANIZATION_FORM_IDS,
  ORGANIZATION_FUNCTION_ENTRIES,
  ORGANIZATION_FUNCTION_IDS,
  ORGANIZATION_PRACTICE_ENTRIES,
  ORGANIZATION_PRACTICE_IDS,
  ORGANIZATION_PRACTICE_TERM,
  createOrganizationDraftInputSchema,
  createOrganizationInputSchema,
  organizationDomainSchema,
  organizationFormSchema as canonicalOrganizationFormSchema,
  organizationFunctionSchema,
  organizationPracticeSchema,
  getOrganizationPracticeDiscoveryTerms,
  slugSchema,
  updateOrganizationDraftInputSchema,
  updateOrganizationInputSchema,
  createDefaultOrganizationMembershipTitleDefinition,
  organizationMembershipTitleDefinitionSchema,
  organizationMembershipTitlePrioritySchema,
  organizationMembershipTitlesSchema,
  resolveOrganizationCreateMembershipTitles,
  vocabularyTermFieldCopy,
  type CharacterClass,
  type ContentValidationIntent,
  type CreateOrganizationInput,
  type Organization,
  type OrganizationPractice,
} from '@rpg/contracts'
import { toOptions, type FormItem, type FormValueSync } from '@rpg/ui/form'

import type { ContentFormCtx, ContentFormInputCtx } from './registry/content-form-registry'
import { draftOptionalSelect, formSelectNumberSchema } from './validation/draft-form-schema-helpers'
import { descriptionField, nameField } from './fields/content-identity-form-fields'
import { finalizeContentInput, slugForInputParse } from './registry/content-form-key-helpers'
import { rankOrganizationPracticeComboboxOptions } from '../../organizations/lib/authoring/organization-practice-combobox-ranking'
import { OrganizationEditFamiliarTypeField } from '../../organizations/components/edit/organization-edit-familiar-type-field'
import {
  buildOrganizationMembershipTitlesArrayField,
  normalizeOrganizationMembershipTitleFormRows,
} from '../../organizations/lib/membership-titles/organization-membership-titles-form.lib'
import { OrganizationUseFamiliarTypeAction } from '../../organizations/components/edit/organization-use-familiar-type-action'
import { OrganizationQuickCreateProfileSections } from '../../organizations/components/create/organization-quick-create-profile-sections'
import { OrganizationStartingPointLegendAccessory } from '../../organizations/components/create/organization-starting-point-legend-accessory'
import { OrganizationStartingPointSetupManuallyAction } from '../../organizations/components/create/organization-starting-point-setup-manually-action'
import { OrganizationStartingPointField } from '../../organizations/components/create/organization-starting-point-field'
import { OrganizationMembershipTitlesRegistration } from '../../organizations/components/authoring/organization-membership-titles-registration'
import type { OrganizationFormPresentation } from '../../organizations/lib/organization-form-presentation.lib'
import {
  ORGANIZATION_DOMAIN_FIELD_HINT,
  ORGANIZATION_FORM_FIELD_HINT,
  ORGANIZATION_FORM_FIELD_PLACEHOLDER,
  ORGANIZATION_FUNCTION_FIELD_HINT,
  ORGANIZATION_MEMBER_AFFINITIES_GROUP_DESCRIPTION,
  ORGANIZATION_MEMBER_AFFINITIES_GROUP_LEGEND,
  ORGANIZATION_OPTIONAL_DETAILS_GROUP_DESCRIPTION,
  ORGANIZATION_OPTIONAL_DETAILS_GROUP_LEGEND,
  ORGANIZATION_PRACTICE_FIELD_HINT,
  ORGANIZATION_PROFILE_GROUP_DESCRIPTION,
  ORGANIZATION_PROFILE_GROUP_LEGEND,
  ORGANIZATION_STARTING_POINT_LEGEND,
  ORGANIZATION_DOMAIN_PUBLISH_MESSAGE,
} from '../../organizations/lib/presets/organization-form-copy.lib'
import {
  buildOrganizationStartingPointValueSyncPatch,
  isOrganizationAuthoringPresetId,
  organizationStartingPointFieldPath,
} from '../../organizations/lib/presets/organization-starting-point.lib'
import { resolveDiscoverableOrganizationMemberClasses } from '../../organizations/lib/members/organization-member-class-discoverable.lib'
import {
  buildMemberClassAffinityChipOptions,
  ORGANIZATION_MEMBER_CLASS_AFFINITY_FIELD_HINT,
} from '../../organizations/lib/members/organization-member-class-chip-options.lib'
import {
  buildMemberSpeciesAffinityChipOptions,
  ORGANIZATION_MEMBER_SPECIES_AFFINITY_FIELD_HINT,
} from '../../organizations/lib/members/organization-member-species-chip-options.lib'
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

const organizationFunctionOptions = toOptions(
  ORGANIZATION_FUNCTION_IDS,
  Object.fromEntries(
    ORGANIZATION_FUNCTION_IDS.map((id) => [id, ORGANIZATION_FUNCTION_ENTRIES[id].label]),
  ) as Record<(typeof ORGANIZATION_FUNCTION_IDS)[number], string>,
)

const organizationPracticeOptions = ORGANIZATION_PRACTICE_IDS.map((id) => {
  const entry = ORGANIZATION_PRACTICE_ENTRIES[id]
  const searchTerms = getOrganizationPracticeDiscoveryTerms(id).filter(
    (term) => term !== entry.label,
  )
  return {
    value: id,
    label: entry.label,
    ...(searchTerms.length > 0 ? { searchTerms } : {}),
  }
})

const organizationPracticeFieldCopy = vocabularyTermFieldCopy(ORGANIZATION_PRACTICE_TERM, {
  multiple: true,
})

export type { OrganizationFormPresentation } from '../../organizations/lib/organization-form-presentation.lib'

function fieldPath(prefix: string | undefined, name: string): string {
  return prefix ? `${prefix}.${name}` : name
}

const organizationMembershipTitleFormRowSchema = organizationMembershipTitleDefinitionSchema.extend(
  {
    priority: formSelectNumberSchema(organizationMembershipTitlePrioritySchema),
  },
)

const organizationMembershipTitlesFormSchema = z
  .array(organizationMembershipTitleFormRowSchema)
  .pipe(organizationMembershipTitlesSchema)

const organizationMembersFormFieldsSchema = z.object({
  classAffinityIds: z.array(z.string().min(1)).default([]),
  speciesAffinityIds: z.array(z.string().min(1)).default([]),
  titles: organizationMembershipTitlesFormSchema.optional(),
})

export const organizationFormSchema = withManagedContentMediaFormSchema(
  z
    .object({
      name: z.string().min(1),
      slug: slugSchema.optional(),
      description: z.string().optional(),
      organizationDomain: organizationDomainSchema.optional(),
      organizationForm: canonicalOrganizationFormSchema.optional(),
      functions: z.array(organizationFunctionSchema).default([]),
      practices: z.array(organizationPracticeSchema).default([]),
      members: organizationMembersFormFieldsSchema.default({
        classAffinityIds: [],
        speciesAffinityIds: [],
      }),
      /** Draft-only familiar starting point association — not sent on create. */
      startingPointId: z.enum(ORGANIZATION_AUTHORING_PRESET_IDS).optional(),
    })
    .superRefine((values, ctx) => {
      if (values.organizationDomain === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ORGANIZATION_DOMAIN_PUBLISH_MESSAGE,
          path: ['organizationDomain'],
        })
      }
    }),
)

export const organizationDraftFormSchema = withManagedContentMediaFormSchema(
  z.object({
    name: z.string(),
    slug: slugSchema.optional(),
    description: z.string().optional(),
    organizationDomain: draftOptionalSelect(organizationDomainSchema),
    organizationForm: draftOptionalSelect(canonicalOrganizationFormSchema),
    functions: z.array(organizationFunctionSchema).default([]),
    practices: z.array(organizationPracticeSchema).default([]),
    members: organizationMembersFormFieldsSchema.default({
      classAffinityIds: [],
      speciesAffinityIds: [],
    }),
    startingPointId: draftOptionalSelect(z.enum(ORGANIZATION_AUTHORING_PRESET_IDS)),
  }),
)

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>

export function createOrganizationCreateDefaultValues(): Partial<OrganizationFormValues> {
  return {
    functions: [],
    practices: [],
    members: {
      classAffinityIds: [],
      speciesAffinityIds: [],
      titles: [createDefaultOrganizationMembershipTitleDefinition()],
    },
  }
}

/** @deprecated Prefer `createOrganizationCreateDefaultValues()` for a fresh `omt_*` per create session. */
export const organizationCreateDefaultValues: Partial<OrganizationFormValues> =
  createOrganizationCreateDefaultValues()

export { nameField as organizationNameField }

function buildOrganizationProfileFields(options: {
  prefix?: string
  recommendedPracticeIds: readonly OrganizationPractice[]
}): FormItem[] {
  const { prefix, recommendedPracticeIds } = options
  return [
    {
      type: 'chips',
      name: fieldPath(prefix, 'organizationDomain'),
      label: 'Domain',
      hint: { text: ORGANIZATION_DOMAIN_FIELD_HINT, position: 'below-control' },
      options: organizationDomainOptions,
      multiple: false,
      required: true,
      separator: 'subtle',
    },
    {
      type: 'select',
      name: fieldPath(prefix, 'organizationForm'),
      label: 'Form',
      hint: { text: ORGANIZATION_FORM_FIELD_HINT, position: 'below-control' },
      placeholder: ORGANIZATION_FORM_FIELD_PLACEHOLDER,
      options: organizationFormOptions,
      clearable: true,
      clearAccessibleName: 'Clear Form',
      separator: 'subtle',
    },
    {
      type: 'chips',
      name: fieldPath(prefix, 'functions'),
      label: 'Functions',
      hint: { text: ORGANIZATION_FUNCTION_FIELD_HINT, position: 'below-control' },
      options: organizationFunctionOptions,
      multiple: true,
      separator: 'subtle',
    },
    {
      type: 'combobox',
      name: fieldPath(prefix, 'practices'),
      label: 'Practices',
      hint: { text: ORGANIZATION_PRACTICE_FIELD_HINT, position: 'below-control' },
      options: organizationPracticeOptions,
      multiple: true,
      placeholder: organizationPracticeFieldCopy.placeholder,
      resolveFilteredOptions: (options, query, selected) =>
        rankOrganizationPracticeComboboxOptions(options, query, selected, recommendedPracticeIds),
    },
  ]
}

function buildOrganizationMemberAffinityFields(
  ctx: ContentFormCtx,
  options: {
    prefix?: string
    selectedMemberClassAffinityIds?: readonly string[]
    selectedMemberSpeciesAffinityIds?: readonly string[]
  },
): FormItem[] {
  const { prefix, selectedMemberClassAffinityIds, selectedMemberSpeciesAffinityIds } = options
  return [
    {
      type: 'chips',
      name: fieldPath(prefix, 'members.classAffinityIds'),
      label: 'Classes',
      hint: {
        text: ORGANIZATION_MEMBER_CLASS_AFFINITY_FIELD_HINT,
        position: 'below-control',
      },
      options: buildMemberClassAffinityChipOptions(
        ctx,
        selectedMemberClassAffinityIds ?? ctx.organizationMemberClassAffinitySeedIds ?? [],
      ),
      multiple: true,
    },
    {
      type: 'chips',
      name: fieldPath(prefix, 'members.speciesAffinityIds'),
      label: 'Species',
      hint: {
        text: ORGANIZATION_MEMBER_SPECIES_AFFINITY_FIELD_HINT,
        position: 'below-control',
      },
      options: buildMemberSpeciesAffinityChipOptions(
        ctx,
        selectedMemberSpeciesAffinityIds ?? ctx.organizationMemberSpeciesAffinitySeedIds ?? [],
      ),
      multiple: true,
    },
  ]
}

function buildOrganizationProfileGroup(options: {
  ctx: ContentFormCtx
  prefix?: string
  discoverableClasses: readonly CharacterClass[]
  recommendedPracticeIds: readonly OrganizationPractice[]
}): FormItem {
  const { ctx, prefix, discoverableClasses, recommendedPracticeIds } = options
  const profileFields = buildOrganizationProfileFields({ prefix, recommendedPracticeIds })
  const editFamiliarTypeField: FormItem = {
    kind: 'slot',
    name: fieldPath(prefix, '_organizationEditFamiliarType'),
    render: () =>
      createElement(OrganizationEditFamiliarTypeField, {
        prefix,
        discoverableClasses,
      }),
  }

  return {
    kind: 'group',
    id: 'organization-quick-create-profile',
    ...(ctx.mode === 'edit'
      ? {
          heading: {
            label: ORGANIZATION_PROFILE_GROUP_LEGEND,
            hint: ORGANIZATION_PROFILE_GROUP_DESCRIPTION,
            action: createElement(OrganizationUseFamiliarTypeAction),
          },
        }
      : {
          legend: ORGANIZATION_PROFILE_GROUP_LEGEND,
          description: ORGANIZATION_PROFILE_GROUP_DESCRIPTION,
        }),
    fields: ctx.mode === 'edit' ? [editFamiliarTypeField, ...profileFields] : profileFields,
  }
}

function buildOrganizationMembershipTitlesRegistrationSlot(prefix?: string): FormItem {
  return {
    kind: 'slot',
    name: fieldPath(prefix, '_organizationMembershipTitlesRegistration'),
    render: () => createElement(OrganizationMembershipTitlesRegistration, { prefix }),
  }
}

function buildOrganizationMembershipTitlesField(prefix?: string): FormItem {
  return buildOrganizationMembershipTitlesArrayField(prefix)
}

function buildOrganizationOptionalDetailsGroup(
  ctx: ContentFormCtx,
  options: {
    prefix?: string
    selectedMemberClassAffinityIds?: readonly string[]
    selectedMemberSpeciesAffinityIds?: readonly string[]
  },
  descriptionFieldItem: FormItem,
): FormItem {
  const { prefix } = options
  const memberAffinityFields = buildOrganizationMemberAffinityFields(ctx, options)
  return {
    kind: 'group',
    id: 'organization-quick-create-optional-details',
    heading: {
      label: ORGANIZATION_OPTIONAL_DETAILS_GROUP_LEGEND,
      hint: ORGANIZATION_OPTIONAL_DETAILS_GROUP_DESCRIPTION,
    },
    disclosure: {
      variant: 'legend',
      defaultOpen: false,
      persistOpen: false,
    },
    fields: [
      {
        kind: 'group',
        legend: ORGANIZATION_MEMBER_AFFINITIES_GROUP_LEGEND,
        description: ORGANIZATION_MEMBER_AFFINITIES_GROUP_DESCRIPTION,
        fields: memberAffinityFields,
      },
      buildOrganizationMembershipTitlesField(prefix),
      descriptionFieldItem,
    ],
  }
}

/** Profile + optional details blocks for quick create (gated by authoring UI state). */
export function buildOrganizationQuickCreateFollowOnFields(
  ctx: ContentFormCtx,
  options: {
    prefix?: string
    presentation?: OrganizationFormPresentation
    selectedMemberClassAffinityIds?: readonly string[]
    selectedMemberSpeciesAffinityIds?: readonly string[]
    recommendedPracticeIds?: readonly OrganizationPractice[]
  } = {},
): FormItem[] {
  const {
    prefix,
    presentation = ctx.organizationFormPresentation ?? 'full',
    selectedMemberClassAffinityIds,
    selectedMemberSpeciesAffinityIds,
    recommendedPracticeIds,
  } = options
  const practiceRecommendationIds =
    recommendedPracticeIds ?? ctx.organizationPracticeRecommendationIds ?? []
  const discoverableClasses = resolveDiscoverableOrganizationMemberClasses(ctx)
  const descriptionFieldItem: FormItem = {
    ...descriptionField(ctx),
    name: fieldPath(prefix, 'description'),
  }

  if (presentation !== 'quick') {
    const memberAffinityFields = buildOrganizationMemberAffinityFields(ctx, {
      prefix,
      selectedMemberClassAffinityIds,
      selectedMemberSpeciesAffinityIds,
    })
    const fullPresentationFields: FormItem[] = [
      buildOrganizationProfileGroup({
        ctx,
        prefix,
        discoverableClasses,
        recommendedPracticeIds: practiceRecommendationIds,
      }),
      {
        kind: 'group',
        legend: ORGANIZATION_MEMBER_AFFINITIES_GROUP_LEGEND,
        description: ORGANIZATION_MEMBER_AFFINITIES_GROUP_DESCRIPTION,
        fields: memberAffinityFields,
      },
    ]

    fullPresentationFields.push(buildOrganizationMembershipTitlesField(prefix))

    fullPresentationFields.push(descriptionFieldItem)

    return fullPresentationFields
  }

  return [
    buildOrganizationProfileGroup({
      ctx,
      prefix,
      discoverableClasses,
      recommendedPracticeIds: practiceRecommendationIds,
    }),
    buildOrganizationOptionalDetailsGroup(
      ctx,
      { prefix, selectedMemberClassAffinityIds, selectedMemberSpeciesAffinityIds },
      descriptionFieldItem,
    ),
  ]
}

export function buildOrganizationFields(
  ctx: ContentFormCtx,
  options: {
    prefix?: string
    includeName?: boolean
    presentation?: OrganizationFormPresentation
    selectedMemberClassAffinityIds?: readonly string[]
    selectedMemberSpeciesAffinityIds?: readonly string[]
    recommendedPracticeIds?: readonly OrganizationPractice[]
  } = {},
): FormItem[] {
  const {
    prefix,
    includeName = false,
    presentation = ctx.organizationFormPresentation ?? 'full',
    selectedMemberClassAffinityIds,
    selectedMemberSpeciesAffinityIds,
    recommendedPracticeIds,
  } = options
  const practiceRecommendationIds =
    recommendedPracticeIds ?? ctx.organizationPracticeRecommendationIds ?? []
  const discoverableClasses = resolveDiscoverableOrganizationMemberClasses(ctx)
  const fields: FormItem[] = []

  if (includeName) {
    fields.push({ ...nameField(), name: fieldPath(prefix, 'name') })
  }

  if (ctx.mode !== 'edit') {
    fields.push({
      kind: 'group',
      heading: {
        label: ORGANIZATION_STARTING_POINT_LEGEND,
        accessory: createElement(OrganizationStartingPointLegendAccessory, {
          prefix,
          discoverableClasses,
        }),
        action: createElement(OrganizationStartingPointSetupManuallyAction),
      },
      fields: [
        {
          kind: 'slot',
          name: fieldPath(prefix, 'startingPointId'),
          render: () =>
            createElement(OrganizationStartingPointField, {
              prefix,
              discoverableClasses,
            }),
        },
      ],
    })
  }

  fields.push(buildOrganizationMembershipTitlesRegistrationSlot(prefix))

  if (presentation === 'quick') {
    fields.push({
      kind: 'slot',
      name: fieldPath(prefix, '_organizationQuickCreateProfileSections'),
      render: () =>
        createElement(OrganizationQuickCreateProfileSections, {
          prefix,
          ctx,
          presentation: 'quick',
          selectedMemberClassAffinityIds,
          selectedMemberSpeciesAffinityIds,
          recommendedPracticeIds: practiceRecommendationIds,
        }),
    })
  } else {
    fields.push(
      ...buildOrganizationQuickCreateFollowOnFields(ctx, {
        prefix,
        presentation: 'full',
        selectedMemberClassAffinityIds,
        selectedMemberSpeciesAffinityIds,
        recommendedPracticeIds: practiceRecommendationIds,
      }),
    )
  }

  return fields
}

export function organizationToFormValues(entity: Organization): Partial<OrganizationFormValues> {
  return {
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    organizationDomain: entity.organizationDomain,
    organizationForm: entity.organizationForm,
    functions: entity.functions,
    practices: entity.practices,
    members: {
      classAffinityIds: entity.members.classAffinityIds,
      speciesAffinityIds: entity.members.speciesAffinityIds,
      titles: entity.members.titles,
    },
  }
}

function resolveOrganizationInputSchema(
  isEdit: boolean,
  validationIntent: ContentValidationIntent,
) {
  if (validationIntent === 'draft') {
    return isEdit ? updateOrganizationDraftInputSchema : createOrganizationDraftInputSchema
  }
  return isEdit ? updateOrganizationInputSchema : createOrganizationInputSchema
}

function organizationFormFieldForInput(
  values: OrganizationFormValues,
  isEdit: boolean,
): { organizationForm?: OrganizationFormValues['organizationForm'] | null } {
  const hasForm = typeof values.organizationForm === 'string' && values.organizationForm.length > 0
  if (hasForm) return { organizationForm: values.organizationForm }
  if (isEdit) return { organizationForm: null }
  return {}
}

function organizationValuesForInputParse(
  values: OrganizationFormValues,
  ctx: ContentFormInputCtx<Organization> | undefined,
  isEdit: boolean,
) {
  return {
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    functions: values.functions ?? [],
    practices: values.practices ?? [],
    members: {
      classAffinityIds: values.members?.classAffinityIds ?? [],
      speciesAffinityIds: values.members?.speciesAffinityIds ?? [],
      titles: resolveOrganizationCreateMembershipTitles({
        titles: normalizeOrganizationMembershipTitleFormRows(values.members?.titles),
      }),
    },
    ...(values.organizationDomain !== undefined
      ? { organizationDomain: values.organizationDomain }
      : {}),
    ...organizationFormFieldForInput(values, isEdit),
  }
}

export function buildOrganizationCreateInput(
  values: OrganizationFormValues,
  ctx?: ContentFormInputCtx<Organization>,
  validationIntent: ContentValidationIntent = 'publish',
): CreateOrganizationInput {
  const isEdit = Boolean(ctx?.entity)
  const schema = resolveOrganizationInputSchema(isEdit, validationIntent)
  const input = schema.parse(organizationValuesForInputParse(values, ctx, isEdit))
  return finalizeContentInput(
    input as CreateOrganizationInput & { slug?: string },
    ctx,
  ) as CreateOrganizationInput
}

export function buildOrganizationFormValueSyncs(
  prefix?: string,
  discoverableClasses: readonly CharacterClass[] = [],
): FormValueSync[] {
  const startingPointPath = organizationStartingPointFieldPath(prefix)
  return [
    {
      dependsOn: [startingPointPath],
      apply: (values, changedKeys) => {
        if (!changedKeys.includes(startingPointPath)) return undefined
        const presetId = values[startingPointPath]
        if (!isOrganizationAuthoringPresetId(presetId)) {
          return undefined
        }
        return buildOrganizationStartingPointValueSyncPatch(presetId, {
          prefix,
          discoverableClasses,
        })
      },
    },
  ]
}

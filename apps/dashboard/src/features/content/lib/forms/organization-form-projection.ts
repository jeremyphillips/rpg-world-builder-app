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
  organizationMembershipTitlesSchema,
  vocabularyTermFieldCopy,
  type CharacterClass,
  type ContentValidationIntent,
  type CreateOrganizationInput,
  type Organization,
  type OrganizationPractice,
} from '@rpg/contracts'
import { toOptions, type FormItem, type FormValueSync } from '@rpg/ui/form'

import type { ContentFormCtx, ContentFormInputCtx } from './registry/content-form-registry'
import { draftOptionalSelect } from './validation/draft-form-schema-helpers'
import { descriptionField, nameField } from './fields/content-identity-form-fields'
import { finalizeContentInput, slugForInputParse } from './registry/content-form-key-helpers'
import { rankOrganizationPracticeComboboxOptions } from '../../organizations/lib/authoring/organization-practice-combobox-ranking'
import { OrganizationApplyFamiliarTypeField } from '../../organizations/components/create/organization-apply-familiar-type-field'
import { OrganizationStartingPointCustomizedBadge } from '../../organizations/components/create/organization-starting-point-customized-badge'
import { OrganizationStartingPointField } from '../../organizations/components/create/organization-starting-point-field'
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

export type OrganizationFormPresentation = 'full' | 'quick'

function fieldPath(prefix: string | undefined, name: string): string {
  return prefix ? `${prefix}.${name}` : name
}

const organizationMembersFormFieldsSchema = z.object({
  classAffinityIds: z.array(z.string().min(1)).default([]),
  speciesAffinityIds: z.array(z.string().min(1)).default([]),
  titles: organizationMembershipTitlesSchema.optional(),
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

export const organizationCreateDefaultValues: Partial<OrganizationFormValues> = {
  functions: [],
  practices: [],
  members: { classAffinityIds: [], speciesAffinityIds: [], titles: [] },
}

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
    },
    {
      type: 'chips',
      name: fieldPath(prefix, 'functions'),
      label: 'Functions',
      hint: { text: ORGANIZATION_FUNCTION_FIELD_HINT, position: 'below-control' },
      options: organizationFunctionOptions,
      multiple: true,
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

  if (ctx.mode === 'edit') {
    fields.push({
      kind: 'slot',
      name: fieldPath(prefix, '_organizationApplyFamiliarType'),
      render: () =>
        createElement(OrganizationApplyFamiliarTypeField, {
          prefix,
          discoverableClasses,
        }),
    })
  } else {
    fields.push({
      kind: 'group',
      heading: {
        label: ORGANIZATION_STARTING_POINT_LEGEND,
        accessory: createElement(OrganizationStartingPointCustomizedBadge, {
          prefix,
          discoverableClasses,
        }),
      },
      density: 'compact',
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

  fields.push({
    kind: 'group',
    legend: ORGANIZATION_PROFILE_GROUP_LEGEND,
    description: ORGANIZATION_PROFILE_GROUP_DESCRIPTION,
    density: 'compact',
    fields: buildOrganizationProfileFields({
      prefix,
      recommendedPracticeIds: practiceRecommendationIds,
    }),
  })

  const memberAffinityFields = buildOrganizationMemberAffinityFields(ctx, {
    prefix,
    selectedMemberClassAffinityIds,
    selectedMemberSpeciesAffinityIds,
  })
  const descriptionFieldItem: FormItem = {
    ...descriptionField(ctx),
    name: fieldPath(prefix, 'description'),
  }

  if (presentation === 'quick') {
    fields.push({
      kind: 'group',
      heading: {
        label: ORGANIZATION_OPTIONAL_DETAILS_GROUP_LEGEND,
        hint: ORGANIZATION_OPTIONAL_DETAILS_GROUP_DESCRIPTION,
      },
      density: 'compact',
      disclosure: { variant: 'legend', defaultOpen: false },
      fields: [
        {
          kind: 'group',
          legend: ORGANIZATION_MEMBER_AFFINITIES_GROUP_LEGEND,
          description: ORGANIZATION_MEMBER_AFFINITIES_GROUP_DESCRIPTION,
          density: 'compact',
          fields: memberAffinityFields,
        },
        descriptionFieldItem,
      ],
    })
  } else {
    fields.push({
      kind: 'group',
      legend: ORGANIZATION_MEMBER_AFFINITIES_GROUP_LEGEND,
      description: ORGANIZATION_MEMBER_AFFINITIES_GROUP_DESCRIPTION,
      density: 'compact',
      fields: memberAffinityFields,
    })
    fields.push(descriptionFieldItem)
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
      titles: values.members?.titles ?? [],
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

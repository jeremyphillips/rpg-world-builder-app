import { z } from 'zod'
import {
  ORGANIZATION_AUTHORING_PRESETS,
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
  applyOrganizationAuthoringPreset,
  resolveOrganizationPresetMemberClassAffinityIds,
  vocabularyTermFieldCopy,
  type CharacterClass,
  type ContentValidationIntent,
  type CreateOrganizationInput,
  type Organization,
  type OrganizationPractice,
} from '@rpg/contracts'
import { toOptions, type FormItem, type FormValueSync } from '@rpg/ui/form'

import type { ContentFormCtx, ContentFormInputCtx } from './content-form-registry'
import { draftOptionalSelect } from './draft-form-schema-helpers'
import { descriptionField, nameField } from './fields/content-identity-form-fields'
import { finalizeContentInput, slugForInputParse } from './content-form-key-helpers'
import { rankOrganizationPracticeComboboxOptions } from '../../organizations/lib/organization-practice-combobox-ranking'
import {
  buildMemberClassAffinityChipOptions,
  ORGANIZATION_MEMBER_CLASS_AFFINITY_FIELD_HINT,
} from '../../organizations/lib/organization-member-class-chip-options.lib'
import {
  buildMemberSpeciesAffinityChipOptions,
  ORGANIZATION_MEMBER_SPECIES_AFFINITY_FIELD_HINT,
} from '../../organizations/lib/organization-member-species-chip-options.lib'

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

const organizationAuthoringPresetOptions = ORGANIZATION_AUTHORING_PRESET_IDS.map((id) => {
  const preset = ORGANIZATION_AUTHORING_PRESETS[id]
  return {
    value: id,
    label: preset.label,
    description: preset.description,
    ...('discoveryTerms' in preset && preset.discoveryTerms
      ? { searchTerms: preset.discoveryTerms }
      : {}),
  }
})

const organizationPracticeFieldCopy = vocabularyTermFieldCopy(ORGANIZATION_PRACTICE_TERM, {
  multiple: true,
})

const ORGANIZATION_FUNCTION_FIELD_HINT = 'What this organization broadly does.'
const ORGANIZATION_PRACTICE_FIELD_HINT = 'Distinctive trades, methods, or operational specialties.'

function fieldPath(prefix: string | undefined, name: string): string {
  return prefix ? `${prefix}.${name}` : name
}

const organizationMembersFormFieldsSchema = z.object({
  classAffinityIds: z.array(z.string().min(1)).default([]),
  speciesAffinityIds: z.array(z.string().min(1)).default([]),
})

export const organizationFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  organizationDomain: organizationDomainSchema,
  organizationForm: canonicalOrganizationFormSchema.optional(),
  functions: z.array(organizationFunctionSchema).default([]),
  practices: z.array(organizationPracticeSchema).default([]),
  members: organizationMembersFormFieldsSchema.default({
    classAffinityIds: [],
    speciesAffinityIds: [],
  }),
  /** Ephemeral picker value — cleared after apply; not sent on create. */
  authoringPresetId: z.enum(ORGANIZATION_AUTHORING_PRESET_IDS).optional(),
  /** Create provenance when a familiar starting point was applied — sent as sourcePresetId. */
  sourcePresetId: z.enum(ORGANIZATION_AUTHORING_PRESET_IDS).optional(),
})

export const organizationDraftFormSchema = z.object({
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
  authoringPresetId: draftOptionalSelect(z.enum(ORGANIZATION_AUTHORING_PRESET_IDS)),
  sourcePresetId: draftOptionalSelect(z.enum(ORGANIZATION_AUTHORING_PRESET_IDS)),
})

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>

export const organizationCreateDefaultValues: Partial<OrganizationFormValues> = {
  functions: [],
  practices: [],
  members: { classAffinityIds: [], speciesAffinityIds: [] },
}

export { nameField as organizationNameField }

export function buildOrganizationFields(
  ctx: ContentFormCtx,
  options: {
    prefix?: string
    includeName?: boolean
    selectedMemberClassAffinityIds?: readonly string[]
    selectedMemberSpeciesAffinityIds?: readonly string[]
    recommendedPracticeIds?: readonly OrganizationPractice[]
  } = {},
): FormItem[] {
  const {
    prefix,
    includeName = false,
    selectedMemberClassAffinityIds,
    selectedMemberSpeciesAffinityIds,
    recommendedPracticeIds,
  } = options
  const domainPath = fieldPath(prefix, 'organizationDomain')
  const practiceRecommendationIds =
    recommendedPracticeIds ?? ctx.organizationPracticeRecommendationIds ?? []
  const fields: FormItem[] = []

  if (includeName) {
    fields.push({ ...nameField(), name: fieldPath(prefix, 'name') })
  }

  if (ctx.mode !== 'edit') {
    fields.push({
      type: 'combobox',
      name: fieldPath(prefix, 'authoringPresetId'),
      label: 'Start from familiar type',
      options: organizationAuthoringPresetOptions,
      multiple: false,
      placeholder: 'Search familiar types…',
    })
  }

  fields.push(
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
      name: fieldPath(prefix, 'functions'),
      label: 'Functions',
      hint: { text: ORGANIZATION_FUNCTION_FIELD_HINT, position: 'below-control' },
      options: organizationFunctionOptions,
      multiple: true,
      chrome: { variant: 'outline' },
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
        rankOrganizationPracticeComboboxOptions(
          options,
          query,
          selected,
          practiceRecommendationIds,
        ),
    },
    {
      type: 'chips',
      name: fieldPath(prefix, 'members.classAffinityIds'),
      label: 'Member class affinities',
      hint: {
        text: ORGANIZATION_MEMBER_CLASS_AFFINITY_FIELD_HINT,
        position: 'below-control',
      },
      options: buildMemberClassAffinityChipOptions(
        ctx,
        selectedMemberClassAffinityIds ?? ctx.organizationMemberClassAffinitySeedIds ?? [],
      ),
      multiple: true,
      chrome: { variant: 'outline' },
    },
    {
      type: 'chips',
      name: fieldPath(prefix, 'members.speciesAffinityIds'),
      label: 'Member species affinities',
      hint: {
        text: ORGANIZATION_MEMBER_SPECIES_AFFINITY_FIELD_HINT,
        position: 'below-control',
      },
      options: buildMemberSpeciesAffinityChipOptions(
        ctx,
        selectedMemberSpeciesAffinityIds ?? ctx.organizationMemberSpeciesAffinitySeedIds ?? [],
      ),
      multiple: true,
      chrome: { variant: 'outline' },
    },
    { ...descriptionField(ctx), name: fieldPath(prefix, 'description') },
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
    functions: entity.functions,
    practices: entity.practices,
    members: {
      classAffinityIds: entity.members.classAffinityIds,
      speciesAffinityIds: entity.members.speciesAffinityIds,
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

export function buildOrganizationCreateInput(
  values: OrganizationFormValues,
  ctx?: ContentFormInputCtx<Organization>,
  validationIntent: ContentValidationIntent = 'publish',
): CreateOrganizationInput {
  const isEdit = Boolean(ctx?.entity)
  const schema = resolveOrganizationInputSchema(isEdit, validationIntent)

  const input = schema.parse({
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    functions: values.functions ?? [],
    practices: values.practices ?? [],
    members: {
      classAffinityIds: values.members?.classAffinityIds ?? [],
      speciesAffinityIds: values.members?.speciesAffinityIds ?? [],
    },
    ...(values.organizationDomain !== undefined
      ? { organizationDomain: values.organizationDomain }
      : {}),
    ...(values.sourcePresetId !== undefined ? { sourcePresetId: values.sourcePresetId } : {}),
    ...organizationFormFieldForInput(values, isEdit),
  })
  return finalizeContentInput(
    input as CreateOrganizationInput & { slug?: string },
    ctx,
  ) as CreateOrganizationInput
}

export function buildOrganizationFormValueSyncs(
  prefix?: string,
  discoverableClasses: readonly CharacterClass[] = [],
): FormValueSync[] {
  const presetPath = fieldPath(prefix, 'authoringPresetId')
  return [
    {
      dependsOn: [presetPath],
      apply: (values, changedKeys) => {
        if (!changedKeys.includes(presetPath)) return undefined
        const presetId = values[presetPath]
        if (
          typeof presetId !== 'string' ||
          !ORGANIZATION_AUTHORING_PRESET_IDS.includes(
            presetId as (typeof ORGANIZATION_AUTHORING_PRESET_IDS)[number],
          )
        ) {
          return undefined
        }
        const recipe = applyOrganizationAuthoringPreset(
          presetId as (typeof ORGANIZATION_AUTHORING_PRESET_IDS)[number],
        )
        return {
          [presetPath]: undefined,
          [fieldPath(prefix, 'sourcePresetId')]: presetId,
          [fieldPath(prefix, 'organizationDomain')]: recipe.organizationDomain,
          [fieldPath(prefix, 'organizationForm')]: recipe.organizationForm,
          [fieldPath(prefix, 'functions')]: recipe.functions,
          [fieldPath(prefix, 'practices')]: recipe.practices,
          [fieldPath(prefix, 'members.classAffinityIds')]:
            resolveOrganizationPresetMemberClassAffinityIds(
              presetId as (typeof ORGANIZATION_AUTHORING_PRESET_IDS)[number],
              discoverableClasses,
            ),
        }
      },
    },
  ]
}

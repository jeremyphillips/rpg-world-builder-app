import { z } from 'zod'

import {
  ALIGNMENTS,
  alignmentSchema,
  characterBuilderValidationMessages,
  formatFieldMessage,
  getAlignmentLabel,
  getContentTypeTerm,
  listReachableSpellOptions,
  listReachableStartingWeapons,
  resolveAvailableContent,
  resolveBuilderMaxAllowedLevel,
  type AutomaticNpcBuildConstraints,
  type AutomaticNpcBuildSeed,
  type CharacterBuildContext,
  type OrganizationKind,
} from '@rpg/contracts'
import { toOptions, type FieldOption, type FormItem, type TabbedFormTab } from '@rpg/ui/form'

import { buildOrganizationMembershipTitleRadioOptions } from '../../components/connections/organization-membership-title-field.lib'
import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from '../../components/connections/organization-membership-title-field.types'

// ---------------------------------------------------------------------------
// Quick NPC form — setup (species/class/level) plus authoring tabs for
// details (name, alignment, membership title) and optional requirements
// (weapon/spell constraints). Options come from the canonical availability
// resolver and advisory discovery helpers.
// ---------------------------------------------------------------------------

export const QUICK_NPC_MEMBERSHIP_TITLE_FIELD_NAME = 'membershipTitle'
export const QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME = 'requiredWeaponId'
export const QUICK_NPC_REQUIRED_SPELL_FIELD_NAME = 'requiredSpellId'

export const QUICK_NPC_DETAILS_TAB_ID = 'details' as const
export const QUICK_NPC_REQUIREMENTS_TAB_ID = 'requirements' as const

export type QuickNpcSetupValues = {
  speciesId: string
  classId: string
  level: number
}

export const EMPTY_QUICK_NPC_SETUP_VALUES: QuickNpcSetupValues = {
  speciesId: '',
  classId: '',
  level: 1,
}

export function quickNpcSetupSchema(maxLevel: number) {
  return z.object({
    speciesId: z
      .string()
      .min(1, formatFieldMessage(characterBuilderValidationMessages.speciesRequired())),
    classId: z
      .string()
      .min(1, formatFieldMessage(characterBuilderValidationMessages.classRequired())),
    level: z
      .number({
        message: formatFieldMessage(characterBuilderValidationMessages.levelBelowAllowedMinimum()),
      })
      .int()
      .min(1, formatFieldMessage(characterBuilderValidationMessages.levelBelowAllowedMinimum()))
      .max(
        maxLevel,
        formatFieldMessage(
          characterBuilderValidationMessages.levelExceedsCampaignMaximum({ maxLevel }),
        ),
      ),
  })
}

export function quickNpcAuthoringSchema(maxLevel: number) {
  return quickNpcSetupSchema(maxLevel).extend({
    name: z
      .string()
      .trim()
      .min(1, formatFieldMessage(characterBuilderValidationMessages.nameRequired())),
    alignment: z
      .string()
      .min(1, formatFieldMessage(characterBuilderValidationMessages.alignmentRequired()))
      .pipe(alignmentSchema),
    membershipTitle: z.string(),
    requiredWeaponId: z.string(),
    requiredSpellId: z.string(),
  })
}

/** TabbedForm schema — authoring tabs only; setup fields are validated separately. */
export function quickNpcAuthoringTabSchema() {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, formatFieldMessage(characterBuilderValidationMessages.nameRequired())),
    alignment: z
      .string()
      .min(1, formatFieldMessage(characterBuilderValidationMessages.alignmentRequired()))
      .pipe(alignmentSchema),
    membershipTitle: z.string(),
    requiredWeaponId: z.string(),
    requiredSpellId: z.string(),
  })
}

export type QuickNpcAuthoringTabValues = z.infer<ReturnType<typeof quickNpcAuthoringTabSchema>>

export type QuickNpcAuthoringValues = z.infer<ReturnType<typeof quickNpcAuthoringSchema>>

/** @deprecated Use QuickNpcAuthoringValues — kept for transitional imports. */
export type QuickNpcFormValues = QuickNpcAuthoringValues

export const quickNpcAuthoringTabDefaultValues: QuickNpcAuthoringTabValues = {
  name: '',
  alignment: 'n',
  membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
  requiredWeaponId: '',
  requiredSpellId: '',
}

export const quickNpcAuthoringDefaultValues: QuickNpcAuthoringValues = {
  ...EMPTY_QUICK_NPC_SETUP_VALUES,
  ...quickNpcAuthoringTabDefaultValues,
}

/** Merges outer Setup values with TabbedForm authoring tab values for create/finalize. */
export function mergeQuickNpcAuthoringValues(
  setup: QuickNpcSetupValues,
  tab: QuickNpcAuthoringTabValues,
): QuickNpcAuthoringValues {
  return { ...setup, ...tab }
}

/** @deprecated Use quickNpcAuthoringDefaultValues */
export const quickNpcFormDefaultValues = quickNpcAuthoringDefaultValues

/** Maps validated authoring values to the automatic build resolver seed. */
export function buildQuickNpcSeed(values: QuickNpcAuthoringValues): AutomaticNpcBuildSeed {
  return {
    name: values.name,
    speciesId: values.speciesId,
    classId: values.classId,
    level: values.level,
    alignment: values.alignment,
  }
}

export function buildQuickNpcConstraints(
  values: Pick<QuickNpcAuthoringValues, 'requiredWeaponId' | 'requiredSpellId'>,
): AutomaticNpcBuildConstraints | undefined {
  const requiredWeaponId = values.requiredWeaponId.trim()
  const requiredSpellId = values.requiredSpellId.trim()
  if (!requiredWeaponId && !requiredSpellId) return undefined

  return {
    ...(requiredWeaponId ? { requiredWeaponId } : {}),
    ...(requiredSpellId ? { requiredSpellId } : {}),
  }
}

export function countQuickNpcConfiguredRequirements(
  values: Pick<QuickNpcAuthoringValues, 'requiredWeaponId' | 'requiredSpellId'>,
): number {
  return (
    Number(Boolean(values.requiredWeaponId.trim())) + Number(Boolean(values.requiredSpellId.trim()))
  )
}

export type QuickNpcContentOptions = {
  speciesOptions: FieldOption[]
  classOptions: FieldOption[]
}

function byLabel(left: FieldOption, right: FieldOption): number {
  return left.label.localeCompare(right.label)
}

/** Species/class options from the canonical campaign availability resolver. */
export function buildQuickNpcContentOptions(
  context: CharacterBuildContext,
): QuickNpcContentOptions {
  const available = resolveAvailableContent(context)
  const toContentOption = (entry: { id: string; name: string }): FieldOption => ({
    value: entry.id,
    label: entry.name,
  })

  return {
    speciesOptions: available.species.map(toContentOption).sort(byLabel),
    classOptions: available.classes.map(toContentOption).sort(byLabel),
  }
}

export function resolveQuickNpcMaxLevel(context: CharacterBuildContext): number {
  return resolveBuilderMaxAllowedLevel(context.characterCreationRules)
}

const ALIGNMENT_LABELS = Object.fromEntries(
  ALIGNMENTS.map((alignment) => [alignment, getAlignmentLabel(alignment)]),
) as Record<(typeof ALIGNMENTS)[number], string>

export type QuickNpcRequirementCategories = {
  weapons: FieldOption[]
  spells: FieldOption[]
}

export function resolveQuickNpcRequirementCategories(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
}): QuickNpcRequirementCategories {
  const seed = {
    classId: args.setup.classId,
    level: args.setup.level,
  }

  if (!seed.classId) {
    return { weapons: [], spells: [] }
  }

  const weapons = listReachableStartingWeapons({ seed, context: args.context }).map((weapon) => ({
    value: weapon.id,
    label: weapon.label,
  }))
  const spells = listReachableSpellOptions({ seed, context: args.context }).map((spell) => ({
    value: spell.id,
    label: spell.label,
  }))

  return { weapons, spells }
}

export type QuickNpcSetupFieldsArgs = QuickNpcContentOptions & {
  maxLevel: number
}

export function buildQuickNpcSetupFields(args: QuickNpcSetupFieldsArgs): FormItem[] {
  return [
    {
      type: 'select',
      name: 'speciesId',
      label: getContentTypeTerm('species').label,
      options: args.speciesOptions,
      placeholder: `Choose a ${getContentTypeTerm('species').label.toLowerCase()}`,
      required: true,
      width: 'full',
    },
    {
      kind: 'row',
      fields: [
        {
          type: 'select',
          name: 'classId',
          label: getContentTypeTerm('classes').label,
          options: args.classOptions,
          placeholder: `Choose a ${getContentTypeTerm('classes').label.toLowerCase()}`,
          required: true,
          width: '1/2',
        },
        {
          type: 'number',
          name: 'level',
          label: 'Level',
          required: true,
          min: 1,
          max: args.maxLevel,
          digits: 2,
          width: '1/2',
        },
      ],
    },
  ]
}

export type QuickNpcDetailsFieldsArgs = {
  membership: {
    kind: OrganizationKind
    subtype?: string
  }
  nameFieldSlot?: FormItem
}

export function buildQuickNpcDetailsFields(args: QuickNpcDetailsFieldsArgs): FormItem[] {
  const nameField: FormItem = args.nameFieldSlot ?? {
    type: 'text',
    name: 'name',
    label: 'Name',
    placeholder: 'Enter a name',
    required: true,
    width: 'full',
  }

  return [
    nameField,
    {
      type: 'select',
      name: 'alignment',
      label: 'Alignment',
      options: toOptions(ALIGNMENTS, ALIGNMENT_LABELS),
      required: true,
      width: 'full',
    },
    {
      type: 'radio',
      name: QUICK_NPC_MEMBERSHIP_TITLE_FIELD_NAME,
      label: 'Title',
      options: buildOrganizationMembershipTitleRadioOptions({
        kind: args.membership.kind,
        ...(args.membership.subtype !== undefined ? { subtype: args.membership.subtype } : {}),
      }),
      defaultValue: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
    },
  ]
}

export function buildQuickNpcRequirementsFields(
  categories: QuickNpcRequirementCategories,
): FormItem[] {
  const fields: FormItem[] = []

  if (categories.weapons.length > 0) {
    fields.push({
      type: 'select',
      name: QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME,
      label: 'Starting weapon',
      options: categories.weapons,
      placeholder: 'No requirement',
      width: 'full',
    })
  }

  if (categories.spells.length > 0) {
    fields.push({
      type: 'select',
      name: QUICK_NPC_REQUIRED_SPELL_FIELD_NAME,
      label: 'Spell',
      options: categories.spells,
      placeholder: 'No requirement',
      width: 'full',
    })
  }

  return fields
}

function formatRequirementsTabLabel(configuredCount: number): string {
  return configuredCount > 0 ? `Requirements (${configuredCount})` : 'Requirements'
}

export function buildQuickNpcTabs(args: {
  detailsFields: FormItem[]
  requirementsFields: FormItem[]
  configuredCount: number
}): TabbedFormTab[] {
  const tabs: TabbedFormTab[] = [
    {
      id: QUICK_NPC_DETAILS_TAB_ID,
      label: 'Details',
      fields: args.detailsFields,
      errorPaths: ['name'],
      resolverFields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
    },
  ]

  if (args.requirementsFields.length > 0) {
    tabs.push({
      id: QUICK_NPC_REQUIREMENTS_TAB_ID,
      label: formatRequirementsTabLabel(args.configuredCount),
      fields: args.requirementsFields,
    })
  }

  return tabs
}

/** @deprecated Use buildQuickNpcSetupFields + buildQuickNpcDetailsFields */
export type QuickNpcFormFieldsArgs = QuickNpcContentOptions & {
  maxLevel: number
  membership: {
    kind: OrganizationKind
    subtype?: string
  }
}

/** @deprecated Use buildQuickNpcSetupFields + buildQuickNpcDetailsFields */
export function buildQuickNpcFormFields(args: QuickNpcFormFieldsArgs): FormItem[] {
  return [
    ...buildQuickNpcSetupFields(args),
    ...buildQuickNpcDetailsFields({ membership: args.membership }),
  ]
}

/** @deprecated Use quickNpcAuthoringSchema */
export function quickNpcFormSchema(maxLevel: number) {
  return quickNpcAuthoringSchema(maxLevel)
}

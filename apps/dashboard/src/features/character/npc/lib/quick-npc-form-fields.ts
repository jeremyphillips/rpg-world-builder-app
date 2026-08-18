import type { ReactNode } from 'react'

import { z } from 'zod'

import {
  ALIGNMENTS,
  alignmentSchema,
  characterBuilderValidationMessages,
  formatFieldMessage,
  getAlignmentLabel,
  isClassProgressionApplicable,
  resolvePlayableBuilderContent,
  type AutomaticNpcBuildConstraints,
  type AutomaticNpcBuildSeed,
  type CharacterBuildContext,
  type OrganizationMembershipTitleDefinition,
} from '@rpg/contracts'
import {
  toOptions,
  type FieldOption,
  type FormItem,
  type TabbedFormTab,
  type TrailingFieldActionConfig,
} from '@rpg/ui/form'

import { buildOrganizationMembershipTitleRadioOptions } from '../../components/connections/organization-membership-title-field.lib'
import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from '../../components/connections/organization-membership-title-field.types'
import {
  buildQuickNpcConstraintsFromArrays,
  countQuickNpcConfiguredRequirementsFromArrays,
  type QuickNpcRequirementOptionSets,
} from './quick-npc-requirement-options.lib'
import { resolveQuickNpcDefaultLevel } from './quick-npc-create-modal-setup.lib'

// ---------------------------------------------------------------------------
// Quick NPC form — setup (species/class/level) plus authoring tabs for
// details (name, alignment, membership title) and optional requirements
// (weapon/spell constraints). Options come from the canonical availability
// resolver and advisory discovery helpers.
// ---------------------------------------------------------------------------

export const QUICK_NPC_MEMBERSHIP_TITLE_FIELD_NAME = 'membershipTitle'
export const QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME = 'requiredWeaponIds'
export const QUICK_NPC_REQUIRED_SPELL_FIELD_NAME = 'requiredSpellIds'

export const QUICK_NPC_DETAILS_TAB_ID = 'details' as const
export const QUICK_NPC_REQUIREMENTS_TAB_ID = 'requirements' as const

export type QuickNpcSetupValues = {
  speciesId: string
  classId: string
  level: number
}

export function createQuickNpcSetupDefaultValues(
  context: CharacterBuildContext,
): QuickNpcSetupValues {
  return {
    speciesId: '',
    classId: '',
    level: resolveQuickNpcDefaultLevel(context),
  }
}

export const EMPTY_QUICK_NPC_SETUP_VALUES: QuickNpcSetupValues = {
  speciesId: '',
  classId: '',
  level: 1,
}

export function quickNpcSetupSchema(maxLevel: number, minLevel: number) {
  return z
    .object({
      speciesId: z
        .string()
        .min(1, formatFieldMessage(characterBuilderValidationMessages.speciesRequired())),
      classId: z.string(),
      level: z
        .number({
          message: formatFieldMessage(
            characterBuilderValidationMessages.levelBelowAllowedMinimum(),
          ),
        })
        .int()
        .min(
          minLevel,
          formatFieldMessage(characterBuilderValidationMessages.levelBelowAllowedMinimum()),
        )
        .max(
          maxLevel,
          formatFieldMessage(
            characterBuilderValidationMessages.levelExceedsCampaignMaximum({ maxLevel }),
          ),
        ),
    })
    .superRefine((values, ctx) => {
      if (isClassProgressionApplicable(values.level) && values.classId.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: formatFieldMessage(characterBuilderValidationMessages.classRequired()),
          path: ['classId'],
        })
      }
    })
}

export function quickNpcAuthoringSchema(maxLevel: number, minLevel: number) {
  return quickNpcSetupSchema(maxLevel, minLevel).extend({
    name: z
      .string()
      .trim()
      .min(1, formatFieldMessage(characterBuilderValidationMessages.nameRequired())),
    alignment: z
      .string()
      .min(1, formatFieldMessage(characterBuilderValidationMessages.alignmentRequired()))
      .pipe(alignmentSchema),
    membershipTitle: z.string(),
    requiredWeaponIds: z.array(z.string()),
    requiredSpellIds: z.array(z.string()),
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
    requiredWeaponIds: z.array(z.string()),
    requiredSpellIds: z.array(z.string()),
  })
}

export type QuickNpcAuthoringTabValues = z.infer<ReturnType<typeof quickNpcAuthoringTabSchema>>

export type QuickNpcAuthoringValues = z.infer<ReturnType<typeof quickNpcAuthoringSchema>>

export const quickNpcAuthoringTabDefaultValues: QuickNpcAuthoringTabValues = {
  name: '',
  alignment: 'n',
  membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
  requiredWeaponIds: [],
  requiredSpellIds: [],
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

/** Maps validated authoring values to the automatic build resolver seed. */
export function buildQuickNpcSeed(values: QuickNpcAuthoringValues): AutomaticNpcBuildSeed {
  return {
    name: values.name,
    speciesId: values.speciesId,
    ...(isClassProgressionApplicable(values.level) && values.classId
      ? { classId: values.classId }
      : {}),
    level: values.level,
    alignment: values.alignment,
  }
}

export function buildQuickNpcConstraints(
  values: Pick<QuickNpcAuthoringValues, 'requiredWeaponIds' | 'requiredSpellIds'>,
): AutomaticNpcBuildConstraints | undefined {
  return buildQuickNpcConstraintsFromArrays({
    requiredWeaponIds: values.requiredWeaponIds,
    requiredSpellIds: values.requiredSpellIds,
  })
}

export function countQuickNpcConfiguredRequirements(
  values: Pick<QuickNpcAuthoringValues, 'requiredWeaponIds' | 'requiredSpellIds'>,
): number {
  return countQuickNpcConfiguredRequirementsFromArrays({
    requiredWeaponIds: values.requiredWeaponIds,
    requiredSpellIds: values.requiredSpellIds,
  })
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
  const available = resolvePlayableBuilderContent(context)
  const toContentOption = (entry: { id: string; name: string }): FieldOption => ({
    value: entry.id,
    label: entry.name,
  })

  return {
    speciesOptions: available.species.map(toContentOption).sort(byLabel),
    classOptions: available.classes.map(toContentOption).sort(byLabel),
  }
}

const ALIGNMENT_LABELS = Object.fromEntries(
  ALIGNMENTS.map((alignment) => [alignment, getAlignmentLabel(alignment)]),
) as Record<(typeof ALIGNMENTS)[number], string>

export type QuickNpcRequirementCategories = {
  weapons: FieldOption[]
  spells: FieldOption[]
}

export type { QuickNpcRequirementOptionSets }

function formatRequirementsTabLabel(configuredCount: number): string {
  return configuredCount > 0 ? `Requirements (${configuredCount})` : 'Requirements'
}

export type QuickNpcDetailsFieldsArgs = {
  membership: {
    titles: readonly OrganizationMembershipTitleDefinition[]
  }
  nameTrailingAction?: TrailingFieldActionConfig
  nameHint?: string
}

export function buildQuickNpcDetailsFields(args: QuickNpcDetailsFieldsArgs): FormItem[] {
  const nameField: FormItem = {
    type: 'text',
    name: 'name',
    label: 'Name',
    placeholder: 'Enter a name',
    required: true,
    width: 'full',
    ...(args.nameTrailingAction ? { trailingAction: args.nameTrailingAction } : {}),
    ...(args.nameHint ? { hint: args.nameHint } : {}),
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
        titles: args.membership.titles,
      }),
      defaultValue: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
    },
  ]
}

export function buildQuickNpcRequirementsFields(): FormItem[] {
  return []
}

export function buildQuickNpcTabs(args: {
  detailsFields: FormItem[]
  requirementsFields: FormItem[]
  configuredCount: number
  requirementsHeader?: ReactNode
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

  if (args.requirementsFields.length > 0 || args.requirementsHeader) {
    tabs.push({
      id: QUICK_NPC_REQUIREMENTS_TAB_ID,
      label: formatRequirementsTabLabel(args.configuredCount),
      fields: args.requirementsFields,
      ...(args.requirementsHeader ? { header: args.requirementsHeader } : {}),
    })
  }

  return tabs
}

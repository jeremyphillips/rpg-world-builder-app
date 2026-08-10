import { z } from 'zod'

import {
  ALIGNMENTS,
  alignmentSchema,
  characterBuilderValidationMessages,
  formatFieldMessage,
  getAlignmentLabel,
  getContentTypeTerm,
  resolveAvailableContent,
  resolveBuilderMaxAllowedLevel,
  type AutomaticNpcBuildSeed,
  type CharacterBuildContext,
  type OrganizationKind,
} from '@rpg/contracts'
import { toOptions, type FieldOption, type FormItem } from '@rpg/ui/form'

import { buildOrganizationMembershipTitleRadioOptions } from '../../components/connections/organization-membership-title-field.lib'
import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from '../../components/connections/organization-membership-title-field.types'

// ---------------------------------------------------------------------------
// Quick NPC form — compact seed fields (name, species, class, level,
// alignment) plus the contextual organization membership title. Options come
// from the canonical availability resolver; everything else the automatic
// build resolver fills deterministically.
// ---------------------------------------------------------------------------

export const QUICK_NPC_MEMBERSHIP_TITLE_FIELD_NAME = 'membershipTitle'

export function quickNpcFormSchema(maxLevel: number) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, formatFieldMessage(characterBuilderValidationMessages.nameRequired())),
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
    alignment: z
      .string()
      .min(1, formatFieldMessage(characterBuilderValidationMessages.alignmentRequired()))
      .pipe(alignmentSchema),
    membershipTitle: z.string(),
  })
}

export type QuickNpcFormValues = z.infer<ReturnType<typeof quickNpcFormSchema>>

export const quickNpcFormDefaultValues: QuickNpcFormValues = {
  name: '',
  speciesId: '',
  classId: '',
  level: 1,
  alignment: '' as QuickNpcFormValues['alignment'],
  membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
}

/** Maps validated form values to the automatic build resolver seed. */
export function buildQuickNpcSeed(values: QuickNpcFormValues): AutomaticNpcBuildSeed {
  return {
    name: values.name,
    speciesId: values.speciesId,
    classId: values.classId,
    level: values.level,
    alignment: values.alignment,
  }
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

export type QuickNpcFormFieldsArgs = QuickNpcContentOptions & {
  maxLevel: number
  membership: {
    kind: OrganizationKind
    subtype?: string
  }
}

export function buildQuickNpcFormFields(args: QuickNpcFormFieldsArgs): FormItem[] {
  return [
    {
      type: 'text',
      name: 'name',
      label: 'Name',
      placeholder: 'Enter a name',
      required: true,
      width: 'full',
    },
    {
      kind: 'row',
      fields: [
        {
          type: 'select',
          name: 'speciesId',
          label: getContentTypeTerm('species').label,
          options: args.speciesOptions,
          placeholder: `Choose a ${getContentTypeTerm('species').label.toLowerCase()}`,
          required: true,
          width: '1/2',
        },
        {
          type: 'select',
          name: 'classId',
          label: getContentTypeTerm('classes').label,
          options: args.classOptions,
          placeholder: `Choose a ${getContentTypeTerm('classes').label.toLowerCase()}`,
          required: true,
          width: '1/2',
        },
      ],
    },
    {
      kind: 'row',
      fields: [
        {
          type: 'number',
          name: 'level',
          label: 'Level',
          required: true,
          min: 1,
          max: args.maxLevel,
          digits: 2,
          width: '1/3',
        },
        {
          type: 'select',
          name: 'alignment',
          label: 'Alignment',
          options: toOptions(ALIGNMENTS, ALIGNMENT_LABELS),
          placeholder: 'Choose an alignment',
          required: true,
          width: '2/3',
        },
      ],
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

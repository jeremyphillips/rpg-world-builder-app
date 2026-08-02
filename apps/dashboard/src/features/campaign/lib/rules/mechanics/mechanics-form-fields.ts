import { createElement } from 'react'
import { z } from 'zod'
import { Text } from '@rpg/ui'
import {
  ARMOR_CLASS_BASES,
  ARMOR_CLASS_MODES,
  ATTACK_RESOLUTION_MODE_TERM,
  DEFAULT_EDITION_PRESET_ID,
  EDITION_PRESET_TERM,
  attackResolutionModeIdSchema,
  editionPresetIdSchema,
  armorClassModeSchema,
} from '@rpg/contracts'
import { toOptions, type FieldOption, type FormItem } from '@rpg/ui/form'

import { vocabularyFieldLabel } from '@/features/vocabulary'

import { EditionPresetEffects } from '../../../components/edition-preset-effects.client'
import { ARMOR_CLASS_BASE_LABELS, ARMOR_CLASS_MODE_LABELS } from './mechanics-form-labels'

export const mechanicsValuesSchema = z.object({
  editionPresetId: editionPresetIdSchema,
  armorClassMode: armorClassModeSchema,
  armorClassBase: z.enum(['9', '10']),
  attackResolutionMode: attackResolutionModeIdSchema,
})

export type MechanicsValues = z.infer<typeof mechanicsValuesSchema>

export const MECHANICS_CONFIGURATION_SECTIONS = [
  { id: 'edition-preset', label: vocabularyFieldLabel(EDITION_PRESET_TERM) },
  { id: 'mechanics-knobs', label: 'Mechanics knobs' },
] as const

export type MechanicsConfigurationSectionId =
  (typeof MECHANICS_CONFIGURATION_SECTIONS)[number]['id']

type MechanicsFieldOptions = {
  editionPresetOptions: FieldOption[]
  attackResolutionModeOptions: FieldOption[]
}

const EDITION_PRESET_RECOMMENDED_BADGE = 'Recommended'
const SCROLL_SECTION_ANCHOR_CLASS = 'scroll-mt-20'

function editionPresetOptionsWithRecommendedBadge(options: FieldOption[]): FieldOption[] {
  return options.map((option) =>
    option.value === DEFAULT_EDITION_PRESET_ID
      ? { ...option, badge: EDITION_PRESET_RECOMMENDED_BADGE }
      : option,
  )
}

function editionPresetGroup(editionPresetOptions: FieldOption[]): FormItem {
  return {
    kind: 'group',
    legend: vocabularyFieldLabel(EDITION_PRESET_TERM),
    id: 'edition-preset',
    className: SCROLL_SECTION_ANCHOR_CLASS,
    fields: [
      {
        type: 'radioCard',
        name: 'editionPresetId',
        label: vocabularyFieldLabel(EDITION_PRESET_TERM),
        labelHidden: true,
        required: true,
        options: editionPresetOptionsWithRecommendedBadge(editionPresetOptions),
        defaultValue: DEFAULT_EDITION_PRESET_ID,
      },
      {
        kind: 'slot',
        name: '_editionPresetEffects',
        render: () => createElement(EditionPresetEffects),
      },
    ],
  }
}

function mechanicsKnobsGroup(attackResolutionModeOptions: FieldOption[]): FormItem {
  return {
    kind: 'group',
    legend: 'Mechanics knobs',
    id: 'mechanics-knobs',
    className: SCROLL_SECTION_ANCHOR_CLASS,
    description:
      'Fine-tune armor class and attack resolution. The server tracks whether these differ from your selected preset.',
    fields: [
      {
        type: 'radio',
        name: 'armorClassMode',
        label: 'Armor class direction',
        required: true,
        options: toOptions([...ARMOR_CLASS_MODES], ARMOR_CLASS_MODE_LABELS),
        hint: 'Ascending AC increases with better protection; descending AC decreases.',
      },
      {
        type: 'radio',
        name: 'armorClassBase',
        label: 'Unarmored base AC',
        required: true,
        options: ARMOR_CLASS_BASES.map((base) => ({
          value: String(base),
          label: ARMOR_CLASS_BASE_LABELS[base],
        })),
        hint: 'The baseline armor class for an unarmored character in this rules framework.',
      },
      {
        type: 'select',
        name: 'attackResolutionMode',
        label: vocabularyFieldLabel(ATTACK_RESOLUTION_MODE_TERM),
        required: true,
        options: attackResolutionModeOptions,
        placeholder: 'Choose attack resolution…',
        hint: 'How attack rolls are compared to the target armor class.',
      },
    ],
  }
}

/** Mechanics fields for Homebrew Rules Configuration — flat sections with in-page anchor targets. */
export function buildMechanicsConfigFields({
  editionPresetOptions,
  attackResolutionModeOptions,
}: MechanicsFieldOptions): FormItem[] {
  return [
    {
      kind: 'slot',
      name: '_mechanicsLeadCopy',
      render: () =>
        createElement(
          Text,
          { variant: 'muted' },
          'Choose a rules-era preset to quickly configure core mechanics. You can customize individual mechanics after choosing a preset.',
        ),
    },
    editionPresetGroup(editionPresetOptions),
    mechanicsKnobsGroup(attackResolutionModeOptions),
  ]
}

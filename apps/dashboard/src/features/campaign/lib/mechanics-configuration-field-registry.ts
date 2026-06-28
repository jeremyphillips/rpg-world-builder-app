import { createElement } from 'react'
import { z } from 'zod'
import { Text } from '@rpg/ui'
import {
  ARMOR_CLASS_BASES,
  ARMOR_CLASS_MODES,
  DEFAULT_EDITION_PRESET_ID,
  attackResolutionModeIdSchema,
  editionPresetIdSchema,
  armorClassModeSchema,
} from '@rpg/contracts'
import { toOptions, type FieldOption, type FormItem } from '@rpg/ui/form'

import { EditionPresetEffects } from '../components/edition-preset-effects.client'
import { ARMOR_CLASS_BASE_LABELS, ARMOR_CLASS_MODE_LABELS } from './mechanics-labels'

export const mechanicsValuesSchema = z.object({
  editionPresetId: editionPresetIdSchema,
  armorClassMode: armorClassModeSchema,
  armorClassBase: z.enum(['9', '10']),
  attackResolutionMode: attackResolutionModeIdSchema,
})

export type MechanicsValues = z.infer<typeof mechanicsValuesSchema>

export const MECHANICS_CONFIGURATION_SECTIONS = [
  { id: 'edition-preset', label: 'Edition preset' },
  { id: 'mechanics-knobs', label: 'Mechanics knobs' },
] as const

export type MechanicsConfigurationSectionId =
  (typeof MECHANICS_CONFIGURATION_SECTIONS)[number]['id']

type MechanicsFieldOptions = {
  editionPresetOptions: FieldOption[]
  attackResolutionModeOptions: FieldOption[]
}

function anchorSlot(sectionId: string): FormItem {
  return {
    kind: 'slot',
    name: `_anchor_${sectionId}`,
    render: () => createElement('div', { id: sectionId, className: 'scroll-mt-20' }),
  }
}

function editionPresetGroup(editionPresetOptions: FieldOption[]): FormItem {
  return {
    kind: 'group',
    legend: 'Edition preset',
    collapsible: false,
    fields: [
      {
        type: 'radioCard',
        name: 'editionPresetId',
        label: 'Edition preset',
        labelHidden: true,
        required: true,
        options: editionPresetOptions,
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
    description:
      'Fine-tune armor class and attack resolution. The server tracks whether these differ from your selected preset.',
    collapsible: false,
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
        label: 'Attack resolution',
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
    anchorSlot('edition-preset'),
    editionPresetGroup(editionPresetOptions),
    anchorSlot('mechanics-knobs'),
    mechanicsKnobsGroup(attackResolutionModeOptions),
  ]
}

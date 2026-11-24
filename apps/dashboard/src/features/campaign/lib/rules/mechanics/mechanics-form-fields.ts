import { z } from 'zod'
import {
  ARMOR_CLASS_BASES,
  ARMOR_CLASS_MODES,
  ATTACK_RESOLUTION_MODE_TERM,
  DEFAULT_EDITION_PRESET_ID,
  EDITION_PRESET_IDS,
  EDITION_PRESET_TERM,
  armorClassFromProtection,
  attackResolutionModeIdSchema,
  editionPresetIdSchema,
  armorClassModeSchema,
  getEditionPresetMechanics,
  type ArmorClassBase,
  type ArmorClassMode,
  type EditionPresetId,
} from '@rpg/contracts'
import { toOptions, type FieldOption, type FormItem, type FormValueSync } from '@rpg/ui/form'

import { vocabularyFieldLabel } from '@/features/vocabulary'

import { ARMOR_CLASS_BASE_LABELS, ARMOR_CLASS_MODE_LABELS } from './mechanics-form-labels'
import { MECHANICS_LEAD_COPY_DISPLAY } from './mechanics-lead-copy-display.lib'

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

export type MechanicsFieldOptions = {
  editionPresetOptions: FieldOption[]
  attackResolutionModeOptions: FieldOption[]
}

const EDITION_PRESET_RECOMMENDED_BADGE = 'Recommended'
const SCROLL_SECTION_ANCHOR_CLASS = 'scroll-mt-8'

/** Protection stored on SRD plate. The unarmored-base hint displays it through the scale. */
export const UNARMORED_BASE_EXAMPLE_PLATE_OFFSET = 8

const UNARMORED_BASE_STATIC_HINT =
  'The baseline for an unarmored character. Changing it shifts the displayed AC of every armor.'

function isArmorClassMode(value: unknown): value is ArmorClassMode {
  return (ARMOR_CLASS_MODES as readonly string[]).includes(String(value))
}

function isArmorClassBase(value: unknown): value is ArmorClassBase {
  return (ARMOR_CLASS_BASES as readonly number[]).includes(Number(value))
}

/** Plate's displayed AC under the selected direction and base. */
export function unarmoredBaseShiftHint(values: Record<string, unknown>): string | undefined {
  const mode = values.armorClassMode
  const base = Number(values.armorClassBase)
  if (!isArmorClassMode(mode) || !isArmorClassBase(base)) return undefined

  const plate = armorClassFromProtection({ mode, base }, UNARMORED_BASE_EXAMPLE_PLATE_OFFSET)
  return `${UNARMORED_BASE_STATIC_HINT} Plate: ${plate}.`
}

function editionPresetOptionsWithRecommendedBadge(options: FieldOption[]): FieldOption[] {
  return options.map((option) =>
    option.value === DEFAULT_EDITION_PRESET_ID
      ? { ...option, badge: EDITION_PRESET_RECOMMENDED_BADGE }
      : option,
  )
}

function isEditionPresetId(value: unknown): value is EditionPresetId {
  return typeof value === 'string' && (EDITION_PRESET_IDS as readonly string[]).includes(value)
}

/** Writes preset knobs after the author changes the preset. Skips the first observation. */
const MECHANICS_VALUE_SYNCS: FormValueSync[] = [
  {
    dependsOn: ['editionPresetId'],
    apply: (values) => {
      if (!isEditionPresetId(values.editionPresetId)) return undefined
      const bundle = getEditionPresetMechanics(values.editionPresetId)
      return {
        armorClassMode: bundle.armorClass.mode,
        armorClassBase: String(bundle.armorClass.base),
        attackResolutionMode: bundle.attackResolution.mode,
      }
    },
  },
]

export function buildMechanicsValueSyncs(): FormValueSync[] {
  return MECHANICS_VALUE_SYNCS
}

function editionPresetGroup(editionPresetOptions: FieldOption[]): FormItem {
  return {
    kind: 'group',
    heading: { label: vocabularyFieldLabel(EDITION_PRESET_TERM) },
    id: 'edition-preset',
    className: SCROLL_SECTION_ANCHOR_CLASS,
    fields: [
      {
        type: 'radioCard',
        name: 'editionPresetId',
        label: vocabularyFieldLabel(EDITION_PRESET_TERM),
        labelVisibility: 'srOnly',
        required: true,
        options: editionPresetOptionsWithRecommendedBadge(editionPresetOptions),
        defaultValue: DEFAULT_EDITION_PRESET_ID,
      },
    ],
  }
}

function mechanicsKnobsGroup(attackResolutionModeOptions: FieldOption[]): FormItem {
  return {
    kind: 'group',
    heading: {
      label: 'Mechanics knobs',
      hint: 'Fine-tune armor class and attack resolution. The server tracks whether these differ from your selected preset.',
    },
    id: 'mechanics-knobs',
    className: SCROLL_SECTION_ANCHOR_CLASS,
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
        hint: {
          text: UNARMORED_BASE_STATIC_HINT,
          resolve: {
            dependsOn: ['armorClassMode', 'armorClassBase'],
            hintWhen: unarmoredBaseShiftHint,
          },
        },
      },
      {
        type: 'select',
        name: 'attackResolutionMode',
        label: vocabularyFieldLabel(ATTACK_RESOLUTION_MODE_TERM),
        required: true,
        options: attackResolutionModeOptions,
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
    MECHANICS_LEAD_COPY_DISPLAY,
    editionPresetGroup(editionPresetOptions),
    mechanicsKnobsGroup(attackResolutionModeOptions),
  ]
}

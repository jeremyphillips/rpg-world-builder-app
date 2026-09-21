import { z } from 'zod'
import { createElement } from 'react'
import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  SPELLCASTING_FOCUS_GEAR_KINDS,
  SPELLCASTING_GEAR_KINDS,
  SPELLCASTING_GEAR_KIND_ENTRIES,
  abilitySchema,
  campaignLevelSchema,
  classGainProgressionSchema,
  classSpellcastingProgressionDraftSchema,
  classSpellcastingProgressionSchema,
  spellcastingFocusGearKindSchema,
  spellcastingGearKindSchema,
} from '@rpg/contracts'
import {
  defineDependentField,
  toOptions,
  type FieldVisibility,
  type FormItem,
  type DependentConfig,
} from '@rpg/ui/form'

import { ClassSpellbookAcquisitionField } from '../components/class-spellbook-acquisition-field'
import { ClassSpellcastingProgressionField } from '../components/class-spellcasting-progression-field'

import { getLevelFieldOptions, levelSelectDigits } from '../../lib/form-options/level-field-options'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { draftOptionalSelect } from '../../lib/forms/validation/draft-form-schema-helpers'
import {
  SPELL_SELECTION_CHANGE_PACKAGE_OPTIONS,
  SPELL_SELECTION_MODEL_OPTIONS,
} from './class-spell-selection-form.lib'

const abilityOptions = toOptions(
  ABILITY_IDS,
  Object.fromEntries(ABILITY_IDS.map((id) => [id, ABILITY_ENTRIES[id].label])) as Record<
    (typeof ABILITY_IDS)[number],
    string
  >,
)

const spellcastingGearKindOptions = toOptions(
  SPELLCASTING_GEAR_KINDS,
  Object.fromEntries(
    SPELLCASTING_GEAR_KINDS.map((kind) => [kind, SPELLCASTING_GEAR_KIND_ENTRIES[kind].label]),
  ) as Record<(typeof SPELLCASTING_GEAR_KINDS)[number], string>,
)

const spellcastingFocusKindOptions = toOptions(
  SPELLCASTING_FOCUS_GEAR_KINDS,
  Object.fromEntries(
    SPELLCASTING_FOCUS_GEAR_KINDS.map((kind) => [kind, SPELLCASTING_GEAR_KIND_ENTRIES[kind].label]),
  ) as Record<(typeof SPELLCASTING_FOCUS_GEAR_KINDS)[number], string>,
)

const spellSelectionModelOptions = toOptions(
  SPELL_SELECTION_MODEL_OPTIONS.map((option) => option.value),
  Object.fromEntries(
    SPELL_SELECTION_MODEL_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<(typeof SPELL_SELECTION_MODEL_OPTIONS)[number]['value'], string>,
)

const spellSelectionChangePackageOptions = toOptions(
  SPELL_SELECTION_CHANGE_PACKAGE_OPTIONS.map((option) => option.value),
  Object.fromEntries(
    SPELL_SELECTION_CHANGE_PACKAGE_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<(typeof SPELL_SELECTION_CHANGE_PACKAGE_OPTIONS)[number]['value'], string>,
)

function campaignLevelField(maxLevel: number) {
  return z.coerce.number().pipe(campaignLevelSchema(maxLevel))
}

export function createSpellcastingFormSchema(maxLevel: number) {
  const levelField = campaignLevelField(maxLevel)
  return z.object({
    slotProgressionId: z.string().min(1),
    progression: classSpellcastingProgressionSchema.optional(),
    level: levelField.optional(),
    description: z.string().optional(),
    ability: abilitySchema,
    requiredGear: z.array(spellcastingGearKindSchema).optional(),
    focusKinds: z.array(spellcastingFocusGearKindSchema).optional(),
    recommendedGear: z.array(spellcastingGearKindSchema).optional(),
  })
}

export function createSpellcastingDraftFormSchema(maxLevel: number) {
  const levelField = campaignLevelField(maxLevel)
  return z.object({
    slotProgressionId: draftOptionalSelect(z.string().min(1)),
    progression: classSpellcastingProgressionDraftSchema.optional(),
    level: draftOptionalSelect(levelField),
    description: z.string().optional(),
    ability: draftOptionalSelect(abilitySchema),
    requiredGear: z.array(spellcastingGearKindSchema).optional(),
    focusKinds: z.array(spellcastingFocusGearKindSchema).optional(),
    recommendedGear: z.array(spellcastingGearKindSchema).optional(),
  })
}

function visibleWhenSpellcasting(): FieldVisibility {
  return {
    dependsOn: ['hasSpellcasting'],
    visibleWhen: (watched) => watched['hasSpellcasting'] === true,
  }
}

function spellSelectionLearnedCollectionDependent(ctx: ContentFormCtx) {
  return defineDependentField({
    kind: 'dependent',
    controller: {
      type: 'select',
      name: 'spellSelectionModel',
      label: 'Spell selection',
      options: spellSelectionModelOptions,
      required: true,
      hint: 'How this class chooses level 1+ spells.',
    },
    dependents: {
      visibility: {
        dependsOn: ['spellSelectionModel'],
        visibleWhen: (watched) => watched['spellSelectionModel'] === 'prepareFromLearnedCollection',
      },
      fields: [
        {
          kind: 'slot',
          name: 'spellbookAcquisitionEditor',
          render: () => createElement(ClassSpellbookAcquisitionField, { formCtx: ctx }),
        },
      ],
    },
  })
}

function spellcastingSlotProgressionOptions(ctx: ContentFormCtx) {
  return ctx.options?.spellcastingSlotProgressions ?? []
}

export function spellcastingFields(ctx: ContentFormCtx): FormItem[] {
  const levelOptions = getLevelFieldOptions(ctx)
  const levelDigits = levelSelectDigits(ctx)
  const stack: DependentConfig = {
    kind: 'dependent',
    controller: {
      type: 'switch',
      name: 'hasSpellcasting',
      label: 'Has spellcasting',
    },
    dependents: {
      fields: [
        {
          type: 'combobox',
          name: 'spellcasting.slotProgressionId',
          label: 'Slot progression',
          options: spellcastingSlotProgressionOptions(ctx),
          multiple: false,
          required: true,
          visibility: visibleWhenSpellcasting(),
          hint: 'Spell slot table (Full / Half / Pact / custom) for this class.',
        },
        {
          type: 'select',
          name: 'spellcasting.level',
          label: 'Spellcasting level',
          labelPosition: 'settings',
          separator: 'subtle',
          options: levelOptions,
          required: true,
          digits: levelDigits,
          hint: 'First class level at which this class gains spellcasting',
          visibility: visibleWhenSpellcasting(),
        },
        {
          type: 'chips',
          name: 'spellcasting.ability',
          label: 'Spellcasting ability',
          options: abilityOptions,
          multiple: false,
          required: true,
          visibility: visibleWhenSpellcasting(),
        },
        {
          kind: 'group',
          label: 'Cantrips',
          visibility: visibleWhenSpellcasting(),
          fields: [
            {
              type: 'switch',
              name: 'grantsCantrips',
              label: 'Grants cantrips',
              hint: 'When enabled, the Spellcasting progression table includes a Cantrips column.',
            },
          ],
        },
        {
          kind: 'group',
          label: 'Level 1+ spells',
          visibility: visibleWhenSpellcasting(),
          fields: [
            spellSelectionLearnedCollectionDependent(ctx),
            {
              type: 'select',
              name: 'spellSelectionChangePackage',
              label: 'Change prepared spells',
              options: spellSelectionChangePackageOptions,
              required: true,
              hint: 'When selections may change after character creation.',
            },
          ],
        },
        {
          kind: 'slot',
          name: 'spellcasting.progressionEditor',
          visibility: visibleWhenSpellcasting(),
          render: () => createElement(ClassSpellcastingProgressionField, { formCtx: ctx }),
        },
        {
          type: 'combobox',
          name: 'spellcasting.requiredGear',
          label: 'Required gear',
          options: spellcastingGearKindOptions,
          multiple: true,
          visibility: visibleWhenSpellcasting(),
          hint: 'Class-critical spellcasting items (e.g. Wizard spellbook).',
        },
        {
          type: 'combobox',
          name: 'spellcasting.focusKinds',
          label: 'Focus kinds',
          options: spellcastingFocusKindOptions,
          multiple: true,
          visibility: visibleWhenSpellcasting(),
          hint: 'Spellcasting foci this class can use.',
        },
        {
          type: 'combobox',
          name: 'spellcasting.recommendedGear',
          label: 'Recommended gear',
          options: spellcastingGearKindOptions,
          multiple: true,
          visibility: visibleWhenSpellcasting(),
          hint: 'Strong-tier spellcasting gear suggestions.',
        },
        {
          type: 'richtext',
          name: 'spellcasting.description',
          label: 'Rules description',
          linkable: true,
          internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
          contentTypeOptions: ctx.options?.richTextContentTypeOptions,
          visibility: visibleWhenSpellcasting(),
          hint: 'SRD spellcasting feature prose (shown on the class detail view)',
        },
      ],
    },
  }
  return [stack]
}

export { classGainProgressionSchema }

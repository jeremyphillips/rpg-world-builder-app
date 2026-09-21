import { z } from 'zod'
import { createElement } from 'react'
import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  SPELLCASTING_FOCUS_GEAR_KINDS,
  SPELLCASTING_GEAR_KINDS,
  SPELLCASTING_GEAR_KIND_ENTRIES,
  abilitySchema,
  classGainProgressionSchema,
  classSpellcastingProgressionDraftSchema,
  classSpellcastingProgressionSchema,
  spellRecommendationSchema,
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
import { ClassSpellcastingFeatureField } from '../components/class-spellcasting-feature-field'
import { ClassSpellcastingProgressionField } from '../components/class-spellcasting-progression-field'
import { ClassSpellcastingRecommendationsField } from '../components/class-spellcasting-recommendations-field'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import type { ClassFormValues } from './class-form-fields'
import { isSpellcastingGrantingFeatureRow } from './class-spellcasting-lifecycle'
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

export function createSpellcastingFormSchema(_maxLevel: number) {
  return z.object({
    slotProgressionId: z.string().min(1),
    progression: classSpellcastingProgressionSchema.optional(),
    ability: abilitySchema,
    requiredGear: z.array(spellcastingGearKindSchema).optional(),
    focusKinds: z.array(spellcastingFocusGearKindSchema).optional(),
    recommendedGear: z.array(spellcastingGearKindSchema).optional(),
    recommendations: z.array(spellRecommendationSchema).optional(),
  })
}

export function createSpellcastingDraftFormSchema(_maxLevel: number) {
  return z.object({
    slotProgressionId: draftOptionalSelect(z.string().min(1)),
    progression: classSpellcastingProgressionDraftSchema.optional(),
    ability: draftOptionalSelect(abilitySchema),
    requiredGear: z.array(spellcastingGearKindSchema).optional(),
    focusKinds: z.array(spellcastingFocusGearKindSchema).optional(),
    recommendedGear: z.array(spellcastingGearKindSchema).optional(),
    recommendations: z.array(spellRecommendationSchema).optional(),
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
  const stack: DependentConfig = {
    kind: 'dependent',
    controller: {
      type: 'switch',
      name: 'hasSpellcasting',
      label: 'Has spellcasting',
    },
    confirmBeforeClear: {
      headline: 'Remove spellcasting?',
      description:
        "This will remove the Spellcasting feature and this class's spellcasting configuration, including spell progression, spell selection rules, recommendations, and related settings. This action will take effect when you save the class.",
      confirmLabel: 'Remove spellcasting',
      shouldConfirm: (values) => {
        const features = values.features as ClassFormValues['features'] | undefined
        const hasGrantFeature = Array.isArray(features)
          ? features.some((row) => isSpellcastingGrantingFeatureRow(row))
          : false
        return Boolean(values.spellcasting) || hasGrantFeature
      },
    },
    dependents: {
      fields: [
        {
          kind: 'slot',
          name: 'spellcastingFeatureSummary',
          visibility: visibleWhenSpellcasting(),
          render: () => createElement(ClassSpellcastingFeatureField),
        },
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
          kind: 'group',
          label: 'Recommended starting spells',
          visibility: visibleWhenSpellcasting(),
          fields: [
            {
              kind: 'slot',
              name: 'spellcastingRecommendationsEditor',
              render: () => createElement(ClassSpellcastingRecommendationsField, { formCtx: ctx }),
            },
          ],
        },
      ],
    },
  }
  return [stack]
}

export { classGainProgressionSchema }

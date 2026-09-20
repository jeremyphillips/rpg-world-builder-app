import { createElement } from 'react'
import { z } from 'zod'
import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  SPELLCASTING_FOCUS_GEAR_KINDS,
  SPELLCASTING_GEAR_KINDS,
  SPELLCASTING_GEAR_KIND_ENTRIES,
  abilitySchema,
  campaignLevelSchema,
  spellcastingFocusGearKindSchema,
  spellcastingGearKindSchema,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem, type DependentConfig } from '@rpg/ui/form'

import { getLevelFieldOptions, levelSelectDigits } from '../../lib/form-options/level-field-options'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { draftOptionalSelect } from '../../lib/forms/validation/draft-form-schema-helpers'
import { ClassSpellcastingProfilePreview } from '../components/class-spellcasting-profile-preview'

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

function campaignLevelField(maxLevel: number) {
  return z.coerce.number().pipe(campaignLevelSchema(maxLevel))
}

export function createSpellcastingFormSchema(maxLevel: number) {
  const levelField = campaignLevelField(maxLevel)
  return z.object({
    profileId: z.string().min(1),
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
    profileId: draftOptionalSelect(z.string().min(1)),
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

function spellcastingProfileOptions(ctx: ContentFormCtx) {
  return ctx.options?.spellcastingProfiles ?? []
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
          name: 'spellcasting.profileId',
          label: 'Spellcasting profile',
          options: spellcastingProfileOptions(ctx),
          multiple: false,
          required: true,
          visibility: visibleWhenSpellcasting(),
          hint: 'Ruleset spellcasting progression profile referenced by this class.',
        },
        {
          kind: 'slot',
          name: '_spellcastingProfilePreview',
          visibility: visibleWhenSpellcasting(),
          render: () => createElement(ClassSpellcastingProfilePreview, { formCtx: ctx }),
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

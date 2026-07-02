import { z } from 'zod'
import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  SPELLCASTING_PROGRESSIONS,
  SPELL_PREPARATION_MODES,
  SPELL_PREPARATION_MODE_LABELS,
  abilitySchema,
  campaignLevelSchema,
} from '@rpg/contracts'
import {
  toOptions,
  type EditableGridFieldConfig,
  type FieldVisibility,
  type FormItem,
  type StackConfig,
} from '@rpg/ui/form'

import { effectiveMaxFromCtx } from '../../lib/form-options/content-campaign-rules'
import { getLevelFieldOptions, levelSelectDigits } from '../../lib/form-options/level-field-options'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { titleCase } from '../../lib/utils/title-case'
import { CANTRIPS_KNOWN_PROFILES } from './cantrips-profiles'

const abilityOptions = toOptions(
  ABILITY_IDS,
  Object.fromEntries(ABILITY_IDS.map((id) => [id, ABILITY_ENTRIES[id].label])) as Record<
    (typeof ABILITY_IDS)[number],
    string
  >,
)

const spellcastingProgressionOptions = toOptions(
  SPELLCASTING_PROGRESSIONS,
  Object.fromEntries(SPELLCASTING_PROGRESSIONS.map((p) => [p, `${titleCase(p)} caster`])) as Record<
    (typeof SPELLCASTING_PROGRESSIONS)[number],
    string
  >,
)

const spellPreparationOptions = toOptions(SPELL_PREPARATION_MODES, SPELL_PREPARATION_MODE_LABELS)

export const progressionTableFormSchema = z.object({
  cantrips: z.array(z.number().int().min(0).nullable()),
  spellsAvailable: z.array(z.number().int().min(0).nullable()),
})

function campaignLevelField(maxLevel: number) {
  return z.coerce.number().pipe(campaignLevelSchema(maxLevel))
}

export function createSpellcastingFormSchema(maxLevel: number) {
  const levelField = campaignLevelField(maxLevel)
  return z.object({
    level: levelField.optional(),
    description: z.string().optional(),
    progression: z.enum(SPELLCASTING_PROGRESSIONS).optional(),
    ability: abilitySchema.optional(),
    preparation: z.enum(SPELL_PREPARATION_MODES).optional(),
    progressionTable: progressionTableFormSchema.optional(),
  })
}

function visibleWhenSpellcasting(): FieldVisibility {
  return {
    dependsOn: ['hasSpellcasting'],
    visibleWhen: (watched) => watched['hasSpellcasting'] === true,
  }
}

function buildSpellProgressionGridField(rowCount: number): EditableGridFieldConfig {
  return {
    type: 'editableGrid',
    name: 'spellcasting.progressionTable',
    label: 'Spell progression',
    rowCount,
    visibility: visibleWhenSpellcasting(),
    columns: [
      {
        key: 'cantrips',
        label: 'Cantrips known',
        control: 'select',
        min: 1,
        max: 6,
      },
      {
        key: 'spellsAvailable',
        label: (watched) =>
          watched['spellcasting.preparation'] === 'known' ? 'Spells known' : 'Spells prepared',
        control: 'number',
        min: 0,
        labelDependsOn: ['spellcasting.preparation'],
        visibility: {
          dependsOn: ['spellcasting.preparation'],
          visibleWhen: (watched) => {
            const mode = watched['spellcasting.preparation']
            return mode === 'prepared' || mode === 'known'
          },
        },
      },
    ],
    templates: {
      cantrips: CANTRIPS_KNOWN_PROFILES,
    },
  }
}

export function spellcastingFields(ctx: ContentFormCtx): FormItem[] {
  const levelOptions = getLevelFieldOptions(ctx)
  const levelDigits = levelSelectDigits(ctx)
  const stack: StackConfig = {
    kind: 'stack',
    layout: 'dependent',
    dependentsChrome: 'subtle',
    rhythm: 'comfortable',
    fields: [
      {
        type: 'switch',
        name: 'hasSpellcasting',
        label: 'Has spellcasting',
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
        kind: 'row',
        visibility: visibleWhenSpellcasting(),
        fields: [
          {
            type: 'select',
            name: 'spellcasting.progression',
            label: 'Progression',
            options: spellcastingProgressionOptions,
            required: true,
          },
          {
            type: 'select',
            name: 'spellcasting.ability',
            label: 'Spellcasting ability',
            options: abilityOptions,
            required: true,
          },
          {
            type: 'select',
            name: 'spellcasting.preparation',
            label: 'Preparation',
            options: spellPreparationOptions,
            required: true,
          },
        ],
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
      buildSpellProgressionGridField(effectiveMaxFromCtx(ctx)),
    ],
  }
  return [stack]
}

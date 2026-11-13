import { CONFIGURABLE_CREATURE_TRAIT_PRESET_IDS, getContentTypeTerm } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { buildActiveCreatureTypeFieldOptions } from '@/features/vocabulary'

import { resolutionTargetAuthoringFields } from '../../lib/forms/fields/resolution-target-authoring-fields'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { damageFieldGroup } from '../../lib/forms/mechanics/damage-field-group'
import { monsterActionLimitedUseFields } from './actions/monster-action-on-hit-fields'
import { monsterTraitItemFields, monsterTraitTemplateFields } from './monster-trait-form-fields'
import { monsterTraitPresetFields } from './monster-trait-preset-fields'

const SPELLCASTING_ABILITY = 'Spellcasting ability'

function choice(name: string, label: string, noun?: { singular: string }): FormItem {
  return {
    type: 'select',
    name,
    label,
    options: [],
    ...(noun ? { noun } : {}),
  }
}

function damageRows(ctx: ContentFormCtx, rollName: string, damageTypeName: string): FormItem {
  return damageFieldGroup({ ctx, rollName, damageTypeName, legendVisibility: 'srOnly' })
}

/**
 * Paths whose label means the same thing on every action kind.
 * Description is omitted: special rules text and optional notes are different sentences.
 */
export function monsterActionResolverFields(ctx: ContentFormCtx): FormItem[] {
  return [
    { type: 'text', name: 'name', label: 'Name' },
    choice('equipmentEntryId', getContentTypeTerm('equipment').label, { singular: 'weapon' }),
    choice('castingAbility', SPELLCASTING_ABILITY),
    choice('bonusSource', 'Attack bonus'),
    choice('bonusSource.kind', 'Attack bonus'),
    choice('bonusSource.ability', 'Ability'),
    choice('bonusSource.castingAbility', SPELLCASTING_ABILITY),
    choice('dcSource.kind', 'DC source'),
    choice('dcSource.ability', 'DC ability'),
    choice('dcSource.castingAbility', SPELLCASTING_ABILITY),
    { type: 'chips', name: 'modes', label: 'Modes', options: [] },
    damageRows(ctx, 'damage', 'damageType'),
    {
      kind: 'array',
      name: 'onHit.effects',
      label: 'On hit',
      item: { header: { fallback: (index) => `Effect #${index + 1}` } },
      fields: [
        { type: 'select', name: 'kind', label: 'Effect', options: [] },
        damageRows(ctx, 'roll', 'damageType'),
        { type: 'select', name: 'conditionId', label: 'Condition', options: [] },
        { type: 'text', name: 'description', label: 'Details' },
      ],
    },
    {
      kind: 'array',
      name: 'resolution.effects',
      label: 'Damage entries',
      item: { header: { fallback: (index) => `Damage entry #${index + 1}` } },
      fields: [damageRows(ctx, 'roll', 'damageType')],
    },
    {
      kind: 'array',
      name: 'resolution.outcomes',
      label: 'Outcomes',
      item: { header: { fallback: (index) => `Outcome #${index + 1}` } },
      fields: [],
    },
    choice('resolution.method.ability', 'Save ability'),
    choice('resolution.selectionMode', 'Selection'),
    ...resolutionTargetAuthoringFields({
      prefix: 'resolution.target',
      creatureTypeOptions: buildActiveCreatureTypeFieldOptions(ctx.creatureTypeVocabulary),
    }),
    ...monsterActionLimitedUseFields(),
    { type: 'number', name: 'limitedUse.minRoll', label: 'Recharge roll', min: 2, max: 6 },
    {
      kind: 'array',
      name: 'spells',
      label: getContentTypeTerm('spells').label,
      item: { header: { fallback: (index) => `Spell #${index + 1}` } },
      fields: [
        choice('spellId', getContentTypeTerm('spells').label),
        { type: 'select', name: 'castAtLevel', label: 'Cast at level', options: [] },
        { type: 'select', name: 'limitedUse', label: 'Frequency', options: [] },
      ],
    },
    {
      kind: 'array',
      name: 'steps',
      label: 'Steps',
      item: { header: { fallback: (index) => `Step #${index + 1}` } },
      fields: [
        { type: 'number', name: 'count', label: 'Count', min: 1 },
        { type: 'chips', name: 'actionIds', label: 'Attacks', options: [] },
      ],
    },
  ]
}

/** Trait paths. Action description is a different array, so this label does not rename it. */
export function monsterTraitResolverFields(ctx: ContentFormCtx): FormItem[] {
  return [
    { type: 'text', name: 'name', label: 'Name' },
    ...monsterTraitItemFields(),
    ...monsterTraitTemplateFields(),
    ...CONFIGURABLE_CREATURE_TRAIT_PRESET_IDS.flatMap((preset) =>
      monsterTraitPresetFields(preset, ctx),
    ),
  ]
}

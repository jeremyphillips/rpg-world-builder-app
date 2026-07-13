import { SPELL_ATOMIC_EFFECT_KINDS } from '@rpg/contracts'
import { toOptions, type FieldConfig, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import { damageEffectFieldConfigs } from '../../lib/forms/mechanics/damage-effect-fields'
import { rollValueFieldConfigs } from '../../lib/forms/mechanics/roll-value-fields'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { buildEffectArrayAddMenu } from './effect-add-menu.lib'
import { formatEffectRowPrimary, formatEffectRowSummary } from './effect-display'
import { SPELL_ATOMIC_EFFECT_KIND_LABELS } from './effect-form-schema'

const effectKindOptions = toOptions(SPELL_ATOMIC_EFFECT_KINDS, SPELL_ATOMIC_EFFECT_KIND_LABELS)

function visibleWhenEffectKind(
  kinds: readonly (typeof SPELL_ATOMIC_EFFECT_KINDS)[number][],
): FieldVisibility {
  return {
    dependsOn: ['kind'],
    visibleWhen: (values) =>
      typeof values.kind === 'string' &&
      kinds.includes(values.kind as (typeof SPELL_ATOMIC_EFFECT_KINDS)[number]),
  }
}

function fieldsWithVisibility(fields: FieldConfig[], visibility: FieldVisibility): FieldConfig[] {
  return fields.map((field) => ({ ...field, visibility }))
}

function effectItemFields(ctx: ContentFormCtx): FormItem[] {
  const rollKinds = ['healing', 'temporary-hit-points'] as const

  return [
    {
      type: 'select',
      name: 'kind',
      label: 'Effect kind',
      options: effectKindOptions,
      required: true,
      width: 'lg',
    },
    {
      type: 'text',
      name: 'label',
      label: 'Card label',
      hint: 'Optional heading or projectile noun (e.g. "darts" for Magic Missile).',
      width: 'lg',
    },
    {
      kind: 'row',
      visibility: visibleWhenEffectKind(['damage']),
      fields: fieldsWithVisibility(
        damageEffectFieldConfigs({ ctx }),
        visibleWhenEffectKind(['damage']),
      ),
    },
    ...fieldsWithVisibility(
      rollValueFieldConfigs({ namePrefix: 'roll', label: 'Roll', required: true }),
      visibleWhenEffectKind(rollKinds),
    ),
    {
      kind: 'row',
      visibility: visibleWhenEffectKind(['projectile-count']),
      fields: fieldsWithVisibility(
        [
          {
            type: 'number',
            name: 'count',
            label: 'Count',
            min: 1,
            required: true,
            digits: 2,
            width: 'auto',
          },
        ],
        visibleWhenEffectKind(['projectile-count']),
      ),
    },
    {
      type: 'richtext',
      name: 'description',
      label: 'Supplementary prose',
      linkable: true,
      internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
      contentTypeOptions: ctx.options?.richTextContentTypeOptions,
    },
  ]
}

/** Grants-style effect array editor for spell atomic effects. */
export function effectArrayFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'array',
      name: 'effects',
      legend: 'Atomic effects',
      addLabel: 'Add effect',
      itemCollapsible: true,
      itemHeader: {
        fallback: (index) => `Effect ${index + 1}`,
        primary: (values, index) => formatEffectRowPrimary(values, index),
        summary: (values) => formatEffectRowSummary(values),
      },
      addMenu: buildEffectArrayAddMenu(),
      fields: effectItemFields(ctx),
    },
  ]
}

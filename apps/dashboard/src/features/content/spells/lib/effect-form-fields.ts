import { SPELL_ATOMIC_EFFECT_KINDS } from '@rpg/contracts'
import type { FieldConfig, FieldVisibility, FormItem } from '@rpg/ui/form'

import { damageEffectFieldConfigs } from '../../lib/forms/mechanics/damage-effect-fields'
import { rollValueFieldConfigs } from '../../lib/forms/mechanics/roll-value-fields'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { buildEffectArrayAddMenu } from './effect-add-menu.lib'
import { formatEffectRowPrimary, formatEffectRowSummary } from './effect-display'

const rollOnlyKinds = ['healing', 'temporary-hit-points'] as const
const effectLabelKinds = ['damage', ...rollOnlyKinds] as const

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
  return [
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
      visibleWhenEffectKind(rollOnlyKinds),
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
      type: 'text',
      name: 'unitLabel',
      label: 'Projectile label',
      hint: 'Word used after the count, such as "darts" or "beams".',
      width: 'lg',
      visibility: visibleWhenEffectKind(['projectile-count']),
    },
    {
      type: 'text',
      name: 'label',
      label: 'Effect label',
      hint: 'Optional name used to distinguish this effect, such as "Clenched Fist".',
      width: 'full',
      visibility: visibleWhenEffectKind(effectLabelKinds),
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
      legend: 'Effects',
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

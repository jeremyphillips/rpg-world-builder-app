import { SPELL_ATOMIC_EFFECT_KINDS, type SpellAtomicEffectKind } from '@rpg/contracts'
import type { FieldConfig, FieldVisibility, FormItem } from '@rpg/ui/form'

import { damageEffectFieldConfigs } from '../../../lib/forms/mechanics/damage-effect-fields'
import { rollValueFieldConfigs } from '../../../lib/forms/mechanics/roll-value-fields'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'

const rollOnlyKinds = ['healing', 'temporary-hit-points'] as const
const effectLabelKinds = ['damage', ...rollOnlyKinds] as const

export type EffectItemFieldsOptions = {
  includeLabel?: boolean
  includeDescription?: boolean
  damageRollLabel?: string
}

function visibleWhenEffectKind(kinds: readonly SpellAtomicEffectKind[]): FieldVisibility {
  return {
    dependsOn: ['kind'],
    visibleWhen: (values) =>
      typeof values.kind === 'string' && kinds.includes(values.kind as SpellAtomicEffectKind),
  }
}

function fieldsWithVisibility(fields: FieldConfig[], visibility: FieldVisibility): FieldConfig[] {
  return fields.map((field) => ({ ...field, visibility }))
}

/** Shared per-row fields for spell atomic effect array items. */
export function effectItemFieldsForKinds(
  ctx: ContentFormCtx,
  kinds: readonly SpellAtomicEffectKind[] = SPELL_ATOMIC_EFFECT_KINDS,
  options: EffectItemFieldsOptions = {},
): FormItem[] {
  const {
    includeLabel = true,
    includeDescription = true,
    damageRollLabel = 'Damage roll',
  } = options
  const allowedKinds = new Set<SpellAtomicEffectKind>(kinds)

  const fields: FormItem[] = []

  if (allowedKinds.has('damage')) {
    fields.push({
      kind: 'row',
      visibility: visibleWhenEffectKind(['damage']),
      fields: fieldsWithVisibility(
        damageEffectFieldConfigs({ ctx, rollLabel: damageRollLabel }),
        visibleWhenEffectKind(['damage']),
      ),
    })
  }

  if (rollOnlyKinds.some((kind) => allowedKinds.has(kind))) {
    fields.push(
      ...fieldsWithVisibility(
        rollValueFieldConfigs({ namePrefix: 'roll', label: 'Roll', required: true }),
        visibleWhenEffectKind(rollOnlyKinds.filter((kind) => allowedKinds.has(kind))),
      ),
    )
  }

  if (allowedKinds.has('projectile-count')) {
    fields.push(
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
    )
  }

  if (includeLabel && effectLabelKinds.some((kind) => allowedKinds.has(kind))) {
    fields.push({
      type: 'text',
      name: 'label',
      label: 'Effect label',
      hint: 'Optional name used to distinguish this effect, such as "Clenched Fist".',
      width: 'full',
      visibility: visibleWhenEffectKind(effectLabelKinds.filter((kind) => allowedKinds.has(kind))),
    })
  }

  if (includeDescription) {
    fields.push({
      type: 'richtext',
      name: 'description',
      label: 'Supplementary prose',
      linkable: true,
      internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
      contentTypeOptions: ctx.options?.richTextContentTypeOptions,
    })
  }

  return fields
}

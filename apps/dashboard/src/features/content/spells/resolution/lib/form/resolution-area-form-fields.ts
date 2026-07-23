import type { FormItem } from '@rpg/ui/form'

import { distanceInputSelectField } from '../../../../lib/forms/fields/content-speed-form-fields'
import { SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS } from '../../../../lib/forms/fields/content-identity-form-fields'
import { areaGeometryShapeOptions } from '../../../lib/spell-form-labels'
import { RESOLUTION_FIELD_LABELS } from './resolution-form-labels'
import {
  combineFieldVisibility,
  visibleWhenAreaShape,
  visibleWhenSelectionModeIsOneOf,
} from './resolution-form-visibility'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'

const RESOLUTION_PREFIX = RESOLUTION_FIELD_NAME

/** Resolution-scoped area geometry fields (mirrors spell casting tab area panel). */
export function resolutionAreaFormFields(): FormItem[] {
  const areaVisibility = combineFieldVisibility(visibleWhenSelectionModeIsOneOf('self', 'point'))

  return [
    {
      kind: 'group',
      legend: RESOLUTION_FIELD_LABELS.areaOfEffect,
      chrome: { variant: 'outline' },
      visibility: areaVisibility,
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'select',
              name: `${RESOLUTION_PREFIX}.areaOfEffect.shape`,
              label: 'Shape',
              options: areaGeometryShapeOptions,
              hint: {
                text: 'Mechanical area geometry for resolution preview and execution.',
                position: 'below-control',
              },
              width: 'auto',
            },
            distanceInputSelectField({
              name: `${RESOLUTION_PREFIX}.areaOfEffect.radius`,
              label: 'Radius',
              required: true,
              valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
              visibility: visibleWhenAreaShape(['sphere', 'emanation', 'cylinder']),
            }),
          ],
        },
        distanceInputSelectField({
          name: `${RESOLUTION_PREFIX}.areaOfEffect.height`,
          label: 'Height',
          required: true,
          valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
          visibility: visibleWhenAreaShape(['cylinder']),
        }),
        distanceInputSelectField({
          name: `${RESOLUTION_PREFIX}.areaOfEffect.length`,
          label: 'Length',
          required: true,
          valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
          visibility: visibleWhenAreaShape(['cone', 'line']),
        }),
        distanceInputSelectField({
          name: `${RESOLUTION_PREFIX}.areaOfEffect.width`,
          label: 'Width',
          required: true,
          valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
          visibility: visibleWhenAreaShape(['line']),
        }),
        distanceInputSelectField({
          name: `${RESOLUTION_PREFIX}.areaOfEffect.size`,
          label: 'Side length',
          required: true,
          valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
          visibility: visibleWhenAreaShape(['cube']),
        }),
        {
          type: 'text',
          name: `${RESOLUTION_PREFIX}.areaOfEffect.description`,
          label: 'Special area description',
          visibility: visibleWhenAreaShape(['special']),
          required: true,
        },
      ],
    },
  ]
}

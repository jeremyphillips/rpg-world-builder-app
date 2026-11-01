import { AREA_GEOMETRY_SHAPES, AREA_GEOMETRY_SHAPE_ENTRIES } from '@rpg/contracts'
import type { FieldVisibility, FormItem } from '@rpg/ui/form'
import { toOptions } from '@rpg/ui/form'
import { z } from 'zod'

import { distanceInputSelectField } from './content-speed-form-fields'
import { SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS } from './content-identity-form-fields'

export const AREA_GEOMETRY_FORM_NONE = 'none'

export const areaGeometryShapeOptions = [
  { value: AREA_GEOMETRY_FORM_NONE, label: 'None' },
  ...toOptions(
    AREA_GEOMETRY_SHAPES,
    Object.fromEntries(
      AREA_GEOMETRY_SHAPES.map((shape) => [shape, AREA_GEOMETRY_SHAPE_ENTRIES[shape].label]),
    ) as Record<(typeof AREA_GEOMETRY_SHAPES)[number], string>,
  ),
]

const distanceValueSchema = z.object({
  value: z.coerce.number(),
  unit: z.literal('ft').optional(),
})

export const areaGeometryFormSchema = z.object({
  shape: z.string(),
  radius: distanceValueSchema.optional(),
  length: distanceValueSchema.optional(),
  width: distanceValueSchema.optional(),
  size: distanceValueSchema.optional(),
  height: distanceValueSchema.optional(),
  description: z.string().optional(),
})

export function visibleWhenAreaShape(
  prefix: string,
  shapes: readonly string[],
  extra?: FieldVisibility,
): FieldVisibility {
  const shapeVisibility: FieldVisibility = {
    dependsOn: [`${prefix}.shape`],
    visibleWhen: (values) => {
      const shape = values[`${prefix}.shape`]
      return typeof shape === 'string' && shapes.includes(shape)
    },
  }
  if (!extra) return shapeVisibility
  return {
    dependsOn: Array.from(new Set([...extra.dependsOn, ...shapeVisibility.dependsOn])),
    visibleWhen: (values) => extra.visibleWhen(values) && shapeVisibility.visibleWhen(values),
  }
}

export function areaGeometryFormFields(input: {
  fieldPrefix: string
  legend: string
  legendVisibility?: 'visible' | 'srOnly'
  shapeHint: string
  visibility?: FieldVisibility
}): FormItem[] {
  const { fieldPrefix, legend, legendVisibility, shapeHint, visibility } = input
  const whenShape = (shapes: readonly string[]) =>
    visibleWhenAreaShape(fieldPrefix, shapes, visibility)
  return [
    {
      kind: 'group',
      heading: { label: legend, labelVisibility: legendVisibility ?? 'visible' },
      ...(visibility ? { visibility } : {}),
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'select',
              name: `${fieldPrefix}.shape`,
              label: 'Shape',
              options: areaGeometryShapeOptions,
              hint: { text: shapeHint, position: 'below-control' },
              width: 'auto',
            },
            distanceInputSelectField({
              name: `${fieldPrefix}.radius`,
              label: 'Radius',
              required: true,
              valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
              visibility: whenShape(['sphere', 'emanation', 'cylinder']),
            }),
            distanceInputSelectField({
              name: `${fieldPrefix}.length`,
              label: 'Length',
              required: true,
              valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
              visibility: whenShape(['cone', 'line']),
            }),
          ],
        },
        distanceInputSelectField({
          name: `${fieldPrefix}.height`,
          label: 'Height',
          required: true,
          valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
          visibility: whenShape(['cylinder']),
        }),
        distanceInputSelectField({
          name: `${fieldPrefix}.width`,
          label: 'Width',
          required: true,
          valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
          visibility: whenShape(['line']),
        }),
        distanceInputSelectField({
          name: `${fieldPrefix}.size`,
          label: 'Side length',
          required: true,
          valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
          visibility: whenShape(['cube']),
        }),
        {
          type: 'text',
          name: `${fieldPrefix}.description`,
          label: 'Special area description',
          visibility: whenShape(['special']),
          required: true,
        },
      ],
    },
  ]
}

import { z } from 'zod'

import type { FormItem } from '../field-config'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const goldenPathSchema = z.object({
  email: z.email(),
  slug: z.string().regex(slugPattern),
  mode: z.enum(['a', 'b']),
  grant: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('skill'), skillId: z.string().min(1) }),
    z.object({ kind: z.literal('language'), languageId: z.string().min(1) }),
  ]),
  notes: z.string().min(1),
  grid: z.object({
    cantrips: z.array(z.number().int().min(1).nullable()),
  }),
  roll: z.object({
    count: z.number().int().min(1),
    faces: z.number().int().min(1),
  }),
  grants: z.array(z.object({ label: z.string().min(1) })).min(1),
  tiers: z.array(z.object({ label: z.string().min(1) })).length(2),
})

export type GoldenPathValues = z.infer<typeof goldenPathSchema>

/** Synthetic field tree exercising every tier-1 error-map edge case. */
export const GOLDEN_PATH_FIELDS: FormItem[] = [
  { type: 'text', name: 'email', label: 'Email', required: true },
  { type: 'text', name: 'slug', label: 'Slug', required: true },
  { type: 'select', name: 'mode', label: 'Mode', options: [], required: true },
  { type: 'textarea', name: 'grant', label: 'Grant', required: true },
  {
    kind: 'slot',
    name: 'notes',
    label: 'Notes',
    render: () => null,
  },
  {
    type: 'editableGrid',
    name: 'grid',
    label: 'Progression',
    rowCount: 2,
    columns: [{ key: 'cantrips', label: 'Cantrips', control: 'number', min: 1, max: 9 }],
  },
  {
    type: 'diceFormula',
    name: 'roll',
    label: 'Roll',
    modifierMode: 'none',
    countMin: 1,
  },
  {
    kind: 'array',
    name: 'grants',
    legend: 'Grants',
    itemHeader: { fallback: (index) => `Grant #${index + 1}` },
    fields: [{ type: 'text', name: 'label', label: 'Label', required: true }],
  },
  {
    kind: 'array',
    name: 'tiers',
    legend: 'Wealth tiers',
    fields: [{ type: 'text', name: 'label', label: 'Tier label', required: true }],
  },
]

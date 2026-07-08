import { z } from 'zod'
import { ALIGNMENTS, getAlignmentLabel, optionalAlignmentSchema } from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

const narrativeFormItemSchema = z.object({
  value: z.string().min(1),
})

const narrativeFormSchema = z.object({
  personalityTraits: z.array(narrativeFormItemSchema).default([]),
  ideals: z.array(narrativeFormItemSchema).default([]),
  bonds: z.array(narrativeFormItemSchema).default([]),
  flaws: z.array(narrativeFormItemSchema).default([]),
  backstory: z.string().optional(),
})

export const identityFormSchema = z.object({
  name: z.string().trim().min(1),
  narrative: narrativeFormSchema,
  alignment: optionalAlignmentSchema,
})

export type IdentityFormValues = z.infer<typeof identityFormSchema>

const ALIGNMENT_LABELS = Object.fromEntries(
  ALIGNMENTS.map((alignment) => [alignment, getAlignmentLabel(alignment)]),
) as Record<(typeof ALIGNMENTS)[number], string>

function narrativeArrayField(
  name: 'personalityTraits' | 'ideals' | 'bonds' | 'flaws',
  legend: string,
  placeholder: string,
  addLabel: string,
): FormItem {
  return {
    kind: 'array',
    name: `narrative.${name}`,
    legend,
    itemVariant: 'compact',
    reorder: false,
    fields: [
      {
        kind: 'row',
        fields: [
          {
            type: 'text',
            name: 'value',
            label: legend,
            placeholder,
            required: true,
            width: 'full',
          },
        ],
      },
    ],
    addLabel,
    itemHeader: {
      fallback: (index) => `${legend} ${index + 1}`,
    },
  }
}

export const identityFormFields: FormItem[] = [
  {
    kind: 'row',
    fields: [
      {
        type: 'text',
        name: 'name',
        label: 'Character name',
        placeholder: 'Enter a name',
        required: true,
        width: 'full',
      },
    ],
  },
  {
    type: 'chips',
    name: 'alignment',
    label: 'Alignment',
    options: toOptions(ALIGNMENTS, ALIGNMENT_LABELS),
    width: 'full',
  },
  narrativeArrayField(
    'personalityTraits',
    'Personality traits',
    'Describe a distinctive habit or mannerism.',
    'Add trait',
  ),
  narrativeArrayField('ideals', 'Ideals', 'What principle drives your character?', 'Add ideal'),
  narrativeArrayField('bonds', 'Bonds', 'Who or what does your character care about?', 'Add bond'),
  narrativeArrayField('flaws', 'Flaws', 'What weakness complicates their life?', 'Add flaw'),
  {
    type: 'richtext',
    name: 'narrative.backstory',
    label: 'Backstory',
  },
]

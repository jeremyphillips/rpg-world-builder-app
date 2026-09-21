import { z } from 'zod'
import type { ReactNode } from 'react'
import {
  ALIGNMENTS,
  characterBuilderValidationMessages,
  formatFieldMessage,
  getAlignmentLabel,
  optionalAlignmentSchema,
} from '@rpg/contracts'
import { CANVAS_SURFACE, toOptions, type FormItem } from '@rpg/ui/form'

const narrativeFormItemSchema = z.object({
  value: z.string(),
})

const narrativeFormSchema = z.object({
  personalityTraits: z.array(narrativeFormItemSchema).default([{ value: '' }]),
  ideals: z.array(narrativeFormItemSchema).default([{ value: '' }]),
  bonds: z.array(narrativeFormItemSchema).default([{ value: '' }]),
  flaws: z.array(narrativeFormItemSchema).default([{ value: '' }]),
  backstory: z.string().optional(),
})

export const identityFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, formatFieldMessage(characterBuilderValidationMessages.nameRequired())),
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
  addActionLabel: string,
  hideItemLabel: boolean = true,
): FormItem {
  return {
    kind: 'array',
    name: `narrative.${name}`,
    legend,
    min: 1,
    density: 'comfortable',
    fields: [
      {
        type: 'text',
        name: 'value',
        label: hideItemLabel ? '' : legend,
        placeholder,
        width: 'full',
      },
    ],
    item: {
      variant: 'compact',
      headerVisibility: 'hidden',
      surface: CANVAS_SURFACE,
      header: {
        fallback: (index) => `${legend} ${index + 1}`,
      },
    },
    addAction: {
      label: addActionLabel,
      layout: 'inline',
    },
  }
}

export type BuildIdentityStepFormFieldsInput = {
  renderNameField: () => ReactNode
  renderDraftSync: () => ReactNode
  renderContinueRegistration: () => ReactNode
}

/** Composes the identity step field list, including optional species name generation chrome. */
export function buildIdentityStepFormFields({
  renderNameField,
  renderDraftSync,
  renderContinueRegistration,
}: BuildIdentityStepFormFieldsInput): FormItem[] {
  return [
    {
      kind: 'group',
      fieldChrome: { variant: 'none' },
      fields: [
        {
          kind: 'row',
          fields: [
            {
              kind: 'slot',
              name: '_identityNameField',
              chrome: { variant: 'none' },
              render: renderNameField,
            },
          ],
        },
        {
          type: 'chips',
          name: 'alignment',
          label: 'Alignment',
          multiple: false,
          options: toOptions(ALIGNMENTS, ALIGNMENT_LABELS),
          width: 'full',
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Narrative',
      fieldChrome: { variant: 'none' },
      fields: [
        narrativeArrayField(
          'personalityTraits',
          'Personality traits',
          'Describe a distinctive habit or mannerism.',
          'Add trait',
        ),
        narrativeArrayField(
          'ideals',
          'Ideals',
          'What principle drives your character?',
          'Add ideal',
        ),
        narrativeArrayField(
          'bonds',
          'Bonds',
          'Who or what does your character care about?',
          'Add bond',
        ),
        narrativeArrayField('flaws', 'Flaws', 'What weakness complicates their life?', 'Add flaw'),
        {
          type: 'richtext',
          name: 'narrative.backstory',
          label: 'Backstory',
        },
      ],
    },
    {
      kind: 'slot' as const,
      name: '_identityContinueRegistration',
      chrome: { variant: 'none' as const },
      render: renderContinueRegistration,
    },
    {
      kind: 'slot' as const,
      name: '_identityDraftSync',
      chrome: { variant: 'none' as const },
      render: renderDraftSync,
    },
  ]
}

export const identityFormFields: FormItem[] = buildIdentityStepFormFields({
  renderNameField: () => null,
  renderDraftSync: () => null,
  renderContinueRegistration: () => null,
})

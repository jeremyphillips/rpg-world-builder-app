import { createElement } from 'react'
import type { FormItem } from '@rpg/ui/form'

import { buildActiveSizeFieldOptions } from '@/features/vocabulary'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { createCreatureSizesFieldConfig } from '../../../lib/forms/fields/creature-sizes-form-fields'
import { MonsterAlternateFormsEditor } from '../../components/form/monster-alternate-forms-editor'
import {
  MONSTER_ALTERNATE_FORM_APPEARANCE_LABEL,
  MONSTER_ALTERNATE_FORM_NAME_LABEL,
  MONSTER_ALTERNATE_FORM_NOTES_ADD_LABEL,
  MONSTER_ALTERNATE_FORM_NOTES_HINT,
  MONSTER_ALTERNATE_FORM_NOTES_LABEL,
  MONSTER_ALTERNATE_FORM_SIZE_HINT,
  MONSTER_ALTERNATE_FORMS_ADD_LABEL,
  MONSTER_ALTERNATE_FORMS_HEADING,
  MONSTER_TRUE_FORM_HEADING,
} from '../monster-form-labels'

export function monsterAlternateFormDetailFields(input: {
  rowPath: string
  ctx: ContentFormCtx
}): FormItem[] {
  const { rowPath, ctx } = input
  const sizes = createCreatureSizesFieldConfig({
    hint: MONSTER_ALTERNATE_FORM_SIZE_HINT,
    options: buildActiveSizeFieldOptions(ctx.sizeVocabulary, ctx.creatureSizesSeedIds),
  })
  return [
    {
      type: 'text',
      name: `${rowPath}.name`,
      label: MONSTER_ALTERNATE_FORM_NAME_LABEL,
      required: true,
    },
    {
      type: 'text',
      name: `${rowPath}.appearance`,
      label: MONSTER_ALTERNATE_FORM_APPEARANCE_LABEL,
    },
    {
      ...sizes,
      name: `${rowPath}.overrides.sizes`,
      required: false,
      optionalDisclosure: {
        addLabel: MONSTER_ALTERNATE_FORM_SIZE_HINT,
        expandWhenPopulated: true,
      },
    },
    {
      type: 'textarea',
      name: `${rowPath}.notes`,
      label: MONSTER_ALTERNATE_FORM_NOTES_LABEL,
      hint: MONSTER_ALTERNATE_FORM_NOTES_HINT,
      optionalDisclosure: {
        addLabel: MONSTER_ALTERNATE_FORM_NOTES_ADD_LABEL,
        expandWhenPopulated: true,
      },
    },
  ]
}

export function monsterFormsSectionFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'group',
      heading: { label: MONSTER_ALTERNATE_FORMS_HEADING },
      disclosure: {
        variant: 'inline',
        openLabel: MONSTER_ALTERNATE_FORMS_HEADING,
        closeLabel: MONSTER_ALTERNATE_FORMS_HEADING,
        summaryDependsOn: ['forms'],
        resolveSummary: (values) => ({
          primary: values.forms
            ? MONSTER_ALTERNATE_FORMS_HEADING
            : MONSTER_ALTERNATE_FORMS_ADD_LABEL,
        }),
      },
      fields: [
        {
          kind: 'group',
          heading: { label: MONSTER_TRUE_FORM_HEADING },
          visibility: {
            dependsOn: ['forms'],
            visibleWhen: (values) => values.forms != null,
          },
          fields: [
            {
              type: 'text',
              name: 'forms.trueForm.name',
              label: MONSTER_ALTERNATE_FORM_NAME_LABEL,
              required: true,
            },
            {
              type: 'text',
              name: 'forms.trueForm.appearance',
              label: MONSTER_ALTERNATE_FORM_APPEARANCE_LABEL,
            },
          ],
        },
        {
          kind: 'slot',
          name: 'formsEditor',
          issuePaths: ['forms.alternates'],
          render: () => createElement(MonsterAlternateFormsEditor, { ctx }),
        },
      ],
    },
  ]
}

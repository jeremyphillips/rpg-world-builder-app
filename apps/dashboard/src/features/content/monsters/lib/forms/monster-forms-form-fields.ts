import { createElement } from 'react'
import type { FormItem } from '@rpg/ui/form'

import { buildActiveSizeFieldOptions } from '@/features/vocabulary'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { createCreatureSizesFieldConfig } from '../../../lib/forms/fields/creature-sizes-form-fields'
import { MonsterFormsEditor } from '../../components/form/monster-forms-editor'
import { MonsterTrueFormDesignation } from '../../components/form/monster-true-form-designation'
import {
  MONSTER_FORM_NAME_LABEL,
  MONSTER_FORM_NOTES_ADD_LABEL,
  MONSTER_FORM_NOTES_HINT,
  MONSTER_FORM_NOTES_LABEL,
  MONSTER_FORM_SIZE_HINT,
  MONSTER_FORMS_ADD_LABEL,
  MONSTER_FORMS_HEADING,
  MONSTER_TRUE_FORM_HEADING,
} from '../monster-form-labels'

export function monsterDefinedFormDetailFields(input: {
  rowPath: string
  ctx: ContentFormCtx
}): FormItem[] {
  const { rowPath, ctx } = input
  const sizes = createCreatureSizesFieldConfig({
    hint: MONSTER_FORM_SIZE_HINT,
    options: buildActiveSizeFieldOptions(ctx.sizeVocabulary, ctx.creatureSizesSeedIds),
  })
  return [
    {
      type: 'text',
      name: `${rowPath}.name`,
      label: MONSTER_FORM_NAME_LABEL,
      required: true,
    },
    {
      ...sizes,
      name: `${rowPath}.overrides.sizes`,
      required: false,
      optionalDisclosure: {
        addLabel: MONSTER_FORM_SIZE_HINT,
        expandWhenPopulated: true,
      },
    },
    {
      type: 'textarea',
      name: `${rowPath}.notes`,
      label: MONSTER_FORM_NOTES_LABEL,
      hint: MONSTER_FORM_NOTES_HINT,
      optionalDisclosure: {
        addLabel: MONSTER_FORM_NOTES_ADD_LABEL,
        expandWhenPopulated: true,
      },
    },
  ]
}

export function monsterFormsSectionFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'group',
      heading: { label: MONSTER_FORMS_HEADING },
      disclosure: {
        variant: 'inline',
        openLabel: MONSTER_FORMS_HEADING,
        closeLabel: MONSTER_FORMS_HEADING,
        summaryDependsOn: ['forms'],
        resolveSummary: (values) => ({
          primary: values.forms ? MONSTER_FORMS_HEADING : MONSTER_FORMS_ADD_LABEL,
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
              kind: 'slot',
              name: 'forms.trueForm.kind',
              issuePaths: ['forms.trueForm.formId', 'forms.trueForm.name'],
              render: () => createElement(MonsterTrueFormDesignation),
            },
            {
              type: 'text',
              name: 'forms.trueForm.name',
              label: MONSTER_FORM_NAME_LABEL,
              hint: "Overrides the profile's form name in rules text.",
              optionalDisclosure: {
                addLabel: 'Override form name',
                expandWhenPopulated: true,
              },
              visibility: {
                dependsOn: ['forms.trueForm.kind'],
                visibleWhen: (values) =>
                  (values.forms as { trueForm?: { kind?: string } } | undefined)?.trueForm?.kind ===
                  'profile',
              },
            },
          ],
        },
        {
          kind: 'slot',
          name: 'formsEditor',
          issuePaths: ['forms.definedForms', 'forms.trueForm.formId'],
          render: () => createElement(MonsterFormsEditor, { ctx }),
        },
      ],
    },
  ]
}

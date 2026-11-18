import { createElement } from 'react'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { MonsterFormsDifferencePresentation } from '../../components/form/monster-forms-difference-presentation'
import { MonsterFormsEditor } from '../../components/form/monster-forms-editor'
import { MonsterTrueFormDesignation } from '../../components/form/monster-true-form-designation'
import { monsterFormMovementOverrideGroup } from './monster-form-movement-override-fields'
import { monsterFormSizesOverrideGroup } from './monster-form-sizes-override-fields'
import {
  MONSTER_FORM_NAME_LABEL,
  MONSTER_FORM_NOTES_HINT,
  MONSTER_FORM_NOTES_LABEL,
  MONSTER_FORM_SPEECH_LABEL,
  MONSTER_FORMS_ADD_LABEL,
  MONSTER_SHAPE_SHIFTING_DESCRIPTION,
  MONSTER_SHAPE_SHIFTING_HEADING,
  MONSTER_TRUE_FORM_HEADING,
} from '../monster-form-labels'

export function monsterDefinedFormDetailFields(ctx: ContentFormCtx): FormItem[] {
  return [
    monsterFormSizesOverrideGroup(ctx),
    monsterFormMovementOverrideGroup(),
    {
      type: 'boolean',
      name: 'speechRestricted',
      label: MONSTER_FORM_SPEECH_LABEL,
    },
    {
      type: 'textarea',
      name: 'notes',
      label: MONSTER_FORM_NOTES_LABEL,
      hint: MONSTER_FORM_NOTES_HINT,
      optionalDisclosure: {
        intent: 'add',
        actionSubject: 'notes',
        expandWhenPopulated: true,
      },
    },
  ]
}

export function monsterFormsSectionFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'group',
      heading: {
        label: MONSTER_SHAPE_SHIFTING_HEADING,
        hint: MONSTER_SHAPE_SHIFTING_DESCRIPTION,
      },
      disclosure: {
        variant: 'inline',
        openLabel: MONSTER_SHAPE_SHIFTING_HEADING,
        closeLabel: MONSTER_SHAPE_SHIFTING_HEADING,
        summaryDependsOn: ['forms'],
        resolveSummary: (values) => ({
          primary: values.forms ? MONSTER_SHAPE_SHIFTING_HEADING : MONSTER_FORMS_ADD_LABEL,
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
                intent: 'override',
                actionSubject: 'form name',
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
        {
          kind: 'slot',
          name: 'forms.differencesPresentation',
          issuePaths: ['forms.differencesPresentation'],
          render: () => createElement(MonsterFormsDifferencePresentation),
        },
      ],
    },
  ]
}

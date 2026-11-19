import { useCallback, useMemo } from 'react'
import { Button } from '@rpg/ui'
import type { DisplayConfig } from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { FormEmbeddedMasterDetailEditor } from '../../../../components/master-detail/form-embedded-master-detail-editor'
import { useMasterDetailArray } from '../../../../lib/master-detail/use-master-detail-array'
import { defineMasterDetailItemNoun } from '../../../../lib/master-detail/master-detail-item-noun'
import { useMonsterFormsLifecycleContext } from '../../../hooks/monster-forms-lifecycle-provider'
import {
  MONSTER_FORM_ITEM_NOUN_LABEL,
  MONSTER_FORM_ITEM_NOUN_PLURAL,
  MONSTER_DEFINED_FORM_DISPLAY_FALLBACK,
  MONSTER_DEFINED_FORMS_LIST_HEADING,
  MONSTER_FORMS_ADD_FORM_LABEL,
  MONSTER_FORMS_ADD_LABEL,
  MONSTER_FORMS_REMOVE_LABEL,
} from '../../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../../lib/monster-form-values'
import { monsterDefinedFormListMeta } from '../../../lib/forms/monster-defined-form-list-meta'
import { monsterDefinedFormDetailFields } from '../../../lib/forms/monster-forms-form-fields'
import type { MonsterDefinedFormDraft } from '../../../lib/forms/monster-forms-form-values'
import { makeEmptyMonsterDefinedForm } from '../../../lib/forms/monster-forms-form-values'
import { resortMonsterFormRestrictionIds } from '../../../lib/resort-monster-form-restriction-ids'
import { monsterDefinedFormRowResolveFields } from '../../../lib/forms/monster-forms-validation-fields'

const MONSTER_FORM_ITEM_NOUN = defineMasterDetailItemNoun({
  label: MONSTER_FORM_ITEM_NOUN_LABEL,
  singular: MONSTER_FORM_ITEM_NOUN_LABEL.toLowerCase(),
  plural: MONSTER_FORM_ITEM_NOUN_PLURAL,
})

export function MonsterFormsEditor({ ctx }: { ctx: ContentFormCtx }) {
  const forms = useWatch<MonsterFormValues, 'forms'>({ name: 'forms' })
  const form = useFormContext<MonsterFormValues>()
  const { getValues, setValue, trigger } = form
  const makeDefaults = useCallback(() => makeEmptyMonsterDefinedForm(), [])
  const editor = useMasterDetailArray('forms.definedForms', makeDefaults)
  const lifecycle = useMonsterFormsLifecycleContext()
  const resolver = useMemo(
    () => ({ resolveItemFields: monsterDefinedFormRowResolveFields(ctx) }),
    [ctx],
  )
  const resolveItemFields = useCallback(
    (row: unknown) => {
      const draft = row as MonsterDefinedFormDraft
      const fields = monsterDefinedFormDetailFields(ctx)
      const designated = forms?.trueForm.kind === 'defined' && forms.trueForm.formId === draft?.id
      if (!designated) return fields
      const trueFormOverrideFieldNames = [
        'sizesOverride',
        'movementOverride',
        'speechRestricted',
      ] as const
      return [
        ...fields.filter(
          (field) =>
            !('name' in field) ||
            field.name == null ||
            !trueFormOverrideFieldNames.includes(
              field.name as (typeof trueFormOverrideFieldNames)[number],
            ),
        ),
        {
          kind: 'display',
          id: 'defined-form-base-statistics',
          content: {
            variant: 'text',
            text: "This form uses the creature's base statistics.",
            role: 'supporting',
          },
        } satisfies DisplayConfig,
      ]
    },
    [ctx, forms?.trueForm],
  )
  const lifecycleEditor = useMemo(
    () => ({
      ...editor,
      move: (from: number, to: number) => {
        editor.move(from, to)
        const nextForms = getValues('forms')
        if (nextForms?.definedForms && nextForms.trueForm) {
          resortMonsterFormRestrictionIds(form, nextForms)
        }
      },
      requestRemove: (index: number) => {
        const definedForms = getValues('forms')?.definedForms ?? forms?.definedForms
        const formId = definedForms?.[index]?.id
        if (!formId) return
        lifecycle.requestDefinedFormRemoval(formId, () => {
          const nextDefinedForms = getValues('forms')?.definedForms ?? []
          editor.replaceRows(nextDefinedForms as Record<string, unknown>[])
          if (nextDefinedForms.length <= 1) return
          editor.select(index < nextDefinedForms.length ? index : index - 1)
        })
      },
    }),
    [editor, form, forms?.definedForms, getValues, lifecycle],
  )
  const addControl = (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        const row = makeEmptyMonsterDefinedForm()
        editor.appendRow(row)
        if (forms?.trueForm.kind === 'defined' && forms.definedForms.length === 0) {
          setValue('forms.trueForm', { kind: 'defined', formId: row.id }, { shouldDirty: true })
          void trigger(['forms.trueForm', 'forms.definedForms'])
        }
      }}
    >
      {MONSTER_FORMS_ADD_FORM_LABEL}
    </Button>
  )

  if (!forms?.trueForm || !Array.isArray(forms.definedForms)) {
    return (
      <>
        <Button type="button" variant="secondary" onClick={lifecycle.addForms}>
          {MONSTER_FORMS_ADD_LABEL}
        </Button>
      </>
    )
  }

  return (
    <>
      <FormEmbeddedMasterDetailEditor<MonsterDefinedFormDraft>
        editor={lifecycleEditor}
        formCtx={ctx}
        fieldName="forms.definedForms"
        itemFields={resolver}
        resolveItemFields={resolveItemFields}
        itemNoun={MONSTER_FORM_ITEM_NOUN}
        listTitle={MONSTER_DEFINED_FORMS_LIST_HEADING}
        ariaLabel={MONSTER_DEFINED_FORMS_LIST_HEADING}
        addLabel={MONSTER_FORMS_ADD_FORM_LABEL}
        addControl={addControl}
        idPrefix="monster-defined-form"
        makeItemDefaults={makeDefaults}
        rowTitle={{
          strategy: 'authored',
          field: 'name',
          resolveFallback: () => MONSTER_DEFINED_FORM_DISPLAY_FALLBACK,
        }}
        resolveListMeta={(mapCtx) => monsterDefinedFormListMeta(forms, mapCtx)}
        listReorder
      />
      <Button type="button" variant="ghost" onClick={lifecycle.requestRemoveAll}>
        {MONSTER_FORMS_REMOVE_LABEL}
      </Button>
    </>
  )
}

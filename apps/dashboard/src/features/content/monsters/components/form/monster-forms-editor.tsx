import { useCallback, useMemo } from 'react'
import { Button } from '@rpg/ui'
import { useFormContext, useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { FormEmbeddedMasterDetailEditor } from '../../../components/master-detail/form-embedded-master-detail-editor'
import { useMasterDetailArray } from '../../../lib/master-detail/use-master-detail-array'
import { defineMasterDetailItemNoun } from '../../../lib/master-detail/master-detail-item-noun'
import { useMonsterFormsLifecycle } from '../../hooks/use-monster-forms-lifecycle'
import {
  MONSTER_FORM_ITEM_NOUN_LABEL,
  MONSTER_FORM_ITEM_NOUN_PLURAL,
  MONSTER_FORMS_ADD_FORM_LABEL,
  MONSTER_FORMS_ADD_LABEL,
  MONSTER_FORMS_REMOVE_LABEL,
} from '../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import { monsterDefinedFormListMeta } from '../../lib/forms/monster-defined-form-list-meta'
import { monsterDefinedFormDetailFields } from '../../lib/forms/monster-forms-form-fields'
import type { MonsterDefinedFormDraft } from '../../lib/forms/monster-forms-form-values'
import { makeEmptyMonsterDefinedForm } from '../../lib/forms/monster-forms-form-values'
import { monsterDefinedFormRowResolveFields } from '../../lib/forms/monster-forms-validation-fields'

const MONSTER_FORM_ITEM_NOUN = defineMasterDetailItemNoun({
  label: MONSTER_FORM_ITEM_NOUN_LABEL,
  singular: MONSTER_FORM_ITEM_NOUN_LABEL.toLowerCase(),
  plural: MONSTER_FORM_ITEM_NOUN_PLURAL,
})

export function MonsterFormsEditor({ ctx }: { ctx: ContentFormCtx }) {
  const forms = useWatch<MonsterFormValues, 'forms'>({ name: 'forms' })
  const { setValue, trigger } = useFormContext<MonsterFormValues>()
  const makeDefaults = useCallback(() => makeEmptyMonsterDefinedForm(), [])
  const editor = useMasterDetailArray('forms.definedForms', makeDefaults)
  const lifecycle = useMonsterFormsLifecycle()
  const resolver = useMemo(
    () => ({ resolveItemFields: monsterDefinedFormRowResolveFields(ctx) }),
    [ctx],
  )
  const resolveItemFields = useCallback(() => {
    const fields = monsterDefinedFormDetailFields(ctx)
    const selected =
      editor.selectedIndex === null ? undefined : forms?.definedForms[editor.selectedIndex]
    const designated = forms?.trueForm.kind === 'defined' && forms.trueForm.formId === selected?.id
    if (!designated) return fields
    return [
      ...fields.filter((field) => !('name' in field) || field.name !== 'overrides.sizes'),
      {
        kind: 'slot' as const,
        name: 'baseStatistics',
        render: () => (
          <div>
            <p>This form uses the creature's base statistics.</p>
          </div>
        ),
      },
    ]
  }, [ctx, editor.selectedIndex, forms])
  const lifecycleEditor = useMemo(
    () => ({
      ...editor,
      requestRemove: (index: number) => {
        const formId = forms?.definedForms[index]?.id
        if (!formId) return
        lifecycle.requestDefinedFormRemoval(formId, () => {
          if (editor.fields.length <= 1) return
          editor.select(index < editor.fields.length - 1 ? index + 1 : index - 1)
        })
      },
    }),
    [editor, forms?.definedForms, lifecycle],
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
        {lifecycle.dialog}
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
        listTitle="Defined forms"
        ariaLabel="Defined forms"
        addLabel={MONSTER_FORMS_ADD_FORM_LABEL}
        addControl={addControl}
        idPrefix="monster-defined-form"
        makeItemDefaults={makeDefaults}
        rowTitle={{ strategy: 'authored', field: 'name' }}
        resolveListMeta={(mapCtx) => monsterDefinedFormListMeta(forms, mapCtx)}
      />
      <Button type="button" variant="ghost" onClick={lifecycle.requestRemoveAll}>
        {MONSTER_FORMS_REMOVE_LABEL}
      </Button>
      {lifecycle.dialog}
    </>
  )
}

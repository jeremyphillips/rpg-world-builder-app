import { useCallback, useMemo } from 'react'
import { Button } from '@rpg/ui'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { FormEmbeddedMasterDetailEditor } from '../../../components/master-detail/form-embedded-master-detail-editor'
import { useMasterDetailArray } from '../../../lib/master-detail/use-master-detail-array'
import { defineMasterDetailItemNoun } from '../../../lib/master-detail/master-detail-item-noun'
import { useMonsterFormsLifecycle } from '../../hooks/use-monster-forms-lifecycle'
import {
  MONSTER_ALTERNATE_FORM_ITEM_NOUN_LABEL,
  MONSTER_ALTERNATE_FORM_ITEM_NOUN_PLURAL,
  MONSTER_ALTERNATE_FORM_UNTITLED_TITLE,
  MONSTER_ALTERNATE_FORMS_ADD_FORM_LABEL,
  MONSTER_ALTERNATE_FORMS_ADD_LABEL,
  MONSTER_ALTERNATE_FORMS_HEADING,
  MONSTER_ALTERNATE_FORMS_REMOVE_LABEL,
} from '../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import { monsterAlternateFormDetailFields } from '../../lib/forms/monster-forms-form-fields'
import { makeEmptyMonsterAlternateForm } from '../../lib/forms/monster-forms-form-values'
import { monsterAlternateFormRowResolveFields } from '../../lib/forms/monster-forms-validation-fields'

const MONSTER_ALTERNATE_FORM_ITEM_NOUN = defineMasterDetailItemNoun({
  label: MONSTER_ALTERNATE_FORM_ITEM_NOUN_LABEL,
  singular: MONSTER_ALTERNATE_FORM_ITEM_NOUN_LABEL.toLowerCase(),
  plural: MONSTER_ALTERNATE_FORM_ITEM_NOUN_PLURAL,
})

export function MonsterAlternateFormsEditor({ ctx }: { ctx: ContentFormCtx }) {
  const forms = useWatch<MonsterFormValues, 'forms'>({ name: 'forms' })
  const makeDefaults = useCallback(() => makeEmptyMonsterAlternateForm(), [])
  const editor = useMasterDetailArray('forms.alternates', makeDefaults)
  const lifecycle = useMonsterFormsLifecycle()
  const resolver = useMemo(
    () => ({ resolveItemFields: monsterAlternateFormRowResolveFields(ctx) }),
    [ctx],
  )
  const resolveItemFields = useCallback(
    () =>
      monsterAlternateFormDetailFields({
        rowPath:
          editor.selectedIndex === null
            ? 'forms.alternates.0'
            : `forms.alternates.${editor.selectedIndex}`,
        ctx,
      }),
    [ctx, editor.selectedIndex],
  )

  if (!forms) {
    return (
      <>
        <Button type="button" variant="secondary" onClick={lifecycle.addForms}>
          {MONSTER_ALTERNATE_FORMS_ADD_LABEL}
        </Button>
        {lifecycle.dialog}
      </>
    )
  }

  return (
    <>
      <FormEmbeddedMasterDetailEditor
        editor={editor}
        formCtx={ctx}
        fieldName="forms.alternates"
        itemFields={resolver}
        resolveItemFields={resolveItemFields}
        itemNoun={MONSTER_ALTERNATE_FORM_ITEM_NOUN}
        listTitle={MONSTER_ALTERNATE_FORMS_HEADING}
        ariaLabel={MONSTER_ALTERNATE_FORMS_HEADING}
        addLabel={MONSTER_ALTERNATE_FORMS_ADD_FORM_LABEL}
        idPrefix="monster-alternate-form"
        makeItemDefaults={makeDefaults}
        leadingContent={
          <Button type="button" variant="secondary" onClick={lifecycle.requestRemoveAll}>
            {MONSTER_ALTERNATE_FORMS_REMOVE_LABEL}
          </Button>
        }
        mapListItem={({ row }) => ({
          title:
            typeof (row as { name?: unknown })?.name === 'string' &&
            (row as { name: string }).name.trim()
              ? (row as { name: string }).name.trim()
              : MONSTER_ALTERNATE_FORM_UNTITLED_TITLE,
        })}
      />
      {lifecycle.dialog}
    </>
  )
}

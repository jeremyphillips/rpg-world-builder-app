import { useCallback, useMemo } from 'react'

import { CreatureTraitAddMenu } from '../../lib/creature-traits/creature-trait-add-menu'
import { FormEmbeddedMasterDetailEditor } from '../../components/master-detail/form-embedded-master-detail-editor'
import { useMasterDetailArray } from '../../lib/master-detail/use-master-detail-array'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  traitItemFields,
  traitItemTitle,
  type TraitRowForm,
} from '../lib/species-trait-form-fields'
import { TRAIT_MASTER_DETAIL_ITEM_NOUN } from '../lib/species-trait-form-labels'
import { traitItemDefaultValues } from '../lib/species-trait-form-values'

const TRAITS_FIELD_NAME = 'traits'

export interface SpeciesTraitsTabProps {
  formCtx: ContentFormCtx
}

/**
 * Master-detail editor for the species `traits` field array: a selectable list
 * on the left, the selected trait's form on the right. Renders directly into
 * the parent form via `useFieldArray`, so global save and validation are
 * unchanged from the previous inline array.
 */
export function SpeciesTraitsTab({ formCtx }: SpeciesTraitsTabProps) {
  const fields = useMemo(() => traitItemFields(formCtx), [formCtx])
  const makeItemDefaults = useCallback(() => traitItemDefaultValues(fields), [fields])
  const editor = useMasterDetailArray(TRAITS_FIELD_NAME, makeItemDefaults)

  return (
    <FormEmbeddedMasterDetailEditor
      editor={editor}
      formCtx={formCtx}
      fieldName={TRAITS_FIELD_NAME}
      itemFields={fields}
      itemNoun={TRAIT_MASTER_DETAIL_ITEM_NOUN}
      listTitle="Traits"
      ariaLabel="Traits"
      addLabel="Add trait"
      idPrefix="species-trait"
      addControl={
        <CreatureTraitAddMenu
          label="Add trait"
          rulesetId={formCtx.rulesetId}
          onCustom={() => editor.appendRow(makeItemDefaults())}
          onTemplate={(templateId) =>
            editor.appendRow({
              ...makeItemDefaults(),
              kind: 'template',
              templateId,
              name: '',
              description: '',
              ...(templateId === 'legendary-resistance' ? { config: { uses: { normal: 3 } } } : {}),
            })
          }
        />
      }
      mapListItem={({ row, index }) => ({
        title: traitItemTitle((row ?? {}) as TraitRowForm, index),
      })}
      access={{ kind: 'availability', fieldName: 'available' }}
    />
  )
}

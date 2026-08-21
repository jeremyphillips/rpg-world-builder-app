'use client'

import { useMemo } from 'react'

import { FormEmbeddedMasterDetailEditor } from '../../components/master-detail/form-embedded-master-detail-editor.client'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  traitItemEyebrow,
  traitItemFields,
  traitItemTitle,
  type TraitRowForm,
} from '../lib/species-trait-form-fields'

const TRAITS_FIELD_NAME = 'traits'
const TRAIT_NOUN = 'trait'

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

  return (
    <FormEmbeddedMasterDetailEditor
      formCtx={formCtx}
      fieldName={TRAITS_FIELD_NAME}
      itemFields={fields}
      itemNoun={TRAIT_NOUN}
      ariaLabel="Traits"
      addLabel="Add trait"
      emptyListLabel="No traits yet. Add one to get started."
      idPrefix="species-trait"
      mapListItem={({ row, index }) => ({
        title: traitItemTitle((row ?? {}) as TraitRowForm, index),
        eyebrow: traitItemEyebrow(row as TraitRowForm | undefined),
      })}
    />
  )
}

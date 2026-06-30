'use client'

import { useMemo } from 'react'

import { FormEmbeddedMasterDetailEditor } from '../../components/form-embedded-master-detail-editor.client'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import {
  classFeatureItemFields,
  featureItemEyebrow,
  featureItemTitle,
  type FeatureRowForm,
} from '../lib/class-feature-form-fields'

const FEATURES_FIELD_NAME = 'features'
const FEATURE_NOUN = 'feature'

export interface ClassFeaturesTabProps {
  formCtx: ContentFormCtx
}

/** Master-detail editor for the class `features` field array. */
export function ClassFeaturesTab({ formCtx }: ClassFeaturesTabProps) {
  const fields = useMemo(() => classFeatureItemFields(formCtx), [formCtx])

  return (
    <FormEmbeddedMasterDetailEditor
      formCtx={formCtx}
      fieldName={FEATURES_FIELD_NAME}
      itemFields={fields}
      itemNoun={FEATURE_NOUN}
      ariaLabel="Features"
      addLabel="Add feature"
      emptyListLabel="No features yet. Add one to get started."
      idPrefix="class-feature"
      mapListItem={({ row, index }) => ({
        title: featureItemTitle(row as FeatureRowForm | undefined, index),
        eyebrow: featureItemEyebrow(row as FeatureRowForm | undefined),
      })}
    />
  )
}

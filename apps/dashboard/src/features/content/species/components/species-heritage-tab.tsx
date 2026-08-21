import { useCallback, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Button, Text } from '@rpg/ui'
import { buildItemDefaultValues, FormItems } from '@rpg/ui/form'

import { FormEmbeddedMasterDetailEditor } from '../../components/master-detail/form-embedded-master-detail-editor'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { isEmbeddedRowSystemLocked } from '../../lib/master-detail/is-embedded-row-system-locked'
import { useMasterDetailArray } from '../../lib/master-detail/use-master-detail-array'
import {
  ADD_HERITAGE_LABEL,
  ADD_HERITAGE_OPTION_LABEL,
  HERITAGE_EMPTY_MESSAGE,
  HERITAGE_OPTION_NOUN,
} from '../lib/species-heritage-form-labels'
import { heritageDefaultValues } from '../lib/species-heritage-form-values'
import { heritageScalarFields, type HeritageForm } from '../lib/species-heritage-form-fields'
import {
  traitItemFields,
  traitItemTitle,
  type TraitRowForm,
} from '../lib/species-trait-form-fields'

const HERITAGE_FIELD_NAME = 'heritage'
const OPTIONS_FIELD_NAME = 'heritage.options'

export interface SpeciesHeritageTabProps {
  formCtx: ContentFormCtx
}

function HeritageEmptyState({ formCtx }: { formCtx: ContentFormCtx }) {
  const { setValue } = useFormContext()

  return (
    <div className="space-y-3">
      <Text variant="muted" className="text-sm">
        {HERITAGE_EMPTY_MESSAGE}
      </Text>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setValue(HERITAGE_FIELD_NAME, heritageDefaultValues(formCtx), { shouldDirty: true })
        }}
      >
        {ADD_HERITAGE_LABEL}
      </Button>
    </div>
  )
}

function HeritageScalarSection({
  formCtx,
  heritage,
  onRemove,
}: {
  formCtx: ContentFormCtx
  heritage: HeritageForm | undefined
  onRemove: () => void
}) {
  const scalarFields = useMemo(() => heritageScalarFields(formCtx), [formCtx])
  const heritageLocked = isEmbeddedRowSystemLocked(heritage, formCtx.entitySource)

  return (
    <div className="space-y-3">
      <FormItems
        items={scalarFields}
        idPrefix="species-heritage"
        namePrefix={HERITAGE_FIELD_NAME}
      />
      {!heritageLocked ? (
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          Remove heritage
        </Button>
      ) : null}
    </div>
  )
}

function HeritageEditor({ formCtx }: { formCtx: ContentFormCtx }) {
  const { setValue } = useFormContext()
  const traitFields = useMemo(() => traitItemFields(formCtx), [formCtx])
  const makeOptionDefaults = useCallback(() => buildItemDefaultValues(traitFields), [traitFields])
  const editor = useMasterDetailArray(OPTIONS_FIELD_NAME, makeOptionDefaults)
  const heritage = useWatch({ name: HERITAGE_FIELD_NAME }) as HeritageForm | undefined

  const handleRemoveHeritage = () => {
    setValue(HERITAGE_FIELD_NAME, undefined, { shouldDirty: true })
    editor.cancelRemove()
  }

  return (
    <FormEmbeddedMasterDetailEditor
      formCtx={formCtx}
      fieldName={OPTIONS_FIELD_NAME}
      itemFields={traitFields}
      itemNoun={HERITAGE_OPTION_NOUN}
      ariaLabel="Heritage options"
      addLabel={ADD_HERITAGE_OPTION_LABEL}
      emptyListLabel="No options yet. Add one to get started."
      idPrefix="species-heritage-option"
      editor={editor}
      leadingContent={
        <HeritageScalarSection
          formCtx={formCtx}
          heritage={heritage}
          onRemove={handleRemoveHeritage}
        />
      }
      mapListItem={({ row, index }) => ({
        title: traitItemTitle((row ?? {}) as TraitRowForm, index),
      })}
    />
  )
}

/**
 * Heritage tab: scalar name/description at the top, master-detail over
 * `heritage.options` below. Empty state offers a single "Add heritage"
 * control; once present, options use the same trait editor as the Traits tab.
 */
export function SpeciesHeritageTab({ formCtx }: SpeciesHeritageTabProps) {
  const heritage = useWatch({ name: HERITAGE_FIELD_NAME }) as HeritageForm | undefined
  const hasHeritage = heritage != null && typeof heritage === 'object'

  if (!hasHeritage) {
    return <HeritageEmptyState formCtx={formCtx} />
  }

  return <HeritageEditor formCtx={formCtx} />
}

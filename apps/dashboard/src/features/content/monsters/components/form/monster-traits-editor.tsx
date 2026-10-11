import { useCallback, useMemo } from 'react'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { FormEmbeddedMasterDetailEditor } from '../../../components/master-detail/form-embedded-master-detail-editor'
import { createMonsterRowId } from '../../lib/monster-action-presets'
import { MONSTER_TRAITS_HEADING } from '../../lib/monster-form-labels'
import {
  MONSTER_TRAIT_ITEM_NOUN,
  monsterTraitItemFields,
} from '../../lib/monster-trait-form-fields'

export function MonsterTraitsEditor({ ctx }: { ctx: ContentFormCtx }) {
  const fields = useMemo(() => monsterTraitItemFields(), [])
  const makeItemDefaults = useCallback(
    () => ({ id: createMonsterRowId(), name: '', description: '' }),
    [],
  )

  return (
    <FormEmbeddedMasterDetailEditor
      formCtx={ctx}
      fieldName="traits"
      itemFields={fields}
      itemNoun={MONSTER_TRAIT_ITEM_NOUN}
      listTitle={MONSTER_TRAITS_HEADING}
      ariaLabel={MONSTER_TRAITS_HEADING}
      addLabel="Add trait"
      idPrefix="monster-trait"
      makeItemDefaults={makeItemDefaults}
      mapListItem={({ row, index }) => {
        const name = (row as { name?: string } | undefined)?.name?.trim()
        return { title: name || `Trait ${index + 1}` }
      }}
    />
  )
}

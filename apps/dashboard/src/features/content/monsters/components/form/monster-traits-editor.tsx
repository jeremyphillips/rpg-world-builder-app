import { useCallback, useMemo } from 'react'
import { resolveTraitName, type ContentTrait } from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  CreatureTraitAddMenu,
  creatureTraitTemplateRow,
} from '../../../lib/creature-traits/creature-trait-add-menu'
import { FormEmbeddedMasterDetailEditor } from '../../../components/master-detail/form-embedded-master-detail-editor'
import { createMonsterRowId } from '../../lib/monster-row-id'
import { MONSTER_TRAITS_HEADING } from '../../lib/monster-form-labels'
import {
  MONSTER_TRAIT_ITEM_NOUN,
  monsterTraitItemFields,
} from '../../lib/monster-trait-form-fields'

export function MonsterTraitsEditor({ ctx }: { ctx: ContentFormCtx }) {
  const fields = useMemo(() => monsterTraitItemFields(), [])
  const makeItemDefaults = useCallback(
    () => ({ id: createMonsterRowId(), kind: 'custom' as const, name: '', description: '' }),
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
      renderAddControl={({ append }) => (
        <CreatureTraitAddMenu
          label="Add trait"
          rulesetId={ctx.rulesetId}
          onCustom={() => append(makeItemDefaults())}
          onTemplate={(templateId) =>
            append(creatureTraitTemplateRow(templateId, createMonsterRowId()))
          }
        />
      )}
      access={{ kind: 'availability', fieldName: 'available' }}
      mapListItem={({ row, index }) => {
        const trait = row as { kind?: string; name?: string; templateId?: string } | undefined
        if (trait?.kind === 'template' && trait.templateId) {
          return {
            title:
              resolveTraitName({
                kind: 'template',
                id: 'row',
                templateId: trait.templateId,
                config: (trait as { config?: unknown }).config,
                nameOverride: (trait as { nameOverride?: string }).nameOverride,
              } as ContentTrait) || `Trait ${index + 1}`,
          }
        }
        const name = trait?.name?.trim()
        return { title: name || `Trait ${index + 1}` }
      }}
    />
  )
}

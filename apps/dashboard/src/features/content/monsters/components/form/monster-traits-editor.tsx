import { useCallback, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import {
  formatCreatureTrait,
  formatMonsterStatBlockSubject,
  getCreatureTraitVocabularyEntry,
} from '@rpg/contracts'
import { ActionIcon, ButtonDropdown, Text } from '@rpg/ui'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { FormEmbeddedMasterDetailEditor } from '../../../components/master-detail/form-embedded-master-detail-editor'
import { useMasterDetailArray } from '../../../lib/master-detail/use-master-detail-array'
import { createMonsterRowId } from '../../lib/actions/monster-action-presets'
import {
  MONSTER_TRAIT_ACQUISITION_GROUPS,
  monsterTraitAcquisitionItems,
  parseMonsterTraitAcquisitionId,
} from '../../lib/actions/monster-trait-acquisition'
import { MONSTER_ADD_LABEL, MONSTER_TRAITS_HEADING } from '../../lib/monster-form-labels'
import {
  MONSTER_TRAIT_ITEM_NOUN,
  monsterTraitItemFields,
} from '../../lib/monster-trait-form-fields'
import type { MonsterFormValues } from '../../lib/monster-form-values'

function isPresetRow(row: unknown): row is { preset: string } {
  return (
    typeof row === 'object' && row !== null && 'preset' in row && typeof row.preset === 'string'
  )
}

function traitListTitle(row: unknown, index: number): string {
  if (isPresetRow(row)) {
    return getCreatureTraitVocabularyEntry(row.preset)?.label ?? `Trait ${index + 1}`
  }
  const name = (row as { name?: string } | undefined)?.name?.trim()
  return name || `Trait ${index + 1}`
}

export function MonsterTraitsEditor({ ctx }: { ctx: ContentFormCtx }) {
  const customFields = useMemo(() => monsterTraitItemFields(), [])
  const makeItemDefaults = useCallback(
    () => ({ id: createMonsterRowId(), name: '', description: '' }),
    [],
  )
  const editor = useMasterDetailArray('traits', makeItemDefaults)
  const traits = useWatch({ name: 'traits' }) as MonsterFormValues['traits'] | undefined
  const monsterName = useWatch({ name: 'name' }) as string | undefined
  const items = useMemo(() => monsterTraitAcquisitionItems({ traits: traits ?? [] }), [traits])

  const resolveItemFields = useCallback(
    (row: unknown): FormItem[] => {
      if (!isPresetRow(row)) return customFields
      const formatted = formatCreatureTrait({
        presetId: row.preset,
        subject: formatMonsterStatBlockSubject(monsterName ?? ''),
      })
      return [
        {
          kind: 'slot',
          name: 'preset',
          render: () => (
            <div className="flex flex-col gap-2">
              <Text variant="label">{formatted?.name ?? row.preset}</Text>
              {formatted ? <Text>{formatted.sentence}</Text> : null}
            </div>
          ),
        },
      ]
    },
    [customFields, monsterName],
  )

  return (
    <FormEmbeddedMasterDetailEditor
      editor={editor}
      formCtx={ctx}
      fieldName="traits"
      itemFields={customFields}
      resolveItemFields={resolveItemFields}
      itemNoun={MONSTER_TRAIT_ITEM_NOUN}
      listTitle={MONSTER_TRAITS_HEADING}
      ariaLabel={MONSTER_TRAITS_HEADING}
      addLabel={MONSTER_ADD_LABEL}
      addControl={
        <ButtonDropdown
          label={MONSTER_ADD_LABEL}
          searchPlaceholder="Search traits…"
          leadingIcon={<ActionIcon action="add" size="sm" />}
          width="fit"
          size="sm"
          variant="outline"
          groups={[...MONSTER_TRAIT_ACQUISITION_GROUPS]}
          items={items}
          onSelectItem={(id) => {
            const choice = parseMonsterTraitAcquisitionId(id)
            if (!choice) return
            if (choice.type === 'focus') {
              const index = (traits ?? []).findIndex((trait) => trait.id === choice.traitId)
              if (index >= 0) editor.select(index)
              return
            }
            if (choice.type === 'custom') {
              editor.appendRow({ id: createMonsterRowId(), name: '', description: '' })
              return
            }
            editor.appendRow({ id: createMonsterRowId(), preset: choice.presetId })
          }}
        />
      }
      idPrefix="monster-trait"
      makeItemDefaults={makeItemDefaults}
      mapListItem={({ row, index }) => ({ title: traitListTitle(row, index) })}
    />
  )
}

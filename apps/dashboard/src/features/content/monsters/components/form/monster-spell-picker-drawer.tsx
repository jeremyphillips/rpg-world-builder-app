import { useState } from 'react'
import type { Spell } from '@rpg/contracts'
import { Button, dialogPanelActionRowClasses } from '@rpg/ui'

import { CatalogEntityPickerSheet } from '../../../lib/entity/surfaces/catalog/catalog-entity-picker-sheet'
import { createCatalogEntityRowRenderer } from '../../../lib/entity/surfaces/catalog/catalog-entity-row-renderer'
import {
  MONSTER_SPELL_ALREADY_USED_LABEL,
  MONSTER_SPELL_CHANGE_LABEL,
  MONSTER_SPELL_PICKER_NO_ITEMS,
  MONSTER_SPELL_PICKER_NO_RESULTS,
  MONSTER_SPELL_PICKER_SEARCH_PLACEHOLDER,
} from '../../lib/monster-form-labels'
import { spellEntryCatalogMetadata } from '../../lib/actions/monster-spell-frequency'

const ADD_SPELL_LABEL = 'Add spell'

export function MonsterSpellPickerDrawer({
  open,
  mode,
  spells,
  disabledSpellIds,
  onOpenChange,
  onCommit,
}: {
  open: boolean
  mode: 'add' | 'change'
  spells: readonly Spell[]
  disabledSpellIds: ReadonlySet<string>
  onOpenChange: (open: boolean) => void
  onCommit: (spellId: string) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const title = mode === 'change' ? MONSTER_SPELL_CHANGE_LABEL : ADD_SPELL_LABEL

  const close = () => {
    setSelectedId(null)
    onOpenChange(false)
  }

  const commit = () => {
    if (!selectedId || disabledSpellIds.has(selectedId)) return
    onCommit(selectedId)
    close()
  }

  return (
    <CatalogEntityPickerSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setSelectedId(null)
        onOpenChange(next)
      }}
      title={title}
      items={spells}
      getItemKey={(spell) => spell.id}
      getItemToolbarLabel={(spell) => spell.name}
      getSearchText={(spell) => [spell.name, ...spellEntryCatalogMetadata(spell)].join(' ')}
      searchPlaceholder={MONSTER_SPELL_PICKER_SEARCH_PLACEHOLDER}
      noResultsMessage={MONSTER_SPELL_PICKER_NO_RESULTS}
      noItemsMessage={MONSTER_SPELL_PICKER_NO_ITEMS}
      selection={{
        value: selectedId,
        onValueChange: setSelectedId,
        isItemDisabled: (spell) => disabledSpellIds.has(spell.id),
      }}
      renderEntityRow={createCatalogEntityRowRenderer({
        buildEntity: (spell) => ({
          heading: spell.name,
          supportingMetadata: spellEntryCatalogMetadata(spell),
          ...(disabledSpellIds.has(spell.id)
            ? {
                status: [
                  {
                    kind: 'text' as const,
                    label: MONSTER_SPELL_ALREADY_USED_LABEL,
                    variant: 'muted' as const,
                  },
                ],
              }
            : {}),
        }),
      })}
      footer={
        <div className={dialogPanelActionRowClasses}>
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selectedId || disabledSpellIds.has(selectedId)}
            onClick={commit}
          >
            {title}
          </Button>
        </div>
      }
    />
  )
}

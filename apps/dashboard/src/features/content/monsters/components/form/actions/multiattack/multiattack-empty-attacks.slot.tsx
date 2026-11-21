import { useMemo } from 'react'
import { ActionIcon, ButtonDropdown, Text } from '@rpg/ui'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import {
  MONSTER_ACTION_ACQUISITION_GROUPS,
  monsterActionAcquisitionItems,
  parseMonsterActionAcquisitionId,
  type MonsterActionAcquisitionChoice,
} from '../../../../lib/actions/acquisition/monster-action-acquisition'
import type { MonsterActionSection } from '../../../../lib/actions/references/monster-action-equipment-references'
import {
  MONSTER_MULTIATTACK_ADD_ATTACK_ACTION_LABEL,
  MONSTER_MULTIATTACK_EMPTY_ATTACKS_BODY,
  MONSTER_MULTIATTACK_EMPTY_ATTACKS_HEADING,
} from '../../../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../../../lib/monster-form-values'

function isAttackAcquisitionId(id: string): boolean {
  const choice = parseMonsterActionAcquisitionId(id)
  if (!choice) return false
  if (choice.type === 'add-weapon') return true
  if (choice.type === 'weapon-entry') return true
  if (choice.type === 'natural') return true
  if (choice.type === 'focus-existing') return true
  if (choice.type === 'create') {
    return choice.kind === 'attack'
  }
  return false
}

export function MonsterMultiattackEmptyAttacksSlot(input: {
  section: MonsterActionSection
  ctx: ContentFormCtx
  weapons: readonly { entryId: string; label: string; equipped: boolean }[]
  weaponActions: readonly { id: string; equipmentEntryId?: string }[]
  allowAddWeapon: boolean
  onSelect: (
    section: MonsterActionSection,
    choice: Exclude<MonsterActionAcquisitionChoice, { type: 'add-weapon' }>,
  ) => void
}) {
  const values = useWatch() as MonsterFormValues
  const items = useMemo(() => {
    return monsterActionAcquisitionItems({
      weapons: input.weapons,
      weaponActions: input.weaponActions,
      allowAddWeapon: input.allowAddWeapon,
      section: input.section,
      sectionRows: {
        actions: values.actions ?? [],
        bonusActions: values.bonusActions ?? [],
        reactions: values.reactions ?? [],
        ...(values.legendaryActions
          ? { legendaryActions: { actions: values.legendaryActions.actions } }
          : {}),
      },
      spellCatalogReady: input.ctx.spellCatalogStatus === 'ready',
    }).filter(
      (item) =>
        !item.disabled &&
        isAttackAcquisitionId(item.id) &&
        parseMonsterActionAcquisitionId(item.id)?.type !== 'add-weapon',
    )
  }, [input, values])

  return (
    <div className="flex flex-col gap-3">
      <Text as="p" variant="label">
        {MONSTER_MULTIATTACK_EMPTY_ATTACKS_HEADING}
      </Text>
      <Text as="p" variant="supporting">
        {MONSTER_MULTIATTACK_EMPTY_ATTACKS_BODY}
      </Text>
      <ButtonDropdown
        label={MONSTER_MULTIATTACK_ADD_ATTACK_ACTION_LABEL}
        leadingIcon={<ActionIcon action="add" size="sm" />}
        width="fit"
        size="sm"
        variant="outline"
        groups={[...MONSTER_ACTION_ACQUISITION_GROUPS].filter((group) =>
          items.some((item) => item.groupId === group.id),
        )}
        items={items}
        onSelectItem={(id) => {
          const choice = parseMonsterActionAcquisitionId(id)
          if (choice && choice.type !== 'add-weapon') input.onSelect(input.section, choice)
        }}
      />
    </div>
  )
}

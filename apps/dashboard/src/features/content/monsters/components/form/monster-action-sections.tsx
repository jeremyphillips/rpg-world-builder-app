import { useMemo, useState } from 'react'
import {
  getMonsterActionKindLabel,
  isWeaponEquipment,
  resolveEquipmentInstanceReferenceLabel,
} from '@rpg/contracts'
import { ActionIcon, ButtonDropdown, ConfirmDialog } from '@rpg/ui'
import { useFormContext } from 'react-hook-form'

import { EquipmentPickerDrawer } from '@/features/character'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { MasterDetailGrid } from '../../../components/master-detail/master-detail-grid'
import { MasterDetailListPanel } from '../../../components/master-detail/master-detail-list-panel'
import {
  MONSTER_ACTION_ACQUISITION_GROUPS,
  monsterActionAcquisitionItems,
  parseMonsterActionAcquisitionId,
  type MonsterActionAcquisitionChoice,
} from '../../lib/actions/monster-action-acquisition'
import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from '../../lib/actions/monster-action-equipment-references'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import type { MonsterActionPending } from '../../hooks/use-monster-action-sections'
import {
  buildMonsterLoadoutPickerItems,
  resolveMonsterFormWeaponGrants,
} from '../../lib/equipment/monster-loadout-picker.lib'
import {
  monsterEquipmentCatalog,
  monsterMagicPropertyProvider,
} from '../../lib/monster-form-derivation'
import {
  MONSTER_ACTIONS_HEADING,
  MONSTER_ADD_LABEL,
  MONSTER_BONUS_ACTIONS_HEADING,
  MONSTER_CANCEL_LABEL,
  MONSTER_DROP_TRIGGER_CONFIRM,
  MONSTER_MOVE_TO_LABEL,
  MONSTER_REACTIONS_HEADING,
  formatDropTriggerBody,
} from '../../lib/monster-form-labels'
import { MONSTER_ACTION_ITEM_NOUN } from '../../lib/monster-trait-form-fields'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import { useMonsterActionSections } from '../../hooks/use-monster-action-sections'
import { MonsterActionDetail } from './monster-action-detail'

const SECTION_HEADINGS = {
  actions: MONSTER_ACTIONS_HEADING,
  bonusActions: MONSTER_BONUS_ACTIONS_HEADING,
  reactions: MONSTER_REACTIONS_HEADING,
} as const

function sectionRows(
  values: MonsterFormValues | undefined,
  section: MonsterActionSection,
): MonsterActionDraftRow[] {
  const rows = values?.[section]
  return Array.isArray(rows) ? (rows as MonsterActionDraftRow[]) : []
}

function MonsterActionAddMenu({
  section,
  weapons,
  allowAddWeapon,
  onSelect,
}: {
  section: MonsterActionSection
  weapons: readonly { entryId: string; label: string; equipped: boolean }[]
  allowAddWeapon: boolean
  onSelect: (section: MonsterActionSection, choice: MonsterActionAcquisitionChoice) => void
}) {
  return (
    <ButtonDropdown
      label={MONSTER_ADD_LABEL}
      leadingIcon={<ActionIcon action="add" size="sm" />}
      width="fit"
      size="sm"
      variant="outline"
      groups={[...MONSTER_ACTION_ACQUISITION_GROUPS]}
      items={monsterActionAcquisitionItems({ weapons, allowAddWeapon })}
      onSelectItem={(id) => {
        const choice = parseMonsterActionAcquisitionId(id)
        if (choice) onSelect(section, choice)
      }}
    />
  )
}

function pendingConfirmCopy(pending: MonsterActionPending | null): {
  headline: string
  description: string
} {
  if (pending?.type === 'multiattack-delete') {
    const names = pending.names.join(', ')
    return {
      headline: 'Remove referenced attack',
      description: `This attack is used by ${names}. Removing it drops that reference and leaves the step count unchanged.`,
    }
  }
  if (pending?.type === 'multiattack-move') {
    const names = pending.names.join(', ')
    return {
      headline: 'Move referenced attack',
      description: `${names} will be invalid until this attack is moved back to Actions.`,
    }
  }
  return { headline: MONSTER_MOVE_TO_LABEL, description: formatDropTriggerBody() }
}

function equippedWeaponRows(
  values: MonsterFormValues,
  catalog: ReturnType<typeof monsterEquipmentCatalog>,
  provider: ReturnType<typeof monsterMagicPropertyProvider>,
) {
  return (values.equipment ?? []).flatMap((entry) => {
    const item = catalog.get(entry.equipmentId)
    if (!item || !isWeaponEquipment(item)) return []
    return [
      {
        entryId: entry.entryId,
        equipped: entry.equipped === true,
        label: resolveEquipmentInstanceReferenceLabel(
          entry,
          item,
          provider,
          values.equipment ?? [],
        ),
      },
    ]
  })
}

export function MonsterActionSections({ ctx }: { ctx: ContentFormCtx }) {
  const sections = useMonsterActionSections(ctx.entityId)
  const { getValues, formState } = useFormContext<MonsterFormValues>()
  const [weaponPickerSection, setWeaponPickerSection] = useState<MonsterActionSection | null>(null)
  const values = sections.values ?? getValues()
  const catalog = monsterEquipmentCatalog(ctx)
  const provider = monsterMagicPropertyProvider(ctx)
  const located = sections.locate(sections.selectedActionId)
  const allowAddWeapon = ctx.equipmentCatalogStatus === 'ready'
  const weapons = equippedWeaponRows(values, catalog, provider)
  const confirmCopy = pendingConfirmCopy(sections.pending)

  const pickerItems = useMemo(() => {
    if (!weaponPickerSection) return []
    const referenceOptions = ctx.options?.equipment?.forReference() ?? []
    const grants = resolveMonsterFormWeaponGrants(values)
    return buildMonsterLoadoutPickerItems({
      referenceOptions,
      weaponGrants: grants,
      equipment: values.equipment ?? [],
    }).filter((item) => isWeaponEquipment(item.equipment))
  }, [ctx.options?.equipment, values, weaponPickerSection])

  const weaponGrants = useMemo(() => resolveMonsterFormWeaponGrants(values), [values])

  return (
    <>
      <MasterDetailGrid>
        <div className="flex flex-col gap-4">
          {MONSTER_ACTION_SECTIONS.map((section) => {
            const rows = sectionRows(values, section)
            const selectedIndex = rows.findIndex((row) => row.id === sections.selectedActionId)
            const invalidItemCount =
              formState.submitCount > 0
                ? rows.filter((_, index) => sections.hasRowError(section, index)).length
                : 0
            return (
              <MasterDetailListPanel
                key={section}
                items={rows.map((row, index) => ({
                  id: row.id,
                  title: row.name?.trim() || `Action ${index + 1}`,
                  meta: {
                    sourceLabel: getMonsterActionKindLabel(row.kind),
                  },
                  hasError: formState.submitCount > 0 && sections.hasRowError(section, index),
                }))}
                selectedIndex={selectedIndex >= 0 ? selectedIndex : null}
                listTitle={SECTION_HEADINGS[section]}
                ariaLabel={SECTION_HEADINGS[section]}
                addLabel={MONSTER_ADD_LABEL}
                itemNoun={MONSTER_ACTION_ITEM_NOUN}
                addControl={
                  <MonsterActionAddMenu
                    section={section}
                    weapons={weapons}
                    allowAddWeapon={allowAddWeapon}
                    onSelect={(target, choice) => {
                      if (choice.type === 'add-weapon') {
                        setWeaponPickerSection(target)
                        return
                      }
                      sections.addAcquisition(target, choice)
                    }}
                  />
                }
                onSelect={(index) => {
                  const row = rows[index]
                  if (row) sections.setSelectedActionId(row.id)
                }}
                invalidItemCount={invalidItemCount}
              />
            )
          })}
        </div>
        <MonsterActionDetail ctx={ctx} sections={sections} located={located} />
      </MasterDetailGrid>
      <ConfirmDialog
        open={sections.pending != null}
        onOpenChange={(open) => {
          if (!open) sections.setPending(null)
        }}
        headline={confirmCopy.headline}
        description={confirmCopy.description}
        confirmLabel={MONSTER_DROP_TRIGGER_CONFIRM}
        cancelLabel={MONSTER_CANCEL_LABEL}
        onConfirm={() => sections.confirmPending()}
        onCancel={() => sections.setPending(null)}
      />
      <EquipmentPickerDrawer
        open={weaponPickerSection !== null}
        onOpenChange={(open) => {
          if (!open) setWeaponPickerSection(null)
        }}
        items={pickerItems}
        allowedKinds={['weapon']}
        workflowMode="loadout"
        showCharacterPreview={false}
        armorClassRules={ctx.armorClassRules}
        browseSortContext={{
          proficientWeaponCategories: weaponGrants.categories,
          preferMartialWeaponBrowseOrder: false,
        }}
        onCommitAdd={(item) => {
          if (!weaponPickerSection) return false
          sections.commitEquippedWeapon(weaponPickerSection, item.equipment.id, item.equipment.name)
          setWeaponPickerSection(null)
          return true
        }}
      />
    </>
  )
}

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
import { MasterDetailDeleteDialog } from '../../../components/master-detail/master-detail-delete-dialog'
import { MasterDetailGrid } from '../../../components/master-detail/master-detail-grid'
import { MasterDetailListPanel } from '../../../components/master-detail/master-detail-list-panel'
import { masterDetailItemNounLabel } from '../../../lib/master-detail/master-detail-constants'
import { useEmbeddedMasterDetailRows } from '../../../lib/master-detail/use-embedded-master-detail-rows'
import { useMasterDetailCollectionAvailability } from '../../../lib/master-detail/use-master-detail-collection-availability'
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
import { monsterActionEditorTitles } from '../../lib/actions/monster-action-editor-title'
import { multiattacksReferencingAction } from '../../lib/actions/monster-action-multiattack-references'
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
import { MONSTER_ACTION_ITEM_NOUN } from '../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import { monsterActionResolverFields } from '../../lib/monster-validation-resolver-fields'
import { useMonsterActionSections } from '../../hooks/use-monster-action-sections'
import { MonsterActionDetail } from './monster-action-detail'

const SECTION_HEADINGS = {
  actions: MONSTER_ACTIONS_HEADING,
  bonusActions: MONSTER_BONUS_ACTIONS_HEADING,
  reactions: MONSTER_REACTIONS_HEADING,
} as const

function mapActionListItem(row: unknown, index: number, titles: ReadonlyMap<string, string>) {
  const action = row as MonsterActionDraftRow | undefined
  return {
    title: action ? (titles.get(action.id) ?? `Action ${index + 1}`) : `Action ${index + 1}`,
    sourceLabel: action ? getMonsterActionKindLabel(action.kind) : undefined,
  }
}

function MonsterActionAddMenu({
  section,
  weapons,
  weaponActions,
  allowAddWeapon,
  onSelect,
}: {
  section: MonsterActionSection
  weapons: readonly { entryId: string; label: string; equipped: boolean }[]
  weaponActions: readonly { id: string; equipmentEntryId?: string }[]
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
      items={monsterActionAcquisitionItems({ weapons, weaponActions, allowAddWeapon })}
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

function sectionTitles(
  values: MonsterFormValues,
  ctx: ContentFormCtx,
  section: MonsterActionSection,
) {
  return monsterActionEditorTitles((values[section] ?? []) as MonsterActionDraftRow[], values, ctx)
}

function weaponActionReferences(values: MonsterFormValues) {
  return MONSTER_ACTION_SECTIONS.flatMap((actionSection) =>
    ((values[actionSection] ?? []) as MonsterActionDraftRow[]).flatMap((action) =>
      action.kind === 'weapon' && action.equipmentEntryId
        ? [{ id: action.id, equipmentEntryId: action.equipmentEntryId }]
        : [],
    ),
  )
}

function useMonsterActionDetailRows(
  ctx: ContentFormCtx,
  sections: ReturnType<typeof useMonsterActionSections>,
  values: MonsterFormValues,
) {
  const actionItemFields = useMemo(() => monsterActionResolverFields(ctx), [ctx])
  const actionTitles = sectionTitles(values, ctx, 'actions')
  const bonusTitles = sectionTitles(values, ctx, 'bonusActions')
  const reactionTitles = sectionTitles(values, ctx, 'reactions')
  const shared = {
    formCtx: ctx,
    itemFields: actionItemFields,
    itemNoun: MONSTER_ACTION_ITEM_NOUN,
    access: { kind: 'availability' as const, fieldName: 'available' },
  }
  const actionRows = useEmbeddedMasterDetailRows({
    ...shared,
    fieldName: 'actions',
    editor: sections.editors.actions,
    mapListItem: ({ row, index }) => mapActionListItem(row, index, actionTitles),
  })
  const bonusRows = useEmbeddedMasterDetailRows({
    ...shared,
    fieldName: 'bonusActions',
    editor: sections.editors.bonusActions,
    mapListItem: ({ row, index }) => mapActionListItem(row, index, bonusTitles),
  })
  const reactionRows = useEmbeddedMasterDetailRows({
    ...shared,
    fieldName: 'reactions',
    editor: sections.editors.reactions,
    mapListItem: ({ row, index }) => mapActionListItem(row, index, reactionTitles),
  })
  return {
    titlesBySection: {
      actions: actionTitles,
      bonusActions: bonusTitles,
      reactions: reactionTitles,
    },
    rowsBySection: {
      actions: actionRows,
      bonusActions: bonusRows,
      reactions: reactionRows,
    },
    actionRows,
  }
}

export function MonsterActionSections({ ctx }: { ctx: ContentFormCtx }) {
  const sections = useMonsterActionSections(ctx.entityId)
  const { getValues } = useFormContext<MonsterFormValues>()
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

  const { titlesBySection, rowsBySection, actionRows } = useMonsterActionDetailRows(
    ctx,
    sections,
    values,
  )
  const availabilityItems = useMemo(
    () =>
      MONSTER_ACTION_SECTIONS.flatMap((section) =>
        rowsBySection[section].allRows.map((row) => row.availability),
      ),
    [rowsBySection],
  )
  const collection = useMasterDetailCollectionAvailability({
    items: availabilityItems,
    selectedId: sections.selectedActionId,
    onSelectedIdChange: sections.selectAction,
  })
  const visibleIds = useMemo(
    () => new Set(collection.visibleItems.map((item) => item.rowId)),
    [collection.visibleItems],
  )
  const invalidItemCount = MONSTER_ACTION_SECTIONS.reduce((count, section) => {
    return (
      count +
      rowsBySection[section].allRows.filter(
        (row) => visibleIds.has(row.item.id) && (row.item.issueCount ?? 0) > 0,
      ).length
    )
  }, 0)
  const deleteLocated = sections.locate(sections.deleteTargetId)
  const deleteReferences =
    deleteLocated?.section === 'actions'
      ? multiattacksReferencingAction(
          (values.actions ?? []) as MonsterActionDraftRow[],
          deleteLocated.action.id,
        )
      : []
  const deleteDescription =
    deleteReferences.length > 0
      ? `This attack is used by ${deleteReferences
          .map((action) => titlesBySection.actions.get(action.id) ?? action.id)
          .join(', ')}. Removing it drops that reference and leaves the step count unchanged.`
      : undefined

  return (
    <>
      <MasterDetailGrid>
        <MasterDetailListPanel
          ariaLabel={MONSTER_ACTIONS_HEADING}
          itemNoun={MONSTER_ACTION_ITEM_NOUN}
          selectedItemId={collection.isSelectedVisible ? sections.selectedActionId : null}
          onSelectItem={sections.selectAction}
          countSupplement={collection.countSupplement}
          invalidItemCount={invalidItemCount}
          groups={MONSTER_ACTION_SECTIONS.map((section) => ({
            id: section,
            title: SECTION_HEADINGS[section],
            addControl: (
              <MonsterActionAddMenu
                section={section}
                weapons={weapons}
                weaponActions={weaponActionReferences(values)}
                allowAddWeapon={allowAddWeapon}
                onSelect={(target, choice) => {
                  if (choice.type === 'add-weapon') {
                    setWeaponPickerSection(target)
                    return
                  }
                  if (choice.type === 'focus-existing') {
                    sections.selectAction(choice.actionId)
                    return
                  }
                  sections.addAcquisition(target, choice)
                }}
              />
            ),
            items: rowsBySection[section].allRows
              .filter((row) => visibleIds.has(row.item.id))
              .map((row) => row.item),
          }))}
        />
        <MonsterActionDetail
          ctx={ctx}
          sections={sections}
          located={collection.isSelectedVisible ? located : null}
          rows={located ? rowsBySection[located.section] : actionRows}
        />
      </MasterDetailGrid>
      <MasterDetailDeleteDialog
        open={sections.deleteTargetId !== null}
        itemNoun={masterDetailItemNounLabel(MONSTER_ACTION_ITEM_NOUN)}
        itemName={deleteLocated?.action.name?.trim() || 'Action'}
        description={deleteDescription}
        onOpenChange={(open) => {
          if (!open) sections.cancelDelete()
        }}
        onConfirm={sections.confirmDelete}
      />
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

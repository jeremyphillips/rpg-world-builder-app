import { useCallback, useMemo, useState } from 'react'
import {
  actionsReferencingAction,
  getMonsterActionKindLabel,
  isWeaponEquipment,
  resolveCreatureFormsContext,
  resolveEquipmentInstanceReferenceLabel,
} from '@rpg/contracts'
import { ButtonDropdown, ConfirmDialog } from '@rpg/ui'
import { useFormContext } from 'react-hook-form'

import { EquipmentPickerDrawer } from '@/features/character'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { MasterDetailDeleteDialog } from '../../../../components/master-detail/master-detail-delete-dialog'
import { MasterDetailGrid } from '../../../../components/master-detail/master-detail-grid'
import { MasterDetailListPanel } from '../../../../components/master-detail/master-detail-list-panel'
import { masterDetailItemNounLabel } from '../../../../lib/master-detail/master-detail-constants'
import { useEmbeddedMasterDetailRows } from '../../../../lib/master-detail/use-embedded-master-detail-rows'
import { useMasterDetailCollectionAvailability } from '../../../../lib/master-detail/use-master-detail-collection-availability'
import {
  MONSTER_ACTION_ACQUISITION_GROUPS,
  monsterActionAcquisitionItems,
  parseMonsterActionAcquisitionId,
  type MonsterActionAcquisitionChoice,
} from '../../../lib/actions/acquisition/monster-action-acquisition'
import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from '../../../lib/actions/references/monster-action-equipment-references'
import { monsterActionEditorTitles } from '../../../lib/actions/monster-action-editor-title'
import { createMonsterActionRowTitleConfig } from '../../../lib/actions/monster-action-row-title'
import { presentActionReference } from '../../../lib/actions/references/monster-action-reference-presentation'
import { isActionReferenceAcquisitionTarget } from '../../../lib/actions/reference/action-reference-acquisition'
import {
  LEGENDARY_ACTION_ACQUISITION_GROUPS,
  legendaryActionAcquisitionItems,
} from '../../../lib/actions/acquisition/monster-legendary-action-acquisition'
import {
  formatMoveReferencedActionBody,
  formatRemoveReferencedActionBody,
  MONSTER_MOVE_REFERENCED_ACTION_HEADLINE,
  MONSTER_REMOVE_REFERENCED_ACTION_HEADLINE,
} from '../../../lib/monster-form-labels'
import type { MonsterActionDraftRow } from '../../../lib/actions/monster-action-presets'
import { monsterFormSectionRows } from '../../../lib/actions/monster-action-section-access'
import type { MonsterActionPending } from '../../../hooks/use-monster-action-sections'
import {
  buildMonsterLoadoutPickerItems,
  resolveMonsterFormWeaponGrants,
} from '../../../lib/equipment/monster-loadout-picker.lib'
import {
  monsterEquipmentCatalog,
  monsterMagicPropertyProvider,
} from '../../../lib/monster-form-derivation'
import {
  MONSTER_ACTIONS_HEADING,
  MONSTER_LEGENDARY_ACTIONS_HEADING,
  MONSTER_ADD_LABEL,
  MONSTER_BONUS_ACTIONS_HEADING,
  MONSTER_CANCEL_LABEL,
  MONSTER_DROP_TRIGGER_CONFIRM,
  MONSTER_MOVE_TO_LABEL,
  MONSTER_REACTIONS_HEADING,
  formatDropTriggerBody,
} from '../../../lib/monster-form-labels'
import {
  MONSTER_ACTION_ITEM_NOUN,
  monsterActionSectionEmptyLabel,
} from '../../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../../lib/monster-form-values'
import { monsterActionRowResolveFields } from '../../../lib/monster-master-detail-validation-fields'
import { useMonsterActionSections } from '../../../hooks/use-monster-action-sections'
import { MonsterActionDetail } from './action-detail'

const SECTION_HEADINGS = {
  actions: MONSTER_ACTIONS_HEADING,
  bonusActions: MONSTER_BONUS_ACTIONS_HEADING,
  reactions: MONSTER_REACTIONS_HEADING,
  legendaryActions: MONSTER_LEGENDARY_ACTIONS_HEADING,
} as const satisfies Record<MonsterActionSection, string>

function resolveActionListMeta(row: unknown, sourceTitles?: ReadonlyMap<string, string>) {
  const action = row as MonsterActionDraftRow | undefined
  const reference =
    action?.kind === 'action-reference' && sourceTitles
      ? presentActionReference({
          name: action.name,
          actionIds: action.actionIds,
          sourceTitles,
        })
      : undefined
  return {
    kindLabel: action ? getMonsterActionKindLabel(action.kind) : undefined,
    ...(reference?.summary ? { summary: reference.summary } : {}),
  }
}

function shapeShiftDisabledReason(values: MonsterFormValues): string | undefined {
  const formsContext = values.forms
    ? resolveCreatureFormsContext(values.forms, values.name)
    : undefined
  if (!formsContext) return 'Add forms before adding Shape-Shift.'
  if (formsContext.status !== 'complete') return 'Select the true form before adding Shape-Shift.'
  if (formsContext.alternateDestinations.length === 0) {
    return 'Add a form other than the true form before adding Shape-Shift.'
  }
  return undefined
}

function actionAcquisitionSectionRows(values: MonsterFormValues) {
  return {
    actions: values.actions ?? [],
    bonusActions: values.bonusActions ?? [],
    reactions: values.reactions ?? [],
    ...(values.legendaryActions
      ? { legendaryActions: { actions: values.legendaryActions.actions } }
      : {}),
  }
}

function MonsterActionAddMenu({
  section,
  weapons,
  weaponActions,
  allowAddWeapon,
  values,
  ctx,
  onSelect,
}: {
  section: MonsterActionSection
  weapons: readonly { entryId: string; label: string; equipped: boolean }[]
  weaponActions: readonly { id: string; equipmentEntryId?: string }[]
  allowAddWeapon: boolean
  values: MonsterFormValues
  ctx: ContentFormCtx
  onSelect: (section: MonsterActionSection, choice: MonsterActionAcquisitionChoice) => void
}) {
  const items =
    section === 'legendaryActions'
      ? legendaryActionAcquisitionItems(values, ctx)
      : monsterActionAcquisitionItems({
          weapons,
          weaponActions,
          allowAddWeapon,
          section,
          shapeShiftDisabledReason: shapeShiftDisabledReason(values),
          sectionRows: actionAcquisitionSectionRows(values),
          hasReferenceTargets: ((values.actions ?? []) as MonsterActionDraftRow[]).some(
            isActionReferenceAcquisitionTarget,
          ),
          spellCatalogReady: ctx.spellCatalogStatus === 'ready',
        })
  const groupSource =
    section === 'legendaryActions' || section === 'reactions'
      ? [...LEGENDARY_ACTION_ACQUISITION_GROUPS]
      : [...MONSTER_ACTION_ACQUISITION_GROUPS]
  const groups = groupSource.filter((group) => items.some((item) => item.groupId === group.id))
  return (
    <ButtonDropdown
      label={MONSTER_ADD_LABEL}
      triggerPresentation="addIcon"
      supportingWrap
      groups={groups}
      items={items}
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
      headline: MONSTER_REMOVE_REFERENCED_ACTION_HEADLINE,
      description: formatRemoveReferencedActionBody(names),
    }
  }
  if (pending?.type === 'multiattack-move') {
    const names = pending.names.join(', ')
    return {
      headline: MONSTER_MOVE_REFERENCED_ACTION_HEADLINE,
      description: formatMoveReferencedActionBody(names),
    }
  }
  return { headline: MONSTER_MOVE_TO_LABEL, description: formatDropTriggerBody() }
}

function equippedWeaponRows(
  values: MonsterFormValues,
  catalog: ReturnType<typeof monsterEquipmentCatalog>,
  provider: ReturnType<typeof monsterMagicPropertyProvider>,
) {
  if (!provider) return []
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
  return monsterActionEditorTitles(monsterFormSectionRows(values, section), values, ctx, section)
}

function weaponActionReferences(values: MonsterFormValues) {
  return MONSTER_ACTION_SECTIONS.flatMap((actionSection) =>
    monsterFormSectionRows(values, actionSection).flatMap((action) =>
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
  const makeActionResolver = useCallback(
    (section: MonsterActionSection) =>
      monsterActionRowResolveFields({ ctx, section, readValues: () => values }),
    [ctx, values],
  )
  const actionTitles = sectionTitles(values, ctx, 'actions')
  const bonusTitles = sectionTitles(values, ctx, 'bonusActions')
  const reactionTitles = sectionTitles(values, ctx, 'reactions')
  const legendaryTitles = sectionTitles(values, ctx, 'legendaryActions')
  const shared = {
    formCtx: ctx,
    itemNoun: MONSTER_ACTION_ITEM_NOUN,
    access: { kind: 'availability' as const, fieldName: 'available' as const },
  }
  const actionRowTitle = useMemo(
    () => createMonsterActionRowTitleConfig({ section: 'actions', values, ctx }),
    [ctx, values],
  )
  const bonusRowTitle = useMemo(
    () => createMonsterActionRowTitleConfig({ section: 'bonusActions', values, ctx }),
    [ctx, values],
  )
  const reactionRowTitle = useMemo(
    () => createMonsterActionRowTitleConfig({ section: 'reactions', values, ctx }),
    [ctx, values],
  )
  const legendaryRowTitle = useMemo(
    () => createMonsterActionRowTitleConfig({ section: 'legendaryActions', values, ctx }),
    [ctx, values],
  )
  const actionRows = useEmbeddedMasterDetailRows({
    ...shared,
    itemFields: { resolveItemFields: makeActionResolver('actions') },
    fieldName: 'actions',
    editor: sections.editors.actions,
    sectionLabel: SECTION_HEADINGS.actions,
    rowTitle: actionRowTitle,
    resolveListMeta: ({ row }) => resolveActionListMeta(row),
  })
  const bonusRows = useEmbeddedMasterDetailRows({
    ...shared,
    itemFields: { resolveItemFields: makeActionResolver('bonusActions') },
    fieldName: 'bonusActions',
    editor: sections.editors.bonusActions,
    sectionLabel: SECTION_HEADINGS.bonusActions,
    rowTitle: bonusRowTitle,
    resolveListMeta: ({ row }) => resolveActionListMeta(row),
  })
  const reactionRows = useEmbeddedMasterDetailRows({
    ...shared,
    itemFields: { resolveItemFields: makeActionResolver('reactions') },
    fieldName: 'reactions',
    editor: sections.editors.reactions,
    sectionLabel: SECTION_HEADINGS.reactions,
    rowTitle: reactionRowTitle,
    resolveListMeta: ({ row }) => resolveActionListMeta(row, actionTitles),
  })
  const legendaryRows = useEmbeddedMasterDetailRows({
    ...shared,
    itemFields: { resolveItemFields: makeActionResolver('legendaryActions') },
    fieldName: 'legendaryActions.actions',
    editor: sections.editors.legendaryActions,
    sectionLabel: SECTION_HEADINGS.legendaryActions,
    rowTitle: legendaryRowTitle,
    resolveListMeta: ({ row }) => resolveActionListMeta(row, actionTitles),
  })
  return {
    titlesBySection: {
      actions: actionTitles,
      bonusActions: bonusTitles,
      reactions: reactionTitles,
      legendaryActions: legendaryTitles,
    },
    rowsBySection: {
      actions: actionRows,
      bonusActions: bonusRows,
      reactions: reactionRows,
      legendaryActions: legendaryRows,
    },
    actionRows,
  }
}

export function MonsterActionSections({ ctx }: { ctx: ContentFormCtx }) {
  const sections = useMonsterActionSections(ctx.entityId, {
    equipmentCatalogStatus: ctx.equipmentCatalogStatus,
  })
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
  const deleteReferences = deleteLocated
    ? actionsReferencingAction(
        [
          ...((values.actions ?? []) as MonsterActionDraftRow[]),
          ...monsterFormSectionRows(values, 'legendaryActions'),
        ],
        deleteLocated.action.id,
      )
    : []
  const deleteNames = deleteReferences
    .map((action) => {
      const section = monsterFormSectionRows(values, 'legendaryActions').some(
        (row) => row.id === action.id,
      )
        ? 'legendaryActions'
        : 'actions'
      return titlesBySection[section].get(action.id) ?? action.name ?? action.id
    })
    .join(', ')
  const deleteDescription =
    deleteReferences.length > 0 ? formatRemoveReferencedActionBody(deleteNames) : undefined

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
            emptyLabel: monsterActionSectionEmptyLabel(section),
            addControl: (
              <MonsterActionAddMenu
                section={section}
                weapons={weapons}
                weaponActions={weaponActionReferences(values)}
                allowAddWeapon={allowAddWeapon}
                values={values}
                ctx={ctx}
                onSelect={(target, choice) => {
                  if (choice.type === 'add-weapon') {
                    setWeaponPickerSection(target)
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
          weapons={weapons}
          weaponActions={weaponActionReferences(values)}
          allowAddWeapon={allowAddWeapon}
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

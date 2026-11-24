import { useEffect, useMemo } from 'react'
import { isWeaponEquipment, resolveEquipmentInstanceReferenceLabel } from '@rpg/contracts'
import { SemanticText, Text } from '@rpg/ui'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { MasterDetailEditorPanel } from '../../../../components/master-detail/master-detail-editor-panel'
import { masterDetailItemTitle } from '../../../../lib/master-detail/master-detail-constants'
import type { useEmbeddedMasterDetailRows } from '../../../../lib/master-detail/use-embedded-master-detail-rows'
import { useMonsterActionFacingHost } from '../../../../facing/use-monster-action-facing-host'
import { sharedCastingOptions } from '../../../lib/actions/spell/monster-action-casting-summary'
import { isActionReferenceAcquisitionTarget } from '../../../lib/actions/reference/action-reference-acquisition'
import { legendarySourceSpellOptions } from '../../../lib/actions/acquisition/monster-legendary-action-acquisition'
import { monsterActionDetailFields } from '../../../lib/actions/detail-fields/monster-action-detail-fields'
import { monsterActionSectionMoveAllowed } from '../../../lib/actions/monster-action-kind'
import { monsterActionEditorTitles } from '../../../lib/actions/monster-action-editor-title'
import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from '../../../lib/actions/references/monster-action-equipment-references'
import { MONSTER_MOVE_TO_LABEL } from '../../../lib/monster-form-labels'
import type { MonsterActionDraftRow } from '../../../lib/actions/monster-action-presets'
import { monsterActionSectionHeading } from '../../../lib/actions/monster-action-presets'
import { MONSTER_ACTION_ITEM_NOUN } from '../../../lib/monster-form-labels'
import { collectMonsterFormAdvisories } from '../../../lib/monster-form-advisories'
import {
  monsterEquipmentCatalog,
  monsterMagicPropertyProvider,
} from '../../../lib/monster-form-derivation'
import type { MonsterFormValues } from '../../../lib/monster-form-values'
import {
  monsterFormSectionRowNamePrefix,
  monsterFormSectionRows,
  monsterFormSectionRowsFieldName,
} from '../../../lib/actions/monster-action-section-access'
import type { useMonsterActionSections } from '../../../hooks/use-monster-action-sections'

function referenceOptionLabels(values: MonsterFormValues, ctx: ContentFormCtx) {
  const actionRows = (values.actions ?? []) as MonsterActionDraftRow[]
  const titles = monsterActionEditorTitles(actionRows, values, ctx, 'actions')
  const unnamed = masterDetailItemTitle(undefined, MONSTER_ACTION_ITEM_NOUN)
  return actionRows.filter(isActionReferenceAcquisitionTarget).map((row) => ({
    value: row.id,
    label: titles.get(row.id) ?? unnamed,
  }))
}

function moveOverflowActions(
  located: { section: MonsterActionSection; action: MonsterActionDraftRow } | null | undefined,
  requestMove: (section: MonsterActionSection) => void,
) {
  if (!located) return undefined
  const items = MONSTER_ACTION_SECTIONS.filter((section) =>
    monsterActionSectionMoveAllowed(located.action, located.section, section),
  ).map((section) => ({
    id: `move-${section}`,
    label: monsterActionSectionHeading(section),
    onSelect: () => requestMove(section),
  }))
  if (items.length === 0) return undefined
  return [{ id: 'move-to', label: MONSTER_MOVE_TO_LABEL, items }]
}

type Sections = ReturnType<typeof useMonsterActionSections>
type ActionRows = ReturnType<typeof useEmbeddedMasterDetailRows>

function attackChipOptions(
  rows: readonly MonsterActionDraftRow[],
  actionId: string,
  values: MonsterFormValues,
  ctx: ContentFormCtx,
  section?: MonsterActionSection,
): { value: string; label: string }[] {
  const titles = monsterActionEditorTitles(rows, values, ctx, section)
  return rows
    .filter(
      (row) =>
        row.id !== actionId &&
        (row.kind === 'weapon' || row.kind === 'natural-weapon' || row.kind === 'attack'),
    )
    .map((row) => ({ value: row.id, label: titles.get(row.id) ?? row.id }))
}

function equipmentOptions(
  values: MonsterFormValues,
  ctx: ContentFormCtx,
): { value: string; label: string }[] {
  const catalog = monsterEquipmentCatalog(ctx)
  const provider = monsterMagicPropertyProvider(ctx)
  const equipment = values.equipment ?? []
  return equipment.flatMap((entry) => {
    const item = catalog.get(entry.equipmentId)
    if (!item || !isWeaponEquipment(item)) return []
    return [
      {
        value: entry.entryId,
        label: resolveEquipmentInstanceReferenceLabel(entry, item, provider, equipment),
      },
    ]
  })
}

// fallow-ignore-next-line complexity
export function MonsterActionDetail({
  ctx,
  sections,
  located,
  rows,
  weapons,
  weaponActions,
  allowAddWeapon,
}: {
  ctx: ContentFormCtx
  sections: Sections
  located: { action: MonsterActionDraftRow; section: MonsterActionSection; index: number } | null
  rows: ActionRows
  weapons: readonly { entryId: string; label: string; equipped: boolean }[]
  weaponActions: readonly { id: string; equipmentEntryId?: string }[]
  allowAddWeapon: boolean
}) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const action = located?.action
  const namePrefix = located
    ? `${monsterFormSectionRowNamePrefix(located.section)}.${located.index}`
    : ''
  const liveAction =
    located && values
      ? (monsterFormSectionRows(values, located.section)[located.index] ?? action)
      : action
  const editor = located ? sections.editors[located.section] : sections.editors.actions
  const fields = useMemo(() => {
    if (!located || !values || !action || !liveAction) return []
    const sectionRows = monsterFormSectionRows(values, located.section)
    return monsterActionDetailFields({
      ctx,
      action: liveAction,
      section: located.section,
      namePrefix,
      equipmentOptions: equipmentOptions(values, ctx),
      equipment: values.equipment,
      sharedCastingOptions: sharedCastingOptions(values, action.id),
      advisories: collectMonsterFormAdvisories(values, monsterEquipmentCatalog(ctx)),
      onCastingSourceBlocked: sections.setNotice,
      attackOptions: attackChipOptions(
        (located.section === 'reactions' || located.section === 'legendaryActions'
          ? (values.actions ?? [])
          : sectionRows) as MonsterActionDraftRow[],
        action.id,
        values,
        ctx,
        located.section === 'reactions' || located.section === 'legendaryActions'
          ? 'actions'
          : located.section,
      ),
      actionRows: sectionRows,
      bonusActionRows: (values.bonusActions ?? []) as MonsterActionDraftRow[],
      weapons,
      weaponActions,
      allowAddWeapon,
      onAcquireAttack: (section, choice) => sections.addAcquisition(section, choice),
      referenceOptions: referenceOptionLabels(values, ctx),
      sourceSpellOptions: legendarySourceSpellOptions(values, liveAction, ctx.spellCatalogById),
    })
  }, [
    action,
    allowAddWeapon,
    ctx,
    liveAction,
    located,
    namePrefix,
    sections.addAcquisition,
    sections.setNotice,
    values,
    weaponActions,
    weapons,
  ])

  const facing = useMonsterActionFacingHost({
    ctx,
    values,
    action: liveAction ?? action,
    section: located?.section,
  })

  useEffect(() => {
    if (sections.focusToken === 0 || !action) return
    document.getElementById(`monster-action-focus-${action.id}`)?.focus()
  }, [action, sections.focusToken])

  const contextualChrome = sections.notice ? (
    <div id={action ? `monster-action-focus-${action.id}` : undefined} tabIndex={-1}>
      <Text as="p" variant="supporting">
        <SemanticText>{sections.notice}</SemanticText>
      </Text>
    </div>
  ) : action ? (
    <div id={`monster-action-focus-${action.id}`} tabIndex={-1} />
  ) : null

  const spellPicker =
    located && action
      ? {
          enabled: action.kind === 'spell' && located.section !== 'legendaryActions',
          catalog: ctx.spellCatalogById,
        }
      : undefined

  return (
    <MasterDetailEditorPanel
      editor={editor}
      itemFields={fields}
      fieldName={located ? monsterFormSectionRowsFieldName(located.section) : 'actions'}
      idPrefix="monster-action"
      itemNoun={MONSTER_ACTION_ITEM_NOUN}
      showSelectedDetail={Boolean(located && action)}
      selectedIdentity={
        located && action && rows.selectedIdentity
          ? {
              ...rows.selectedIdentity,
              rowKey: action.id ?? rows.selectedIdentity.rowKey,
            }
          : undefined
      }
      campaignId={ctx.campaignId}
      rowAvailability={rows.selectedRowAvailability}
      availabilityFormItems={rows.availabilityFormItems}
      availabilityNamePrefix={rows.availabilityNamePrefix}
      availabilityDialogRef={rows.availabilityDialogRef}
      onDelete={located ? () => sections.requestDelete(located.action.id) : undefined}
      onDuplicate={located ? sections.duplicateSelected : undefined}
      overflowActions={moveOverflowActions(located, sections.requestMove)}
      contextualChrome={contextualChrome}
      facing={facing}
      spellPicker={spellPicker}
    />
  )
}

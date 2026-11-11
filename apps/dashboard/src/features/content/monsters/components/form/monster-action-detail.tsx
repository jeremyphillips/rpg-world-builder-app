import { useEffect, useMemo } from 'react'
import { isWeaponEquipment, resolveEquipmentInstanceReferenceLabel } from '@rpg/contracts'
import { SemanticText, Text } from '@rpg/ui'
import { FormItems, FormRhythmStack } from '@rpg/ui/form'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { MasterDetailEditorPanel } from '../../../components/master-detail/master-detail-editor-panel'
import type { useEmbeddedMasterDetailRows } from '../../../lib/master-detail/use-embedded-master-detail-rows'
import { sharedCastingOptions } from '../../lib/actions/monster-action-casting-summary'
import { isLegendaryReferenceTarget } from '../../lib/actions/legendary-action-category'
import { legendarySourceSpellOptions } from '../../lib/actions/monster-legendary-action-acquisition'
import { monsterActionDetailFields } from '../../lib/actions/monster-action-detail-fields'
import {
  monsterActionHeaderName,
  monsterActionEditorTitles,
} from '../../lib/actions/monster-action-editor-title'
import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from '../../lib/actions/monster-action-equipment-references'
import { MONSTER_MOVE_TO_LABEL } from '../../lib/monster-form-labels'
import { MonsterSpellPickerHost } from './monster-spell-picker-host'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import { monsterActionSectionHeading } from '../../lib/actions/monster-action-presets'
import { MONSTER_ACTION_ITEM_NOUN } from '../../lib/monster-form-labels'
import { collectMonsterFormAdvisories } from '../../lib/monster-form-advisories'
import {
  monsterEquipmentCatalog,
  monsterMagicPropertyProvider,
} from '../../lib/monster-form-derivation'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import type { useMonsterActionSections } from '../../hooks/use-monster-action-sections'

type Sections = ReturnType<typeof useMonsterActionSections>
type ActionRows = ReturnType<typeof useEmbeddedMasterDetailRows>

function attackChipOptions(
  rows: readonly MonsterActionDraftRow[],
  actionId: string,
  values: MonsterFormValues,
  ctx: ContentFormCtx,
): { value: string; label: string }[] {
  const titles = monsterActionEditorTitles(rows, values, ctx)
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
}: {
  ctx: ContentFormCtx
  sections: Sections
  located: { action: MonsterActionDraftRow; section: MonsterActionSection; index: number } | null
  rows: ActionRows
}) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const action = located?.action
  const namePrefix = located ? `${located.section}.${located.index}` : ''
  const sectionRows = (
    located && values ? (values[located.section] ?? []) : []
  ) as MonsterActionDraftRow[]
  const liveAction =
    located && values
      ? ((values[located.section]?.[located.index] as MonsterActionDraftRow | undefined) ?? action)
      : action
  const headerName =
    located && liveAction
      ? monsterActionHeaderName({
          action: liveAction,
          sectionRows,
          values,
          ctx,
          section: located.section,
        })
      : undefined
  const editor = located ? sections.editors[located.section] : sections.editors.actions
  const initialEdit = Boolean(
    headerName?.mode === 'authored' &&
    !liveAction?.name?.trim() &&
    editor.lastAddedFieldId &&
    editor.lastAddedFieldId === editor.selectedFieldId,
  )
  const fields = useMemo(() => {
    if (!located || !values || !action || !liveAction) return []
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
        (values[located.section] ?? []) as MonsterActionDraftRow[],
        action.id,
        values,
        ctx,
      ),
      referenceOptions: ((values.actions ?? []) as MonsterActionDraftRow[])
        .filter(isLegendaryReferenceTarget)
        .map((row) => ({
          value: row.id,
          label:
            monsterActionEditorTitles(
              (values.actions ?? []) as MonsterActionDraftRow[],
              values,
              ctx,
              'actions',
            ).get(row.id) ?? row.id,
        })),
      sourceSpellOptions: legendarySourceSpellOptions(values, liveAction, ctx.spellCatalogById),
    })
  }, [action, ctx, liveAction, located, namePrefix, sections.setNotice, values])

  useEffect(() => {
    if (sections.focusToken === 0 || !action) return
    document.getElementById(`monster-action-focus-${action.id}`)?.focus()
  }, [action, sections.focusToken])

  return (
    <MasterDetailEditorPanel
      editor={editor}
      itemFields={fields}
      fieldName={located?.section ?? 'actions'}
      idPrefix="monster-action"
      itemNoun={MONSTER_ACTION_ITEM_NOUN}
      showSelectedDetail={Boolean(located && action)}
      selectedIdentity={
        located && action && headerName
          ? {
              title: headerName.title,
              rowKey: editor.selectedFieldId ?? action.id,
              meta: rows.selectedIdentity?.meta,
              ...(headerName.sourceName ? { sourceName: headerName.sourceName } : {}),
              inlineTitle: {
                field: 'name',
                fallback: headerName.fallback,
                placeholder: headerName.placeholder,
                mode: headerName.mode,
                initialEdit,
                ...(headerName.resetLabel ? { resetLabel: headerName.resetLabel } : {}),
              },
              deletable: rows.selectedIdentity?.deletable,
              availability: rows.selectedIdentity?.availability,
              onAvailabilityChange: rows.selectedIdentity?.onAvailabilityChange,
              issueCount: rows.selectedIdentity?.issueCount,
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
      overflowActions={
        located && located.section !== 'legendaryActions'
          ? [
              {
                id: 'move-to',
                label: MONSTER_MOVE_TO_LABEL,
                items: MONSTER_ACTION_SECTIONS.filter(
                  (section) =>
                    section !== located.section &&
                    section !== 'legendaryActions' &&
                    !(located.action.kind === 'multiattack' && section !== 'actions'),
                ).map((section) => ({
                  id: `move-${section}`,
                  label: monsterActionSectionHeading(section),
                  onSelect: () => sections.requestMove(section),
                })),
              },
            ]
          : undefined
      }
      detailLeading={
        sections.notice ? (
          <div id={action ? `monster-action-focus-${action.id}` : undefined} tabIndex={-1}>
            <Text as="p" variant="supporting">
              <SemanticText>{sections.notice}</SemanticText>
            </Text>
          </div>
        ) : action ? (
          <div id={`monster-action-focus-${action.id}`} tabIndex={-1} />
        ) : null
      }
      renderBody={
        located && action
          ? () => (
              <MonsterSpellPickerHost
                enabled={action.kind === 'spell' && located.section !== 'legendaryActions'}
                arrayName={`${namePrefix}.spells`}
                catalog={ctx.spellCatalogById}
              >
                <FormRhythmStack>
                  <FormItems
                    items={fields}
                    idPrefix={`monster-action-${action.id}`}
                    namePrefix={namePrefix}
                  />
                </FormRhythmStack>
              </MonsterSpellPickerHost>
            )
          : undefined
      }
    />
  )
}

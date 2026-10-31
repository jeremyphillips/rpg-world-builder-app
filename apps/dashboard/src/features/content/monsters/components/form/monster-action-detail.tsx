import { useEffect, useMemo } from 'react'
import {
  getMonsterActionKindLabel,
  isWeaponEquipment,
  resolveEquipmentInstanceReferenceLabel,
} from '@rpg/contracts'
import { SemanticText, Text } from '@rpg/ui'
import { FormItems } from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { MasterDetailEditorShell } from '../../../components/master-detail/master-detail-editor-shell'
import { collectMonsterFormAdvisories } from '../../lib/monster-form-advisories'
import { monsterActionDetailFields } from '../../lib/actions/monster-action-detail-fields'
import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from '../../lib/actions/monster-action-equipment-references'
import { MONSTER_MOVE_TO_LABEL } from '../../lib/monster-form-labels'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import { monsterActionSectionHeading } from '../../lib/actions/monster-action-presets'
import { MONSTER_ACTION_ITEM_NOUN } from '../../lib/monster-trait-form-fields'
import {
  monsterEquipmentCatalog,
  monsterMagicPropertyProvider,
} from '../../lib/monster-form-derivation'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import type { useMonsterActionSections } from '../../hooks/use-monster-action-sections'
import { MonsterActionAttackSummary } from './monster-action-attack-summary'

type Sections = ReturnType<typeof useMonsterActionSections>

function sharedCastingOptions(
  values: MonsterFormValues,
  actionId: string,
): { value: string; label: string }[] {
  const rows = [
    ...values.actions,
    ...values.bonusActions,
    ...values.reactions,
  ] as MonsterActionDraftRow[]
  return rows.flatMap((entry) => {
    if (entry.kind !== 'spell' || entry.id === actionId) return []
    if (entry.castingAbility?.kind !== 'ability' || !entry.name?.trim()) return []
    return [{ value: entry.id, label: `Same as ${entry.name}` }]
  })
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
}: {
  ctx: ContentFormCtx
  sections: Sections
  located: { action: MonsterActionDraftRow; section: MonsterActionSection; index: number } | null
}) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const { formState } = useFormContext<MonsterFormValues>()
  const action = located?.action
  const namePrefix = located ? `${located.section}.${located.index}` : ''
  const fields = useMemo(() => {
    if (!located || !values || !action) return []
    return monsterActionDetailFields({
      ctx,
      action,
      section: located.section,
      namePrefix,
      equipmentOptions: equipmentOptions(values, ctx),
      sharedCastingOptions: sharedCastingOptions(values, action.id),
      attackOptions: (values[located.section] ?? [])
        .filter(
          (row) =>
            row.id !== action.id &&
            (row.kind === 'weapon' || row.kind === 'natural-weapon' || row.kind === 'attack'),
        )
        .map((row) => ({ value: row.id, label: row.name?.trim() || row.kind })),
    })
  }, [action, ctx, located, namePrefix, values])

  useEffect(() => {
    if (sections.focusToken === 0 || !action) return
    document.getElementById(`monster-action-focus-${action.id}`)?.focus()
  }, [action, sections.focusToken])

  const advisories =
    located && values
      ? collectMonsterFormAdvisories(values, monsterEquipmentCatalog(ctx))
          .filter((advisory) => advisory.path.startsWith(`${located.section}.${located.index}`))
          .map((advisory) => advisory.message)
      : []
  const showError = Boolean(
    located && formState.submitCount > 0 && sections.hasRowError(located.section, located.index),
  )

  return (
    <MasterDetailEditorShell
      itemNoun={MONSTER_ACTION_ITEM_NOUN}
      selectedIdentity={
        located
          ? {
              title: located.action.name?.trim() || `Action ${located.index + 1}`,
              meta: {
                eyebrow: getMonsterActionKindLabel(located.action.kind),
                sourceLabel: monsterActionSectionHeading(located.section),
              },
              issueCount: showError ? 1 : 0,
            }
          : undefined
      }
      onDelete={located ? () => sections.removeAction(located.action.id) : undefined}
      overflowActions={
        located
          ? [
              {
                id: 'move-to',
                label: MONSTER_MOVE_TO_LABEL,
                items: MONSTER_ACTION_SECTIONS.filter(
                  (section) =>
                    section !== located.section &&
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
    >
      {located && action ? (
        <div id={`monster-action-focus-${action.id}`} tabIndex={-1} className="flex flex-col gap-4">
          <MonsterActionAttackSummary ctx={ctx} action={action} />
          {sections.notice ? (
            <Text as="p" variant="supporting">
              <SemanticText>{sections.notice}</SemanticText>
            </Text>
          ) : null}
          {advisories.map((message) => (
            <Text key={message} as="p" variant="supporting">
              <SemanticText>{message}</SemanticText>
            </Text>
          ))}
          <FormItems
            items={fields}
            idPrefix={`monster-action-${action.id}`}
            namePrefix={namePrefix}
          />
        </div>
      ) : null}
    </MasterDetailEditorShell>
  )
}

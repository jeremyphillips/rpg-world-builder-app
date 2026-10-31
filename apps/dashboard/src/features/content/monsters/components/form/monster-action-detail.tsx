import { useEffect, useMemo } from 'react'
import {
  getMonsterActionKindLabel,
  isWeaponEquipment,
  resolveEquipmentInstanceReferenceLabel,
} from '@rpg/contracts'
import { Button, SemanticText, Text } from '@rpg/ui'
import { FormItems } from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { MasterDetailEditorShell } from '../../../components/master-detail/master-detail-editor-shell'
import { collectMonsterFormAdvisories } from '../../lib/monster-form-advisories'
import { monsterActionDetailFields } from '../../lib/actions/monster-action-detail-fields'
import type { MonsterActionSection } from '../../lib/actions/monster-action-equipment-references'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import { monsterActionSectionHeading } from '../../lib/actions/monster-action-presets'
import { MONSTER_ACTION_ITEM_NOUN } from '../../lib/monster-trait-form-fields'
import {
  monsterEquipmentCatalog,
  monsterMagicPropertyProvider,
} from '../../lib/monster-form-derivation'
import { MONSTER_MOVE_DOWN_LABEL, MONSTER_MOVE_UP_LABEL } from '../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import type { useMonsterActionSections } from '../../hooks/use-monster-action-sections'
import { MonsterActionAttackSummary } from './monster-action-attack-summary'
import { MonsterActionMoveSectionField } from './monster-action-move-section-field'

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
  const rowCount = located && values ? (values[located.section]?.length ?? 0) : 0
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
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={located.index <= 0}
              onClick={() => sections.reorder(located.section, located.index, located.index - 1)}
            >
              {MONSTER_MOVE_UP_LABEL}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={located.index >= rowCount - 1}
              onClick={() => sections.reorder(located.section, located.index, located.index + 1)}
            >
              {MONSTER_MOVE_DOWN_LABEL}
            </Button>
          </div>
          <MonsterActionMoveSectionField
            section={located.section}
            onMove={(target) => sections.requestMove(target)}
          />
        </div>
      ) : null}
    </MasterDetailEditorShell>
  )
}

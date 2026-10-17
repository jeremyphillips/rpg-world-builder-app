import type { Dispatch } from 'react'

import {
  formatEquipmentMechanicalComponentsForTarget,
  formatSignedModifier,
  joinInlineMetadata,
  type EquipmentEffectTotals,
  type EquipmentInstance,
  type ResolvedEquipmentMagicProperties,
} from '@rpg/contracts'
import {
  ActionButton,
  ActionIcon,
  Heading,
  SemanticText,
  SwitchField,
  Text,
  iconGhostControlVariants,
} from '@rpg/ui'
import { FieldSeparatorWrapper } from '@rpg/ui/form'

import { ContentFormEntitySelectionRow } from '../../../lib/forms/selection/content-form-entity-selection-row'
import type {
  EquipmentEditorAction,
  EquipmentEditorState,
} from '../../lib/instance-editor/equipment-editor-types'
import {
  EQUIPMENT_ADJUSTMENTS_SECTION_HEADING,
  EQUIPMENT_INSTANCE_EDITOR_ADD_ADJUSTMENT_ACTION_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_ADD_MAGIC_PROPERTY_ACTION_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_CUSTOM_PROPERTY_STATUS_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_EQUIPPED_HINT,
  EQUIPMENT_INSTANCE_EDITOR_EQUIPPED_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_MAGICAL_HINT,
  EQUIPMENT_INSTANCE_EDITOR_MAGICAL_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_MODIFIERS_HEADING,
  effectTargetSentenceLabel,
  equipmentAdjustmentsSectionDescription,
  formatEditRowAriaLabel,
  formatEquipmentAdjustmentBonusLabel,
  formatMagicalPropertiesRemovalWarning,
  formatRemoveMagicPropertyAriaLabel,
  magicPropertyCategoryLabel,
} from '../../lib/instance-editor/equipment-instance-editor-form-labels'
import {
  effectTargetLabel,
  overlappingMechanicalModifierTargets,
} from '../../lib/instance-editor/equipment-instance-editor.lib'

type EditorDispatch = Dispatch<EquipmentEditorAction>

type EquipmentInstanceEditorMainBodyProps = {
  state: EquipmentEditorState
  magic: ResolvedEquipmentMagicProperties
  totals: EquipmentEffectTotals
  hasPresetProperties: boolean
  dispatch: EditorDispatch
}

function CombinedMechanicalModifiers({
  draft,
  magic,
  totals,
}: {
  draft: EquipmentInstance
  magic: ResolvedEquipmentMagicProperties
  totals: EquipmentEffectTotals
}) {
  const overlapping = overlappingMechanicalModifierTargets({ draft, magic, totals })
  if (overlapping.length === 0) return null

  return (
    <div className="space-y-2 border-t border-border pt-3">
      <Text variant="emphasis">{EQUIPMENT_INSTANCE_EDITOR_MODIFIERS_HEADING}</Text>
      {overlapping.map((target) => {
        const summary = formatEquipmentMechanicalComponentsForTarget(draft, magic, target)
        return (
          <div
            key={target}
            className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1"
          >
            <Text variant="muted">{effectTargetLabel(target)}</Text>
            <Text variant="muted">{summary ?? formatSignedModifier(totals[target])}</Text>
          </div>
        )
      })}
    </div>
  )
}

function MagicalPropertiesSection({
  draft,
  magic,
  hasPresetProperties,
  dispatch,
}: {
  draft: EquipmentInstance
  magic: ResolvedEquipmentMagicProperties
  hasPresetProperties: boolean
  dispatch: EditorDispatch
}) {
  const propertyCount = draft.magicProperties?.length ?? 0

  return (
    <FieldSeparatorWrapper separator="subtle">
      <div className="space-y-2">
        <SwitchField
          id="equipment-editor-magical"
          label={EQUIPMENT_INSTANCE_EDITOR_MAGICAL_LABEL}
          hint={EQUIPMENT_INSTANCE_EDITOR_MAGICAL_HINT}
          labelPosition="settings"
          checked={Boolean(draft.magical)}
          onCheckedChange={(magical) => dispatch({ type: 'setMagical', magical })}
        />

        {draft.magical ? (
          <div className="space-y-2">
            {magic.resolved.map((row) => {
              const propertyMetadata = joinInlineMetadata([
                magicPropertyCategoryLabel(row.definition.category),
                ...row.definition.effects.map(
                  (effect) =>
                    `${formatSignedModifier(effect.bonus)} ${effectTargetSentenceLabel(effect.target)}`,
                ),
              ])
              const showPresetDescription = row.definition.effects.length === 0
              return (
                <ContentFormEntitySelectionRow
                  key={row.entry.propertyId}
                  entity={{
                    heading: row.definition.name,
                    ...(showPresetDescription ? { description: row.definition.description } : {}),
                    statusComposition: 'metadata',
                    status: [
                      {
                        kind: 'text',
                        label: propertyMetadata,
                        variant: 'muted',
                      },
                    ],
                  }}
                  trailing={{
                    kind: 'utility',
                    content: (
                      <button
                        type="button"
                        className={iconGhostControlVariants({
                          hover: 'destructive',
                          layout: 'flex',
                        })}
                        aria-label={formatRemoveMagicPropertyAriaLabel(row.definition.name)}
                        onClick={() =>
                          dispatch({
                            type: 'removeMagicProperty',
                            kind: 'preset',
                            id: row.entry.propertyId,
                          })
                        }
                      >
                        <ActionIcon action="remove" />
                      </button>
                    ),
                  }}
                />
              )
            })}
            {magic.custom.map((row) => (
              <ContentFormEntitySelectionRow
                key={row.customId}
                entity={{
                  heading: row.name,
                  description: row.description,
                  statusComposition: 'metadata',
                  status: [
                    {
                      kind: 'text',
                      label: EQUIPMENT_INSTANCE_EDITOR_CUSTOM_PROPERTY_STATUS_LABEL,
                      variant: 'muted',
                    },
                  ],
                }}
                trailing={{
                  kind: 'utility',
                  content: (
                    <button
                      type="button"
                      className={iconGhostControlVariants({ hover: 'text', layout: 'flex' })}
                      aria-label={formatEditRowAriaLabel(row.name)}
                      onClick={() =>
                        dispatch({
                          type: 'openPropertyCreate',
                          origin: 'existing',
                          draft: {
                            customId: row.customId,
                            name: row.name,
                            description: row.description,
                          },
                        })
                      }
                    >
                      <ActionIcon action="edit" />
                    </button>
                  ),
                }}
              />
            ))}
            <ActionButton
              action="add"
              variant="outline"
              size="sm"
              onClick={() =>
                dispatch(
                  hasPresetProperties
                    ? { type: 'openPropertyBrowse' }
                    : { type: 'openPropertyCreate', origin: 'direct' },
                )
              }
            >
              {EQUIPMENT_INSTANCE_EDITOR_ADD_MAGIC_PROPERTY_ACTION_LABEL}
            </ActionButton>
          </div>
        ) : propertyCount > 0 ? (
          <SemanticText tone="warning">
            {formatMagicalPropertiesRemovalWarning(propertyCount)}
          </SemanticText>
        ) : null}
      </div>
    </FieldSeparatorWrapper>
  )
}

function AdjustmentsSection({
  draft,
  magic,
  totals,
  dispatch,
}: {
  draft: EquipmentInstance
  magic: ResolvedEquipmentMagicProperties
  totals: EquipmentEffectTotals
  dispatch: EditorDispatch
}) {
  return (
    <div className="space-y-2">
      <Heading variant="label" as="label">
        {EQUIPMENT_ADJUSTMENTS_SECTION_HEADING}
      </Heading>
      <p className="text-style-caption">{equipmentAdjustmentsSectionDescription()}</p>
      {(draft.adjustments ?? []).map((row) => (
        <ContentFormEntitySelectionRow
          key={row.effectId}
          entity={{
            heading: effectTargetLabel(row.target),
            description: row.notes,
            statusComposition: 'metadata',
            status: [
              {
                kind: 'text',
                label: formatEquipmentAdjustmentBonusLabel(row.bonus),
                variant: 'muted',
              },
            ],
          }}
          trailing={{
            kind: 'utility',
            content: (
              <button
                type="button"
                className={iconGhostControlVariants({ hover: 'text', layout: 'flex' })}
                aria-label={formatEditRowAriaLabel(effectTargetLabel(row.target))}
                onClick={() =>
                  dispatch({
                    type: 'openEffectForm',
                    draft: {
                      effectId: row.effectId,
                      target: row.target,
                      bonus: row.bonus,
                      notes: row.notes,
                    },
                    origin: 'existing',
                  })
                }
              >
                <ActionIcon action="edit" />
              </button>
            ),
          }}
        />
      ))}
      <ActionButton
        action="add"
        variant="outline"
        size="sm"
        onClick={() => dispatch({ type: 'openEffectChoose' })}
      >
        {EQUIPMENT_INSTANCE_EDITOR_ADD_ADJUSTMENT_ACTION_LABEL}
      </ActionButton>
      <CombinedMechanicalModifiers draft={draft} magic={magic} totals={totals} />
    </div>
  )
}

export function EquipmentInstanceEditorMainBody({
  state,
  magic,
  totals,
  hasPresetProperties,
  dispatch,
}: EquipmentInstanceEditorMainBodyProps) {
  const draft = state.session.draft

  return (
    <div className="space-y-6">
      <FieldSeparatorWrapper separator="subtle">
        <SwitchField
          id="equipment-editor-equipped"
          label={EQUIPMENT_INSTANCE_EDITOR_EQUIPPED_LABEL}
          hint={EQUIPMENT_INSTANCE_EDITOR_EQUIPPED_HINT}
          labelPosition="settings"
          checked={Boolean(draft.equipped)}
          onCheckedChange={(equipped) => dispatch({ type: 'patchDraft', patch: { equipped } })}
        />
      </FieldSeparatorWrapper>

      <MagicalPropertiesSection
        draft={draft}
        magic={magic}
        hasPresetProperties={hasPresetProperties}
        dispatch={dispatch}
      />
      <AdjustmentsSection draft={draft} magic={magic} totals={totals} dispatch={dispatch} />
    </div>
  )
}

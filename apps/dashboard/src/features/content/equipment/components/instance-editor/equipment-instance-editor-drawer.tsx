import { useMemo, useReducer } from 'react'

import { loadSeedMagicProperties } from '@rpg/catalog/magic-properties'
import {
  EQUIPMENT_EFFECT_BONUS_MAX,
  EQUIPMENT_EFFECT_BONUS_MIN,
  formatSignedModifier,
  formatEquipmentMechanicalComponentsForTarget,
  joinInlineMetadata,
  nextNonZeroBonus,
  resolveEquipmentEntryEffectTotals,
  resolveEquipmentMagicProperties,
  type Equipment,
  type EquipmentInstance,
  type MagicPropertyDefinitionProvider,
  type SystemRulesetId,
} from '@rpg/contracts'
type EquipmentEffectTarget = 'attack_roll' | 'damage_roll' | 'armor_class'

const EFFECT_TARGET_DESCRIPTIONS: Record<EquipmentEffectTarget, string> = {
  attack_roll: 'Modify attack rolls made with this equipment.',
  damage_roll: 'Modify damage rolls made with this equipment.',
  armor_class: 'Increase or decrease AC.',
}
import {
  ActionButton,
  ActionIcon,
  Button,
  DecisionSummaryPanel,
  Heading,
  NumberStepper,
  RadioCard,
  SemanticText,
  SwitchField,
  Text,
  TextareaField,
  TextField,
  iconGhostControlVariants,
} from '@rpg/ui'

import { DrawerShell } from '@/components/drawer'
import { ContentFormEntitySelectionRow } from '../../../lib/forms/selection/content-form-entity-selection-row'
import { useUnsavedChangesConfirm } from '@/lib/use-unsaved-changes-confirm'
import { commitEquipmentEditorSession } from '../../lib/instance-editor/commit-equipment-editor-session'
import {
  createEquipmentEditorState,
  equipmentEditorReducer,
  isEquipmentEditorSessionDirty,
} from '../../lib/instance-editor/equipment-editor-reducer'
import type { EquipmentEditorState } from '../../lib/instance-editor/equipment-editor-types'
import {
  allowedEffectTargetsForEquipment,
  effectTargetLabel,
  equipmentInstanceEditorKindHeadline,
  listPresetMagicPropertiesForItem,
} from '../../lib/instance-editor/equipment-instance-editor.lib'

export type EquipmentInstanceEditorDrawerProps<T extends EquipmentInstance & { entryId: string }> =
  {
    open: boolean
    onOpenChange: (open: boolean) => void
    sourceEntry: T
    entries: readonly T[]
    catalogItem: Equipment
    rulesetId: SystemRulesetId
    definitions?: MagicPropertyDefinitionProvider
    subjectNoun: 'creature' | 'character'
    referencedByLabel?: string
    onCommit: (nextEntries: T[]) => void
  }

const EQUIPMENT_EDITOR_DONE_LABEL = 'Done'
const EQUIPMENT_EDITOR_CANCEL_LABEL = 'Cancel'
const EQUIPMENT_EDITOR_CONTINUE_LABEL = 'Continue'

function editorModeTitle(state: EquipmentEditorState): string {
  switch (state.mode.kind) {
    case 'scope':
      return 'Customize item'
    case 'main':
      return 'Edit item'
    case 'effectChoose':
      return 'Add adjustment'
    case 'effectForm':
      return state.mode.origin === 'existing' ? 'Edit adjustment' : 'Add adjustment'
    case 'propertyBrowse':
      return 'Add magic property'
    case 'propertyCreate':
      return state.mode.draft.customId ? 'Edit custom property' : 'Create custom property'
    default:
      return 'Edit item'
  }
}

function backTargetLabel(state: EquipmentEditorState): string | null {
  if (state.mode.kind === 'effectChoose') return 'Add adjustment'
  if (state.mode.kind === 'effectForm') return 'Add adjustment'
  if (state.mode.kind === 'propertyBrowse') return 'Add magic property'
  if (state.mode.kind === 'propertyCreate' && state.mode.origin === 'browse') {
    return 'Add magic property'
  }
  if (state.mode.kind === 'main' || state.mode.kind === 'scope') return null
  return 'Edit item'
}

export function EquipmentInstanceEditorDrawer<T extends EquipmentInstance & { entryId: string }>(
  props: EquipmentInstanceEditorDrawerProps<T>,
) {
  if (!props.open) return null
  return <EquipmentInstanceEditorDrawerInner key={props.sourceEntry.entryId} {...props} />
}

// fallow-ignore-next-line complexity
function EquipmentInstanceEditorDrawerInner<T extends EquipmentInstance & { entryId: string }>({
  open,
  onOpenChange,
  sourceEntry,
  entries,
  catalogItem,
  rulesetId,
  definitions: definitionsProp,
  subjectNoun,
  referencedByLabel,
  onCommit,
}: EquipmentInstanceEditorDrawerProps<T>) {
  const definitions = useMemo(() => {
    if (definitionsProp) return definitionsProp
    const byId = new Map(loadSeedMagicProperties(rulesetId).map((row) => [row.id, row]))
    return (id: string) => byId.get(id)
  }, [definitionsProp, rulesetId])

  const [state, dispatch] = useReducer(equipmentEditorReducer, sourceEntry, (entry) =>
    createEquipmentEditorState({ sourceEntry: entry }),
  )

  const dirty = isEquipmentEditorSessionDirty(state)
  const discardGuard = useUnsavedChangesConfirm({ isDirty: dirty })

  const closeDrawer = () => onOpenChange(false)

  const requestClose = () => {
    if (state.mode.kind !== 'main' && state.mode.kind !== 'scope') {
      dispatch({ type: 'cancelSubMode' })
      return
    }
    discardGuard.request(closeDrawer)
  }

  const handleOpenChange = (next: boolean) => {
    if (next) onOpenChange(true)
    else requestClose()
  }

  const handleDone = () => {
    const next = commitEquipmentEditorSession(entries, state.session) as T[]
    onCommit(next)
    discardGuard.runTrusted(closeDrawer)
  }

  const presets = listPresetMagicPropertiesForItem(rulesetId, catalogItem)
  const magic = resolveEquipmentMagicProperties(state.session.draft, catalogItem, definitions)
  const totals = resolveEquipmentEntryEffectTotals(state.session.draft, catalogItem, definitions)
  const headline =
    state.mode.kind === 'main'
      ? equipmentInstanceEditorKindHeadline(catalogItem)
      : editorModeTitle(state)

  const showBack =
    state.mode.kind !== 'main' && state.mode.kind !== 'scope' && backTargetLabel(state) !== null

  const editorMode = state.mode
  // fallow-ignore-next-line complexity
  const footer = (() => {
    switch (editorMode.kind) {
      case 'scope':
        return (
          <>
            <DrawerShell.Close asChild>
              <Button variant="outline" onClick={requestClose}>
                {EQUIPMENT_EDITOR_CANCEL_LABEL}
              </Button>
            </DrawerShell.Close>
            <Button type="button" onClick={() => dispatch({ type: 'continueFromScope' })}>
              {EQUIPMENT_EDITOR_CONTINUE_LABEL}
            </Button>
          </>
        )
      case 'main':
        return (
          <>
            <DrawerShell.Close asChild>
              <Button variant="outline" onClick={requestClose}>
                {EQUIPMENT_EDITOR_CANCEL_LABEL}
              </Button>
            </DrawerShell.Close>
            <Button type="button" onClick={handleDone}>
              {EQUIPMENT_EDITOR_DONE_LABEL}
            </Button>
          </>
        )
      case 'effectChoose':
        return (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch({ type: 'cancelSubMode' })}
            >
              {EQUIPMENT_EDITOR_CANCEL_LABEL}
            </Button>
            <Button
              type="button"
              disabled={!editorMode.draft.target}
              onClick={() =>
                dispatch({
                  type: 'openEffectForm',
                  draft: editorMode.draft,
                  origin: 'new',
                })
              }
            >
              {EQUIPMENT_EDITOR_CONTINUE_LABEL}
            </Button>
          </>
        )
      case 'effectForm':
        return (
          <>
            {editorMode.origin === 'existing' && editorMode.draft.effectId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  dispatch({ type: 'removeEffect', effectId: editorMode.draft.effectId! })
                }
              >
                Remove adjustment
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch({ type: 'cancelSubMode' })}
            >
              {EQUIPMENT_EDITOR_CANCEL_LABEL}
            </Button>
            <Button
              type="button"
              onClick={() =>
                dispatch({
                  type: 'commitEffectDraft',
                  draft: editorMode.draft,
                  replace: editorMode.origin === 'existing',
                })
              }
            >
              {editorMode.origin === 'existing' ? 'Save adjustment' : 'Add adjustment'}
            </Button>
          </>
        )
      case 'propertyBrowse':
        return (
          <>
            <ActionButton
              action="add"
              variant="ghost"
              onClick={() => dispatch({ type: 'openPropertyCreate', origin: 'browse' })}
            >
              Create custom property
            </ActionButton>
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch({ type: 'cancelSubMode' })}
            >
              {EQUIPMENT_EDITOR_CANCEL_LABEL}
            </Button>
          </>
        )
      case 'propertyCreate':
        return (
          <>
            {editorMode.draft.customId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  dispatch({
                    type: 'removeMagicProperty',
                    kind: 'custom',
                    id: editorMode.draft.customId!,
                  })
                }
              >
                Remove property
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch({ type: 'cancelSubMode' })}
            >
              {EQUIPMENT_EDITOR_CANCEL_LABEL}
            </Button>
            <Button
              type="button"
              onClick={() =>
                dispatch({
                  type: 'commitCustomProperty',
                  draft: editorMode.draft,
                  replaceCustomId: editorMode.draft.customId,
                })
              }
            >
              {editorMode.draft.customId ? 'Save property' : 'Create property'}
            </Button>
          </>
        )
      default:
        return null
    }
  })()

  return (
    <>
      <DrawerShell
        open={open}
        onOpenChange={handleOpenChange}
        title={headline}
        headerLeading={
          showBack ? (
            <button
              type="button"
              className={iconGhostControlVariants({ hover: 'text', layout: 'flex' })}
              aria-label={`Back to ${backTargetLabel(state)}`}
              onClick={() => dispatch({ type: 'back' })}
            >
              <ActionIcon action="back" />
            </button>
          ) : undefined
        }
        footer={footer}
      >
        {state.mode.kind === 'scope' ? (
          <ScopeModeBody
            entryName={catalogItem.name}
            quantity={sourceEntry.quantity ?? 1}
            subjectNoun={subjectNoun}
            scope={state.session.scope}
            referencedByLabel={referencedByLabel}
            onScopeChange={(scope) => dispatch({ type: 'setScope', scope })}
          />
        ) : null}
        {state.mode.kind === 'main' ? (
          <MainModeBody
            state={state}
            catalogItem={catalogItem}
            magic={magic}
            totals={totals}
            onPatch={(patch) => dispatch({ type: 'patchDraft', patch })}
            onMagical={(magical) => dispatch({ type: 'setMagical', magical })}
            onOpenEffectChoose={() => dispatch({ type: 'openEffectChoose' })}
            onOpenEffectForm={(effectId) => {
              const row = state.session.draft.adjustments?.find(
                (effect) => effect.effectId === effectId,
              )
              if (!row) return
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
            }}
            onOpenPropertyBrowse={() =>
              presets.length > 0
                ? dispatch({ type: 'openPropertyBrowse' })
                : dispatch({ type: 'openPropertyCreate', origin: 'direct' })
            }
            onOpenPropertyCreate={(customId) => {
              const row = state.session.draft.magicProperties?.find(
                (property) => property.kind === 'custom' && property.customId === customId,
              )
              if (row?.kind !== 'custom') return
              dispatch({
                type: 'openPropertyCreate',
                origin: 'existing',
                draft: {
                  customId: row.customId,
                  name: row.name,
                  description: row.description,
                },
              })
            }}
            onRemovePreset={(propertyId) =>
              dispatch({ type: 'removeMagicProperty', kind: 'preset', id: propertyId })
            }
          />
        ) : null}
        {editorMode.kind === 'effectChoose' ? (
          <EffectChooseBody
            item={catalogItem}
            draft={editorMode.draft}
            existingTargets={
              new Set(state.session.draft.adjustments?.map((row) => row.target) ?? [])
            }
            onSelect={(target) =>
              dispatch({
                type: 'openEffectChoose',
                draft: { ...editorMode.draft, target },
                returnTo: editorMode.returnTo,
              })
            }
          />
        ) : null}
        {editorMode.kind === 'effectForm' ? (
          <EffectFormBody
            draft={editorMode.draft}
            onChange={(draft) =>
              dispatch({ type: 'openEffectForm', draft, origin: editorMode.origin })
            }
            onChangeTarget={() =>
              dispatch({
                type: 'openEffectChoose',
                draft: editorMode.draft,
                returnTo: 'effectForm',
              })
            }
          />
        ) : null}
        {editorMode.kind === 'propertyBrowse' ? (
          <PropertyBrowseBody
            presets={presets}
            draft={editorMode.draft}
            sessionDraft={state.session.draft}
            onDraftChange={(draft) => dispatch({ type: 'openPropertyBrowse', draft })}
            onAdd={(propertyId, replacePropertyId) =>
              dispatch({ type: 'commitPresetProperty', propertyId, replacePropertyId })
            }
          />
        ) : null}
        {editorMode.kind === 'propertyCreate' ? (
          <PropertyCreateBody
            draft={editorMode.draft}
            onChange={(draft) =>
              dispatch({ type: 'openPropertyCreate', draft, origin: editorMode.origin })
            }
          />
        ) : null}
      </DrawerShell>
      {discardGuard.dialog}
    </>
  )
}

function CombinedMechanicalModifiers({
  draft,
  magic,
  totals,
}: {
  draft: EquipmentInstance
  magic: ReturnType<typeof resolveEquipmentMagicProperties>
  totals: ReturnType<typeof resolveEquipmentEntryEffectTotals>
}) {
  const manualTargets = new Set((draft.adjustments ?? []).map((effect) => effect.target))

  const overlapping = (['attack_roll', 'damage_roll', 'armor_class'] as const).filter((target) => {
    const hasEnhancement = magic.resolved.some(
      (row) =>
        row.definition.category === 'enhancement' &&
        row.definition.effects.some((effect) => effect.target === target),
    )
    return manualTargets.has(target) && hasEnhancement && totals[target] !== 0
  })

  if (overlapping.length === 0) return null

  return (
    <div className="space-y-2 border-t border-border pt-3">
      <Text variant="emphasis">Equipment modifiers</Text>
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

function ScopeModeBody({
  entryName,
  quantity,
  subjectNoun,
  scope,
  referencedByLabel,
  onScopeChange,
}: {
  entryName: string
  quantity: number
  subjectNoun: 'creature' | 'character'
  scope: 'one' | 'all'
  referencedByLabel?: string
  onScopeChange: (scope: 'one' | 'all') => void
}) {
  const subject =
    subjectNoun === 'creature'
      ? `This creature has ${quantity} ${entryName}.`
      : `You have ${quantity} ${entryName}.`
  return (
    <div className="space-y-4">
      <Heading variant="subsection" as="h3">
        Customize {entryName}
      </Heading>
      <Text variant="muted">{subject} Choose which to customize.</Text>
      <RadioCard
        value={scope}
        onValueChange={(value) => onScopeChange(value as 'one' | 'all')}
        options={[
          {
            value: 'one',
            label: 'One copy',
            description: 'Separate one copy for customization. Other copies remain unchanged.',
          },
          {
            value: 'all',
            label: `All ${quantity} copies`,
            description: 'Apply the same customization to every copy in this stack.',
          },
        ]}
        variant="card"
      />
      {scope === 'one' && referencedByLabel ? (
        <SemanticText tone="info">{referencedByLabel}</SemanticText>
      ) : null}
    </div>
  )
}

// fallow-ignore-next-line complexity
function MainModeBody({
  state,
  catalogItem,
  magic,
  totals,
  onPatch,
  onMagical,
  onOpenEffectChoose,
  onOpenEffectForm,
  onOpenPropertyBrowse,
  onOpenPropertyCreate,
  onRemovePreset,
}: {
  state: EquipmentEditorState
  catalogItem: Equipment
  magic: ReturnType<typeof resolveEquipmentMagicProperties>
  totals: ReturnType<typeof resolveEquipmentEntryEffectTotals>
  onPatch: (patch: Partial<EquipmentInstance>) => void
  onMagical: (magical: boolean) => void
  onOpenEffectChoose: () => void
  onOpenEffectForm: (effectId: string) => void
  onOpenPropertyBrowse: () => void
  onOpenPropertyCreate: (customId: string) => void
  onRemovePreset: (propertyId: string) => void
}) {
  const draft = state.session.draft
  const quantity = draft.quantity ?? 1
  const showQuantityStepper = state.session.scope === 'all' || quantity <= 1

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Text>{catalogItem.name}</Text>
        {showQuantityStepper ? (
          <NumberStepper
            size="sm"
            value={quantity}
            min={1}
            onChange={(value) => onPatch({ quantity: value })}
            aria-label={`Quantity of ${catalogItem.name}`}
          />
        ) : (
          <Text variant="muted">×1 (separated on save)</Text>
        )}
      </div>

      <SwitchField
        id="equipment-editor-equipped"
        label="Equipped"
        hint="Show this item as equipped on the stat block."
        labelPosition="settings"
        checked={Boolean(draft.equipped)}
        onCheckedChange={(equipped) => onPatch({ equipped })}
      />

      <SwitchField
        id="equipment-editor-magical"
        label="Magical"
        hint="Treat this item as magical. Properties are optional."
        labelPosition="settings"
        checked={Boolean(draft.magical)}
        onCheckedChange={onMagical}
      />

      {draft.magical ? (
        <div className="space-y-2">
          {magic.resolved.map((row) => {
            const propertyMetadata = joinInlineMetadata([
              row.definition.category === 'enhancement' ? 'Enhancement' : 'Special',
              ...row.definition.effects.map(
                (effect) =>
                  `${formatSignedModifier(effect.bonus)} ${effectTargetLabel(effect.target).toLowerCase()}`,
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
                      className={iconGhostControlVariants({ hover: 'destructive', layout: 'flex' })}
                      aria-label={`Remove ${row.definition.name}`}
                      onClick={() => onRemovePreset(row.entry.propertyId)}
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
                status: [{ kind: 'text', label: 'Custom property', variant: 'muted' }],
              }}
              trailing={{
                kind: 'utility',
                content: (
                  <button
                    type="button"
                    className={iconGhostControlVariants({ hover: 'text', layout: 'flex' })}
                    aria-label={`Edit ${row.name}`}
                    onClick={() => onOpenPropertyCreate(row.customId)}
                  >
                    <ActionIcon action="edit" />
                  </button>
                ),
              }}
            />
          ))}
          <ActionButton action="add" variant="ghost" onClick={onOpenPropertyBrowse}>
            Add magic property
          </ActionButton>
        </div>
      ) : (draft.magicProperties?.length ?? 0) > 0 ? (
        <SemanticText tone="warning">
          {(draft.magicProperties?.length ?? 0) === 1
            ? '1 magic property will be removed when you click Done.'
            : `${draft.magicProperties?.length} magic properties will be removed when you click Done.`}
        </SemanticText>
      ) : null}

      <div className="space-y-2">
        <Heading variant="subsection" as="h3">
          Adjustments
        </Heading>
        <Text variant="muted">
          Apply manual modifiers to attack rolls, damage rolls, or Armor Class.
        </Text>
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
                  label: `${formatSignedModifier(row.bonus)} adjustment`,
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
                  aria-label={`Edit ${effectTargetLabel(row.target)}`}
                  onClick={() => onOpenEffectForm(row.effectId)}
                >
                  <ActionIcon action="edit" />
                </button>
              ),
            }}
          />
        ))}
        <ActionButton action="add" variant="ghost" onClick={onOpenEffectChoose}>
          Add adjustment
        </ActionButton>
        <CombinedMechanicalModifiers draft={draft} magic={magic} totals={totals} />
      </div>
    </div>
  )
}

function EffectChooseBody({
  item,
  draft,
  existingTargets,
  onSelect,
}: {
  item: Equipment
  draft: { target?: EquipmentEffectTarget }
  existingTargets: Set<EquipmentEffectTarget>
  onSelect: (target: EquipmentEffectTarget) => void
}) {
  const targets = allowedEffectTargetsForEquipment(item)
  return (
    <RadioCard
      value={draft.target ?? ''}
      onValueChange={(value) => onSelect(value as EquipmentEffectTarget)}
      variant="card"
      options={targets.map((target) => ({
        value: target,
        label: effectTargetLabel(target),
        description: existingTargets.has(target)
          ? 'Already added. Edit it from the item.'
          : EFFECT_TARGET_DESCRIPTIONS[target],
        disabled: existingTargets.has(target),
      }))}
    />
  )
}

function EffectFormBody({
  draft,
  onChange,
  onChangeTarget,
}: {
  draft: {
    target?: EquipmentEffectTarget
    bonus: number
    notes?: string
  }
  onChange: (draft: { target?: EquipmentEffectTarget; bonus: number; notes?: string }) => void
  onChangeTarget: () => void
}) {
  return (
    <div className="space-y-4">
      <DecisionSummaryPanel
        rows={[
          {
            id: 'effect-target',
            label: 'Effect target',
            value: draft.target ? effectTargetLabel(draft.target) : '—',
            decisionId: 'effect-target',
            onNavigate: onChangeTarget,
          },
        ]}
      />
      <NumberStepper
        id="equipment-effect-modifier"
        label="Modifier"
        signDisplay="signed-prefix"
        value={draft.bonus}
        min={EQUIPMENT_EFFECT_BONUS_MIN}
        max={EQUIPMENT_EFFECT_BONUS_MAX}
        onChange={(bonus) => onChange({ ...draft, bonus: nextNonZeroBonus(draft.bonus, bonus) })}
        aria-label="Modifier"
      />
      <TextareaField
        id="equipment-effect-notes"
        label="Notes"
        hint="Optional. Shown with this effect."
        value={draft.notes ?? ''}
        onChange={(event) => onChange({ ...draft, notes: event.target.value || undefined })}
      />
    </div>
  )
}

function PropertyBrowseBody({
  presets,
  draft,
  sessionDraft,
  onDraftChange,
  onAdd,
}: {
  presets: ReturnType<typeof listPresetMagicPropertiesForItem>
  draft: { query: string; category: 'all' | 'enhancement' }
  sessionDraft: EquipmentInstance
  onDraftChange: (draft: { query: string; category: 'all' | 'enhancement' }) => void
  onAdd: (propertyId: string, replacePropertyId?: string) => void
}) {
  const currentEnhancement = sessionDraft.magicProperties?.find((row) => row.kind === 'preset')
  const filtered = presets.filter((row) => {
    if (draft.category === 'enhancement' && row.category !== 'enhancement') return false
    if (!draft.query.trim()) return true
    return row.name.toLowerCase().includes(draft.query.trim().toLowerCase())
  })

  return (
    <div className="space-y-4">
      <TextField
        id="equipment-property-search"
        label="Search"
        placeholder="Search properties"
        value={draft.query}
        onChange={(event) => onDraftChange({ ...draft, query: event.target.value })}
      />
      <ul className="space-y-2">
        {filtered.map((preset) => {
          const added =
            sessionDraft.magicProperties?.some(
              (row) => row.kind === 'preset' && row.propertyId === preset.id,
            ) ?? false
          return (
            <li key={preset.id}>
              <ContentFormEntitySelectionRow
                entity={{
                  heading: preset.name,
                  description: preset.description,
                }}
                trailing={{
                  kind: 'utility',
                  content: (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={added}
                      onClick={() =>
                        onAdd(
                          preset.id,
                          currentEnhancement?.kind === 'preset'
                            ? currentEnhancement.propertyId
                            : undefined,
                        )
                      }
                    >
                      {added ? 'Added' : currentEnhancement ? 'Replace' : 'Add'}
                    </Button>
                  ),
                }}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function PropertyCreateBody({
  draft,
  onChange,
}: {
  draft: { name: string; description: string }
  onChange: (draft: { name: string; description: string; customId?: string }) => void
}) {
  return (
    <div className="space-y-4">
      <TextField
        id="equipment-custom-property-name"
        label="Property name"
        required
        value={draft.name}
        onChange={(event) => onChange({ ...draft, name: event.target.value })}
      />
      <TextareaField
        id="equipment-custom-property-description"
        label="Description"
        required
        hint="Custom properties describe rules or behavior but don't automatically apply mechanical effects."
        value={draft.description}
        onChange={(event) => onChange({ ...draft, description: event.target.value })}
      />
    </div>
  )
}

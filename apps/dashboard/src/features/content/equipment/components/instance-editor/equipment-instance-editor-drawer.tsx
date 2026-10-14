import { useMemo, useReducer, type Dispatch } from 'react'

import {
  EQUIPMENT_EFFECT_BONUS_MAX,
  EQUIPMENT_EFFECT_BONUS_MIN,
  nextNonZeroBonus,
  resolveEquipmentEntryEffectTotals,
  resolveEquipmentMagicProperties,
  type Equipment,
  type EquipmentEffectTarget,
  type EquipmentInstance,
  type MagicPropertyDefinition,
  type MagicPropertyDefinitionProvider,
  type SystemRulesetId,
} from '@rpg/contracts'
import {
  Button,
  DecisionSummaryPanel,
  Heading,
  NumberStepper,
  RadioCard,
  SearchBar,
  SemanticText,
  Text,
  TextareaField,
  TextField,
} from '@rpg/ui'

import { DrawerShell } from '@/components/drawer'
import { useUnsavedChangesConfirm } from '@/lib/use-unsaved-changes-confirm'
import { ContentFormEntitySelectionRow } from '../../../lib/forms/selection/content-form-entity-selection-row'
import { commitEquipmentEditorSession } from '../../lib/instance-editor/commit-equipment-editor-session'
import {
  createEquipmentEditorState,
  equipmentEditorReducer,
  isEquipmentEditorSessionDirty,
} from '../../lib/instance-editor/equipment-editor-reducer'
import type {
  EquipmentEditorAction,
  EquipmentEditorMode,
  EquipmentEditorState,
} from '../../lib/instance-editor/equipment-editor-types'
import {
  EQUIPMENT_INSTANCE_EDITOR_CUSTOM_PROPERTY_DESCRIPTION_HINT,
  EQUIPMENT_INSTANCE_EDITOR_EFFECT_ALREADY_ADDED_DESCRIPTION,
  EQUIPMENT_INSTANCE_EDITOR_EFFECT_TARGET_FIELD_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_MODIFIER_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_NOTES_HINT,
  EQUIPMENT_INSTANCE_EDITOR_NOTES_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_PROPERTY_ADD_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_PROPERTY_ADDED_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_PROPERTY_DESCRIPTION_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_PROPERTY_NAME_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_PROPERTY_REPLACE_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_PROPERTY_SEARCH_ARIA_LABEL,
  EQUIPMENT_INSTANCE_EDITOR_PROPERTY_SEARCH_PLACEHOLDER,
  EQUIPMENT_INSTANCE_EDITOR_SCOPE_ALL_COPIES_DESCRIPTION,
  EQUIPMENT_INSTANCE_EDITOR_SCOPE_ONE_COPY_DESCRIPTION,
  EQUIPMENT_INSTANCE_EDITOR_SCOPE_ONE_COPY_LABEL,
  equipmentInstanceEditorBackTargetLabel,
  equipmentInstanceEditorModeTitle,
  formatEquipmentInstanceEditorBackAriaLabel,
  formatScopeAllCopiesLabel,
  formatScopeChooseCustomizationCopy,
  formatScopeCustomizeHeading,
  formatScopeSubjectIntro,
} from '../../lib/instance-editor/equipment-instance-editor-form-labels'
import {
  allowedEffectTargetsForEquipment,
  createDefaultMagicPropertyProvider,
  effectTargetDescription,
  effectTargetLabel,
  equipmentInstanceEditorKindHeadline,
  filterPresetMagicPropertiesForBrowse,
  listPresetMagicPropertiesForItem,
  presetPropertyBrowseChoice,
} from '../../lib/instance-editor/equipment-instance-editor.lib'
import { EquipmentInstanceEditorFooter } from './equipment-instance-editor-footer'
import { EquipmentInstanceEditorMainBody } from './equipment-instance-editor-main-body'

const PRESET_BROWSE_ACTION_LABEL = {
  add: EQUIPMENT_INSTANCE_EDITOR_PROPERTY_ADD_LABEL,
  replace: EQUIPMENT_INSTANCE_EDITOR_PROPERTY_REPLACE_LABEL,
  added: EQUIPMENT_INSTANCE_EDITOR_PROPERTY_ADDED_LABEL,
} as const

type EditorDispatch = Dispatch<EquipmentEditorAction>

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

export function EquipmentInstanceEditorDrawer<T extends EquipmentInstance & { entryId: string }>(
  props: EquipmentInstanceEditorDrawerProps<T>,
) {
  if (!props.open) return null
  return <EquipmentInstanceEditorDrawerInner key={props.sourceEntry.entryId} {...props} />
}

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
  const definitions = useMemo(
    () => definitionsProp ?? createDefaultMagicPropertyProvider(rulesetId),
    [definitionsProp, rulesetId],
  )

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
      : equipmentInstanceEditorModeTitle(state)

  const backTarget = equipmentInstanceEditorBackTargetLabel(state)
  const showBack = state.mode.kind !== 'main' && state.mode.kind !== 'scope' && backTarget !== null

  return (
    <>
      <DrawerShell
        open={open}
        onOpenChange={handleOpenChange}
        title={headline}
        headerBack={
          showBack && backTarget
            ? {
                ariaLabel: formatEquipmentInstanceEditorBackAriaLabel(backTarget),
                onClick: () => dispatch({ type: 'back' }),
              }
            : undefined
        }
        footer={
          <EquipmentInstanceEditorFooter
            mode={state.mode}
            dispatch={dispatch}
            onRequestClose={requestClose}
            onDone={handleDone}
          />
        }
      >
        <EquipmentInstanceEditorBody
          state={state}
          dispatch={dispatch}
          catalogItem={catalogItem}
          subjectNoun={subjectNoun}
          referencedByLabel={referencedByLabel}
          sourceQuantity={sourceEntry.quantity ?? 1}
          magic={magic}
          totals={totals}
          presets={presets}
        />
      </DrawerShell>
      {discardGuard.dialog}
    </>
  )
}

function EquipmentInstanceEditorBody({
  state,
  dispatch,
  catalogItem,
  subjectNoun,
  referencedByLabel,
  sourceQuantity,
  magic,
  totals,
  presets,
}: {
  state: EquipmentEditorState
  dispatch: EditorDispatch
  catalogItem: Equipment
  subjectNoun: 'creature' | 'character'
  referencedByLabel?: string
  sourceQuantity: number
  magic: ReturnType<typeof resolveEquipmentMagicProperties>
  totals: ReturnType<typeof resolveEquipmentEntryEffectTotals>
  presets: MagicPropertyDefinition[]
}) {
  const mode = state.mode
  switch (mode.kind) {
    case 'scope':
      return (
        <ScopeModeBody
          entryName={catalogItem.name}
          quantity={sourceQuantity}
          subjectNoun={subjectNoun}
          scope={state.session.scope}
          referencedByLabel={referencedByLabel}
          onScopeChange={(scope) => dispatch({ type: 'setScope', scope })}
        />
      )
    case 'main':
      return (
        <EquipmentInstanceEditorMainBody
          state={state}
          catalogItem={catalogItem}
          magic={magic}
          totals={totals}
          hasPresetProperties={presets.length > 0}
          dispatch={dispatch}
        />
      )
    case 'effectChoose':
      return (
        <EffectChooseBody
          item={catalogItem}
          mode={mode}
          existingTargets={new Set(state.session.draft.adjustments?.map((row) => row.target) ?? [])}
          dispatch={dispatch}
        />
      )
    case 'effectForm':
      return <EffectFormBody mode={mode} dispatch={dispatch} />
    case 'propertyBrowse':
      return (
        <PropertyBrowseBody
          presets={presets}
          mode={mode}
          sessionDraft={state.session.draft}
          dispatch={dispatch}
        />
      )
    case 'propertyCreate':
      return <PropertyCreateBody mode={mode} dispatch={dispatch} />
  }
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
  const subjectIntro = formatScopeSubjectIntro(subjectNoun, quantity, entryName)
  return (
    <div className="space-y-4">
      <Heading variant="subsection" as="h3">
        {formatScopeCustomizeHeading(entryName)}
      </Heading>
      <Text variant="muted">{formatScopeChooseCustomizationCopy(subjectIntro)}</Text>
      <RadioCard
        value={scope}
        onValueChange={(value) => onScopeChange(value as 'one' | 'all')}
        options={[
          {
            value: 'one',
            label: EQUIPMENT_INSTANCE_EDITOR_SCOPE_ONE_COPY_LABEL,
            description: EQUIPMENT_INSTANCE_EDITOR_SCOPE_ONE_COPY_DESCRIPTION,
          },
          {
            value: 'all',
            label: formatScopeAllCopiesLabel(quantity),
            description: EQUIPMENT_INSTANCE_EDITOR_SCOPE_ALL_COPIES_DESCRIPTION,
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

function EffectChooseBody({
  item,
  mode,
  existingTargets,
  dispatch,
}: {
  item: Equipment
  mode: Extract<EquipmentEditorMode, { kind: 'effectChoose' }>
  existingTargets: Set<EquipmentEffectTarget>
  dispatch: EditorDispatch
}) {
  const targets = allowedEffectTargetsForEquipment(item)
  return (
    <RadioCard
      value={mode.draft.target ?? ''}
      onValueChange={(value) =>
        dispatch({
          type: 'openEffectChoose',
          draft: { ...mode.draft, target: value as EquipmentEffectTarget },
          returnTo: mode.returnTo,
        })
      }
      variant="card"
      options={targets.map((target) => ({
        value: target,
        label: effectTargetLabel(target),
        description: existingTargets.has(target)
          ? EQUIPMENT_INSTANCE_EDITOR_EFFECT_ALREADY_ADDED_DESCRIPTION
          : effectTargetDescription(target),
        disabled: existingTargets.has(target),
      }))}
    />
  )
}

function EffectFormBody({
  mode,
  dispatch,
}: {
  mode: Extract<EquipmentEditorMode, { kind: 'effectForm' }>
  dispatch: EditorDispatch
}) {
  const { draft } = mode
  return (
    <div className="space-y-4">
      <DecisionSummaryPanel
        rows={[
          {
            id: 'effect-target',
            label: EQUIPMENT_INSTANCE_EDITOR_EFFECT_TARGET_FIELD_LABEL,
            value: draft.target ? effectTargetLabel(draft.target) : '—',
            decisionId: 'effect-target',
            onNavigate: () =>
              dispatch({
                type: 'openEffectChoose',
                draft,
                returnTo: 'effectForm',
              }),
          },
        ]}
      />
      <NumberStepper
        id="equipment-effect-modifier"
        label={EQUIPMENT_INSTANCE_EDITOR_MODIFIER_LABEL}
        signDisplay="signed-prefix"
        value={draft.bonus}
        min={EQUIPMENT_EFFECT_BONUS_MIN}
        max={EQUIPMENT_EFFECT_BONUS_MAX}
        onChange={(bonus) =>
          dispatch({
            type: 'openEffectForm',
            draft: { ...draft, bonus: nextNonZeroBonus(draft.bonus, bonus) },
            origin: mode.origin,
          })
        }
        aria-label={EQUIPMENT_INSTANCE_EDITOR_MODIFIER_LABEL}
      />
      <TextareaField
        id="equipment-effect-notes"
        label={EQUIPMENT_INSTANCE_EDITOR_NOTES_LABEL}
        hint={EQUIPMENT_INSTANCE_EDITOR_NOTES_HINT}
        value={draft.notes ?? ''}
        onChange={(event) =>
          dispatch({
            type: 'openEffectForm',
            draft: { ...draft, notes: event.target.value || undefined },
            origin: mode.origin,
          })
        }
      />
    </div>
  )
}

function PropertyBrowseBody({
  presets,
  mode,
  sessionDraft,
  dispatch,
}: {
  presets: readonly MagicPropertyDefinition[]
  mode: Extract<EquipmentEditorMode, { kind: 'propertyBrowse' }>
  sessionDraft: EquipmentInstance
  dispatch: EditorDispatch
}) {
  const filtered = filterPresetMagicPropertiesForBrowse(presets, mode.draft)

  return (
    <div className="space-y-4">
      <SearchBar
        id="equipment-property-search"
        value={mode.draft.query}
        onValueChange={(query) =>
          dispatch({ type: 'openPropertyBrowse', draft: { ...mode.draft, query } })
        }
        placeholder={EQUIPMENT_INSTANCE_EDITOR_PROPERTY_SEARCH_PLACEHOLDER}
        ariaLabel={EQUIPMENT_INSTANCE_EDITOR_PROPERTY_SEARCH_ARIA_LABEL}
      />
      <ul className="space-y-2">
        {filtered.map((preset) => {
          const choice = presetPropertyBrowseChoice(sessionDraft, preset.id)
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
                      disabled={choice.action === 'added'}
                      onClick={() =>
                        dispatch({
                          type: 'commitPresetProperty',
                          propertyId: preset.id,
                          replacePropertyId: choice.replacePropertyId,
                        })
                      }
                    >
                      {PRESET_BROWSE_ACTION_LABEL[choice.action]}
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
  mode,
  dispatch,
}: {
  mode: Extract<EquipmentEditorMode, { kind: 'propertyCreate' }>
  dispatch: EditorDispatch
}) {
  const { draft } = mode
  return (
    <div className="space-y-4">
      <TextField
        id="equipment-custom-property-name"
        label={EQUIPMENT_INSTANCE_EDITOR_PROPERTY_NAME_LABEL}
        required
        value={draft.name}
        onChange={(event) =>
          dispatch({
            type: 'openPropertyCreate',
            draft: { ...draft, name: event.target.value },
            origin: mode.origin,
          })
        }
      />
      <TextareaField
        id="equipment-custom-property-description"
        label={EQUIPMENT_INSTANCE_EDITOR_PROPERTY_DESCRIPTION_LABEL}
        required
        hint={EQUIPMENT_INSTANCE_EDITOR_CUSTOM_PROPERTY_DESCRIPTION_HINT}
        value={draft.description}
        onChange={(event) =>
          dispatch({
            type: 'openPropertyCreate',
            draft: { ...draft, description: event.target.value },
            origin: mode.origin,
          })
        }
      />
    </div>
  )
}

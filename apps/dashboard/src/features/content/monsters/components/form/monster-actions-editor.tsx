import { useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import { useFormContext, type UseFormReturn } from 'react-hook-form'
import {
  ABILITY_IDS,
  getAbilityLabel,
  getContentTypeTerm,
  getDamageTypeLabel,
  getMonsterActionKindLabel,
  getWeaponModeLabel,
  resolveMonsterReactionTrigger,
  SPELL_COMPONENT_ENTRIES,
  SPELL_COMPONENT_IDS,
  isWeaponEquipment,
  MONSTER_ACTION_KINDS,
  resolveEquipmentInstanceReferenceLabel,
  type Equipment,
  type MagicPropertyDefinitionProvider,
  type MonsterActionKind,
  type SystemRulesetId,
} from '@rpg/contracts'
import { Button, ConfirmDialog, SemanticText, Text } from '@rpg/ui'

import { referenceWeaponComboboxFieldOptions } from '../../../lib/form-options/content-field-option.lib'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { MasterDetailGrid } from '../../../components/master-detail/master-detail-grid'
import { useMonsterActionSections } from '../../hooks/use-monster-action-sections'
import {
  createMonsterRowId,
  MONSTER_NATURAL_WEAPON_PRESETS,
  monsterActionSectionHeading,
  type MonsterActionDraftRow,
  type MonsterActionPresetId,
} from '../../lib/actions/monster-action-presets'
import { collectMonsterFormAdvisories } from '../../lib/monster-form-advisories'
import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from '../../lib/actions/monster-action-equipment-references'
import { monsterEquipmentCatalog } from '../../lib/monster-form-derivation'
import {
  MONSTER_ACTION_DETAIL_EMPTY,
  MONSTER_ACTION_NAME_LABEL,
  MONSTER_ACTIONS_EMPTY,
  MONSTER_ADDITIONAL_CONDITION_HINT,
  MONSTER_ADDITIONAL_CONDITION_LABEL,
  MONSTER_ADD_LABEL,
  MONSTER_CANCEL_LABEL,
  MONSTER_CUSTOM_DESCRIPTION_LABEL,
  MONSTER_KIND_LABEL,
  MONSTER_KIND_SWITCH_KEEP,
  MONSTER_MOVE_DOWN_LABEL,
  MONSTER_MOVE_TO_LABEL,
  MONSTER_MOVE_UP_LABEL,
  MONSTER_REMOVE_LABEL,
  MONSTER_SECTION_EMPTY,
  MONSTER_SPECIAL_PRESET_HINT,
  MONSTER_SPELL_PRESET_HINT,
  MONSTER_TRIGGER_LABEL,
  MONSTER_WEAPON_PRESET_HINT,
  MONSTER_DROP_TRIGGER_CONFIRM,
  formatAddedEquipmentNotice,
  formatDropTriggerBody,
  formatKindSwitchConfirm,
  formatKindSwitchTitle,
  formatWeaponSwapNotice,
  monsterAddWeaponShortcut,
} from '../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../lib/monster-form-values'

const DAMAGE_TYPE_OPTIONS = ['slashing', 'piercing', 'bludgeoning', 'fire', 'cold', 'poison']

type Sections = ReturnType<typeof useMonsterActionSections>
type LocatedAction = {
  action: MonsterActionDraftRow
  section: MonsterActionSection
  index: number
}
type EquipmentCatalog = ReadonlyMap<string, Equipment>
type EquipmentRows = MonsterFormValues['equipment']

function actionTitle(action: MonsterActionDraftRow, index: number): string {
  return action.name?.trim() || `Action ${index + 1}`
}

function useFocusAction(token: number, id: string | null) {
  useEffect(() => {
    if (token === 0 || !id) return
    document.getElementById(`monster-action-focus-${id}`)?.focus()
  }, [token, id])
}

function linkedEquipmentName(
  action: MonsterActionDraftRow,
  equipment: EquipmentRows,
  catalog: EquipmentCatalog,
  provider: MagicPropertyDefinitionProvider,
  siblingEntries: readonly MonsterFormValues['equipment'][number][] = equipment ?? [],
): string | undefined {
  const entry = (equipment ?? []).find((row) => row.entryId === action.equipmentEntryId)
  if (!entry) return action.equipmentEntryId
  return resolveEquipmentInstanceReferenceLabel(
    entry,
    catalog.get(entry.equipmentId),
    provider,
    siblingEntries,
  )
}

function withWeaponMode(
  action: MonsterActionDraftRow,
  mode: 'melee' | 'ranged',
): MonsterActionDraftRow {
  const next: MonsterActionDraftRow = { ...action, mode }
  if (mode === 'ranged') {
    delete next.reach
    return next
  }
  delete next.range
  next.reach = 5
  return next
}

function linkNewWeapon(
  form: UseFormReturn<MonsterFormValues>,
  sections: Sections,
  located: LocatedAction,
  equipmentId: string,
  name: string,
  focus: RefObject<HTMLSelectElement | null>,
) {
  const entryId = createMonsterRowId()
  const equipment = [
    ...(form.getValues('equipment') ?? []),
    { entryId, equipmentId, quantity: 1, equipped: true },
  ]
  form.setValue('equipment', equipment, { shouldDirty: true })
  sections.replaceAction(located.section, located.index, {
    ...located.action,
    equipmentEntryId: entryId,
  })
  sections.setNotice(formatAddedEquipmentNotice(name))
  queueMicrotask(() => focus.current?.focus())
}

function ActionPresetMenu({
  section,
  onChoose,
}: {
  section: MonsterActionSection
  onChoose: (presetId: MonsterActionPresetId) => void
}) {
  return (
    <div role="menu" aria-label={monsterActionSectionHeading(section)}>
      <Button type="button" onClick={() => onChoose('weapon')}>
        Weapon
        <Text>{MONSTER_WEAPON_PRESET_HINT}</Text>
      </Button>
      {MONSTER_NATURAL_WEAPON_PRESETS.map((preset) => (
        <Button key={preset.id} type="button" onClick={() => onChoose(preset.id)}>
          {preset.name}
          <Text>{getDamageTypeLabel(preset.damageType)}</Text>
        </Button>
      ))}
      <Button type="button" onClick={() => onChoose('special')}>
        Special
        <Text>{MONSTER_SPECIAL_PRESET_HINT}</Text>
      </Button>
      <Button type="button" onClick={() => onChoose('spell')}>
        Spell
        <Text>{MONSTER_SPELL_PRESET_HINT}</Text>
      </Button>
    </div>
  )
}

function ActionListRow({
  row,
  index,
  selected,
  showError,
  onSelect,
  onMoveUp,
  onMoveDown,
}: {
  row: MonsterActionDraftRow
  index: number
  selected: boolean
  showError: boolean
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const title = actionTitle(row, index)
  return (
    <li>
      <button type="button" aria-current={selected ? 'true' : undefined} onClick={onSelect}>
        {title}
        {showError ? <span>Needs attention</span> : null}
      </button>
      <Button
        id={selected ? `monster-action-focus-${row.id}` : undefined}
        type="button"
        aria-label={`${MONSTER_MOVE_UP_LABEL} ${title}`}
        onClick={onMoveUp}
      >
        {MONSTER_MOVE_UP_LABEL}
      </Button>
      <Button type="button" aria-label={`${MONSTER_MOVE_DOWN_LABEL} ${title}`} onClick={onMoveDown}>
        {MONSTER_MOVE_DOWN_LABEL}
      </Button>
    </li>
  )
}

function ActionSectionColumn({
  values,
  sections,
  chooser,
  onToggleChooser,
}: {
  values: MonsterFormValues
  sections: Sections
  chooser: MonsterActionSection | null
  onToggleChooser: (section: MonsterActionSection | null) => void
}) {
  return (
    <div>
      {MONSTER_ACTION_SECTIONS.map((section) => (
        <ActionSectionBlock
          key={section}
          section={section}
          rows={(values[section] ?? []) as MonsterActionDraftRow[]}
          sections={sections}
          open={chooser === section}
          onToggleChooser={onToggleChooser}
        />
      ))}
    </div>
  )
}

function ActionSectionBlock({
  section,
  rows,
  sections,
  open,
  onToggleChooser,
}: {
  section: MonsterActionSection
  rows: MonsterActionDraftRow[]
  sections: Sections
  open: boolean
  onToggleChooser: (section: MonsterActionSection | null) => void
}) {
  const form = useFormContext<MonsterFormValues>()
  return (
    <section aria-label={monsterActionSectionHeading(section)}>
      <h3>{monsterActionSectionHeading(section)}</h3>
      <Button type="button" onClick={() => onToggleChooser(open ? null : section)}>
        {MONSTER_ADD_LABEL}
      </Button>
      {open ? (
        <ActionPresetMenu
          section={section}
          onChoose={(presetId) => {
            sections.addPreset(section, presetId)
            onToggleChooser(null)
          }}
        />
      ) : null}
      {rows.length === 0 ? (
        <p>{section === 'actions' ? MONSTER_ACTIONS_EMPTY : MONSTER_SECTION_EMPTY}</p>
      ) : (
        <ul>
          {rows.map((row, index) => (
            <ActionListRow
              key={row.id}
              row={row}
              index={index}
              selected={row.id === sections.selectedActionId}
              showError={form.formState.submitCount > 0 && sections.hasRowError(section, index)}
              onSelect={() => sections.setSelectedActionId(row.id)}
              onMoveUp={() => sections.reorder(section, index, index - 1)}
              onMoveDown={() => sections.reorder(section, index, index + 1)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function WeaponEquipmentControls({
  action,
  equipment,
  catalog,
  provider,
  equipmentSelectRef,
  addingWeapon,
  weaponChoices,
  onWeaponSwap,
  onAddWeapon,
  onToggleAddWeapon,
}: {
  action: MonsterActionDraftRow
  equipment: EquipmentRows
  catalog: EquipmentCatalog
  provider: MagicPropertyDefinitionProvider
  equipmentSelectRef: RefObject<HTMLSelectElement | null>
  addingWeapon: boolean
  weaponChoices: { value: string; label: string }[]
  onWeaponSwap: (entryId: string, name: string) => void
  onAddWeapon: (equipmentId: string, name: string) => void
  onToggleAddWeapon: () => void
}) {
  const ownedWeapons = (equipment ?? []).filter((entry) => {
    const item = catalog.get(entry.equipmentId)
    return item ? isWeaponEquipment(item) : false
  })
  const label = getContentTypeTerm('equipment').label
  return (
    <>
      <label>
        {label}
        <select
          ref={equipmentSelectRef}
          aria-label={label}
          value={action.equipmentEntryId ?? ''}
          onChange={(event) => {
            const entryId = event.target.value
            onWeaponSwap(
              entryId,
              linkedEquipmentName(
                { ...action, equipmentEntryId: entryId },
                equipment,
                catalog,
                provider,
                ownedWeapons,
              ) ?? entryId,
            )
          }}
        >
          <option value="">Select</option>
          {ownedWeapons.map((entry) => (
            <option key={entry.entryId} value={entry.entryId}>
              {resolveEquipmentInstanceReferenceLabel(
                entry,
                catalog.get(entry.equipmentId),
                provider,
                ownedWeapons,
              )}
            </option>
          ))}
        </select>
      </label>
      {ownedWeapons.length === 0 ? (
        <Button type="button" onClick={onToggleAddWeapon}>
          {monsterAddWeaponShortcut()}
        </Button>
      ) : null}
      {addingWeapon ? (
        <div>
          {weaponChoices.map((choice) => (
            <Button
              key={choice.value}
              type="button"
              onClick={() => onAddWeapon(choice.value, choice.label)}
            >
              {choice.label}
            </Button>
          ))}
          <Button type="button" onClick={onToggleAddWeapon}>
            {MONSTER_CANCEL_LABEL}
          </Button>
        </div>
      ) : null}
    </>
  )
}

function NaturalWeaponControls({
  action,
  prefix,
  onChange,
}: {
  action: MonsterActionDraftRow
  prefix: string
  onChange: (next: MonsterActionDraftRow) => void
}) {
  const { clearErrors } = useFormContext<MonsterFormValues>()
  return (
    <>
      <div role="group" aria-label="Mode">
        {(['melee', 'ranged'] as const).map((mode) => (
          <Button
            key={mode}
            type="button"
            aria-pressed={action.mode === mode}
            onClick={() => {
              clearErrors(`${prefix}.reach`)
              clearErrors(`${prefix}.range`)
              onChange(withWeaponMode(action, mode))
            }}
          >
            {getWeaponModeLabel(mode)}
          </Button>
        ))}
      </div>
      <NaturalWeaponMeasure action={action} onChange={onChange} />
      <label>
        Damage type
        <select
          aria-label="Damage type"
          value={action.damageType ?? ''}
          onChange={(event) => onChange({ ...action, damageType: event.target.value })}
        >
          <option value="">Select</option>
          {DAMAGE_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {getDamageTypeLabel(type)}
            </option>
          ))}
        </select>
      </label>
    </>
  )
}

function NaturalWeaponMeasure({
  action,
  onChange,
}: {
  action: MonsterActionDraftRow
  onChange: (next: MonsterActionDraftRow) => void
}) {
  if (action.mode === 'ranged') {
    return (
      <label>
        Range
        <input
          aria-label="Range"
          type="number"
          value={action.range?.normal ?? ''}
          onChange={(event) => {
            const normal = Number(event.target.value)
            onChange({
              ...action,
              range: Number.isFinite(normal) && normal > 0 ? { normal } : undefined,
            })
          }}
        />
      </label>
    )
  }
  return (
    <label>
      Reach
      <input
        aria-label="Reach"
        type="number"
        value={action.reach ?? ''}
        onChange={(event) =>
          onChange({ ...action, reach: Number(event.target.value) || undefined })
        }
      />
    </label>
  )
}

function RechargeLimitFields({
  action,
  onChange,
}: {
  action: MonsterActionDraftRow
  onChange: (next: MonsterActionDraftRow) => void
}) {
  if (action.limitedUse?.kind !== 'recharge') return null
  return (
    <label>
      Minimum roll
      <input
        aria-label="Minimum roll"
        type="number"
        min={2}
        max={6}
        value={action.limitedUse.minRoll ?? ''}
        onChange={(event) => {
          const minRoll = event.target.value === '' ? undefined : Number(event.target.value)
          onChange({
            ...action,
            limitedUse: { kind: 'recharge', ...(minRoll === undefined ? {} : { minRoll }) },
          })
        }}
      />
    </label>
  )
}

function UsesLimitFields({
  action,
  onChange,
}: {
  action: MonsterActionDraftRow
  onChange: (next: MonsterActionDraftRow) => void
}) {
  if (action.limitedUse?.kind !== 'uses') return null
  const limitedUse = action.limitedUse
  return (
    <>
      <label>
        Count
        <select
          aria-label="Count"
          value={limitedUse.count?.kind ?? ''}
          onChange={(event) => onChange(usesCountChange(action, event.target.value))}
        >
          <option value="">Choose</option>
          <option value="fixed">Fixed number</option>
          <option value="proficiency-bonus">Proficiency bonus</option>
        </select>
      </label>
      <FixedUseCountField action={action} onChange={onChange} />
      <label>
        Recovers on
        <select
          aria-label="Recovers on"
          value={limitedUse.recovery?.minimumRest ?? ''}
          onChange={(event) => onChange(usesRestChange(action, event.target.value))}
        >
          <option value="">Choose</option>
          <option value="short">Short Rest</option>
          <option value="long">Long Rest</option>
        </select>
      </label>
    </>
  )
}

function FixedUseCountField({
  action,
  onChange,
}: {
  action: MonsterActionDraftRow
  onChange: (next: MonsterActionDraftRow) => void
}) {
  if (action.limitedUse?.kind !== 'uses' || action.limitedUse.count?.kind !== 'fixed') return null
  return (
    <label>
      Uses
      <input
        aria-label="Uses"
        type="number"
        min={1}
        value={action.limitedUse.count.value ?? ''}
        onChange={(event) => onChange(fixedUseValueChange(action, event.target.value))}
      />
    </label>
  )
}

function usesCountChange(action: MonsterActionDraftRow, countKind: string): MonsterActionDraftRow {
  const recovery = action.limitedUse?.kind === 'uses' ? action.limitedUse.recovery : undefined
  if (countKind === 'proficiency-bonus') {
    return {
      ...action,
      limitedUse: { kind: 'uses', recovery, count: { kind: 'proficiency-bonus' } },
    }
  }
  if (countKind === 'fixed') {
    return { ...action, limitedUse: { kind: 'uses', recovery, count: { kind: 'fixed' } } }
  }
  return { ...action, limitedUse: { kind: 'uses', recovery } }
}

function fixedUseValueChange(action: MonsterActionDraftRow, raw: string): MonsterActionDraftRow {
  const recovery = action.limitedUse?.kind === 'uses' ? action.limitedUse.recovery : undefined
  const value = raw === '' ? undefined : Number(raw)
  return {
    ...action,
    limitedUse: {
      kind: 'uses',
      recovery,
      count: value === undefined ? { kind: 'fixed' } : { kind: 'fixed', value },
    },
  }
}

function usesRestChange(action: MonsterActionDraftRow, minimumRest: string): MonsterActionDraftRow {
  const count = action.limitedUse?.kind === 'uses' ? action.limitedUse.count : undefined
  if (minimumRest !== 'short' && minimumRest !== 'long') {
    return { ...action, limitedUse: { kind: 'uses', count } }
  }
  return { ...action, limitedUse: { kind: 'uses', count, recovery: { minimumRest } } }
}

function LimitedUseFields({
  action,
  onChange,
}: {
  action: MonsterActionDraftRow
  onChange: (next: MonsterActionDraftRow) => void
}) {
  const kind = action.limitedUse?.kind ?? 'none'
  return (
    <div>
      <label>
        Limit
        <select
          aria-label="Limit"
          value={kind}
          onChange={(event) => {
            const next = event.target.value
            if (next === 'none') {
              const { limitedUse: _limitedUse, ...rest } = action
              onChange(rest)
              return
            }
            if (next === 'recharge') onChange({ ...action, limitedUse: { kind: 'recharge' } })
            if (next === 'uses') onChange({ ...action, limitedUse: { kind: 'uses' } })
          }}
        >
          <option value="none">No limit</option>
          <option value="uses">Uses</option>
          <option value="recharge">Recharge</option>
        </select>
      </label>
      <RechargeLimitFields action={action} onChange={onChange} />
      <UsesLimitFields action={action} onChange={onChange} />
    </div>
  )
}

function spellAbilityValue(action: MonsterActionDraftRow): string {
  if (action.castingAbility?.kind === 'ability') return action.castingAbility.ability
  if (action.castingAbility?.kind === 'shared') return `shared:${action.castingAbility.entryId}`
  return ''
}

function applySpellAbility(action: MonsterActionDraftRow, value: string): MonsterActionDraftRow {
  if (!value) {
    const { castingAbility: _castingAbility, ...rest } = action
    return rest
  }
  if (value.startsWith('shared:')) {
    return {
      ...action,
      castingAbility: { kind: 'shared', entryId: value.slice('shared:'.length) },
    }
  }
  return { ...action, castingAbility: { kind: 'ability', ability: value as never } }
}

function SpellActionFields({
  ctx,
  action,
  section,
  onChange,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
  section: MonsterActionSection
  onChange: (next: MonsterActionDraftRow) => void
}) {
  const { getValues } = useFormContext<MonsterFormValues>()
  if (action.kind !== 'spell') return null
  const values = getValues()
  const spellOptions = [...(ctx.spellCatalogById?.values() ?? [])]
  const sharedTargets = (
    [...values.actions, ...values.bonusActions, ...values.reactions] as MonsterActionDraftRow[]
  ).filter(
    (entry) =>
      entry.kind === 'spell' &&
      entry.id !== action.id &&
      entry.castingAbility?.kind === 'ability' &&
      entry.name,
  )
  const spells = action.spells ?? []
  const sharedPool = Boolean(action.limitedUse)

  return (
    <div>
      <label>
        Spellcasting ability
        <select
          aria-label="Spellcasting ability"
          value={spellAbilityValue(action)}
          onChange={(event) => onChange(applySpellAbility(action, event.target.value))}
        >
          <option value="">Choose</option>
          {ABILITY_IDS.map((ability) => (
            <option key={ability} value={ability}>
              {getAbilityLabel(ability)}
            </option>
          ))}
          {sharedTargets.map((entry) => (
            <option key={entry.id} value={`shared:${entry.id}`}>
              Same as {entry.name}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend>Omitted components</legend>
        {SPELL_COMPONENT_IDS.map((component) => (
          <label key={component}>
            <input
              type="checkbox"
              checked={action.omittedComponents?.includes(component) ?? false}
              onChange={(event) => {
                const current = action.omittedComponents ?? []
                onChange({
                  ...action,
                  omittedComponents: event.target.checked
                    ? [...current, component]
                    : current.filter((id) => id !== component),
                })
              }}
            />
            {SPELL_COMPONENT_ENTRIES[component].label}
          </label>
        ))}
      </fieldset>
      <label>
        <input
          type="checkbox"
          checked={sharedPool}
          onChange={(event) => {
            if (event.target.checked) {
              onChange({
                ...action,
                limitedUse: action.limitedUse ?? { kind: 'uses' },
                spells: spells.map(({ limitedUse: _limitedUse, ...spell }) => spell),
              })
              return
            }
            const { limitedUse: _limitedUse, ...rest } = action
            onChange(rest)
          }}
        />
        Shared pool for every spell
      </label>
      {sharedPool ? <Text>All spell choices consume the same pool.</Text> : null}
      {sharedPool ? <LimitedUseFields action={action} onChange={onChange} /> : null}
      {spells.map((spell, index) => (
        <div key={`${action.id}-spell-${index}`}>
          <label>
            Spell
            <select
              aria-label={`Spell ${index + 1}`}
              value={spell.spellId ?? ''}
              onChange={(event) => {
                const spellId = event.target.value || undefined
                onChange({
                  ...action,
                  spells: spells.map((entry, spellIndex) =>
                    spellIndex === index ? { ...entry, spellId } : entry,
                  ),
                })
              }}
            >
              <option value="">Choose</option>
              {spellOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cast at level
            <input
              aria-label={`Cast at level ${index + 1}`}
              type="number"
              min={0}
              max={9}
              value={spell.castAtLevel ?? ''}
              onChange={(event) => {
                const castAtLevel =
                  event.target.value === '' ? undefined : Number(event.target.value)
                onChange({
                  ...action,
                  spells: spells.map((entry, spellIndex) =>
                    spellIndex === index ? { ...entry, castAtLevel } : entry,
                  ),
                })
              }}
            />
          </label>
          {sharedPool ? null : (
            <LimitedUseFields
              action={{ ...action, limitedUse: spell.limitedUse }}
              onChange={(next) => {
                onChange({
                  ...action,
                  spells: spells.map((entry, spellIndex) =>
                    spellIndex === index ? { ...entry, limitedUse: next.limitedUse } : entry,
                  ),
                })
              }}
            />
          )}
        </div>
      ))}
      <Button
        type="button"
        onClick={() => onChange({ ...action, spells: [...spells, { spellId: undefined }] })}
      >
        Add spell
      </Button>
      <InheritedSpellTriggers ctx={ctx} action={action} section={section} />
    </div>
  )
}

function InheritedSpellTriggers({
  ctx,
  action,
  section,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
  section: MonsterActionSection
}) {
  if (section !== 'reactions' || action.kind !== 'spell') return null
  const resolution = resolveMonsterReactionTrigger({
    action,
    spellsById: ctx.spellCatalogById,
    catalogStatus: ctx.spellCatalogStatus === 'ready' ? 'ready' : 'unavailable',
  })
  if (resolution.kind !== 'spell-choices') return null
  return (
    <>
      {resolution.spells.map((spell) => (
        <Text key={spell.spellId}>
          {spell.status === 'inherited'
            ? `Trigger: ${spell.trigger}`
            : `Unavailable spell (${spell.reason})`}
        </Text>
      ))}
    </>
  )
}

function ReactionTriggerField({
  action,
  section,
  onChange,
}: {
  action: MonsterActionDraftRow
  section: MonsterActionSection
  onChange: (next: MonsterActionDraftRow) => void
}) {
  if (section !== 'reactions') return null
  const label = action.kind === 'spell' ? MONSTER_ADDITIONAL_CONDITION_LABEL : MONSTER_TRIGGER_LABEL
  return (
    <label>
      {label}
      <input
        aria-label={label}
        value={action.trigger?.text ?? ''}
        onChange={(event) => {
          const text = event.target.value
          onChange({ ...action, trigger: text ? { text } : undefined })
        }}
      />
      {action.kind === 'spell' ? <Text>{MONSTER_ADDITIONAL_CONDITION_HINT}</Text> : null}
    </label>
  )
}

function MonsterActionDetail({
  ctx,
  action,
  section,
  index,
  advisories,
  notice,
  equipmentSelectRef,
  addingWeapon,
  weaponChoices,
  descriptionId,
  onKind,
  onRemove,
  onMove,
  onChange,
  onWeaponSwap,
  onAddWeapon,
  onToggleAddWeapon,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
  section: MonsterActionSection
  index: number
  advisories: string[]
  notice: string | null
  equipmentSelectRef: RefObject<HTMLSelectElement | null>
  addingWeapon: boolean
  weaponChoices: { value: string; label: string }[]
  descriptionId: string
  onKind: (kind: MonsterActionKind) => void
  onRemove: () => void
  onMove: (section: MonsterActionSection) => void
  onChange: (next: MonsterActionDraftRow) => void
  onWeaponSwap: (entryId: string, name: string) => void
  onAddWeapon: (equipmentId: string, name: string) => void
  onToggleAddWeapon: () => void
}) {
  const catalog = monsterEquipmentCatalog(ctx)
  const rulesetId = (ctx.rulesetId ?? 'srd-cc-5.2.1') as SystemRulesetId
  const provider = useMemo(() => createMagicPropertyDefinitionProvider(rulesetId), [rulesetId])
  const { getValues } = useFormContext<MonsterFormValues>()
  const equipment = getValues().equipment
  return (
    <div>
      <label>
        {MONSTER_KIND_LABEL}
        <select
          aria-label={MONSTER_KIND_LABEL}
          value={action.kind}
          onChange={(event) => onKind(event.target.value as MonsterActionKind)}
        >
          {MONSTER_ACTION_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {getMonsterActionKindLabel(kind)}
            </option>
          ))}
        </select>
      </label>
      {action.kind === 'weapon' ? (
        <WeaponEquipmentControls
          action={action}
          equipment={equipment}
          catalog={catalog}
          provider={provider}
          equipmentSelectRef={equipmentSelectRef}
          addingWeapon={addingWeapon}
          weaponChoices={weaponChoices}
          onWeaponSwap={onWeaponSwap}
          onAddWeapon={onAddWeapon}
          onToggleAddWeapon={onToggleAddWeapon}
        />
      ) : null}
      {notice ? (
        <Text as="span" variant="supporting">
          <SemanticText>{notice}</SemanticText>
        </Text>
      ) : null}
      {advisories.map((message) => (
        <Text key={message} as="span" variant="supporting">
          <SemanticText>{message}</SemanticText>
        </Text>
      ))}
      <label>
        {MONSTER_ACTION_NAME_LABEL}
        <input
          aria-label={MONSTER_ACTION_NAME_LABEL}
          value={action.name ?? ''}
          onChange={(event) => onChange({ ...action, name: event.target.value })}
        />
      </label>
      {action.kind === 'spell' ? null : <LimitedUseFields action={action} onChange={onChange} />}
      <SpellActionFields ctx={ctx} action={action} section={section} onChange={onChange} />
      <ReactionTriggerField action={action} section={section} onChange={onChange} />
      {action.kind === 'natural-weapon' ? (
        <NaturalWeaponControls action={action} prefix={`${section}.${index}`} onChange={onChange} />
      ) : null}
      <label htmlFor={descriptionId}>{MONSTER_CUSTOM_DESCRIPTION_LABEL}</label>
      <textarea
        id={descriptionId}
        aria-label={MONSTER_CUSTOM_DESCRIPTION_LABEL}
        value={action.description ?? ''}
        onChange={(event) => onChange({ ...action, description: event.target.value })}
      />
      <label>
        {MONSTER_MOVE_TO_LABEL}
        <select
          aria-label={MONSTER_MOVE_TO_LABEL}
          value={section}
          onChange={(event) => onMove(event.target.value as MonsterActionSection)}
        >
          {MONSTER_ACTION_SECTIONS.map((target) => (
            <option key={target} value={target}>
              {monsterActionSectionHeading(target)}
            </option>
          ))}
        </select>
      </label>
      <Button type="button" onClick={onRemove}>
        {MONSTER_REMOVE_LABEL}
      </Button>
    </div>
  )
}

function KindSwitchDialog({
  sections,
  located,
}: {
  sections: Sections
  located: LocatedAction | null
}) {
  const pending = sections.pending?.type === 'kind' ? sections.pending : null
  const title = located
    ? actionTitle(located.action, located.index)
    : actionTitle({ id: '', kind: 'special' }, 0)
  return (
    <ConfirmDialog
      open={pending != null}
      onOpenChange={(open) => {
        if (!open) sections.setPending(null)
      }}
      headline={
        pending ? formatKindSwitchTitle(title, getMonsterActionKindLabel(pending.nextKind)) : ''
      }
      description={pending ? `${pending.losses.join(' ')} ${MONSTER_KIND_SWITCH_KEEP}` : undefined}
      confirmLabel={
        pending ? formatKindSwitchConfirm(getMonsterActionKindLabel(pending.nextKind)) : 'Change'
      }
      cancelLabel={MONSTER_CANCEL_LABEL}
      onConfirm={() => sections.confirmPending(located?.action.name)}
      onCancel={() => sections.setPending(null)}
    />
  )
}

function TriggerDropDialog({ sections }: { sections: Sections }) {
  const pending = sections.pending?.type === 'trigger'
  return (
    <ConfirmDialog
      open={pending}
      onOpenChange={(open) => {
        if (!open) sections.setPending(null)
      }}
      headline={MONSTER_MOVE_TO_LABEL}
      description={formatDropTriggerBody()}
      confirmLabel={MONSTER_DROP_TRIGGER_CONFIRM}
      cancelLabel={MONSTER_CANCEL_LABEL}
      onConfirm={() => sections.confirmPending()}
      onCancel={() => sections.setPending(null)}
    />
  )
}

function ActionDetailPane({
  ctx,
  form,
  sections,
  located,
  addingWeapon,
  setAddingWeapon,
  equipmentSelectRef,
  descriptionId,
}: {
  ctx: ContentFormCtx
  form: UseFormReturn<MonsterFormValues>
  sections: Sections
  located: LocatedAction | null
  addingWeapon: boolean
  setAddingWeapon: (value: boolean | ((open: boolean) => boolean)) => void
  equipmentSelectRef: RefObject<HTMLSelectElement | null>
  descriptionId: string
}) {
  const rulesetId = (ctx.rulesetId ?? 'srd-cc-5.2.1') as SystemRulesetId
  const provider = useMemo(() => createMagicPropertyDefinitionProvider(rulesetId), [rulesetId])
  if (!located) return <p>{MONSTER_ACTION_DETAIL_EMPTY}</p>
  const values = form.getValues()
  const catalog = monsterEquipmentCatalog(ctx)
  const advisories = collectMonsterFormAdvisories(values, catalog)
    .filter((advisory) => advisory.path.startsWith(`${located.section}.${located.index}`))
    .map((advisory) => advisory.message)
  return (
    <MonsterActionDetail
      ctx={ctx}
      action={located.action}
      section={located.section}
      index={located.index}
      advisories={advisories}
      equipmentSelectRef={equipmentSelectRef}
      addingWeapon={addingWeapon}
      weaponChoices={referenceWeaponComboboxFieldOptions(ctx.options?.equipment)}
      descriptionId={descriptionId}
      onKind={(kind) =>
        sections.requestKind(
          kind,
          linkedEquipmentName(located.action, values.equipment, catalog, provider) ?? '',
          linkedEquipmentName(located.action, values.equipment, catalog, provider) ?? '',
        )
      }
      onRemove={() => sections.removeAction(located.action.id)}
      onMove={(to) => sections.requestMove(to)}
      onChange={(next) => sections.replaceAction(located.section, located.index, next)}
      onWeaponSwap={(entryId, name) => {
        sections.replaceAction(located.section, located.index, {
          ...located.action,
          equipmentEntryId: entryId,
        })
        sections.setNotice(formatWeaponSwapNotice(name))
      }}
      onToggleAddWeapon={() => setAddingWeapon((open) => !open)}
      onAddWeapon={(equipmentId, name) => {
        linkNewWeapon(form, sections, located, equipmentId, name, equipmentSelectRef)
        setAddingWeapon(false)
      }}
      notice={sections.notice}
    />
  )
}

export function MonsterActionsEditor({ ctx }: { ctx: ContentFormCtx }) {
  const form = useFormContext<MonsterFormValues>()
  const sections = useMonsterActionSections(ctx.entityId)
  const located = sections.locate(sections.selectedActionId)
  const equipmentSelectRef = useRef<HTMLSelectElement>(null)
  const [chooser, setChooser] = useState<MonsterActionSection | null>(null)
  const [addingWeapon, setAddingWeapon] = useState(false)
  const descriptionId = useId()
  useFocusAction(sections.focusToken, sections.selectedActionId)

  return (
    <>
      <MasterDetailGrid>
        <ActionSectionColumn
          values={form.getValues()}
          sections={sections}
          chooser={chooser}
          onToggleChooser={setChooser}
        />
        <div>
          <ActionDetailPane
            ctx={ctx}
            form={form}
            sections={sections}
            located={located}
            addingWeapon={addingWeapon}
            setAddingWeapon={setAddingWeapon}
            equipmentSelectRef={equipmentSelectRef}
            descriptionId={descriptionId}
          />
        </div>
      </MasterDetailGrid>
      <KindSwitchDialog sections={sections} located={located} />
      <TriggerDropDialog sections={sections} />
    </>
  )
}

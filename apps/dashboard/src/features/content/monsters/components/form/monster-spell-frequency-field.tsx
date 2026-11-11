import {
  PROFICIENCY_BONUS_TERM,
  REST_KIND_ENTRIES,
  REST_KINDS,
  type RestKind,
} from '@rpg/contracts'
import { InlineMetadata, NumberField, SelectField } from '@rpg/ui'
import { useFieldControlSize } from '@rpg/ui/form'
import { useFormContext, useFormState, useWatch } from 'react-hook-form'

import { vocabularyFieldLabel } from '@/features/vocabulary'

import {
  MONSTER_LIMIT_RECHARGES_ON_LABEL,
  MONSTER_SPELL_FREQUENCY_LABEL,
  monsterLimitRechargesOnHint,
} from '../../lib/monster-form-labels'
import {
  SPELL_ENTRY_FREQUENCY_AT_WILL,
  SPELL_ENTRY_FREQUENCY_AT_WILL_LABEL,
  SPELL_ENTRY_FREQUENCY_SHARED,
  limitedUseFromSpellFrequency,
  readSpellFrequency,
  spellEntryFrequencyLabel,
  spellFrequencyControlIsShared,
  spellFrequencyOptions,
} from '../../lib/actions/monster-spell-frequency'

const WRITE_OPTIONS = { shouldDirty: true, shouldTouch: true, shouldValidate: true } as const

const LIMIT_KIND_OPTIONS = [
  { value: SPELL_ENTRY_FREQUENCY_AT_WILL, label: SPELL_ENTRY_FREQUENCY_AT_WILL_LABEL },
  { value: 'uses', label: 'Uses' },
  { value: 'recharge', label: 'Recharge' },
]

const COUNT_KIND_OPTIONS = [
  { value: 'fixed', label: 'Fixed number' },
  { value: 'proficiency-bonus', label: vocabularyFieldLabel(PROFICIENCY_BONUS_TERM) },
]

const REST_OPTIONS = REST_KINDS.map((id) => ({
  value: id,
  label: REST_KIND_ENTRIES[id].label,
}))

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function MonsterSpellFrequencyField({
  spellLimitName,
  actionLimitName,
}: {
  spellLimitName: string
  actionLimitName: string
}) {
  const controlSize = useFieldControlSize()
  const { setValue, getFieldState } = useFormContext()
  const formState = useFormState({ name: spellLimitName })
  const spellLimitedUse = useWatch({ name: spellLimitName })
  const actionLimitedUse = useWatch({ name: actionLimitName })
  const reading = readSpellFrequency(spellLimitedUse)
  const error = getFieldState(spellLimitName, formState).error?.message
  const fieldId = `${spellLimitName.replaceAll('.', '-')}-frequency`

  const write = (next: unknown) => {
    setValue(spellLimitName, next as never, WRITE_OPTIONS)
  }

  if (reading.status === 'incomplete') {
    return (
      <MonsterSpellIncompleteLimit
        id={fieldId}
        limitedUse={spellLimitedUse}
        error={error}
        onChange={write}
      />
    )
  }

  const shared = spellFrequencyControlIsShared(spellLimitedUse, actionLimitedUse)
  const options = shared
    ? [
        {
          value: SPELL_ENTRY_FREQUENCY_SHARED,
          label: spellEntryFrequencyLabel(spellLimitedUse, actionLimitedUse) ?? '',
        },
      ]
    : spellFrequencyOptions(reading)
  const value = shared
    ? SPELL_ENTRY_FREQUENCY_SHARED
    : reading.status === 'daily'
      ? String(reading.count)
      : reading.status === 'unsupported'
        ? 'custom'
        : SPELL_ENTRY_FREQUENCY_AT_WILL

  return (
    <SelectField
      id={fieldId}
      label={MONSTER_SPELL_FREQUENCY_LABEL}
      size={controlSize}
      options={options}
      value={value}
      disabled={shared}
      error={error}
      onValueChange={(next) => {
        const limitedUse = limitedUseFromSpellFrequency(next)
        if (limitedUse === 'unchanged') return
        write(limitedUse)
      }}
    />
  )
}

function incompleteLimitKind(limitedUse: unknown): '' | 'uses' | 'recharge' {
  if (!isRecord(limitedUse)) return ''
  if (limitedUse.kind === 'uses' || limitedUse.kind === 'recharge') return limitedUse.kind
  return ''
}

function writeIncompleteKind(next: string): unknown {
  if (next === SPELL_ENTRY_FREQUENCY_AT_WILL) return undefined
  if (next === 'recharge') return { kind: 'recharge' }
  return { kind: 'uses' }
}

function IncompleteLimitKindField({
  id,
  kind,
  error,
  onChange,
}: {
  id: string
  kind: string
  error?: string
  onChange: (next: unknown) => void
}) {
  const controlSize = useFieldControlSize()
  return (
    <SelectField
      id={`${id}-kind`}
      label="Limit"
      size={controlSize}
      options={LIMIT_KIND_OPTIONS}
      value={kind}
      error={error}
      onValueChange={(next) => onChange(writeIncompleteKind(next))}
    />
  )
}

function IncompleteRechargeField({
  id,
  minRoll,
  onChange,
}: {
  id: string
  minRoll: unknown
  onChange: (next: unknown) => void
}) {
  const controlSize = useFieldControlSize()
  return (
    <NumberField
      id={`${id}-recharge`}
      label={MONSTER_LIMIT_RECHARGES_ON_LABEL}
      size={controlSize}
      min={2}
      max={6}
      digits={2}
      value={typeof minRoll === 'number' ? minRoll : ''}
      hint={monsterLimitRechargesOnHint(minRoll)}
      onChange={(event) => {
        const next = Number(event.target.value)
        onChange(
          Number.isInteger(next) ? { kind: 'recharge', minRoll: next } : { kind: 'recharge' },
        )
      }}
    />
  )
}

function IncompleteUsesFields({
  id,
  count,
  minimumRest,
  onChange,
}: {
  id: string
  count: Record<string, unknown> | undefined
  minimumRest: RestKind | undefined
  onChange: (next: unknown) => void
}) {
  const controlSize = useFieldControlSize()
  const countKind = count?.kind === 'fixed' || count?.kind === 'proficiency-bonus' ? count.kind : ''
  const recovery = minimumRest ? { recovery: { minimumRest } } : {}
  return (
    <>
      <div className="flex gap-3">
        <SelectField
          id={`${id}-count-kind`}
          label="Count"
          size={controlSize}
          options={COUNT_KIND_OPTIONS}
          value={countKind}
          onValueChange={(next) =>
            onChange({
              kind: 'uses',
              count:
                next === 'proficiency-bonus' ? { kind: 'proficiency-bonus' } : { kind: 'fixed' },
              ...recovery,
            })
          }
        />
        <SelectField
          id={`${id}-rest`}
          label="Recovers on"
          size={controlSize}
          options={REST_OPTIONS}
          value={minimumRest ?? ''}
          onValueChange={(next) =>
            onChange({
              kind: 'uses',
              ...(count ? { count } : {}),
              recovery: { minimumRest: next as RestKind },
            })
          }
        />
      </div>
      {countKind === 'fixed' ? (
        <NumberField
          id={`${id}-count`}
          label="Uses"
          size={controlSize}
          min={1}
          digits={2}
          value={typeof count?.value === 'number' ? count.value : ''}
          onChange={(event) => {
            const value = Number(event.target.value)
            onChange({
              kind: 'uses',
              count: Number.isInteger(value) ? { kind: 'fixed', value } : { kind: 'fixed' },
              ...recovery,
            })
          }}
        />
      ) : null}
    </>
  )
}

function MonsterSpellIncompleteLimit({
  id,
  limitedUse,
  error,
  onChange,
}: {
  id: string
  limitedUse: unknown
  error?: string
  onChange: (next: unknown) => void
}) {
  const record = isRecord(limitedUse) ? limitedUse : {}
  const kind = incompleteLimitKind(limitedUse)
  const count = isRecord(record.count) ? record.count : undefined
  const recovery = isRecord(record.recovery) ? record.recovery : undefined
  const minimumRest = REST_KINDS.find((rest) => rest === recovery?.minimumRest)

  return (
    <div className="flex flex-col gap-3">
      <IncompleteLimitKindField id={id} kind={kind} error={error} onChange={onChange} />
      {kind === 'recharge' ? (
        <IncompleteRechargeField id={id} minRoll={record.minRoll} onChange={onChange} />
      ) : null}
      {kind === 'uses' ? (
        <IncompleteUsesFields id={id} count={count} minimumRest={minimumRest} onChange={onChange} />
      ) : null}
    </div>
  )
}

export function SpellEntryMetadataLines({
  catalog,
  frequency,
}: {
  catalog: readonly string[]
  frequency: readonly string[]
}) {
  if (catalog.length === 0 && frequency.length === 0) return null
  return (
    <div className="flex flex-col">
      <MetadataLine parts={catalog} />
      <MetadataLine parts={frequency} />
    </div>
  )
}

function MetadataLine({ parts }: { parts: readonly string[] }) {
  if (parts.length === 0) return null
  return (
    <InlineMetadata role="supporting" density="compact">
      {parts.map((part) => (
        <InlineMetadata.Item key={part}>{part}</InlineMetadata.Item>
      ))}
    </InlineMetadata>
  )
}

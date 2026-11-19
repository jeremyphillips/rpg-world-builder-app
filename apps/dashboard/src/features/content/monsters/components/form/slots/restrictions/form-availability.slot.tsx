import { monsterFormRestrictionEligibleIds, sortMonsterFormRestrictionIds } from '@rpg/contracts'
import { monsterFormRestrictionLabelMap } from '@rpg/contracts'
import { ChipsField, RadioGroupField, type FieldHintPosition } from '@rpg/ui'
import { useSlotIssues } from '@rpg/ui/form'
import { useEffect, useState } from 'react'
import { useFormContext, useWatch, type UseFormReturn } from 'react-hook-form'

import {
  MONSTER_FORM_AVAILABILITY_ALL,
  MONSTER_FORM_AVAILABILITY_FORMS_LABEL,
  MONSTER_FORM_AVAILABILITY_LABEL,
  MONSTER_FORM_AVAILABILITY_SELECTED,
  formatMonsterMissingFormLabel,
  monsterFormAvailabilityHintPhase,
  monsterFormAvailabilityRowKind,
  resolveMonsterFormAvailabilityHint,
} from '../../../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../../../lib/monster-form-values'

function stringIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((id): id is string => typeof id === 'string')
}

function rowFieldPath(namePrefix: string | undefined, field: string): string {
  return namePrefix ? `${namePrefix}.${field}` : field
}

function formRestrictionChipOptions(
  knownNames: Map<string, string>,
  forms: MonsterFormValues['forms'] | undefined,
  selected: readonly string[],
) {
  const ordered =
    forms?.trueForm && Array.isArray(forms.definedForms)
      ? monsterFormRestrictionEligibleIds(forms)
      : []
  const ids = [...ordered]
  for (const id of selected) {
    if (!ids.includes(id)) ids.push(id)
  }
  return ids.map((id) => ({
    value: id,
    label: knownNames.get(id) ?? formatMonsterMissingFormLabel(id),
  }))
}

const AVAILABILITY_WRITE = { shouldDirty: true, shouldValidate: true } as const

function clearOnlyInFormIds(form: UseFormReturn<MonsterFormValues>, namePrefix: string) {
  const current = form.getValues(namePrefix as never) as unknown
  if (!current || typeof current !== 'object') return
  const { onlyInFormIds: _ids, ...rest } = current as Record<string, unknown>
  form.setValue(namePrefix as never, rest as never, AVAILABILITY_WRITE)
}

function applyAvailabilityMode(
  form: UseFormReturn<MonsterFormValues>,
  namePrefix: string,
  restrictionPath: string,
  restrictionKeyPresent: boolean,
  value: string,
) {
  if (value === 'all') {
    clearOnlyInFormIds(form, namePrefix)
    return
  }
  if (restrictionKeyPresent) return
  form.setValue(restrictionPath as never, [] as never, AVAILABILITY_WRITE)
}

function writeSelectedFormIds(
  form: UseFormReturn<MonsterFormValues>,
  restrictionPath: string,
  value: unknown,
  forms: NonNullable<MonsterFormValues['forms']> | undefined,
) {
  const raw = Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
  const normalized = forms && raw.length > 0 ? sortMonsterFormRestrictionIds(raw, forms) : raw
  form.setValue(restrictionPath as never, normalized as never, AVAILABILITY_WRITE)
}

function shouldShowFormAvailability(
  namePrefix: string | undefined,
  authorable: boolean,
  restrictionKeyPresent: boolean,
): namePrefix is string {
  return Boolean(namePrefix && (authorable || restrictionKeyPresent))
}

type MonsterFormAvailabilityViewProps = {
  form: UseFormReturn<MonsterFormValues>
  restrictionPath: string
  controlId: string
  message?: string
  restrictionKeyPresent: boolean
  selected: readonly string[]
  chipOptions: ReturnType<typeof formRestrictionChipOptions>
  forms: MonsterFormValues['forms'] | undefined
  hint: string
  hintPosition: FieldHintPosition
  onAvailabilityModeChange: (value: string) => void
}

function MonsterFormAvailabilityView({
  form,
  restrictionPath,
  controlId,
  message,
  restrictionKeyPresent,
  selected,
  chipOptions,
  forms,
  hint,
  hintPosition,
  onAvailabilityModeChange,
}: MonsterFormAvailabilityViewProps) {
  return (
    <div className="flex flex-col gap-3">
      <RadioGroupField
        id={controlId}
        label={MONSTER_FORM_AVAILABILITY_LABEL}
        hint={hint}
        hintPosition={hintPosition}
        orientation="horizontal"
        value={restrictionKeyPresent ? 'selected' : 'all'}
        error={message}
        options={[
          { value: 'all', label: MONSTER_FORM_AVAILABILITY_ALL },
          { value: 'selected', label: MONSTER_FORM_AVAILABILITY_SELECTED },
        ]}
        onValueChange={onAvailabilityModeChange}
      />
      {restrictionKeyPresent ? (
        <ChipsField
          id={`${controlId}-forms`}
          label={MONSTER_FORM_AVAILABILITY_FORMS_LABEL}
          labelVisibility="srOnly"
          options={chipOptions}
          multiple
          value={[...selected]}
          onChange={(value) => writeSelectedFormIds(form, restrictionPath, value, forms)}
        />
      ) : null}
    </div>
  )
}

export function MonsterFormAvailabilityControl({ namePrefix }: { namePrefix?: string }) {
  const form = useFormContext<MonsterFormValues>()
  const forms = useWatch<MonsterFormValues, 'forms'>({ name: 'forms' })
  const creatureName = useWatch<MonsterFormValues, 'name'>({ name: 'name' })
  const restrictionPath = rowFieldPath(namePrefix, 'onlyInFormIds')
  const watchedIds: unknown = useWatch({ name: restrictionPath as never })
  const { message } = useSlotIssues()

  const restrictionKeyPresent = Array.isArray(watchedIds)
  const authorable = forms ? monsterFormRestrictionEligibleIds(forms).length > 1 : false
  const visible = shouldShowFormAvailability(namePrefix, authorable, restrictionKeyPresent)

  const [availabilityEngaged, setAvailabilityEngaged] = useState(restrictionKeyPresent)

  useEffect(() => {
    setAvailabilityEngaged(restrictionKeyPresent)
  }, [namePrefix])

  useEffect(() => {
    if (restrictionKeyPresent) setAvailabilityEngaged(true)
  }, [restrictionKeyPresent])

  if (!visible) return null

  const knownNames = forms ? monsterFormRestrictionLabelMap(forms, creatureName ?? '') : new Map()
  const selected = restrictionKeyPresent ? stringIds(watchedIds) : []
  const rowKind = monsterFormAvailabilityRowKind(namePrefix)
  const hintPhase = monsterFormAvailabilityHintPhase(restrictionKeyPresent, availabilityEngaged)
  const { hint, hintPosition } = resolveMonsterFormAvailabilityHint(hintPhase, rowKind)

  return (
    <MonsterFormAvailabilityView
      form={form}
      restrictionPath={restrictionPath}
      controlId={`${namePrefix.replaceAll('.', '-')}-form-availability`}
      message={message}
      restrictionKeyPresent={restrictionKeyPresent}
      selected={selected}
      chipOptions={formRestrictionChipOptions(knownNames, forms, selected)}
      forms={forms}
      hint={hint}
      hintPosition={hintPosition}
      onAvailabilityModeChange={(value) => {
        if (value === 'selected' || value === 'all') setAvailabilityEngaged(true)
        applyAvailabilityMode(form, namePrefix, restrictionPath, restrictionKeyPresent, value)
      }}
    />
  )
}

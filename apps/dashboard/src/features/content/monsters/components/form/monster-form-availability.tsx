import {
  formatMonsterFormQualifier,
  formatMonsterQualifiedHeading,
  monsterFormRestrictionEligibleIds,
  resolveCreatureFormsContext,
  type CreatureFormsDraft,
} from '@rpg/contracts'
import { ChipsField, RadioGroupField, RulesPreview } from '@rpg/ui'
import { useSlotIssues, type FormItem } from '@rpg/ui/form'
import { useFormContext, useWatch, type UseFormReturn } from 'react-hook-form'

import {
  MONSTER_FORM_AVAILABILITY_ALL,
  MONSTER_FORM_AVAILABILITY_FORMS_LABEL,
  MONSTER_FORM_AVAILABILITY_LABEL,
  MONSTER_FORM_AVAILABILITY_ORDER_HINT,
  MONSTER_FORM_AVAILABILITY_PREVIEW_LABEL,
  MONSTER_FORM_AVAILABILITY_SELECTED,
  formatMonsterMissingFormLabel,
} from '../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../lib/monster-form-values'

export const MONSTER_FORM_AVAILABILITY_FIELD = 'formAvailability'

export function insertMonsterFormAvailabilityField(fields: FormItem[]): FormItem[] {
  const slot = monsterFormAvailabilityField()
  const advisoryIndex = fields.findIndex(
    (item) => 'name' in item && item.name === 'buildAdvisories',
  )
  if (advisoryIndex < 0) return [slot, ...fields]
  return [...fields.slice(0, advisoryIndex + 1), slot, ...fields.slice(advisoryIndex + 1)]
}

export function monsterFormAvailabilityField(): FormItem {
  return {
    kind: 'slot',
    name: MONSTER_FORM_AVAILABILITY_FIELD,
    issuePaths: ['onlyInFormIds'],
    render: ({ namePrefix }) => <MonsterFormAvailabilityControl namePrefix={namePrefix} />,
  }
}

function restrictionFormLabels(
  forms: CreatureFormsDraft,
  creatureName: string,
): Map<string, string> {
  const eligibleIds = new Set(monsterFormRestrictionEligibleIds(forms))
  const names = new Map<string, string>()
  const context = resolveCreatureFormsContext(forms, creatureName)
  if (context.status === 'invalid') return names

  const register = (id: string, label: string) => {
    if (eligibleIds.has(id)) names.set(id, label.trim() || 'Untitled form')
  }

  if (context.profile?.id) register(context.profile.id, context.profile.name)
  for (const form of context.definedForms) {
    register(form.id, form.name)
  }
  return names
}

function stringIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((id): id is string => typeof id === 'string')
}

function rowFieldPath(namePrefix: string | undefined, field: string): string {
  return namePrefix ? `${namePrefix}.${field}` : field
}

function orderedFormOptions(knownNames: Map<string, string>, selected: readonly string[]) {
  const unselected = [...knownNames.keys()].filter((id) => !selected.includes(id))
  return [...selected, ...unselected].map((id) => ({
    value: id,
    label: knownNames.get(id) ?? formatMonsterMissingFormLabel(id),
  }))
}

function availabilityHeading(
  rowName: string | undefined,
  selected: readonly string[],
  knownNames: Map<string, string>,
): string | undefined {
  const qualifier = formatMonsterFormQualifier(selected.map((id) => knownNames.get(id) ?? id))
  if (!qualifier) return undefined
  return formatMonsterQualifiedHeading(rowName?.trim() || 'Untitled', { formQualifier: qualifier })
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
) {
  form.setValue(
    restrictionPath as never,
    (Array.isArray(value) ? value : []) as never,
    AVAILABILITY_WRITE,
  )
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
  namePrefix: string
  restrictionPath: string
  controlId: string
  message?: string
  restrictionKeyPresent: boolean
  selected: readonly string[]
  chipOptions: ReturnType<typeof orderedFormOptions>
  heading?: string
}

function MonsterFormAvailabilityView({
  form,
  namePrefix,
  restrictionPath,
  controlId,
  message,
  restrictionKeyPresent,
  selected,
  chipOptions,
  heading,
}: MonsterFormAvailabilityViewProps) {
  return (
    <div className="flex flex-col gap-3">
      <RadioGroupField
        id={controlId}
        label={MONSTER_FORM_AVAILABILITY_LABEL}
        orientation="horizontal"
        value={restrictionKeyPresent ? 'selected' : 'all'}
        error={message}
        options={[
          { value: 'all', label: MONSTER_FORM_AVAILABILITY_ALL },
          { value: 'selected', label: MONSTER_FORM_AVAILABILITY_SELECTED },
        ]}
        onValueChange={(value) =>
          applyAvailabilityMode(form, namePrefix, restrictionPath, restrictionKeyPresent, value)
        }
      />
      {restrictionKeyPresent ? (
        <ChipsField
          id={`${controlId}-forms`}
          label={MONSTER_FORM_AVAILABILITY_FORMS_LABEL}
          hint={MONSTER_FORM_AVAILABILITY_ORDER_HINT}
          options={chipOptions}
          multiple
          value={[...selected]}
          onChange={(value) => writeSelectedFormIds(form, restrictionPath, value)}
        />
      ) : null}
      {heading ? (
        <RulesPreview
          label={MONSTER_FORM_AVAILABILITY_PREVIEW_LABEL}
          content={{ kind: 'prose', text: heading }}
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
  const watchedName: unknown = useWatch({ name: rowFieldPath(namePrefix, 'name') as never })
  const rowName = typeof watchedName === 'string' ? watchedName : undefined
  const { message } = useSlotIssues()

  const restrictionKeyPresent = Array.isArray(watchedIds)
  const authorable = forms ? monsterFormRestrictionEligibleIds(forms).length > 1 : false
  if (!shouldShowFormAvailability(namePrefix, authorable, restrictionKeyPresent)) return null

  const knownNames = forms ? restrictionFormLabels(forms, creatureName ?? '') : new Map()
  const selected = restrictionKeyPresent ? stringIds(watchedIds) : []

  return (
    <MonsterFormAvailabilityView
      form={form}
      namePrefix={namePrefix}
      restrictionPath={restrictionPath}
      controlId={`${namePrefix.replaceAll('.', '-')}-form-availability`}
      message={message}
      restrictionKeyPresent={restrictionKeyPresent}
      selected={selected}
      chipOptions={orderedFormOptions(knownNames, selected)}
      heading={availabilityHeading(rowName, selected, knownNames)}
    />
  )
}

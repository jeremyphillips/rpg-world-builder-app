import {
  formatMonsterFormQualifier,
  formatMonsterQualifiedHeading,
  resolveCreatureFormsContext,
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

function formNamesById(
  forms: MonsterFormValues['forms'],
  creatureName: string,
): Map<string, string> {
  const names = new Map<string, string>()
  if (!forms) return names
  const context = resolveCreatureFormsContext(forms, creatureName)
  if (context.status === 'invalid') return names
  for (const form of context.eligibleForms) {
    if (form.id) names.set(form.id, form.name.trim() || 'Untitled form')
  }
  return names
}

function stringIds(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
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
  restricted: boolean,
  value: string,
) {
  if (value === 'all') {
    clearOnlyInFormIds(form, namePrefix)
    return
  }
  if (restricted) return
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

export function MonsterFormAvailabilityControl({ namePrefix }: { namePrefix?: string }) {
  const form = useFormContext<MonsterFormValues>()
  const forms = useWatch<MonsterFormValues, 'forms'>({ name: 'forms' })
  const creatureName = useWatch<MonsterFormValues, 'name'>({ name: 'name' })
  const restrictionPath = rowFieldPath(namePrefix, 'onlyInFormIds')
  const watchedIds: unknown = useWatch({ name: restrictionPath as never })
  const watchedName: unknown = useWatch({ name: rowFieldPath(namePrefix, 'name') as never })
  const ids = stringIds(watchedIds)
  const rowName = typeof watchedName === 'string' ? watchedName : undefined
  const { message } = useSlotIssues()
  const restricted = Array.isArray(ids)
  if (!namePrefix || (!forms && !restricted)) return null

  const knownNames = formNamesById(forms, creatureName ?? '')
  const selected = restricted ? ids : []
  const heading = availabilityHeading(rowName, selected, knownNames)
  const controlId = `${namePrefix.replaceAll('.', '-')}-form-availability`

  return (
    <div className="flex flex-col gap-3">
      <RadioGroupField
        id={controlId}
        label={MONSTER_FORM_AVAILABILITY_LABEL}
        orientation="horizontal"
        value={restricted ? 'selected' : 'all'}
        error={message}
        options={[
          { value: 'all', label: MONSTER_FORM_AVAILABILITY_ALL },
          { value: 'selected', label: MONSTER_FORM_AVAILABILITY_SELECTED },
        ]}
        onValueChange={(value) =>
          applyAvailabilityMode(form, namePrefix, restrictionPath, restricted, value)
        }
      />
      {restricted ? (
        <ChipsField
          id={`${controlId}-forms`}
          label={MONSTER_FORM_AVAILABILITY_FORMS_LABEL}
          hint={MONSTER_FORM_AVAILABILITY_ORDER_HINT}
          options={orderedFormOptions(knownNames, selected)}
          multiple
          value={selected}
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

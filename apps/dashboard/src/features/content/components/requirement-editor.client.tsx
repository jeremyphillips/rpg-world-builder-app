'use client'

import { Fragment, useCallback } from 'react'
import { useController, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import {
  Badge,
  Button,
  Field,
  Input,
  RadioGroupField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  fieldWidthVariants,
} from '@rpg/ui'
import { ABILITY_SCORE_MAX, ABILITY_SCORE_MIN, MAX_CHARACTER_LEVEL } from '@rpg/contracts'
import { Trash2 } from 'lucide-react'

import {
  ABILITY_FIELD_LABEL,
  ADD_CONDITION_LABEL,
  ADD_CONDITION_SET_LABEL,
  CONDITION_SETS_HEADING,
  CONDITION_TYPE_LABEL,
  CONDITION_TYPE_PLACEHOLDER,
  EMPTY_CONDITION_SETS_HINT,
  LOGIC_CONNECTOR_LABELS,
  MATCH_RULE_LABEL,
  MATCH_RULE_OPTIONS,
  MINIMUM_SCORE_FIELD_LABEL,
  MIN_LEVEL_FIELD_LABEL,
  PREVIEW_LABEL,
  REQUIREMENT_ABILITY_OPTIONS,
  REQUIREMENT_LEAF_TYPE_OPTIONS,
  SENTENCE_OPERATOR_LABELS,
  SPELLCASTING_SENTENCE_LABEL,
  conditionSetAriaLabel,
  removeConditionLabel,
  removeConditionSetLabel,
} from '../lib/requirement-editor-constants'
import {
  formatRequirementEditorPreview,
  newRequirementDraftLeaf,
  newRequirementGroup,
  newRequirementLeaf,
  type PrerequisiteEditorValue,
  type RequirementLeafForm,
  type RequirementLeafType,
  type RequirementLeafTypedForm,
} from '../lib/requirement-editor-form'

export interface RequirementEditorProps {
  /** Parent form field path, e.g. `prerequisiteEditor`. */
  name: string
}

/** Flat field stack + shared control row keep sentence operands on one baseline. */
const SENTENCE_FIELD_STACK = 'space-y-0'
const SENTENCE_CONTROLS_ROW = 'flex flex-wrap items-center gap-2'
const SENTENCE_TYPE_LABEL_CLASS =
  "flex items-center gap-1.5 text-xs font-medium leading-none after:text-destructive data-[required]:after:ml-0.5 data-[required]:after:content-['*']"
const SENTENCE_OPERATOR_CLASS = 'text-sm text-muted-foreground'

function parseNumberInput(raw: string): number | '' {
  if (raw === '') return ''
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? '' : parsed
}

function replaceLeafType(
  current: RequirementLeafForm,
  nextType: RequirementLeafType,
): RequirementLeafTypedForm {
  if ('type' in current && current.type === nextType) return current
  return { ...newRequirementLeaf(nextType), id: current.id }
}

function LogicConnectorChip({
  operator,
  align = 'center',
}: {
  operator: keyof typeof LOGIC_CONNECTOR_LABELS
  align?: 'center' | 'start'
}) {
  return (
    <div className={`flex py-1 ${align === 'start' ? 'justify-start' : 'justify-center'}`}>
      <Badge variant="outline" aria-hidden="true">
        {LOGIC_CONNECTOR_LABELS[operator]}
      </Badge>
    </div>
  )
}

interface MinLevelSegmentsProps {
  idPrefix: string
  leafPath: string
}

function MinLevelSegments({ idPrefix, leafPath }: MinLevelSegmentsProps) {
  const { field: levelField, fieldState: levelFieldState } = useController({
    name: `${leafPath}.level`,
  })

  return (
    <>
      <span className={SENTENCE_OPERATOR_CLASS} aria-hidden="true">
        {SENTENCE_OPERATOR_LABELS.minLevel}
      </span>
      <Field.Root
        id={`${idPrefix}-level`}
        width="xs"
        size="sm"
        required
        className={SENTENCE_FIELD_STACK}
        error={levelFieldState.error?.message}
      >
        <Field.Label className="sr-only">{MIN_LEVEL_FIELD_LABEL}</Field.Label>
        <Field.Control>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_CHARACTER_LEVEL}
            size="sm"
            className={fieldWidthVariants({ width: 'xs' })}
            value={levelField.value ?? ''}
            onChange={(event) => levelField.onChange(parseNumberInput(event.target.value))}
            onBlur={levelField.onBlur}
          />
        </Field.Control>
        <Field.Error />
      </Field.Root>
    </>
  )
}

interface AbilityMinimumSegmentsProps {
  idPrefix: string
  leafPath: string
}

function AbilityMinimumSegments({ idPrefix, leafPath }: AbilityMinimumSegmentsProps) {
  const { field: abilityField, fieldState: abilityFieldState } = useController({
    name: `${leafPath}.ability`,
  })
  const { field: minimumField, fieldState: minimumFieldState } = useController({
    name: `${leafPath}.minimum`,
  })

  return (
    <>
      <Field.Root
        id={`${idPrefix}-ability`}
        width="sm"
        size="sm"
        required
        className={SENTENCE_FIELD_STACK}
        error={abilityFieldState.error?.message}
      >
        <Field.Label className="sr-only">{ABILITY_FIELD_LABEL}</Field.Label>
        <Select
          value={abilityField.value ?? ''}
          onValueChange={abilityField.onChange}
          name={abilityField.name}
        >
          <Field.Control>
            <SelectTrigger size="sm" onBlur={abilityField.onBlur}>
              <SelectValue />
            </SelectTrigger>
          </Field.Control>
          <SelectContent>
            {REQUIREMENT_ABILITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Field.Error />
      </Field.Root>
      <span className={SENTENCE_OPERATOR_CLASS} aria-hidden="true">
        {SENTENCE_OPERATOR_LABELS.abilityMinimum}
      </span>
      <Field.Root
        id={`${idPrefix}-minimum`}
        width="xs"
        size="sm"
        required
        className={SENTENCE_FIELD_STACK}
        error={minimumFieldState.error?.message}
      >
        <Field.Label className="sr-only">{MINIMUM_SCORE_FIELD_LABEL}</Field.Label>
        <Field.Control>
          <Input
            type="number"
            inputMode="numeric"
            min={ABILITY_SCORE_MIN}
            max={ABILITY_SCORE_MAX}
            size="sm"
            className={fieldWidthVariants({ width: 'xs' })}
            value={minimumField.value ?? ''}
            onChange={(event) => minimumField.onChange(parseNumberInput(event.target.value))}
            onBlur={minimumField.onBlur}
          />
        </Field.Control>
        <Field.Error />
      </Field.Root>
    </>
  )
}

interface ConditionSentenceRowProps {
  idPrefix: string
  leafPath: string
  setIndex: number
  conditionIndex: number
  canRemove: boolean
  onRemove: () => void
}

function ConditionSentenceRow({
  idPrefix,
  leafPath,
  setIndex,
  conditionIndex,
  canRemove,
  onRemove,
}: ConditionSentenceRowProps) {
  const { setValue, getValues } = useFormContext()
  const { field: typeField, fieldState: typeFieldState } = useController({
    name: `${leafPath}.type`,
  })
  const leafType = typeField.value as RequirementLeafType | undefined

  const handleTypeChange = useCallback(
    (nextType: string) => {
      const current = getValues(leafPath) as RequirementLeafForm
      setValue(leafPath, replaceLeafType(current, nextType as RequirementLeafType), {
        shouldDirty: true,
        shouldValidate: true,
      })
    },
    [getValues, leafPath, setValue],
  )

  const typeControlId = `${idPrefix}-type`

  return (
    <div className="space-y-3">
      <label
        id={`${typeControlId}-label`}
        htmlFor={typeControlId}
        className={SENTENCE_TYPE_LABEL_CLASS}
        data-required
      >
        {CONDITION_TYPE_LABEL}
      </label>

      <div className={SENTENCE_CONTROLS_ROW}>
        <Field.Root
          id={typeControlId}
          width="md"
          size="sm"
          required
          className={SENTENCE_FIELD_STACK}
          error={typeFieldState.error?.message}
        >
          <Field.Label className="sr-only">{CONDITION_TYPE_LABEL}</Field.Label>
          <Select value={leafType} onValueChange={handleTypeChange} name={typeField.name}>
            <Field.Control>
              <SelectTrigger
                size="sm"
                onBlur={typeField.onBlur}
                aria-labelledby={`${typeControlId}-label`}
              >
                <SelectValue placeholder={CONDITION_TYPE_PLACEHOLDER} />
              </SelectTrigger>
            </Field.Control>
            <SelectContent>
              {REQUIREMENT_LEAF_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Field.Error />
        </Field.Root>

        {leafType === 'minLevel' ? (
          <MinLevelSegments idPrefix={idPrefix} leafPath={leafPath} />
        ) : null}
        {leafType === 'abilityMinimum' ? (
          <AbilityMinimumSegments idPrefix={idPrefix} leafPath={leafPath} />
        ) : null}
        {leafType === 'spellcasting' ? (
          <span className={SENTENCE_OPERATOR_CLASS}>{SPELLCASTING_SENTENCE_LABEL}</span>
        ) : null}

        {canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-8 shrink-0 p-0"
            aria-label={removeConditionLabel(setIndex, conditionIndex)}
            onClick={onRemove}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

interface ConditionSetEditorProps {
  idPrefix: string
  setPath: string
  setIndex: number
  onRemove: () => void
}

function ConditionSetEditor({ idPrefix, setPath, setIndex, onRemove }: ConditionSetEditorProps) {
  const { fields, append, remove } = useFieldArray({ name: `${setPath}.requirements` })
  const { field: kindField, fieldState: kindFieldState } = useController({
    name: `${setPath}.kind`,
  })
  const groupKind = kindField.value as 'all' | 'any' | undefined

  return (
    <section
      aria-label={conditionSetAriaLabel(setIndex)}
      className="space-y-4 rounded-md border border-border p-4"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <RadioGroupField
            id={`${idPrefix}-match-rule`}
            label={MATCH_RULE_LABEL}
            options={[...MATCH_RULE_OPTIONS]}
            value={kindField.value ?? 'all'}
            onValueChange={kindField.onChange}
            onBlur={kindField.onBlur}
            error={kindFieldState.error?.message}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-8 shrink-0 p-0"
          aria-label={removeConditionSetLabel(setIndex)}
          onClick={onRemove}
        >
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </div>

      <div className="space-y-2">
        {fields.map((field, conditionIndex) => (
          <Fragment key={field.id}>
            {conditionIndex > 0 ? (
              <LogicConnectorChip operator={groupKind === 'any' ? 'OR' : 'AND'} align="start" />
            ) : null}
            <ConditionSentenceRow
              idPrefix={`${idPrefix}-condition-${conditionIndex}`}
              leafPath={`${setPath}.requirements.${conditionIndex}`}
              setIndex={setIndex}
              conditionIndex={conditionIndex}
              canRemove={fields.length > 1}
              onRemove={() => remove(conditionIndex)}
            />
          </Fragment>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append(newRequirementDraftLeaf())}
      >
        {ADD_CONDITION_LABEL}
      </Button>
    </section>
  )
}

/**
 * Sentence-builder editor for feat (and future content) prerequisites.
 * Binds to `prerequisiteEditor.groups` on the parent form via nested field arrays.
 */
export function RequirementEditor({ name }: RequirementEditorProps) {
  const groupsPath = `${name}.groups`
  const { fields, append, remove } = useFieldArray({ name: groupsPath })
  const editorValue = useWatch({ name }) as PrerequisiteEditorValue | undefined
  const preview = formatRequirementEditorPreview(editorValue ?? { groups: [] })

  return (
    <div className="space-y-6">
      <div aria-live="polite" className="rounded-md bg-muted/60 px-4 py-4">
        <span className="sr-only">{PREVIEW_LABEL}</span>
        <Text variant="lead">{preview}</Text>
      </div>

      <Text variant="emphasis">{CONDITION_SETS_HEADING}</Text>

      {fields.length === 0 ? (
        <Text variant="muted" className="text-sm">
          {EMPTY_CONDITION_SETS_HINT}
        </Text>
      ) : (
        <div className="space-y-2">
          {fields.map((field, setIndex) => (
            <Fragment key={field.id}>
              {setIndex > 0 ? <LogicConnectorChip operator="AND" /> : null}
              <ConditionSetEditor
                idPrefix={`requirement-editor-set-${setIndex}`}
                setPath={`${groupsPath}.${setIndex}`}
                setIndex={setIndex}
                onRemove={() => remove(setIndex)}
              />
            </Fragment>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append(newRequirementGroup())}
      >
        {ADD_CONDITION_SET_LABEL}
      </Button>
    </div>
  )
}

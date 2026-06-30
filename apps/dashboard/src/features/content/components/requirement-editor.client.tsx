'use client'

import { Fragment, useCallback } from 'react'
import { useController, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import {
  Badge,
  Button,
  cn,
  Field,
  FieldGroup,
  Input,
  RadioGroupField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  fieldArrayItemClasses,
  fieldInlineSentenceClasses,
  fieldLabelVariants,
  fieldWidthVariants,
  type FieldSize,
} from '@rpg/ui'
import { useFormSectionContext } from '@rpg/ui/form'
import { ABILITY_SCORE_MAX, ABILITY_SCORE_MIN, MAX_CHARACTER_LEVEL } from '@rpg/contracts'
import { Trash2 } from 'lucide-react'

import {
  ABILITY_FIELD_LABEL,
  ABILITY_MINIMUM_OF_CONNECTOR,
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
} from '../lib/forms/requirement-editor-constants'
import { formatRequirementEditorPreview } from '../lib/forms/requirement-editor-form'
import {
  newRequirementDraftLeaf,
  newRequirementGroup,
  newRequirementLeaf,
  type PrerequisiteEditorValue,
  type RequirementLeafForm,
  type RequirementLeafType,
  type RequirementLeafTypedForm,
} from '../lib/forms/requirement-editor-form-schema'

export interface RequirementEditorProps {
  /** Parent form field path, e.g. `prerequisiteEditor`. */
  name: string
  /** Campaign max character level for min-level prerequisites. */
  maxCharacterLevel?: number
}

/** Flat field stack keeps sentence operands on one baseline inside the inline row. */
const SENTENCE_FIELD_STACK = 'space-y-0'
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
  maxCharacterLevel: number
  size: FieldSize
}

function MinLevelSegments({ idPrefix, leafPath, maxCharacterLevel, size }: MinLevelSegmentsProps) {
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
        size={size}
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
            max={maxCharacterLevel}
            size={size}
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
  size: FieldSize
}

function AbilityMinimumSegments({ idPrefix, leafPath, size }: AbilityMinimumSegmentsProps) {
  const { field: abilityField, fieldState: abilityFieldState } = useController({
    name: `${leafPath}.ability`,
  })
  const { field: minimumField, fieldState: minimumFieldState } = useController({
    name: `${leafPath}.minimum`,
  })

  return (
    <>
      <span className={SENTENCE_OPERATOR_CLASS} aria-hidden="true">
        {ABILITY_MINIMUM_OF_CONNECTOR}
      </span>
      <Field.Root
        id={`${idPrefix}-ability`}
        width="sm"
        size={size}
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
            <SelectTrigger size={size} onBlur={abilityField.onBlur}>
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
        size={size}
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
            size={size}
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
  maxCharacterLevel: number
  size: FieldSize
  onRemove: () => void
}

function ConditionSentenceRow({
  idPrefix,
  leafPath,
  setIndex,
  conditionIndex,
  canRemove,
  maxCharacterLevel,
  size,
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
        className={fieldLabelVariants({ size })}
        data-required
      >
        {CONDITION_TYPE_LABEL}
      </label>

      <div className={fieldInlineSentenceClasses}>
        <Field.Root
          id={typeControlId}
          width="md"
          size={size}
          required
          className={SENTENCE_FIELD_STACK}
          error={typeFieldState.error?.message}
        >
          <Field.Label className="sr-only">{CONDITION_TYPE_LABEL}</Field.Label>
          <Select value={leafType} onValueChange={handleTypeChange} name={typeField.name}>
            <Field.Control>
              <SelectTrigger
                size={size}
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
          <MinLevelSegments
            idPrefix={idPrefix}
            leafPath={leafPath}
            maxCharacterLevel={maxCharacterLevel}
            size={size}
          />
        ) : null}
        {leafType === 'abilityMinimum' ? (
          <AbilityMinimumSegments idPrefix={idPrefix} leafPath={leafPath} size={size} />
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
  maxCharacterLevel: number
  size: FieldSize
  onRemove: () => void
}

function ConditionSetEditor({
  idPrefix,
  setPath,
  setIndex,
  maxCharacterLevel,
  size,
  onRemove,
}: ConditionSetEditorProps) {
  const { fields, append, remove } = useFieldArray({ name: `${setPath}.requirements` })
  const { field: kindField, fieldState: kindFieldState } = useController({
    name: `${setPath}.kind`,
  })
  const groupKind = kindField.value as 'all' | 'any' | undefined

  return (
    <fieldset
      aria-label={conditionSetAriaLabel(setIndex)}
      className={cn(fieldArrayItemClasses, 'space-y-4')}
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
            size={size}
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
              maxCharacterLevel={maxCharacterLevel}
              size={size}
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
    </fieldset>
  )
}

/**
 * Sentence-builder editor for feat (and future content) prerequisites.
 * Binds to `prerequisiteEditor.groups` on the parent form via nested field arrays.
 */
export function RequirementEditor({
  name,
  maxCharacterLevel = MAX_CHARACTER_LEVEL,
}: RequirementEditorProps) {
  const { size, rhythm } = useFormSectionContext()
  const groupsPath = `${name}.groups`
  const { fields, append, remove } = useFieldArray({ name: groupsPath })
  const editorValue = useWatch({ name }) as PrerequisiteEditorValue | undefined
  const preview = formatRequirementEditorPreview(editorValue ?? { groups: [] }, maxCharacterLevel)

  return (
    <div className="space-y-6">
      <div aria-live="polite" className="rounded-md bg-muted/60 px-4 py-4">
        <span className="sr-only">{PREVIEW_LABEL}</span>
        <Text variant="lead">{preview}</Text>
      </div>

      <FieldGroup legend={CONDITION_SETS_HEADING} legendSize="array" size={size} rhythm={rhythm}>
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
                  maxCharacterLevel={maxCharacterLevel}
                  size={size}
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
      </FieldGroup>
    </div>
  )
}

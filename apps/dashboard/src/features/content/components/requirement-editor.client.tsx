'use client'

import { useCallback } from 'react'
import { useController, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { Button, FieldGroup, SelectField, Text } from '@rpg/ui'
import { FormItems } from '@rpg/ui/form'
import { Trash2 } from 'lucide-react'

import {
  ADD_REQUIREMENT_GROUP_LABEL,
  ADD_REQUIREMENT_LABEL,
  PREVIEW_LABEL,
  REQUIREMENT_LEAF_TYPE_OPTIONS,
  REQUIREMENT_TYPE_LABEL,
  removeRequirementGroupLabel,
  removeRequirementLabel,
  requirementGroupLegend,
} from '../lib/requirement-editor-constants'
import {
  requirementGroupKindField,
  requirementLeafDetailFields,
} from '../lib/requirement-editor-fields'
import {
  formatRequirementEditorPreview,
  newRequirementGroup,
  newRequirementLeaf,
  type PrerequisiteEditorValue,
  type RequirementLeafForm,
  type RequirementLeafType,
} from '../lib/requirement-editor-form'

export interface RequirementEditorProps {
  /** Parent form field path, e.g. `prerequisiteEditor`. */
  name: string
}

interface RequirementLeafRowProps {
  idPrefix: string
  namePrefix: string
  groupIndex: number
  leafIndex: number
  canRemove: boolean
  onRemove: () => void
}

function replaceLeafType(
  current: RequirementLeafForm,
  nextType: RequirementLeafType,
): RequirementLeafForm {
  if (current.type === nextType) return current
  return { ...newRequirementLeaf(nextType), id: current.id }
}

function RequirementLeafRow({
  idPrefix,
  namePrefix,
  groupIndex,
  leafIndex,
  canRemove,
  onRemove,
}: RequirementLeafRowProps) {
  const { setValue, getValues } = useFormContext()
  const leafPath = `${namePrefix}.requirements.${leafIndex}`
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

  return (
    <div className="space-y-4 rounded-md border border-border/60 p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-4">
          <SelectField
            id={`${idPrefix}-type`}
            label={REQUIREMENT_TYPE_LABEL}
            required
            width="md"
            size="sm"
            options={REQUIREMENT_LEAF_TYPE_OPTIONS}
            value={leafType ?? ''}
            onValueChange={handleTypeChange}
            onBlur={typeField.onBlur}
            error={typeFieldState.error?.message}
          />
          {leafType === 'spellcasting' ? (
            <Text variant="small" className="text-muted-foreground">
              Requires the Spellcasting feature.
            </Text>
          ) : leafType ? (
            <FormItems
              items={requirementLeafDetailFields(leafType)}
              idPrefix={`${idPrefix}-detail`}
              namePrefix={leafPath}
            />
          ) : null}
        </div>
        {canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-8 shrink-0 p-0"
            aria-label={removeRequirementLabel(groupIndex, leafIndex)}
            onClick={onRemove}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

interface RequirementGroupEditorProps {
  idPrefix: string
  namePrefix: string
  groupIndex: number
  onRemove: () => void
}

function RequirementGroupEditor({
  idPrefix,
  namePrefix,
  groupIndex,
  onRemove,
}: RequirementGroupEditorProps) {
  const { fields, append, remove } = useFieldArray({ name: `${namePrefix}.requirements` })

  return (
    <FieldGroup legend={requirementGroupLegend(groupIndex)}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <FormItems
              items={[requirementGroupKindField()]}
              idPrefix={`${idPrefix}-kind`}
              namePrefix={namePrefix}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-8 shrink-0 p-0"
            aria-label={removeRequirementGroupLabel(groupIndex)}
            onClick={onRemove}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, leafIndex) => (
            <RequirementLeafRow
              key={field.id}
              idPrefix={`${idPrefix}-req-${leafIndex}`}
              namePrefix={namePrefix}
              groupIndex={groupIndex}
              leafIndex={leafIndex}
              canRemove={fields.length > 1}
              onRemove={() => remove(leafIndex)}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(newRequirementLeaf())}
        >
          {ADD_REQUIREMENT_LABEL}
        </Button>
      </div>
    </FieldGroup>
  )
}

/**
 * Vertical group-based editor for feat (and future content) prerequisites.
 * Binds to `prerequisiteEditor.groups` on the parent form via nested field arrays.
 */
export function RequirementEditor({ name }: RequirementEditorProps) {
  const groupsPath = `${name}.groups`
  const { fields, append, remove } = useFieldArray({ name: groupsPath })
  const editorValue = useWatch({ name }) as PrerequisiteEditorValue | undefined
  const preview = formatRequirementEditorPreview(editorValue ?? { groups: [] })

  return (
    <div className="space-y-6">
      {fields.length === 0 ? (
        <Text variant="muted" className="text-sm">
          No prerequisite groups yet. Add one to define requirements.
        </Text>
      ) : (
        <div className="space-y-8">
          {fields.map((field, groupIndex) => (
            <RequirementGroupEditor
              key={field.id}
              idPrefix={`requirement-editor-group-${groupIndex}`}
              namePrefix={`${groupsPath}.${groupIndex}`}
              groupIndex={groupIndex}
              onRemove={() => remove(groupIndex)}
            />
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append(newRequirementGroup())}
      >
        {ADD_REQUIREMENT_GROUP_LABEL}
      </Button>

      <div aria-live="polite" className="rounded-md bg-muted/40 px-4 py-3">
        <Text variant="small" className="font-medium">
          {PREVIEW_LABEL}
        </Text>
        <Text variant="small" className="mt-1 text-muted-foreground">
          {preview}
        </Text>
      </div>
    </div>
  )
}

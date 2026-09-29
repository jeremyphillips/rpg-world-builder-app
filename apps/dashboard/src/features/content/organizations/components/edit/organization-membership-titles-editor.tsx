import * as React from 'react'
import { useController, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import {
  createOrganizationMembershipTitleId,
  sortOrganizationMembershipTitleDefinitionsForDisplay,
  type OrganizationMembershipTitleDefinition,
} from '@rpg/contracts'
import { Button, SelectField, TextField, Text } from '@rpg/ui'

import {
  createOrganizationMembershipTitleFormRow,
  organizationMembershipTitlePriorityOptions,
} from '../../lib/membership-titles/organization-membership-titles-form.lib'

import {
  organizationMembershipTitlesEditorListVariants,
  organizationMembershipTitlesEditorRowVariants,
} from './organization-membership-titles-editor.variants'

function membersTitlesFieldPath(prefix?: string): string {
  return prefix ? `${prefix}.members.titles` : 'members.titles'
}

type MembershipTitleRowProps = {
  fieldPath: string
  index: number
  canRemove: boolean
  onRemove: () => void
  idPrefix: string
}

function MembershipTitleRow({
  fieldPath,
  index,
  canRemove,
  onRemove,
  idPrefix,
}: MembershipTitleRowProps) {
  const labelPath = `${fieldPath}.${index}.label`
  const priorityPath = `${fieldPath}.${index}.priority`
  const idPath = `${fieldPath}.${index}.id`
  useController({ name: idPath })
  const { field: labelField, fieldState: labelFieldState } = useController({ name: labelPath })
  const { field: priorityField, fieldState: priorityFieldState } = useController({
    name: priorityPath,
  })

  return (
    <li className={organizationMembershipTitlesEditorRowVariants()}>
      <TextField
        id={`${idPrefix}-${index}-label`}
        label="Label"
        value={labelField.value ?? ''}
        onChange={labelField.onChange}
        onBlur={labelField.onBlur}
        error={labelFieldState.error?.message}
      />
      <SelectField
        id={`${idPrefix}-${index}-priority`}
        label="Rank"
        labelPosition="inline"
        options={organizationMembershipTitlePriorityOptions}
        value={String(priorityField.value ?? 10)}
        onValueChange={(value) => priorityField.onChange(Number.parseInt(value, 10))}
        error={priorityFieldState.error?.message}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={!canRemove}
        onClick={onRemove}
        aria-label="Remove membership title"
      >
        Remove
      </Button>
    </li>
  )
}

export type OrganizationMembershipTitlesEditorProps = {
  prefix?: string
  idPrefix?: string
}

export function OrganizationMembershipTitlesEditor({
  prefix,
  idPrefix = prefix ? `${prefix}-membership-titles` : 'organization-membership-titles',
}: OrganizationMembershipTitlesEditorProps) {
  const { control, getValues } = useFormContext()
  const fieldPath = membersTitlesFieldPath(prefix)
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: fieldPath,
    shouldUnregister: false,
  })
  const watchedTitles = useWatch({ control, name: fieldPath }) as
    | OrganizationMembershipTitleDefinition[]
    | undefined

  const watchedTitleIds = React.useMemo(
    () => (watchedTitles ?? []).map((row) => row.id).join('\0'),
    [watchedTitles],
  )
  const syncedCatalogIdsRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (syncedCatalogIdsRef.current === watchedTitleIds) return

    const catalog = getValues(fieldPath) as OrganizationMembershipTitleDefinition[] | undefined
    if (!catalog || catalog.length === 0) return

    replace(catalog)
    syncedCatalogIdsRef.current = watchedTitleIds
  }, [fieldPath, getValues, replace, watchedTitleIds])

  const sortedIndices = React.useMemo(() => {
    const titles = getValues(fieldPath) as OrganizationMembershipTitleDefinition[] | undefined
    const catalog = titles ?? []
    const sorted = sortOrganizationMembershipTitleDefinitionsForDisplay(catalog)
    return sorted.map((entry) => catalog.findIndex((row) => row.id === entry.id))
  }, [fieldPath, fields, getValues])

  const handleAdd = React.useCallback(() => {
    append(createOrganizationMembershipTitleFormRow(createOrganizationMembershipTitleId))
  }, [append])

  return (
    <div className="flex flex-col gap-3">
      <ol
        className={organizationMembershipTitlesEditorListVariants()}
        data-testid={`${idPrefix}-list`}
      >
        {sortedIndices.map((index) => {
          const field = fields[index]
          if (!field) return null

          return (
            <MembershipTitleRow
              key={field.id}
              fieldPath={fieldPath}
              index={index}
              idPrefix={idPrefix}
              canRemove={fields.length > 1}
              onRemove={() => {
                if (fields.length <= 1) return
                remove(index)
              }}
            />
          )
        })}
      </ol>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          Add title
        </Button>
        {fields.length <= 1 ? (
          <Text variant="muted">At least one membership title is required.</Text>
        ) : null}
      </div>
    </div>
  )
}

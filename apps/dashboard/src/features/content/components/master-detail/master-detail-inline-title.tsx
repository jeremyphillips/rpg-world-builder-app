import { useEffect, useRef, useState } from 'react'
import { get, useFormContext, useFormState, useWatch, type FieldErrors } from 'react-hook-form'
import { ActionButton, cn, Input, Text } from '@rpg/ui'
import { useFieldErrorPresentation, useFormValidationPresentation } from '@rpg/ui/form'

import type { MasterDetailInlineTitle } from '../../lib/master-detail/master-detail-inline-title.types'

export type { MasterDetailInlineTitle }

/** Shared by the display heading and the edit input so the two modes cannot drift. */
const MASTER_DETAIL_TITLE_TYPE_CLASS = 'truncate text-lg font-medium text-foreground'

const TITLE_LABEL = {
  authored: 'Name',
  override: 'Custom name',
} as const

function storedText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function storedName(value: unknown): string | undefined {
  const trimmed = storedText(value).trim()
  return trimmed ? trimmed : undefined
}

const NAME_WRITE = { shouldDirty: true, shouldTouch: true, shouldValidate: true } as const

function writeStoredName(
  getValues: (name: string) => unknown,
  setValue: (name: string, value: unknown, options: typeof NAME_WRITE) => void,
  path: string,
  next: string | undefined,
) {
  if (next !== undefined) {
    setValue(path, next, NAME_WRITE)
    return
  }
  const segments = path.split('.')
  const field = segments.pop()
  const parentPath = segments.join('.')
  const parent = parentPath ? getValues(parentPath) : undefined
  if (!field || !parent || typeof parent !== 'object' || Array.isArray(parent)) {
    setValue(path, '', NAME_WRITE)
    return
  }
  const copy = { ...(parent as Record<string, unknown>) }
  delete copy[field]
  setValue(parentPath, copy, NAME_WRITE)
}

export function MasterDetailInlineTitleEditor({
  namePrefix,
  titleInputId,
  selectedFieldId,
  title,
  onAcquisitionEditApplied,
}: {
  namePrefix: string
  /** Stable id for the title input element (RHF field id within the array). */
  titleInputId: string
  selectedFieldId: string
  title: MasterDetailInlineTitle
  onAcquisitionEditApplied?: (fieldId: string) => void
}) {
  const path = `${namePrefix}.${title.field}`
  const { getValues, setValue } = useFormContext()
  const watched = useWatch({ name: path })
  const { errors } = useFormState({ name: path })
  const fieldError = get(errors as FieldErrors, path) as { message?: string } | undefined
  const valueKey = storedText(watched)
  const presentation = useFormValidationPresentation()
  const issueMessage = presentation.issues.find((issue) => {
    const presentationPath = issue.presentationPath ?? issue.path
    return presentationPath === path || issue.path === path
  })?.message
  const validation = useFieldErrorPresentation(fieldError?.message ?? issueMessage, path)
  const inputRef = useRef<HTMLInputElement>(null)
  const cancelingRef = useRef(false)
  const localWriteRef = useRef(false)
  const seenValueRef = useRef(valueKey)
  const snapshotRef = useRef<string | undefined>(undefined)
  const snapshotReadyRef = useRef(false)
  const acquisitionEditOpenedRef = useRef(Boolean(title.initialEdit))
  const acquisitionAcknowledgedRef = useRef(false)
  const [editing, setEditing] = useState(() => Boolean(title.initialEdit))
  const [draft, setDraft] = useState(valueKey)
  const label = TITLE_LABEL[title.mode]
  const inputId = `master-detail-title-${titleInputId}`
  const errorId = `${inputId}-error`
  const display = storedName(watched) ?? title.fallback

  useEffect(() => {
    if (localWriteRef.current) {
      localWriteRef.current = false
      seenValueRef.current = valueKey
      return
    }
    if (seenValueRef.current === valueKey) return
    seenValueRef.current = valueKey
    setDraft(valueKey)
    setEditing(false)
  }, [valueKey])

  useEffect(() => {
    if (!editing) {
      snapshotReadyRef.current = false
      return
    }
    if (snapshotReadyRef.current) return
    snapshotReadyRef.current = true
    snapshotRef.current = storedName(getValues(path))
  }, [editing, getValues, path])

  useEffect(() => {
    if (!title.initialEdit || acquisitionEditOpenedRef.current) return
    acquisitionEditOpenedRef.current = true
    snapshotRef.current = storedName(getValues(path))
    setEditing(true)
  }, [getValues, path, title.initialEdit])

  useEffect(() => {
    if (!editing) return
    const input = inputRef.current
    if (!input) return
    input.focus()
    if (
      title.initialEdit &&
      acquisitionEditOpenedRef.current &&
      !acquisitionAcknowledgedRef.current &&
      onAcquisitionEditApplied
    ) {
      acquisitionAcknowledgedRef.current = true
      onAcquisitionEditApplied(selectedFieldId)
    }
  }, [editing, onAcquisitionEditApplied, selectedFieldId, title.initialEdit])

  function commit(raw: string) {
    const next = storedName(raw)
    setEditing(false)
    if (storedName(getValues(path)) === next) return
    localWriteRef.current = true
    writeStoredName(getValues, setValue, path, next)
  }

  function onBlur() {
    if (cancelingRef.current) {
      cancelingRef.current = false
      return
    }
    if (storedName(getValues(path)) !== snapshotRef.current) {
      setEditing(false)
      return
    }
    commit(draft)
  }

  return (
    <div className="min-w-0">
      <div
        data-master-detail-title-row
        className="inline-flex w-fit max-w-full min-h-[var(--control-height-md)] min-w-0 items-center gap-1"
      >
        {editing ? (
          <Input
            ref={inputRef}
            id={inputId}
            size="md"
            value={draft}
            placeholder={title.placeholder}
            aria-label={label}
            aria-invalid={validation.invalid}
            aria-describedby={validation.error ? errorId : undefined}
            autoComplete="off"
            className={cn(
              MASTER_DETAIL_TITLE_TYPE_CLASS,
              'w-auto min-w-80 max-w-full [field-sizing:content]',
            )}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={onBlur}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                commit(draft)
              }
              if (event.key === 'Escape') {
                event.preventDefault()
                cancelingRef.current = true
                setDraft(storedText(getValues(path)))
                setEditing(false)
              }
            }}
          />
        ) : (
          <div className={cn(MASTER_DETAIL_TITLE_TYPE_CLASS, 'min-w-0')}>{display}</div>
        )}
        <ActionButton
          action="edit"
          variant="ghost"
          size="icon-sm"
          aria-label="Edit name"
          aria-hidden={editing ? true : undefined}
          tabIndex={editing ? -1 : 0}
          className={editing ? 'invisible shrink-0' : 'shrink-0'}
          onClick={() => {
            snapshotRef.current = storedName(getValues(path))
            setDraft(storedText(getValues(path)))
            setEditing(true)
          }}
        />
      </div>
      {validation.error ? (
        <Text id={errorId} role="alert" variant="caption" className="text-destructive-muted">
          {validation.error}
        </Text>
      ) : null}
    </div>
  )
}

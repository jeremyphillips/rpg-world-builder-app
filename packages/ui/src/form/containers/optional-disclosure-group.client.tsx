'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useFormContext, useFormState, useWatch } from 'react-hook-form'

import { Button } from '../../components/ui/button.client'
import { FieldGroup } from '../../components/ui/field-group.client'
import { OptionalFieldDisclosure } from '../../components/ui/optional-field-disclosure.client'
import { formMicroActionButtonProps } from '../form-micro-action'
import type { GroupConfig } from '../field-config'
import { collectDependentClearingFields } from '../config/confirm-before-clear.lib'
import { useConfirmBeforeClear } from '../config/use-confirm-before-clear.client'

function objectHasContent(value: unknown): boolean {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.values(value as Record<string, unknown>).some((entry) => {
    if (entry == null || entry === '') return false
    if (typeof entry === 'object') return objectHasContent(entry)
    return true
  })
}

function watchedHasContent(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'string') return value.trim().length > 0
  return objectHasContent(value)
}

type OptionalDisclosureGroupProps = {
  item: GroupConfig
  idPrefix: string
  namePrefix?: string
  children: ReactNode
}

/** Optional object group. Opening writes form state only when `seedWhen` is set. Remove unsets the object. */
export function OptionalDisclosureGroup({
  item,
  idPrefix,
  namePrefix,
  children,
}: OptionalDisclosureGroupProps) {
  const disclosure = item.optionalDisclosure
  const objectName = item.name
  if (!disclosure || !objectName) return children

  return (
    <OptionalDisclosureGroupBody
      disclosure={disclosure}
      objectName={objectName}
      fieldLabel={item.heading?.label ?? item.legend ?? 'Saving throw'}
      fields={item.fields}
      idPrefix={idPrefix}
      namePrefix={namePrefix}
    >
      {children}
    </OptionalDisclosureGroupBody>
  )
}

function OptionalDisclosureGroupBody({
  disclosure,
  objectName,
  fieldLabel,
  fields,
  idPrefix,
  namePrefix,
  children,
}: {
  disclosure: NonNullable<GroupConfig['optionalDisclosure']>
  objectName: string
  fieldLabel: string
  fields: GroupConfig['fields']
  idPrefix: string
  namePrefix?: string
  children: ReactNode
}) {
  const fullName = namePrefix ? `${namePrefix}.${objectName}` : objectName
  const { setValue, unregister } = useFormContext()
  const watched = useWatch({ name: fullName })
  const populated = watchedHasContent(watched)
  const [manualOpen, setManualOpen] = useState(false)
  const { defaultValues } = useFormState({ name: fullName })
  const defaultsRef = useRef(defaultValues)
  useEffect(() => {
    if (defaultsRef.current === defaultValues) return
    defaultsRef.current = defaultValues
    setManualOpen(false)
  }, [defaultValues])
  const open = manualOpen || (disclosure.expandWhenPopulated !== false && populated)
  const controlId = `${idPrefix}-${fullName.replaceAll('.', '-')}`

  const clear = () => {
    unregister(fullName, { keepDefaultValue: true, keepDirty: false })
    setTimeout(() => {
      setValue(fullName, undefined, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }, 0)
    setManualOpen(false)
  }
  const { attemptClear, confirmDialog } = useConfirmBeforeClear({
    confirmBeforeClear: disclosure.confirmBeforeClear,
    clearingFields: collectDependentClearingFields(fields),
    namePrefix,
    onClear: clear,
  })

  const removeLabel = disclosure.removeLabel ?? 'Remove'
  if (open) {
    return (
      <>
        <FieldGroup
          id={controlId}
          legend={fieldLabel}
          legendAction={
            <Button
              {...formMicroActionButtonProps}
              aria-label={`${removeLabel} ${fieldLabel}`}
              onClick={attemptClear}
            >
              {removeLabel}
            </Button>
          }
        >
          {children}
        </FieldGroup>
        {confirmDialog}
      </>
    )
  }

  return (
    <>
      <OptionalFieldDisclosure
        controlId={controlId}
        fieldLabel={fieldLabel}
        addLabel={disclosure.addLabel}
        removeLabel={removeLabel}
        open={false}
        labeled={disclosure.labeled}
        addDisabled={disclosure.addDisabled}
        onOpenChange={(next) => {
          if (!next) return
          setManualOpen(true)
          if (disclosure.seedWhen && !watchedHasContent(watched)) {
            setValue(fullName, disclosure.seedWhen({}), {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            })
          }
        }}
        onRemove={attemptClear}
      >
        {null}
      </OptionalFieldDisclosure>
      {confirmDialog}
    </>
  )
}

'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useFormContext, useFormState, useWatch } from 'react-hook-form'

import { ActionIcon } from '../../components/ui/action-icon.client'
import { Button } from '../../components/ui/button.client'
import { FieldGroup } from '../../components/ui/field-group.client'
import { OptionalFieldDisclosure } from '../../components/ui/optional-field-disclosure.client'
import { fieldActionLabelMetricsClasses } from '../../components/ui/field.variants'
import type { GroupConfig } from '../field-config'
import { collectDependentClearingFields } from '../config/confirm-before-clear.lib'
import { useDependsOnValues } from '../config/form-depends-on.client'
import { useConfirmBeforeClear } from '../config/use-confirm-before-clear.client'
import {
  resolveOptionalDisclosureClearPaths,
  useOptionalDisclosureGroupLegendChrome,
} from './optional-disclosure-group.lib'

function objectHasContent(value: unknown): boolean {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.values(value as Record<string, unknown>).some((entry) => {
    if (entry == null || entry === '') return false
    if (typeof entry === 'object') return objectHasContent(entry)
    return true
  })
}

function watchedHasContent(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'string') return value.trim().length > 0
  return objectHasContent(value)
}

function rootPathHasContent(values: Record<string, unknown>, path: string): boolean {
  return watchedHasContent(values[path])
}

function optionalGroupPopulated(
  values: Record<string, unknown>,
  disclosure: NonNullable<GroupConfig['optionalDisclosure']>,
  watched: unknown,
): boolean {
  if (disclosure.watchPaths && disclosure.watchPaths.length > 0) {
    return disclosure.watchPaths.some((path) => rootPathHasContent(values, path))
  }
  return watchedHasContent(watched)
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
      item={item}
      disclosure={disclosure}
      objectName={objectName}
      idPrefix={idPrefix}
      namePrefix={namePrefix}
    >
      {children}
    </OptionalDisclosureGroupBody>
  )
}

function OptionalDisclosureGroupBody({
  item,
  disclosure,
  objectName,
  idPrefix,
  namePrefix,
  children,
}: {
  item: GroupConfig
  disclosure: NonNullable<GroupConfig['optionalDisclosure']>
  objectName: string
  idPrefix: string
  namePrefix?: string
  children: ReactNode
}) {
  const { fieldLabel, heading, legendSize, groupRhythm, groupSize, hint } =
    useOptionalDisclosureGroupLegendChrome(item, namePrefix)
  const fullName = namePrefix ? `${namePrefix}.${objectName}` : objectName
  const { setValue, unregister, getValues } = useFormContext()
  const watched = useWatch({ name: fullName })
  const formValues = useWatch()
  const populated = optionalGroupPopulated(
    (formValues ?? getValues()) as Record<string, unknown>,
    disclosure,
    watched,
  )
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
  const summaryDependsOn = disclosure.summary?.dependsOn ?? []
  const summaryDependencyValues = useDependsOnValues(summaryDependsOn, namePrefix)
  const summaryText = disclosure.summary?.resolve(summaryDependencyValues, { open })

  const clear = () => {
    const pathsToClear = resolveOptionalDisclosureClearPaths(disclosure, fullName)
    for (const path of pathsToClear) {
      unregister(path, { keepDefaultValue: true, keepDirty: false })
    }
    setTimeout(() => {
      for (const path of pathsToClear) {
        setValue(path, undefined, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })
      }
    }, 0)
    setManualOpen(false)
  }
  const { attemptClear, confirmDialog } = useConfirmBeforeClear({
    confirmBeforeClear: disclosure.confirmBeforeClear,
    clearingFields: collectDependentClearingFields(item.fields),
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
          legendSrOnly={heading?.labelVisibility === 'srOnly'}
          legendAccessory={heading?.accessory}
          legendSize={legendSize}
          headingScale={item.headingScale}
          rhythm={groupRhythm}
          size={groupSize}
          hint={hint}
          legendAction={
            <Button
              type="button"
              variant="text"
              size="default"
              className="gap-1.5"
              aria-label={`${removeLabel} ${fieldLabel}`}
              onClick={attemptClear}
            >
              <ActionIcon action="clear" size="owner" />
              <span className={fieldActionLabelMetricsClasses(groupSize)}>{removeLabel}</span>
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
        summary={summaryText}
        addDisabled={disclosure.addDisabled}
        onOpenChange={(next) => {
          if (!next) return
          setManualOpen(true)
          if (disclosure.seedWhen && !watchedHasContent(watched)) {
            const seedValues = (formValues ?? getValues()) as Record<string, unknown>
            setValue(fullName, disclosure.seedWhen(seedValues), {
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

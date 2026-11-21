'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useFormContext, useFormState, useWatch } from 'react-hook-form'

import { FieldGroup } from '../../components/ui/field-group.client'
import {
  OptionalDisclosureAction,
  OptionalFieldDisclosure,
} from '../../components/ui/optional-field-disclosure.client'
import type { GroupConfig } from '../field-config'
import { collectDependentClearingFields } from '../config/confirm-before-clear.lib'
import { useDependsOnValues } from '../config/form-depends-on.client'
import { getValueAtPath, resolveDependsOnWatchName } from '../config/form-depends-on.lib'
import { useConfirmBeforeClear } from '../config/use-confirm-before-clear.client'
import {
  optionalDisclosureShellProps,
  resolveOptionalDisclosureActions,
  resolveOptionalDisclosureSubject,
} from '../config/optional-disclosure-actions.lib'
import {
  resolveOptionalDisclosureClearPaths,
  useOptionalDisclosureGroupLegendChrome,
} from './optional-disclosure-group.lib'
import { optionalDisclosureDependsOnPaths } from '../config/optional-disclosure-config.lib'
import { OptionalDisclosureSourcePreview } from '../../components/ui/optional-disclosure-source-preview.client'
import type { OptionalDisclosureSourcePreviewContent } from '../../components/ui/optional-disclosure-source-preview.client'
import type { FieldSize } from '../../components/ui/field.client'
import {
  fieldAnatomyStackVariants,
  fieldStackRhythmVariants,
  type FieldRhythm,
} from '../../components/ui/field.variants'
import { cn } from '../../lib/utils'

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

function rootPathHasContent(
  values: Record<string, unknown>,
  path: string,
  namePrefix?: string,
): boolean {
  const resolved = resolveDependsOnWatchName(path, namePrefix)
  return watchedHasContent(getValueAtPath(values, resolved))
}

function optionalGroupPopulated(
  values: Record<string, unknown>,
  disclosure: NonNullable<GroupConfig['optionalDisclosure']>,
  watched: unknown,
  namePrefix?: string,
): boolean {
  if (disclosure.watchPaths && disclosure.watchPaths.length > 0) {
    return disclosure.watchPaths.some((path) => rootPathHasContent(values, path, namePrefix))
  }
  return watchedHasContent(watched)
}

type OptionalDisclosureGroupProps = {
  item: GroupConfig
  idPrefix: string
  namePrefix?: string
  children: ReactNode
}

/**
 * Source preview sits in field anatomy with the editor; editor siblings keep section rhythm.
 * Omit the wrapper when no preview — ordinary group body layout is unchanged.
 */
function OptionalDisclosureOpenGroupBody({
  controlId,
  sourcePreview,
  groupSize,
  groupRhythm,
  children,
}: {
  controlId: string
  sourcePreview?: OptionalDisclosureSourcePreviewContent
  groupSize: FieldSize
  groupRhythm: FieldRhythm
  children: ReactNode
}) {
  if (!sourcePreview) return children

  return (
    <div className={fieldAnatomyStackVariants({ size: groupSize })}>
      <OptionalDisclosureSourcePreview id={`${controlId}-source-preview`} preview={sourcePreview} />
      <div className={cn(fieldStackRhythmVariants({ rhythm: groupRhythm }), 'min-w-0')}>
        {children}
      </div>
    </div>
  )
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
    namePrefix,
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
  const dependencyValues = useDependsOnValues(
    optionalDisclosureDependsOnPaths(disclosure),
    namePrefix,
  )
  const summaryText = disclosure.summary?.resolve(dependencyValues, { open })
  const sourcePreview = open ? disclosure.sourcePreview?.resolve(dependencyValues) : undefined

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

  const actions = resolveOptionalDisclosureActions({
    intent: disclosure.intent,
    subject: resolveOptionalDisclosureSubject(fieldLabel, disclosure),
    labeled: disclosure.labeled,
    addLabel: disclosure.addLabel,
    removeLabel: disclosure.removeLabel,
  })
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
            <OptionalDisclosureAction
              action={actions.openAction}
              placement="inlineWithLabel"
              fieldSize={groupSize}
              aria-label={actions.openAccessibleName}
              onClick={attemptClear}
            >
              {actions.openLabel}
            </OptionalDisclosureAction>
          }
        >
          <OptionalDisclosureOpenGroupBody
            controlId={controlId}
            sourcePreview={sourcePreview}
            groupSize={groupSize}
            groupRhythm={groupRhythm}
          >
            {children}
          </OptionalDisclosureOpenGroupBody>
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
        {...optionalDisclosureShellProps(actions)}
        open={false}
        size={groupSize}
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

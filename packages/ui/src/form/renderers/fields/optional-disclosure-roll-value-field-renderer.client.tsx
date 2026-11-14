'use client'

import { useFormContext, useWatch } from 'react-hook-form'

import { OptionalFieldDisclosure } from '../../../components/ui/optional-field-disclosure.client'
import type { FieldHintPosition } from '../../../components/ui/field.variants'
import { useDependsOnValues } from '../../config/form-depends-on.client'
import type { OptionalDisclosureConfig, RollValueFieldConfig } from '../../field-config'
import { assertOptionalDisclosureFieldConfig } from '../../config/optional-disclosure-config.lib'
import { RollValueFieldRenderer } from './roll-value-field-renderer.client'

export function isOptionalRollPresent(value: unknown): boolean {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

type OptionalDisclosureRollValueFieldRendererProps = {
  config: RollValueFieldConfig
  disclosure: OptionalDisclosureConfig
  fullName: string
  id: string
  namePrefix?: string
  hint?: string
  hintPosition?: FieldHintPosition
}

/** Opens while the roll object exists, including partial and flat-only values. */
export function OptionalDisclosureRollValueFieldRenderer({
  config,
  disclosure,
  fullName,
  id,
  namePrefix,
  hint,
  hintPosition,
}: OptionalDisclosureRollValueFieldRendererProps) {
  assertOptionalDisclosureFieldConfig(config)
  const { setValue, unregister } = useFormContext()
  const watched = useWatch({ name: fullName })
  const open = isOptionalRollPresent(watched)
  const dependsOn = disclosure.summary?.dependsOn ?? []
  const dependencyValues = useDependsOnValues(dependsOn, namePrefix)
  const summary = disclosure.summary?.resolve(dependencyValues, { open })

  const seed = () => {
    if (disclosure.addDisabled) return
    const next = disclosure.seedWhen?.(dependencyValues) ?? {}
    setValue(fullName, next, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
  }

  const clear = () => {
    unregister(fullName, { keepDefaultValue: true, keepDirty: false })
    // Child controllers unregister on unmount and drop this field's dirty flag.
    // Rewrite the absent value afterward so dirtyFields matches defaultValues.
    setTimeout(() => {
      setValue(fullName, undefined, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }, 0)
  }

  return (
    <OptionalFieldDisclosure
      controlId={id}
      fieldLabel={config.label}
      addLabel={disclosure.addLabel}
      removeLabel={disclosure.removeLabel}
      open={open}
      labeled={disclosure.labeled}
      summary={summary}
      addDisabled={disclosure.addDisabled}
      onOpenChange={(next) => {
        if (next) seed()
      }}
      onRemove={clear}
    >
      {open ? (
        <RollValueFieldRenderer
          config={{ ...config, labelVisibility: 'srOnly' }}
          fullName={fullName}
          id={id}
          hint={hint}
          hintPosition={hintPosition}
        />
      ) : null}
    </OptionalFieldDisclosure>
  )
}

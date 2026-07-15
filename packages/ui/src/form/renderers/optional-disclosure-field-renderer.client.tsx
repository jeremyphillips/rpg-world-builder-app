'use client'

import { useState } from 'react'
import type { ControllerRenderProps } from 'react-hook-form'

import { OptionalFieldDisclosure } from '../../components/ui/optional-field-disclosure.client'
import { TextareaField } from '../../components/ui/textarea-field'
import type { OptionalDisclosureConfig, TextareaFieldConfig } from '../field-config'

type OptionalDisclosureTextareaRendererProps = {
  config: TextareaFieldConfig
  disclosure: OptionalDisclosureConfig
  field: ControllerRenderProps
  id: string
  error?: string
  invalid?: boolean
  describedBy?: string
}

export function OptionalDisclosureTextareaFieldRenderer({
  config,
  disclosure,
  field,
  id,
  error,
  invalid,
  describedBy,
}: OptionalDisclosureTextareaRendererProps) {
  const [manualOpen, setManualOpen] = useState(false)
  const hasValue = Boolean(String(field.value ?? '').trim())
  const expandWhenPopulated = disclosure.expandWhenPopulated !== false
  const open = manualOpen || (expandWhenPopulated && hasValue)

  const handleRemove = () => {
    field.onChange('')
    setManualOpen(false)
  }

  return (
    <OptionalFieldDisclosure
      controlId={id}
      fieldLabel={config.label}
      addLabel={disclosure.addLabel}
      removeLabel={disclosure.removeLabel}
      open={open}
      onOpenChange={setManualOpen}
      onRemove={handleRemove}
      size={config.size}
    >
      <TextareaField
        id={id}
        label=""
        aria-label={config.label}
        error={error}
        invalid={invalid}
        describedBy={describedBy}
        hint={config.hint}
        hintPosition={config.hintPosition}
        info={config.info}
        required={config.required}
        width={config.width}
        size={config.size}
        placeholder={config.placeholder}
        rows={config.rows}
        disabled={config.disabled}
        ref={field.ref}
        value={field.value ?? ''}
        onChange={field.onChange}
        onBlur={field.onBlur}
      />
    </OptionalFieldDisclosure>
  )
}

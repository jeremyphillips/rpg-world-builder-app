'use client'

import { useEffect, useRef, useState } from 'react'
import type { ControllerRenderProps } from 'react-hook-form'

import { resolveSelectFieldOptionLabel } from '../../../field-config'
import type { FieldOption } from '../../../field-config'
import { normalizedSelectFieldValue } from './select-field-renderer.lib'

type UseSelectFieldChangePresentationArgs = {
  changeLabel: string | undefined
  field: ControllerRenderProps
  fieldId: string
  flatOptions: readonly FieldOption[]
  onFieldBlur: () => void
}

export function useSelectFieldChangePresentation({
  changeLabel,
  field,
  fieldId,
  flatOptions,
  onFieldBlur,
}: UseSelectFieldChangePresentationArgs) {
  const [changing, setChanging] = useState(false)
  const changeButtonRef = useRef<HTMLButtonElement>(null)
  const selectWasOpenRef = useRef(false)
  const value = normalizedSelectFieldValue(field.value)
  const [committedValue, setCommittedValue] = useState(value)
  if (committedValue !== value) {
    setCommittedValue(value)
    if (changing) setChanging(false)
  }
  const committedLabel = resolveSelectFieldOptionLabel(field.value, flatOptions)
  const showEditor =
    !changeLabel || changing || value === '' || (value !== '' && committedLabel == null)

  useEffect(() => {
    if (!changing || !changeLabel) return
    requestAnimationFrame(() => {
      document.getElementById(fieldId)?.focus()
    })
  }, [changeLabel, changing, fieldId])

  const focusChangeButton = () => {
    requestAnimationFrame(() => {
      changeButtonRef.current?.focus()
    })
  }

  const exitChangeOnBlur = () => {
    onFieldBlur()
    if (!changeLabel || !value) return
    window.setTimeout(() => {
      if (selectWasOpenRef.current) return
      setChanging(false)
    }, 0)
  }

  const beginChange = () => {
    selectWasOpenRef.current = false
    setChanging(true)
  }

  const handleValueChange = (next: string) => {
    field.onChange(next)
    if (changeLabel && next) {
      selectWasOpenRef.current = false
      setChanging(false)
      focusChangeButton()
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      selectWasOpenRef.current = true
      return
    }
    if (changeLabel && selectWasOpenRef.current && value) {
      selectWasOpenRef.current = false
      setChanging(false)
      focusChangeButton()
    }
  }

  return {
    changeButtonRef,
    committedLabel,
    showEditor,
    value,
    beginChange,
    exitChangeOnBlur,
    handleOpenChange,
    handleValueChange,
  }
}

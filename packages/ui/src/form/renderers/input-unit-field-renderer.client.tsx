'use client'

import { useWatch } from 'react-hook-form'

import { resolveValueDigitsFromConfig } from '../config/input-field-value-digits.lib'
import { inputUnitToInlineSentence } from '../config/inline-sentence-legacy-config.lib'
import type { InputUnitFieldConfig } from '../field-config'
import { InlineSentenceFieldRenderer } from './inline-sentence-field-renderer.client'

export interface InputUnitFieldRendererProps {
  config: InputUnitFieldConfig
  id: string
  error?: string
  /** Prefix for `valueDigitsDependsOn` paths inside array items (e.g. `traits.0`). */
  namePrefix?: string
}

/** @deprecated Prefer `InlineSentenceFieldRenderer`. */
export function InputUnitFieldRenderer({
  config,
  id,
  error,
  namePrefix,
}: InputUnitFieldRendererProps) {
  const dependsOn = config.valueDigitsDependsOn
  const prefixedDependsOn = dependsOn
    ? namePrefix
      ? `${namePrefix}.${dependsOn}`
      : dependsOn
    : undefined
  const watchedKind = useWatch({ name: prefixedDependsOn ?? '', disabled: !prefixedDependsOn })
  const valueDigits = resolveValueDigitsFromConfig(config, watchedKind)

  const inlineConfig = inputUnitToInlineSentence({
    ...config,
    valueDigits: valueDigits ?? config.valueDigits,
  })

  return (
    <InlineSentenceFieldRenderer
      config={inlineConfig}
      id={id}
      namePrefix={namePrefix}
      error={error}
    />
  )
}

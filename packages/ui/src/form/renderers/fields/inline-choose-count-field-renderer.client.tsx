'use client'

import { InlineSentenceFieldRenderer } from './inline-sentence-field-renderer.client'
import { inlineChooseCountToInlineSentence } from '../../config/inline-sentence-legacy-config.lib'
import type { InlineChooseCountFieldConfig } from '../../field-config'

export interface InlineChooseCountFieldRendererProps {
  config: InlineChooseCountFieldConfig
  id: string
  namePrefix?: string
  error?: string
}

/** @deprecated Prefer `InlineSentenceFieldRenderer`. */
export function InlineChooseCountFieldRenderer({
  config,
  id,
  namePrefix,
  error,
}: InlineChooseCountFieldRendererProps) {
  return (
    <InlineSentenceFieldRenderer
      config={inlineChooseCountToInlineSentence(config)}
      id={id}
      namePrefix={namePrefix}
      error={error}
    />
  )
}

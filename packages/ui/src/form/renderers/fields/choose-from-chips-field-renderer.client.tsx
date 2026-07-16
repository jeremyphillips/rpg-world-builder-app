'use client'

import { InlineSentenceFieldRenderer } from './inline-sentence-field-renderer.client'
import { chooseFromChipsToInlineSentence } from '../../config/inline-sentence-legacy-config.lib'
import type { ChooseFromChipsFieldConfig } from '../../field-config'

export interface ChooseFromChipsFieldRendererProps {
  config: ChooseFromChipsFieldConfig
  id: string
  namePrefix?: string
  error?: string
}

/** @deprecated Prefer `InlineSentenceFieldRenderer`. */
export function ChooseFromChipsFieldRenderer({
  config,
  id,
  namePrefix,
  error,
}: ChooseFromChipsFieldRendererProps) {
  return (
    <InlineSentenceFieldRenderer
      config={chooseFromChipsToInlineSentence(config)}
      id={id}
      namePrefix={namePrefix}
      error={error}
    />
  )
}

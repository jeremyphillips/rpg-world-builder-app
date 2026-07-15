'use client'

import type { FieldConfig } from '../../field-config'
import {
  chooseFromChipsToInlineSentence,
  inlineChooseCountToInlineSentence,
} from '../../config/inline-sentence-legacy-config.lib'
import { InlineSentenceFieldRenderer } from './inline-sentence-field-renderer.client'
import { InputSelectFieldRenderer } from './input-select-field-renderer.client'
import { InputUnitFieldRenderer } from './input-unit-field-renderer.client'
import { LevelRangeFieldRenderer } from './level-range-field-renderer.client'
import { RollValueFieldRenderer } from './roll-value-field-renderer.client'

type SpecializedFieldRendererProps = {
  renderConfig: FieldConfig
  fullName: string
  id: string
  namePrefix?: string
}

/** Renders field types that bypass the standard `useController` registry path. */
export function renderSpecializedField({
  renderConfig,
  fullName,
  id,
  namePrefix,
}: SpecializedFieldRendererProps) {
  switch (renderConfig.type) {
    case 'inputSelect':
      return (
        <InputSelectFieldRenderer
          config={renderConfig}
          fullName={fullName}
          id={id}
          namePrefix={namePrefix}
        />
      )
    case 'inputUnit':
      return <InputUnitFieldRenderer config={renderConfig} id={id} namePrefix={namePrefix} />
    case 'levelRange':
      return <LevelRangeFieldRenderer config={renderConfig} id={id} namePrefix={namePrefix} />
    case 'inlineChooseCount':
      return (
        <InlineSentenceFieldRenderer
          config={inlineChooseCountToInlineSentence(renderConfig)}
          id={id}
          namePrefix={namePrefix}
        />
      )
    case 'chooseFromChips':
      return (
        <InlineSentenceFieldRenderer
          config={chooseFromChipsToInlineSentence(renderConfig)}
          id={id}
          namePrefix={namePrefix}
        />
      )
    case 'inlineSentence':
      return <InlineSentenceFieldRenderer config={renderConfig} id={id} namePrefix={namePrefix} />
    case 'rollValue':
      return <RollValueFieldRenderer config={renderConfig} fullName={fullName} id={id} />
    default:
      return null
  }
}

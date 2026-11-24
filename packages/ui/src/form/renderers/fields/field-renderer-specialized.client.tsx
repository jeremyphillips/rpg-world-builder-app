'use client'

import { useWatch } from 'react-hook-form'

import {
  chooseFromChipsToInlineSentence,
  inlineChooseCountToInlineSentence,
  inputUnitToInlineSentence,
} from '../../config/inline-sentence-legacy-config.lib'
import { resolveValueDigitsFromConfig } from '../../config/input-field-value-digits.lib'
import type { InputUnitFieldConfig } from '../../field-config'
import type { MultiControllerFieldConfig } from '../field-renderer-families.lib'
import type { ResolvedFieldRender } from '../field-resolved-render.types'
import { InlineSentenceFieldRenderer } from './inline-sentence/inline-sentence-field-renderer.client'
import { InputSelectFieldRenderer } from './input-select-field-renderer.client'
import { LevelRangeFieldRenderer } from './level-range-field-renderer.client'
import { JoinedPairFieldRenderer } from './joined-pair/joined-pair-field-renderer.client'
import { OptionalDisclosureJoinedPairFieldRenderer } from './joined-pair/optional-disclosure-joined-pair-field-renderer.client'
import { OptionalDisclosureRollValueFieldRenderer } from './optional-disclosure/optional-disclosure-roll-value-field-renderer.client'
import { RollValueFieldRenderer } from './roll-value-field-renderer.client'

function InputUnitInlineSentenceField({
  config,
  id,
  namePrefix,
}: {
  config: InputUnitFieldConfig
  id: string
  namePrefix?: string
}) {
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

  return <InlineSentenceFieldRenderer config={inlineConfig} id={id} namePrefix={namePrefix} />
}

/** Renders field types that register more than one controller. */
export function renderSpecializedField({
  resolved,
}: {
  resolved: ResolvedFieldRender & { config: MultiControllerFieldConfig }
}) {
  const { config: renderConfig, fullName, id, namePrefix, hint, hintPosition } = resolved
  switch (renderConfig.type) {
    case 'inputSelect':
      return (
        <InputSelectFieldRenderer
          config={renderConfig}
          fullName={fullName}
          id={id}
          namePrefix={namePrefix}
          hint={hint}
          hintPosition={hintPosition}
        />
      )
    case 'inputUnit':
      return <InputUnitInlineSentenceField config={renderConfig} id={id} namePrefix={namePrefix} />
    case 'levelRange':
      return (
        <LevelRangeFieldRenderer
          config={renderConfig}
          id={id}
          namePrefix={namePrefix}
          hint={hint}
          hintPosition={hintPosition}
        />
      )
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
    case 'joinedPair':
      if (renderConfig.optionalDisclosure) {
        return (
          <OptionalDisclosureJoinedPairFieldRenderer
            config={renderConfig}
            disclosure={renderConfig.optionalDisclosure}
            id={id}
            namePrefix={namePrefix}
          />
        )
      }
      return <JoinedPairFieldRenderer config={renderConfig} id={id} namePrefix={namePrefix} />
    case 'rollValue':
      if (renderConfig.optionalDisclosure) {
        return (
          <OptionalDisclosureRollValueFieldRenderer
            config={renderConfig}
            disclosure={renderConfig.optionalDisclosure}
            fullName={fullName}
            id={id}
            namePrefix={namePrefix}
            hint={hint}
            hintPosition={hintPosition}
          />
        )
      }
      return (
        <RollValueFieldRenderer
          config={renderConfig}
          fullName={fullName}
          id={id}
          hint={hint}
          hintPosition={hintPosition}
        />
      )
    default: {
      const unreachable: never = renderConfig
      return unreachable
    }
  }
}

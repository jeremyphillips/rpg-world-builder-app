import type { FieldConfig, FieldType } from '../field-config'

/** Fields that register more than one controller. Select and text suggestions are separate families. */
export const MULTI_CONTROLLER_FIELD_TYPES = [
  'inputSelect',
  'inputUnit',
  'levelRange',
  'inlineSentence',
  'inlineChooseCount',
  'chooseFromChips',
  'joinedPair',
  'rollValue',
] as const

export type MultiControllerFieldType = (typeof MULTI_CONTROLLER_FIELD_TYPES)[number]

export type StandardRegistryType = Exclude<
  FieldType,
  MultiControllerFieldType | 'select' | 'textSuggestions'
>

export type StandardRegistryFieldConfig = Extract<FieldConfig, { type: StandardRegistryType }>

export type MultiControllerFieldConfig = Extract<FieldConfig, { type: MultiControllerFieldType }>

export function isMultiControllerField(config: FieldConfig): config is MultiControllerFieldConfig {
  return (MULTI_CONTROLLER_FIELD_TYPES as readonly string[]).includes(config.type)
}

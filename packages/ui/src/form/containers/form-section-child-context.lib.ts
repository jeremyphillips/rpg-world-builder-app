import {
  DEFAULT_ARRAY_SECTION_RHYTHM,
  DEFAULT_ARRAY_SECTION_SIZE,
  resolveArraySectionSize,
  resolveFieldStackRhythm,
} from '../../components/ui/field.variants'
import {
  buildFormSectionChildContext,
  type FormSectionContextValue,
} from '../context/form-section.context'
import type { ArrayConfig, SlotConfig } from '../field-config'

export function buildArraySectionChildContext(
  parent: FormSectionContextValue,
  depth: number,
  config: ArrayConfig,
): FormSectionContextValue {
  return buildFormSectionChildContext(parent, depth, {
    rhythm: resolveFieldStackRhythm({
      explicit: config.rhythm,
      inherited: parent.rhythm,
      sectionDefault: DEFAULT_ARRAY_SECTION_RHYTHM,
    }),
    size: resolveArraySectionSize({
      explicit: config.size,
      inherited: parent.size,
      sectionDefault: DEFAULT_ARRAY_SECTION_SIZE,
    }),
  })
}

export function buildSlotSectionChildContext(
  parent: FormSectionContextValue,
  depth: number,
  config: SlotConfig,
): FormSectionContextValue {
  return buildFormSectionChildContext(parent, depth, {
    rhythm: resolveFieldStackRhythm({
      explicit: config.rhythm,
      inherited: parent.rhythm,
      sectionDefault: DEFAULT_ARRAY_SECTION_RHYTHM,
    }),
    size: resolveArraySectionSize({
      explicit: config.size,
      inherited: parent.size,
      sectionDefault: DEFAULT_ARRAY_SECTION_SIZE,
    }),
  })
}

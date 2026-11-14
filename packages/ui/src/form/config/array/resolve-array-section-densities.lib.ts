import type { FieldSizeToken } from '../../../components/ui/field-sizing.variants'
import type { FieldRhythm } from '../../../components/ui/field.variants'
import type { FormSectionContextValue } from '../../context/form-section.context'
import {
  DEFAULT_ARRAY_SECTION_DENSITY,
  resolveFormDensity,
  resolveSectionDensity,
  type FormDensity,
} from '../../form-density'
import type { ArrayConfig } from '../../field-config'
import { resolveFieldControlSize } from '../../resolve-field-control-size.lib'
import type { FieldSize } from '../../../components/ui/field.client'

export type ResolvedArraySectionDensities = {
  presentationDensity: FormDensity
  bodyLayoutDensity: FormDensity
  defaultControlSize: FieldSize | undefined
  legendRhythm: FieldRhythm
  legendFieldSize: FieldSizeToken
}

/** SSOT for array presentation density, body layout density, and inherited control default. */
export function resolveArraySectionDensities(
  config: ArrayConfig,
  parent: Pick<FormSectionContextValue, 'density' | 'defaultControlSize'>,
): ResolvedArraySectionDensities {
  const presentationDensity = config.density ?? parent.density
  const bodyLayoutDensity = resolveSectionDensity({
    explicit: config.density,
    inherited: parent.density,
    sectionDefault: DEFAULT_ARRAY_SECTION_DENSITY,
  })
  const defaultControlSize = config.density
    ? undefined
    : resolveFieldControlSize({ density: bodyLayoutDensity })
  const { rhythm: legendRhythm, size: legendFieldSize } = resolveFormDensity(presentationDensity)

  return {
    presentationDensity,
    bodyLayoutDensity,
    defaultControlSize,
    legendRhythm,
    legendFieldSize,
  }
}

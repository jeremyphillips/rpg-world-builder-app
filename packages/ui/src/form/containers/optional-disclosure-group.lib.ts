import { useMemo } from 'react'

import type { GroupConfig } from '../field-config'
import { useDependsOnValues } from '../config/form-depends-on.client'
import { useFormSectionContext } from '../context/form-section.context'
import { resolveFormDensity } from '../form-density'
import { resolveGroupHeadingTier, resolveGroupLegendSize } from '../form-heading.lib'
import { resolveGroupHeading } from '../resolve-container-heading.lib'
import {
  resolveGroupHeadingHintDependsOn,
  resolveGroupSectionDescription,
} from './form-group-section.lib'
import type { FieldGroupLegendSize } from '../../components/ui/field.variants'
import type { FieldRhythm } from '../../components/ui/field.variants'
import type { FieldSize } from '../../components/ui/field.client'
import type { FormHeading } from '../form-heading.lib'

export function resolveOptionalDisclosureClearPaths(
  disclosure: NonNullable<GroupConfig['optionalDisclosure']>,
  fullName: string,
): string[] {
  if (disclosure.clearPaths && disclosure.clearPaths.length > 0) {
    return [...disclosure.clearPaths]
  }
  if (disclosure.watchPaths && disclosure.watchPaths.length > 0) {
    return [...disclosure.watchPaths]
  }
  return [fullName]
}

export type OptionalDisclosureGroupLegendChrome = {
  fieldLabel: string
  heading: FormHeading | undefined
  legendSize: FieldGroupLegendSize
  groupRhythm: FieldRhythm
  groupSize: FieldSize
  hint: string | undefined
}

/** Legend chrome for open optional-disclosure groups — mirrors `FormGroupSection` FieldGroup props. */
export function useOptionalDisclosureGroupLegendChrome(
  item: GroupConfig,
  namePrefix?: string,
): OptionalDisclosureGroupLegendChrome {
  const parentContext = useFormSectionContext()
  const heading = resolveGroupHeading(item)
  const fieldLabel = heading?.label ?? 'Saving throw'
  const structuralTier = resolveGroupHeadingTier(parentContext.namedGroupDepth)
  const legendSize = resolveGroupLegendSize(structuralTier)
  const groupDensity = item.density ?? parentContext.density
  const { rhythm: groupRhythm, size: groupSize } = resolveFormDensity(groupDensity)
  const hintDependsOn = resolveGroupHeadingHintDependsOn(heading)
  const hintValues = useDependsOnValues(hintDependsOn, namePrefix)
  const hint = useMemo(
    () => resolveGroupSectionDescription(heading, hintValues),
    [heading, hintValues],
  )
  return { fieldLabel, heading, legendSize, groupRhythm, groupSize, hint }
}

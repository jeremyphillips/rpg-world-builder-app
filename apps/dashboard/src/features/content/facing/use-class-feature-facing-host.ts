import { DEFAULT_SYSTEM_RULESET_ID, type SystemRulesetId } from '@rpg/contracts'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import { CLASS_SPELLCASTING_PREVIEW_PARENT_FIELD_KEYS } from '../classes/lib/class-spellcasting-preview-parent-field-keys'
import { spellcastingFromFormValues } from '../classes/lib/class-form-values'
import type { ClassFormValues } from '../classes/lib/class-form-fields'
import type { FeatureRowForm } from '../classes/lib/class-feature-form-fields'
import type { ContentFormCtx } from '../lib/forms/registry/content-form-registry'
import type { FacingHostConfig } from './facing-host-config.types'
import type { ClassFacingHostContext } from './domains/class-feature/class-facing-host'
import { resolveClassFeatureRowFacing } from './resolve-facing'
import { toFacingPanelModel } from './structured-facing-panel-model.lib'

const CLASS_FEATURE_FACING_PARENT_WATCH = [
  'name',
  ...CLASS_SPELLCASTING_PREVIEW_PARENT_FIELD_KEYS,
] as const satisfies readonly (keyof ClassFormValues | 'name')[]

export function useClassFeatureFacingHost(input: {
  formCtx: ContentFormCtx
  fieldName: string
  selectedIndex: number | null
}): FacingHostConfig | undefined {
  const rowPrefix =
    input.selectedIndex === null ? undefined : `${input.fieldName}.${input.selectedIndex}`

  const parentValues = useWatch({
    name: [...CLASS_FEATURE_FACING_PARENT_WATCH],
  }) as unknown[]

  const selectedRow = useWatch({
    name: rowPrefix as 'features.0',
    disabled: !rowPrefix,
  }) as FeatureRowForm | undefined

  const host = useMemo((): ClassFacingHostContext => {
    const formSlice = Object.fromEntries(
      CLASS_FEATURE_FACING_PARENT_WATCH.map((key, index) => [key, parentValues[index]]),
    ) as Pick<ClassFormValues, (typeof CLASS_FEATURE_FACING_PARENT_WATCH)[number]>

    return {
      className: String(formSlice.name ?? ''),
      rulesetId: (input.formCtx.rulesetId ?? DEFAULT_SYSTEM_RULESET_ID) as SystemRulesetId,
      spellcasting: spellcastingFromFormValues(formSlice as ClassFormValues),
      spellcastingProgression: input.formCtx.spellcastingProgression,
      spellsById: input.formCtx.spellCatalogById,
    }
  }, [input.formCtx, parentValues])

  const resolution = useMemo(
    () => resolveClassFeatureRowFacing(selectedRow, host),
    [host, selectedRow],
  )

  if (input.selectedIndex === null) return undefined

  return {
    hostId: 'class-features',
    resolvePanelModel: () => toFacingPanelModel(resolution),
  }
}

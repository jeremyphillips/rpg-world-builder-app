'use client'

import * as React from 'react'

import { FieldDerivedMetaProvider } from '../../components/ui/field-derived-meta-context.client'
import { resolveFieldChromeProps } from '../../components/ui/field-chrome.variants'
import { useFieldRowParticipation } from '../../components/ui/field-row-anatomy.context'
import { collectFieldDynamicDependsOn, type FieldConfig } from '../field-config'
import { useDependsOnValues } from '../config/form-depends-on.client'
import { useFormSectionContext } from '../context/form-section.context'
import {
  buildFieldRendererIds,
  buildJoinedPairRendererIds,
  resolveFieldRenderConfig,
} from './field-renderer-config.lib'
import { isMultiControllerField } from './field-renderer-families.lib'
import type { ResolvedFieldRender } from './field-resolved-render.types'
import { SelectFieldRenderer } from './fields/select/select-field-renderer.client'
import { renderSpecializedField } from './fields/field-renderer-specialized.client'
import { TextSuggestionsFieldRenderer } from './fields/text-suggestions-field-renderer.client'
import { StandardFieldRenderer } from './standard-field-renderer.client'

export type { ResolvedFieldRender } from './field-resolved-render.types'

export interface FieldRendererProps {
  config: FieldConfig
  /** Per-`<Form>` id prefix; the control id becomes `${idPrefix}-${name}`. */
  idPrefix: string
  /**
   * Dotted path prefix for array item fields (e.g. `"traits.0"`). When set, the
   * full RHF field name is `${namePrefix}.${config.name}` and the control id
   * becomes `${idPrefix}-${namePrefix}-${config.name}` (dots replaced with `-`).
   */
  namePrefix?: string
}

function wrapFieldDerivedMetaPresentation(
  node: React.ReactElement,
  resolved: Pick<ResolvedFieldRender, 'derivedMeta' | 'derivedMetaReserveSpace'>,
) {
  if (!resolved.derivedMeta && !resolved.derivedMetaReserveSpace) return node

  return (
    <FieldDerivedMetaProvider
      meta={resolved.derivedMeta}
      reserveSpace={resolved.derivedMetaReserveSpace}
    >
      {node}
    </FieldDerivedMetaProvider>
  )
}

function optionAvailabilityDependsOn(config: FieldConfig): readonly string[] {
  if (config.type === 'chips' || config.type === 'select' || config.type === 'combobox') {
    return config.optionAvailability?.dependsOn ?? []
  }
  return []
}

/**
 * Resolves one `FieldConfig` and dispatches to the binding family that owns it.
 * Must be rendered inside a `FormProvider` (the `<Form>` renderer).
 */
export function FieldRenderer({ config, idPrefix, namePrefix }: FieldRendererProps) {
  const sectionContext = useFormSectionContext()
  const inAnatomyRow = useFieldRowParticipation()
  const { density, defaultControlSize } = sectionContext
  const chromeProps = resolveFieldChromeProps(config, sectionContext)
  const chromedConfig = { ...config, ...chromeProps } as FieldConfig
  const { fullName, id } =
    chromedConfig.type === 'joinedPair'
      ? buildJoinedPairRendererIds(chromedConfig, idPrefix, namePrefix)
      : buildFieldRendererIds(chromedConfig, idPrefix, namePrefix)

  const dynamicValues = useDependsOnValues(collectFieldDynamicDependsOn(chromedConfig), namePrefix)
  const optionValues = useDependsOnValues(optionAvailabilityDependsOn(chromedConfig), namePrefix)
  const resolvedConfig = resolveFieldRenderConfig(
    chromedConfig,
    { density, defaultControlSize },
    dynamicValues,
    optionValues,
    { inAnatomyRow },
  )
  const interactivityDisabled = config.interactivity?.disabledWhen(dynamicValues) ?? false
  const resolved: ResolvedFieldRender = {
    authored: config,
    config: {
      ...resolvedConfig.config,
      disabled: Boolean(config.disabled) || interactivityDisabled,
    } as FieldConfig,
    presentationSize: resolvedConfig.presentationSize,
    controlSize: resolvedConfig.controlSize,
    hint: resolvedConfig.hint,
    hintPosition: resolvedConfig.hintPosition,
    hintIcon: resolvedConfig.hintIcon,
    derivedMeta: resolvedConfig.derivedMeta,
    derivedMetaReserveSpace: resolvedConfig.derivedMetaReserveSpace,
    resolvedSuggestions: resolvedConfig.resolvedSuggestions,
    fullName,
    id,
    namePrefix,
  }

  const node = renderResolvedField(resolved)
  return wrapFieldDerivedMetaPresentation(node, resolved)
}

function renderResolvedField(resolved: ResolvedFieldRender): React.ReactElement {
  if (isMultiControllerField(resolved.config)) {
    return renderSpecializedField({ resolved: { ...resolved, config: resolved.config } })
  }

  if (resolved.config.type === 'select') {
    return <SelectFieldRenderer resolved={resolved} />
  }

  if (resolved.config.type === 'textSuggestions') {
    return <TextSuggestionsFieldRenderer resolved={resolved} />
  }

  return <StandardFieldRenderer resolved={resolved} />
}

import {
  fieldArrayItemListClasses,
  fieldStackRhythmVariants,
} from '../../../components/ui/field.variants'
import { assertArrayItemConfig } from '../../config/array/assert-array-item-config.lib'
import { assertArrayLabelConfig } from '../../config/array/assert-array-label-config.lib'
import {
  resolveArrayHeading,
  resolveArrayLabelMode,
  resolveArraySectionLabelForDisplay,
} from '../../config/array/resolve-array-heading.lib'
import {
  isNestedArraySection,
  resolveArrayAddAction,
  resolveArrayItemConfig,
  resolveArrayItemReorder,
  resolveArrayItemVariant,
} from '../../config/array/array-item-config.lib'
import { resolveArrayItemPresentation } from '../../config/array/array-item-presentation.lib'
import type { ArrayConfig } from '../../field-config'
import {
  DEFAULT_ARRAY_SECTION_DENSITY,
  resolveFormDensity,
  resolveSectionDensity,
} from '../../form-density'
import { resolveArrayEmptyItemLabel } from './array-field-empty-state.lib'

type ResolveArrayFieldRendererChromeInput = {
  config: ArrayConfig
  /** Parent section density before array item defaults apply. */
  parentDensity: Parameters<typeof resolveFormDensity>[0]
  depth: number
  inRhythmStack: boolean | undefined
  fieldsLength: number
  wrapSectionChrome?: boolean
}

export function resolveArrayFieldRendererChrome({
  config,
  parentDensity,
  depth,
  inRhythmStack,
  fieldsLength,
  wrapSectionChrome = false,
}: ResolveArrayFieldRendererChromeInput) {
  const sectionDensity = resolveSectionDensity({
    explicit: config.density,
    inherited: parentDensity,
    sectionDefault: DEFAULT_ARRAY_SECTION_DENSITY,
  })
  const { rhythm, size } = resolveFormDensity(sectionDensity)
  const headerDensity = config.density ?? parentDensity
  const { rhythm: legendRhythm, size: legendFieldSize } = resolveFormDensity(headerDensity)
  const itemConfig = resolveArrayItemConfig(config)
  const addAction = resolveArrayAddAction(config)
  const {
    label: addActionLabel = 'Add item',
    variant: addActionVariant = 'outline',
    layout: addActionLayout = 'stacked',
    size: addActionSize,
    icon: showAddIcon = true,
    menu: addActionMenu,
  } = addAction ?? {
    label: 'Add item',
    icon: true,
    variant: 'outline' as const,
    layout: 'stacked' as const,
  }
  const resolvedHeading = resolveArrayHeading(config)
  const itemLegend = resolvedHeading?.label ?? ''
  const sectionLabel = resolvedHeading?.label ?? resolveArraySectionLabelForDisplay(config)
  const sectionHint = resolvedHeading?.hint
  const labelMode = resolveArrayLabelMode(config)
  const { min = 0, max } = config
  const itemCollapsible = itemConfig.collapsible
  const itemCollapseKey = itemConfig.collapseKey
  const itemBodyStackClasses = fieldStackRhythmVariants({ rhythm })
  const nested = isNestedArraySection(depth)
  const omitSectionBottomMargin = nested || inRhythmStack || wrapSectionChrome
  const variant = resolveArrayItemVariant(config, { nested })
  const reorder = resolveArrayItemReorder(config)
  const reorderConfigured = reorder === 'dragHandle'
  assertArrayLabelConfig(config)
  assertArrayItemConfig(config, sectionLabel)
  const collapsible = itemCollapsible
  const presentation = resolveArrayItemPresentation({
    config,
    variant,
    reorder,
    fieldsLength,
    legend: itemLegend,
    collapsible,
  })
  const itemListClasses = fieldArrayItemListClasses(
    { rhythm, size },
    presentation.stackTreatment,
    presentation.listGap,
  )
  const sortableEnabled = presentation.sortableEnabled

  return {
    emptyItemLabel: resolveArrayEmptyItemLabel(config),
    addAction,
    addActionLabel,
    addActionVariant,
    addActionLayout,
    addActionSize,
    showAddIcon,
    addActionMenu,
    collapsible,
    itemCollapseKey,
    itemConfig,
    itemListClasses,
    itemBodyStackClasses,
    itemLegend,
    sectionLabel,
    sectionHint,
    labelMode,
    legendFieldSize,
    legendRhythm,
    max,
    min,
    nested,
    omitSectionBottomMargin,
    reorderConfigured,
    sortableEnabled,
    stackTreatment: presentation.stackTreatment,
    variant,
  }
}

import {
  fieldArrayItemListClasses,
  fieldStackRhythmVariants,
} from '../../../components/ui/field.variants'
import { assertArrayItemConfig } from '../../config/array/assert-array-item-config.lib'
import { assertArrayLabelConfig } from '../../config/array/assert-array-label-config.lib'
import {
  resolveArrayLabel,
  resolveArrayLabelMode,
  resolveArraySectionLabelForDisplay,
} from '../../config/array/resolve-array-label.lib'
import {
  isNestedArraySection,
  resolveArrayAddAction,
  resolveArrayItemConfig,
  resolveArrayItemReorder,
  resolveArrayItemVariant,
} from '../../config/array/array-item-config.lib'
import { resolveArrayItemPresentation } from '../../config/array/array-item-presentation.lib'
import type { ArrayConfig } from '../../field-config'
import { resolveFormDensity } from '../../form-density'
import { resolveArrayEmptyItemLabel } from './array-field-empty-state.lib'

type ResolveArrayFieldRendererChromeInput = {
  config: ArrayConfig
  density: Parameters<typeof resolveFormDensity>[0]
  legendDensity?: Parameters<typeof resolveFormDensity>[0]
  depth: number
  inRhythmStack: boolean | undefined
  fieldsLength: number
  wrapSectionChrome?: boolean
}

export function resolveArrayFieldRendererChrome({
  config,
  density,
  legendDensity,
  depth,
  inRhythmStack,
  fieldsLength,
  wrapSectionChrome = false,
}: ResolveArrayFieldRendererChromeInput) {
  const { rhythm, size } = resolveFormDensity(density)
  const legendFieldSize = resolveFormDensity(legendDensity ?? density).size
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
  const resolvedLabel = resolveArrayLabel(config)
  const itemLegend = resolvedLabel?.label ?? ''
  const sectionLabel = resolvedLabel?.label ?? resolveArraySectionLabelForDisplay(config)
  const sectionHint = resolvedLabel?.hint
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

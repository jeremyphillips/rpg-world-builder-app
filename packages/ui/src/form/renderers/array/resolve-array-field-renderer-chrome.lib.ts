import {
  fieldArrayItemListClasses,
  fieldStackRhythmVariants,
} from '../../../components/ui/field.variants'
import {
  isNestedArraySection,
  resolveArrayAddAction,
  resolveArrayItemConfig,
  resolveArrayItemReorder,
  resolveArrayItemVariant,
} from '../../config/array/array-item-config.lib'
import type { ArrayConfig } from '../../field-config'
import { resolveFormDensity } from '../../form-density'
import { resolveArrayLegendPresentation } from '../../form-heading.lib'
import { hasNamedArrayHeading, resolveArrayHeading } from '../../resolve-container-heading.lib'

type ResolveArrayFieldRendererChromeInput = {
  config: ArrayConfig
  density: Parameters<typeof resolveFormDensity>[0]
  depth: number
  inRhythmStack: boolean | undefined
  namedGroupDepth: number
  fieldsLength: number
}

export function resolveArrayFieldRendererChrome({
  config,
  density,
  depth,
  inRhythmStack,
  namedGroupDepth,
  fieldsLength,
}: ResolveArrayFieldRendererChromeInput) {
  const { rhythm, size } = resolveFormDensity(density)
  const itemConfig = resolveArrayItemConfig(config)
  const addAction = resolveArrayAddAction(config)
  const {
    label: addActionLabel = 'Add item',
    variant: addActionVariant = 'outline',
    layout: addActionLayout = 'stacked',
    size: addActionSize,
    icon: showAddIcon = true,
    menu: addActionMenu,
  } = addAction ?? {}
  const arrayHeading = resolveArrayHeading(config)
  const legend = arrayHeading?.label ?? config.legend ?? ''
  const hasNamedHeading = hasNamedArrayHeading(config)
  const legendNamedGroupDepth = hasNamedHeading ? Math.max(0, namedGroupDepth - 1) : namedGroupDepth
  const { legendSize, legendScale } = resolveArrayLegendPresentation(legendNamedGroupDepth, size)
  const { min = 0, max } = config
  const itemCollapsible = itemConfig.collapsible
  const itemCollapseKey = itemConfig.collapseKey
  const itemListClasses = fieldArrayItemListClasses({ rhythm, size })
  const itemBodyStackClasses = fieldStackRhythmVariants({ rhythm })
  const nested = isNestedArraySection(depth)
  const omitSectionBottomMargin = nested || inRhythmStack
  const variant = resolveArrayItemVariant(config, { nested })
  const reorder = resolveArrayItemReorder(config)
  const sortableEnabled = reorder === 'dragHandle' && fieldsLength > 1
  const collapsible = itemCollapsible && variant === 'detailed'

  return {
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
    legend,
    legendScale,
    legendSize,
    max,
    min,
    nested,
    omitSectionBottomMargin,
    sortableEnabled,
    variant,
  }
}

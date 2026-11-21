import {
  DEPENDENT_NEST_ALIGN_FIELD_EDGE_CLASS,
  DEPENDENT_NEST_ALIGN_INLINE_CHECKBOX_CLASS,
  DEPENDENT_NEST_ALIGN_INLINE_SWITCH_CLASS,
} from '../../components/ui/field-dependent-alignment.constants'
import { mapFormLabelPositionToLayout } from '../../components/ui/field-row-presentation.lib'
import type { FieldLabelLayout } from '../../components/ui/field-row-presentation.lib'
import type { FieldConfig } from '../field-config'
import type { FieldLabelPosition } from '../../components/ui/field.variants'
import type { SwitchFieldConfig } from '../field-config'

/** Internal classification for dependent nest horizontal alignment. */
export type DependentAlignmentAnchor =
  | 'field-edge'
  | 'inline-leading-switch'
  | 'inline-leading-checkbox'

function resolveSwitchLabelLayout(controller: SwitchFieldConfig): FieldLabelLayout {
  const labelPosition = controller.labelPosition ?? 'inline'
  if (labelPosition === 'inline') return 'inline'
  return mapFormLabelPositionToLayout(labelPosition)
}

function resolveStackedLabelLayout(labelPosition?: FieldLabelPosition): FieldLabelLayout {
  return mapFormLabelPositionToLayout(labelPosition ?? 'above')
}

function resolveControllerLabelLayout(controller: FieldConfig): FieldLabelLayout {
  switch (controller.type) {
    case 'switch':
      return resolveSwitchLabelLayout(controller)
    case 'checkbox':
    case 'boolean':
      return 'inline'
    case 'select':
      return resolveStackedLabelLayout(controller.labelPosition)
    case 'text':
    case 'number':
    case 'textarea':
    case 'richtext':
    case 'markdown':
    case 'json':
      return resolveStackedLabelLayout(controller.labelPosition)
    default:
      return 'stacked'
  }
}

/**
 * Mirrors renderer defaults for dependent nest alignment — not used at render time
 * inside field components to avoid presentation drift cycles.
 *
 * Unknown controllers fall back to {@link DependentAlignmentAnchor} `field-edge`.
 */
export function resolveControllerDependentAnatomy(
  controller: FieldConfig,
): DependentAlignmentAnchor {
  const labelLayout = resolveControllerLabelLayout(controller)

  if (labelLayout !== 'inline') return 'field-edge'

  if (controller.type === 'checkbox' || controller.type === 'boolean') {
    return 'inline-leading-checkbox'
  }
  if (controller.type === 'switch') {
    return 'inline-leading-switch'
  }
  return 'field-edge'
}

export function resolveDependentNestAlignmentClass(anchor: DependentAlignmentAnchor): string {
  switch (anchor) {
    case 'inline-leading-switch':
      return DEPENDENT_NEST_ALIGN_INLINE_SWITCH_CLASS
    case 'inline-leading-checkbox':
      return DEPENDENT_NEST_ALIGN_INLINE_CHECKBOX_CLASS
    default:
      return DEPENDENT_NEST_ALIGN_FIELD_EDGE_CLASS
  }
}

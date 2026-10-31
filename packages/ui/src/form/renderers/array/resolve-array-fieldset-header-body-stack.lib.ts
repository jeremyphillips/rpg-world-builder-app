import {
  fieldAnatomyStackVariants,
  type FieldSizeToken,
} from '../../../components/ui/field.variants'

/** Fieldset stack gap when a visible header cluster renders above the array list. */
export function resolveArrayFieldsetHeaderBodyStackClassName(
  showSectionHeader: boolean,
  size: FieldSizeToken,
): string | undefined {
  return showSectionHeader ? fieldAnatomyStackVariants({ size }) : undefined
}

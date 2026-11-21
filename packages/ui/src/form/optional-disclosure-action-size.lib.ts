import type { ButtonProps } from '../components/ui/button.client'
import type { FieldSize } from '../components/ui/field.client'

export type OptionalDisclosureActionPlacement = 'inlineWithLabel' | 'standalone'

export type OptionalDisclosureActionButtonSize = Extract<
  NonNullable<ButtonProps['size']>,
  'xs' | 'sm' | 'default'
>

/** Collapsed action-only controls track field control scale; header actions stay xs. */
export function resolveOptionalDisclosureActionButtonSize(input: {
  placement: OptionalDisclosureActionPlacement
  fieldSize: FieldSize
}): OptionalDisclosureActionButtonSize {
  if (input.placement === 'inlineWithLabel') return 'xs'
  if (input.fieldSize === 'xs') return 'xs'
  if (input.fieldSize === 'sm') return 'sm'
  return 'default'
}

export function optionalDisclosureActionButtonProps(input: {
  placement: OptionalDisclosureActionPlacement
  fieldSize: FieldSize
}) {
  return {
    type: 'button',
    variant: 'text',
    size: resolveOptionalDisclosureActionButtonSize(input),
  } as const satisfies Pick<ButtonProps, 'type' | 'variant' | 'size'>
}

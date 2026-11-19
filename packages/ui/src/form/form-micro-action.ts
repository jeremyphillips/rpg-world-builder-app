import type { ButtonProps } from '../components/ui/button.client'

/**
 * Shared props for always-xs inline control-band actions in schema-driven forms.
 * Optional disclosure actions use `optionalDisclosureActionButtonProps` instead.
 */
export const formMicroActionButtonProps = {
  type: 'button',
  variant: 'text',
  size: 'xs',
} as const satisfies Pick<ButtonProps, 'type' | 'variant' | 'size'>

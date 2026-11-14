import type { ButtonProps } from '../components/ui/button.client'

/** Shared props for inline control-band actions in schema-driven forms. */
export const formMicroActionButtonProps = {
  type: 'button',
  variant: 'text',
  size: 'xs',
} as const satisfies Pick<ButtonProps, 'type' | 'variant' | 'size'>

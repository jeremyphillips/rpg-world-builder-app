import type { ReactNode } from 'react'

import { Button, type ButtonProps } from './button'

export interface SubmitButtonProps extends Omit<ButtonProps, 'type'> {
  /** When true, the button is disabled and (if provided) shows `pendingLabel`. */
  pending?: boolean
  pendingLabel?: string
  children: ReactNode
}

/**
 * A `type="submit"` button that reflects an async pending state. The base
 * `Button` defaults to `type="button"`, so this forces the submit type.
 */
export function SubmitButton({
  pending = false,
  pendingLabel,
  children,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={disabled || pending} {...props}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  )
}

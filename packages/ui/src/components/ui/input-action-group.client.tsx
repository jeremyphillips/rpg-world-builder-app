'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import { fieldGroupedInputColumnClasses } from './field-input-chrome.variants'
import { resolveAttachedButtonSize } from './field-sizing.variants'
import type { ButtonVariantProps } from './button.variants'
import {
  inputActionGroupActionSegmentVariants,
  inputActionGroupDividerVariants,
  inputActionGroupVariants,
} from './input-action-group.variants'

const INPUT_ACTION_GROUP_ACTION_DISPLAY_NAME = 'InputActionGroup.Action'

type InputActionGroupContextValue = {
  size: FieldSize
  groupDisabled: boolean
}

const InputActionGroupContext = React.createContext<InputActionGroupContextValue | null>(null)

function useInputActionGroupContext(component: string): InputActionGroupContextValue {
  const context = React.useContext(InputActionGroupContext)
  if (!context) {
    throw new Error(`${component} must be used within InputActionGroup`)
  }
  return context
}

export interface InputActionGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: FieldSize
  invalid?: boolean
  /** Disables the whole compound control (input and action). */
  disabled?: boolean
}

function isInputActionGroupAction(
  child: React.ReactNode,
): child is React.ReactElement<InputActionGroupActionProps> {
  return (
    React.isValidElement(child) &&
    (child.type as { displayName?: string }).displayName === INPUT_ACTION_GROUP_ACTION_DISPLAY_NAME
  )
}

/** Joined shell for a text input and trailing action button. */
function InputActionGroupRoot({
  size = 'md',
  invalid = false,
  disabled = false,
  className,
  children,
  ...props
}: InputActionGroupProps) {
  const contextValue = React.useMemo(() => ({ size, groupDisabled: disabled }), [disabled, size])

  let inputChild: React.ReactNode = null
  let actionChild: React.ReactNode = null

  React.Children.forEach(children, (child) => {
    if (isInputActionGroupAction(child)) {
      actionChild = child
      return
    }
    if (child != null && child !== false) {
      inputChild = child
    }
  })

  return (
    <InputActionGroupContext.Provider value={contextValue}>
      <div
        role="group"
        className={cn(inputActionGroupVariants({ invalid, disabled }), className)}
        {...props}
      >
        <div className={fieldGroupedInputColumnClasses}>{inputChild}</div>
        <div aria-hidden className={inputActionGroupDividerVariants()} />
        {actionChild}
      </div>
    </InputActionGroupContext.Provider>
  )
}

export interface InputActionGroupActionProps {
  children: React.ReactElement
  disabled?: boolean
  className?: string
  'aria-describedby'?: string
}

export function InputActionGroupAction({
  children,
  disabled,
  className,
  'aria-describedby': ariaDescribedBy,
}: InputActionGroupActionProps) {
  const { size, groupDisabled } = useInputActionGroupContext('InputActionGroup.Action')
  const resolvedDisabled = disabled ?? groupDisabled

  if (!React.isValidElement(children)) {
    throw new Error('InputActionGroup.Action expects a single element child')
  }

  const actionChild = children as React.ReactElement<{
    className?: string
    disabled?: boolean
    size?: ButtonVariantProps['size']
    'aria-describedby'?: string
  }>

  return (
    <div className={cn(inputActionGroupActionSegmentVariants({ size }), className)}>
      {React.cloneElement(actionChild, {
        size: actionChild.props.size ?? resolveAttachedButtonSize(size),
        disabled: resolvedDisabled,
        'aria-describedby': ariaDescribedBy,
      })}
    </div>
  )
}
InputActionGroupAction.displayName = INPUT_ACTION_GROUP_ACTION_DISPLAY_NAME

export const InputActionGroup = Object.assign(InputActionGroupRoot, {
  Action: InputActionGroupAction,
})

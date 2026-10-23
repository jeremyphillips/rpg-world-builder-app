'use client'

import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'

import { cn } from '../../lib/utils'

export type ToastViewportProps = React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>

/** Radix forwards `className` to the viewport `ol`. Placement is `ui-toast-viewport`. */
export const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Viewport>,
  ToastViewportProps
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport ref={ref} className={cn('ui-toast-viewport', className)} {...props} />
))
ToastViewport.displayName = 'ToastViewport'

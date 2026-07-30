'use client'

import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'

import { cn } from '../../lib/utils'
import { toastViewportVariants } from './toast.variants'

export type ToastViewportProps = React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>

/** Radix forwards `className` to the viewport `ol` — keep `fixed` + `z-toast` here. */
export const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Viewport>,
  ToastViewportProps
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(toastViewportVariants(), className)}
    {...props}
  />
))
ToastViewport.displayName = 'ToastViewport'

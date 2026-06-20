'use client'

import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'

import { cn } from '../../lib/utils'
import {
  accordionContentVariants,
  accordionContentInnerVariants,
  accordionItemVariants,
  accordionTriggerVariants,
  type AccordionVariant,
} from './accordion.variants'

const AccordionVariantContext = React.createContext<AccordionVariant>('default')

type AccordionRootProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>

export type AccordionProps = AccordionRootProps & {
  variant?: AccordionVariant
}

function Accordion({ variant = 'default', children, ...props }: AccordionProps) {
  return (
    <AccordionVariantContext.Provider value={variant}>
      <AccordionPrimitive.Root {...props}>{children}</AccordionPrimitive.Root>
    </AccordionVariantContext.Provider>
  )
}
Accordion.displayName = 'Accordion'

export interface AccordionItemProps extends React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Item
> {
  variant?: AccordionVariant
}

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, variant, ...props }, ref) => {
  const ctxVariant = React.useContext(AccordionVariantContext)
  const resolvedVariant = variant ?? ctxVariant
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(accordionItemVariants({ variant: resolvedVariant }), className)}
      {...props}
    />
  )
})
AccordionItem.displayName = AccordionPrimitive.Item.displayName

export interface AccordionTriggerProps extends React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Trigger
> {
  variant?: AccordionVariant
}

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, variant, ...props }, ref) => {
  const ctxVariant = React.useContext(AccordionVariantContext)
  const resolvedVariant = variant ?? ctxVariant
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(accordionTriggerVariants({ variant: resolvedVariant }), className)}
        {...props}
      >
        {children}
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, forceMount, ...props }, ref) => {
  const ctxVariant = React.useContext(AccordionVariantContext)
  return (
    <AccordionPrimitive.Content
      ref={ref}
      forceMount={forceMount}
      className={cn(accordionContentVariants(), className)}
      {...props}
    >
      <div className={accordionContentInnerVariants({ variant: ctxVariant })}>{children}</div>
    </AccordionPrimitive.Content>
  )
})
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

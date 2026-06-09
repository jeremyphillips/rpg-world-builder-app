import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '../../lib/utils'
import { tabsListVariants, tabsTriggerVariants, type TabsVariant } from './tabs.variants'

const TabsVariantContext = React.createContext<TabsVariant>('line')

export interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  variant?: TabsVariant
}

function Tabs({ variant = 'line', children, ...props }: TabsProps) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.Root {...props}>{children}</TabsPrimitive.Root>
    </TabsVariantContext.Provider>
  )
}
Tabs.displayName = TabsPrimitive.Root.displayName

export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: TabsVariant
}

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, variant, ...props }, ref) => {
    const ctxVariant = React.useContext(TabsVariantContext)
    const resolvedVariant = variant ?? ctxVariant
    return (
      <TabsPrimitive.List
        ref={ref}
        className={cn(tabsListVariants({ variant: resolvedVariant }), className)}
        {...props}
      />
    )
  },
)
TabsList.displayName = TabsPrimitive.List.displayName

export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> {
  variant?: TabsVariant
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, ...props }, ref) => {
  const ctxVariant = React.useContext(TabsVariantContext)
  const resolvedVariant = variant ?? ctxVariant
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant: resolvedVariant }), className)}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

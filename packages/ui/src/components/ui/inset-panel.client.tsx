'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { Text, type TextProps } from './text'
import {
  insetPanelVariants,
  resolveInsetPanelTextVariant,
  type InsetPanelSize,
  type InsetPanelVariantProps,
} from './inset-panel.variants'

interface InsetPanelContextValue {
  size: InsetPanelSize
}

const InsetPanelContext = React.createContext<InsetPanelContextValue | null>(null)

function useInsetPanelContext(part: string): InsetPanelContextValue {
  const context = React.useContext(InsetPanelContext)
  if (!context) {
    throw new Error(`${part} must be used within <InsetPanel>`)
  }
  return context
}

export type InsetPanelProps = React.ComponentPropsWithoutRef<'div'> & InsetPanelVariantProps

const InsetPanelRoot = React.forwardRef<HTMLDivElement, InsetPanelProps>(
  ({ surface, borderStyle, size = 'md', align, className, children, ...props }, ref) => {
    const resolvedSize = size ?? 'md'

    return (
      <InsetPanelContext.Provider value={{ size: resolvedSize }}>
        <div
          ref={ref}
          className={cn(
            insetPanelVariants({ surface, borderStyle, size: resolvedSize, align }),
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </InsetPanelContext.Provider>
    )
  },
)
InsetPanelRoot.displayName = 'InsetPanel'

function InsetPanelText({ variant, className, ...props }: InsetPanelTextProps) {
  const { size } = useInsetPanelContext('InsetPanel.Text')

  return (
    <Text variant={resolveInsetPanelTextVariant(size, variant)} className={className} {...props} />
  )
}
InsetPanelText.displayName = 'InsetPanel.Text'

export type InsetPanelTextProps = React.ComponentPropsWithoutRef<typeof Text> & {
  variant?: TextProps['variant']
}

export { InsetPanelText }

export const InsetPanel = Object.assign(InsetPanelRoot, {
  Text: InsetPanelText,
})

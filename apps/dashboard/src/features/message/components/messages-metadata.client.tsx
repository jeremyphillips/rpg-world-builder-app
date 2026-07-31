'use client'

import * as React from 'react'
import { Text, textVariants, type TextProps } from '@rpg/ui'
import { cn } from '@rpg/ui'

type MessagesMetadataProps = TextProps

/** Shared metadata chrome for list times, thread headers, and previews. */
export function MessagesMetadata({ className, ...props }: MessagesMetadataProps) {
  return <Text variant="caption" className={className} {...props} />
}

type MessagesMetadataTimeProps = React.ComponentProps<'time'>

/** Metadata timestamp with `<time>` semantics for thread groups and date separators. */
export function MessagesMetadataTime({ className, children, ...props }: MessagesMetadataTimeProps) {
  return (
    <time className={cn(textVariants({ variant: 'caption' }), className)} {...props}>
      {children}
    </time>
  )
}

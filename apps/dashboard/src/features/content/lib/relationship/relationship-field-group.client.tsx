'use client'

import type { ReactNode } from 'react'

import { cn, Eyebrow, Heading, Text } from '@rpg/ui'

import {
  relationshipFieldGroupBodyVariants,
  relationshipFieldGroupHeaderVariants,
  relationshipFieldGroupRowVariants,
  relationshipFieldGroupVariants,
} from './relationship-field-group.variants'

export type RelationshipFieldGroupProps = {
  heading: string
  headingId: string
  helper?: string
  headingAs?: 'h2' | 'h3'
  children: ReactNode
  className?: string
}

export function RelationshipFieldGroup({
  heading,
  headingId,
  helper,
  headingAs = 'h2',
  children,
  className,
}: RelationshipFieldGroupProps) {
  return (
    <div className={cn(relationshipFieldGroupVariants(), className)}>
      <div className={relationshipFieldGroupHeaderVariants()}>
        <div className="space-y-1">
          <Heading variant="label" as={headingAs} id={headingId}>
            {heading}
          </Heading>
          {helper ? (
            <Text variant="muted" className="text-sm">
              {helper}
            </Text>
          ) : null}
        </div>
      </div>
      <div className={relationshipFieldGroupBodyVariants()}>{children}</div>
    </div>
  )
}

export type RelationshipFieldGroupRowProps = {
  eyebrow: string
  children: ReactNode
  className?: string
}

export function RelationshipFieldGroupRow({
  eyebrow,
  children,
  className,
}: RelationshipFieldGroupRowProps) {
  return (
    <div className={cn(relationshipFieldGroupRowVariants(), className)}>
      <Eyebrow size="sm" className="mb-0">
        {eyebrow}
      </Eyebrow>
      {children}
    </div>
  )
}

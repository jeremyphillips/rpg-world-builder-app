'use client'

import { Text } from '@rpg/ui'

export type RelationshipDrawerContextHeaderProps = {
  context: string
}

export function RelationshipDrawerContextHeader({ context }: RelationshipDrawerContextHeaderProps) {
  return (
    <Text variant="muted" className="text-sm">
      {context}
    </Text>
  )
}

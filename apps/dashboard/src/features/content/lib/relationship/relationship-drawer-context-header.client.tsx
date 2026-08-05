'use client'

import { Heading, Text } from '@rpg/ui'

export type RelationshipDrawerContextHeaderProps = {
  context: string
  current?: string
}

export function RelationshipDrawerContextHeader({
  context,
  current,
}: RelationshipDrawerContextHeaderProps) {
  return (
    <div className="space-y-1">
      <Text variant="muted" className="text-sm">
        {context}
      </Text>
      {current ? (
        <Heading variant="label" as="p">
          Current: {current}
        </Heading>
      ) : null}
    </div>
  )
}

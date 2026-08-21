'use client'

import type { ReactNode } from 'react'
import { Button, Heading, Text } from '@rpg/ui'

type CharacterDetailHeaderProps = {
  name: string
  summary: string
  xp: string | null
  statusSummary?: ReactNode
  statusActions?: ReactNode
  identitySupplement?: ReactNode
  showDelete: boolean
  onDeleteClick: () => void
}

export function CharacterDetailHeader({
  name,
  summary,
  xp,
  statusSummary,
  statusActions,
  identitySupplement,
  showDelete,
  onDeleteClick,
}: CharacterDetailHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <Heading variant="page" as="h1">
          {name}
        </Heading>
        <Text variant="muted">{summary}</Text>
        {xp !== null ? <Text variant="muted">{xp} XP</Text> : null}
        {statusSummary ? (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {statusSummary}
            {statusActions}
          </div>
        ) : null}
        {identitySupplement}
      </div>
      {showDelete ? (
        <Button type="button" variant="outline" size="sm" onClick={onDeleteClick}>
          Delete
        </Button>
      ) : null}
    </header>
  )
}

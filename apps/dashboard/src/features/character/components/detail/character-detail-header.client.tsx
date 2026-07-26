'use client'

import type { ReactNode } from 'react'
import { Button, Heading, Text } from '@rpg/ui'

type CharacterDetailHeaderProps = {
  name: string
  summary: string
  xp: string | null
  lifecycle?: ReactNode
  lifecycleActions?: ReactNode
  showDelete: boolean
  onDeleteClick: () => void
}

export function CharacterDetailHeader({
  name,
  summary,
  xp,
  lifecycle,
  lifecycleActions,
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
        {lifecycle ? (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {lifecycle}
            {lifecycleActions}
          </div>
        ) : null}
      </div>
      {showDelete ? (
        <Button type="button" variant="outline" size="sm" onClick={onDeleteClick}>
          Delete
        </Button>
      ) : null}
    </header>
  )
}

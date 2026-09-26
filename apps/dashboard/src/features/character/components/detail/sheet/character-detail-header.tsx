import type { ReactNode } from 'react'
import { Button, Heading, Text } from '@rpg/ui'

type CharacterDetailHeaderProps = {
  name: string
  summary: string
  gender: string
  xp: string | null
  identityMedia?: ReactNode
  statusSummary?: ReactNode
  statusActions?: ReactNode
  identitySupplement?: ReactNode
  showDelete: boolean
  onDeleteClick: () => void
}

export function CharacterDetailHeader({
  name,
  summary,
  gender,
  xp,
  identityMedia,
  statusSummary,
  statusActions,
  identitySupplement,
  showDelete,
  onDeleteClick,
}: CharacterDetailHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        {identityMedia}
        <div className="min-w-0 space-y-1">
          <Heading variant="page" as="h1">
            {name}
          </Heading>
          <Text variant="muted">{summary}</Text>
          <Text variant="muted" className="text-sm">
            Gender: {gender}
          </Text>
          {xp !== null ? <Text variant="muted">{xp} XP</Text> : null}
          {statusSummary ? (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {statusSummary}
              {statusActions}
            </div>
          ) : null}
          {identitySupplement}
        </div>
      </div>
      {showDelete ? (
        <Button type="button" variant="outline" size="sm" onClick={onDeleteClick}>
          Delete
        </Button>
      ) : null}
    </header>
  )
}

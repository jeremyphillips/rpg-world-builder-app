import type { ReactNode } from 'react'
import { Heading, Text } from '@rpg/ui'

export type IndexPageIntroProps = {
  title: string
  description: string
  actions?: ReactNode
  showActionsInHeader?: boolean
}

/** Index page title and description, with optional header-aligned actions. */
export function IndexPageIntro({
  title,
  description,
  actions,
  showActionsInHeader = false,
}: IndexPageIntroProps) {
  return (
    <div
      className={
        showActionsInHeader && actions ? 'flex items-start justify-between gap-4' : 'space-y-1'
      }
    >
      <div className="space-y-1">
        <Heading variant="page" as="h1">
          {title}
        </Heading>
        <Text variant="muted">{description}</Text>
      </div>
      {showActionsInHeader && actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

export type IndexPageEmptyStateProps = {
  heading: string
  body: string
  actions?: ReactNode
}

/** Empty-state copy and actions rendered below the page intro. */
export function IndexPageEmptyState({ heading, body, actions }: IndexPageEmptyStateProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Text variant="muted">{heading}</Text>
        <Text variant="muted">{body}</Text>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
